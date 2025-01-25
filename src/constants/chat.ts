import { v4 as uuidv4 } from 'uuid';
import { ChatInterface, ConfigInterface, ModelOptions } from '@type/chat';
import useStore from '@store/store';

const date = new Date();
const dateString =
  date.getFullYear() +
  '-' +
  ('0' + (date.getMonth() + 1)).slice(-2) +
  '-' +
  ('0' + date.getDate()).slice(-2);

// default system message obtained using the following method: https://twitter.com/DeminDimin/status/1619935545144279040
export const _defaultSystemMessage =
  import.meta.env.VITE_DEFAULT_SYSTEM_MESSAGE ??
  `You are ChatGPT, a large language model trained by OpenAI.
Carefully heed the user's instructions. 
Respond using Markdown.`;

// Define the model options with their corresponding providers
export const modelProviders: { [key: string]: ModelOptions[] } = {
  'Anthropic': [
    'Claude-3.5-Sonnet-June',
    'Claude-3.5-Sonnet-June-200k',
    'Claude-3.5-Haiku-200k',
    'Claude-3-Sonnet-200k',
    'Claude-3.5-Haiku',
    'Claude-3-Sonnet'
  ],
  'Google': [
    'Gemini-1.5-Flash',
    'Gemini-1.5-Flash-128k',
    'Gemini-1.5-Flash-Search',
    'Gemini-1.5-Pro',
    'Gemini-1.5-Pro-128k',
    'Gemini-1.5-Pro-Search'
  ],
  'OpenAI': [
    'GPT-4o-Mini-128k',
    'GPT-4o-Aug-128k',
    'GPT-4o-Mini',
    'GPT-4o-Aug'
  ],
  'Alibaba': [
    'Qwen2.5-Coder-32B',
    'Qwen2.5-72B-Instruct'
  ],
  'Mistral': [
    'Mistral-Large-2',
    'Mistral-Large-2-128k',
    'Mixtral-8x7b-Groq'
  ],
  'Meta': [
    'Llama-3.1-405B-FW-128k',
    'Llama-3.2-90B-FW-131k',
    'Llama-3-70b-Groq'
  ],
  'Deepseek': [
    'Deepseek-R1',
    'Deepseek-v3-T'
  ],
  'Others': [
    'Solar-Pro',
    'Command-R-Plus'
  ]
};

export const modelOptions: ModelOptions[] = Object.values(modelProviders).flat();

export const defaultModel = 'Claude-3.5-Sonnet-June';

export const modelMaxToken = new Map<string, number>([
  ['gpt-3.5-turbo', 4096],
  ['gpt-3.5-turbo-0301', 4096],
  ['gpt-3.5-turbo-0613', 4096],
  ['gpt-3.5-turbo-16k', 16384],
  ['gpt-3.5-turbo-16k-0613', 16384],
  ['gpt-3.5-turbo-1106', 16384],
  ['gpt-3.5-turbo-0125', 16384],
  ['gpt-4', 8192],
  ['gpt-4-0314', 8192],
  ['gpt-4-0613', 8192],
  ['gpt-4-32k', 32768],
  ['gpt-4-32k-0314', 32768],
  ['gpt-4-32k-0613', 32768],
  ['gpt-4-1106-preview', 128000],
  ['gpt-4-0125-preview', 128000],
]);

export const modelCost = new Map<string, { prompt: { price: number, unit: number }, completion: { price: number, unit: number } }>([
  ['gpt-3.5-turbo', { prompt: { price: 0.0015, unit: 1000 }, completion: { price: 0.002, unit: 1000 } }],
  ['gpt-3.5-turbo-0301', { prompt: { price: 0.0015, unit: 1000 }, completion: { price: 0.002, unit: 1000 } }],
  ['gpt-3.5-turbo-0613', { prompt: { price: 0.0015, unit: 1000 }, completion: { price: 0.002, unit: 1000 } }],
  ['gpt-3.5-turbo-16k', { prompt: { price: 0.003, unit: 1000 }, completion: { price: 0.004, unit: 1000 } }],
  ['gpt-3.5-turbo-16k-0613', { prompt: { price: 0.003, unit: 1000 }, completion: { price: 0.004, unit: 1000 } }],
  ['gpt-3.5-turbo-1106', { prompt: { price: 0.001, unit: 1000 }, completion: { price: 0.0015, unit: 1000 } }],
  ['gpt-3.5-turbo-0125', { prompt: { price: 0.0005, unit: 1000 }, completion: { price: 0.0015, unit: 1000 } }],
  ['gpt-4', { prompt: { price: 0.03, unit: 1000 }, completion: { price: 0.06, unit: 1000 } }],
  ['gpt-4-0314', { prompt: { price: 0.03, unit: 1000 }, completion: { price: 0.06, unit: 1000 } }],
  ['gpt-4-0613', { prompt: { price: 0.03, unit: 1000 }, completion: { price: 0.06, unit: 1000 } }],
  ['gpt-4-32k', { prompt: { price: 0.06, unit: 1000 }, completion: { price: 0.12, unit: 1000 } }],
  ['gpt-4-32k-0314', { prompt: { price: 0.06, unit: 1000 }, completion: { price: 0.12, unit: 1000 } }],
  ['gpt-4-32k-0613', { prompt: { price: 0.06, unit: 1000 }, completion: { price: 0.12, unit: 1000 } }],
  ['gpt-4-1106-preview', { prompt: { price: 0.01, unit: 1000 }, completion: { price: 0.03, unit: 1000 } }],
  ['gpt-4-0125-preview', { prompt: { price: 0.01, unit: 1000 }, completion: { price: 0.03, unit: 1000 } }],
]);

export const defaultUserMaxToken = 200000;

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  max_tokens: defaultUserMaxToken,
  temperature: 0.6,
  presence_penalty: 0,
  top_p: 1,
  frequency_penalty: 0,
};

export const generateDefaultChat = (
  title?: string,
  folder?: string
): ChatInterface => ({
  id: uuidv4(),
  title: title ? title : 'New Chat',
  messages:
    useStore.getState().defaultSystemMessage.length > 0
      ? [{ role: 'system', content: useStore.getState().defaultSystemMessage }]
      : [],
  config: { ...useStore.getState().defaultChatConfig },
  titleSet: false,
  folder,
});

export const codeLanguageSubset = [
  'python',
  'javascript',
  'java',
  'go',
  'bash',
  'c',
  'cpp',
  'csharp',
  'css',
  'diff',
  'graphql',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'objectivec',
  'perl',
  'php',
  'php-template',
  'plaintext',
  'python-repl',
  'r',
  'ruby',
  'rust',
  'scss',
  'shell',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'wasm',
  'xml',
  'yaml',
];
