import React from 'react';
import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import { limitMessageTokens, updateTotalTokenUsed } from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { ConfigInterface } from '@type/chat';
import { officialAPIEndpoint } from '@constants/auth';

function truncateMessages(messages: MessageInterface[], maxCharacters: number): MessageInterface[] {
  let totalCharacters = 0;
  return messages.map(message => {
    const remainingCharacters = maxCharacters - totalCharacters;
    if (remainingCharacters <= 0) {
      return { ...message, content: "" };  // No space left, truncate content entirely
    }

    const truncatedContent = message.content.slice(0, remainingCharacters);
    totalCharacters += truncatedContent.length;
    return { ...message, content: truncatedContent };
  });
}

function extractTitle(response: string) {
  // Remove any surrounding quotes
  response = response.trim().replace(/^["']|["']$/g, '');
  console.debug(`Response after removing quotes: ${response}`);

  // Check for patterns like "titles:"
  const titlePatternMatch = response.match(/[Tt]itles?:\s*(.*)/s);
  if (titlePatternMatch) {
    // Split the matched pattern by new lines and filter out any empty strings
    let titles = titlePatternMatch[1].split('\n').filter(t => t.trim() !== '');
    // Remove leading non-number characters from the titles
    const cleanTitles = titles.map(title => title.replace(/^[\d*-]\s*/, '').trim());
    console.debug(`Title pattern match found. Titles extracted: ${cleanTitles}`);
    return cleanTitles[0] || '';
  }

  // If no title pattern, but there's a colon, start from there
  const colonIndex = response.indexOf(':');
  if (colonIndex !== -1) {
    const afterColon = response.slice(colonIndex + 1).trim();
    const firstTitle = afterColon.split(/[.,\d\n]/)[0].trim();
    console.debug(`No title pattern found, but colon detected. First title after colon: ${firstTitle}`);
    return firstTitle || '';
  }

  // If no patterns found, return the first 3-4 words
  const words = response.split(/\s+/);
  const firstFewWords = words.slice(0, 4).join(' ');
  console.debug(`No patterns found. Returning first 3-4 words: ${firstFewWords}`);
  return firstFewWords;
}

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const apiKey = useStore((state) => state.apiKey);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);

  const generateTitle = async (
    original_message: MessageInterface[]
  ): Promise<string> => {
    let data;
    try {
      const message = truncateMessages(original_message, 1000);
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        data = await getChatCompletion(
          useStore.getState().apiEndpoint,
          message,
          _defaultChatConfig
        );
      } else if (apiKey) {
        const customChatConfig: ConfigInterface = {
          ..._defaultChatConfig,
          model: "Claude-3-Haiku",
        };
        // own apikey
        data = await getChatCompletion(
          useStore.getState().apiEndpoint,
          message,
          customChatConfig,
          apiKey
        );
      }
    } catch (error: unknown) {
      throw new Error(`Error generating title!\n${(error as Error).message}`);
    }
    return data.choices[0].message.content.replace(/^[\s#]+/, '');
  };

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    try {
      let stream;
      if (chats[currentChatIndex].messages.length === 0)
        throw new Error('No messages submitted!');

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        chats[currentChatIndex].config.max_tokens,
        chats[currentChatIndex].config.model
      );
      if (messages.length === 0) throw new Error('Message exceed max token!');

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config
        );
      } else if (apiKey) {
        // own apikey
        stream = await getChatCompletionStream(
          useStore.getState().apiEndpoint,
          messages,
          chats[currentChatIndex].config,
          apiKey
        );
      }

      if (stream) {
        if (stream.locked)
          throw new Error(
            'Oops, the stream is locked right now. Please try again'
          );
        const reader = stream.getReader();
        let reading = true;
        let partial = '';
        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();
          const result = parseEventSource(
            partial + new TextDecoder().decode(value)
          );
          partial = '';

          if (result === '[DONE]' || done) {
            reading = false;
          } else {
            const resultString = result.reduce((output: string, curr) => {
              if (typeof curr === 'string') {
                partial += curr;
              } else {
                const content = curr.choices[0]?.delta?.content ?? null;
                if (content) output += content;
              }
              return output;
            }, '');

            const updatedChats: ChatInterface[] = JSON.parse(
              JSON.stringify(useStore.getState().chats)
            );
            const updatedMessages = updatedChats[currentChatIndex].messages;
            updatedMessages[updatedMessages.length - 1].content += resultString;
            setChats(updatedChats);
          }
        }
        if (useStore.getState().generating) {
          reader.cancel('Cancelled by user');
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      // update tokens used in chatting
      const currChats = useStore.getState().chats;
      const countTotalTokens = useStore.getState().countTotalTokens;

      if (currChats && countTotalTokens) {
        const model = currChats[currentChatIndex].config.model;
        const messages = currChats[currentChatIndex].messages;
        updateTotalTokenUsed(
          model,
          messages.slice(0, -1),
          messages[messages.length - 1]
        );
      }

      // generate title for new chats
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;
        const assistant_message =
          currChats[currentChatIndex].messages[messages_length - 1].content;
        const user_message =
          currChats[currentChatIndex].messages[messages_length - 2].content;

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title that is no longer than 3 words for the following message:\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n\nJust say the <= 3 words summary, don't say anything else."""`,
        };

        let title = extractTitle((await generateTitle([message])).trim());
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);

        // update tokens used for generating title
        if (countTotalTokens) {
          const model = 'Claude-3-Haiku';
          updateTotalTokenUsed(model, [message], {
            role: 'assistant',
            content: title,
          });
        }
      }
    } catch (e: unknown) {
      const err = (e as Error).message;
      console.log(err);
      setError(err);
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
