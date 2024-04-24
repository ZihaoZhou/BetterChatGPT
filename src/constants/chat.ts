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

export const modelOptions: ModelOptions[] = [
  'GPT-3.5-Turbo',
  'GPT-4',
  'GPT-4-32k',
  'GPT-4-128k',
  'Claude-3-Opus',
  'Claude-3-Sonnet',
  'ChatGPT-16k',
  'Mistral-Large',
  'Gemini-Pro',
  'Llama-2-70b-Groq',
  'Mixtral-8x7b-Groq',
];

export const defaultModel = 'GPT-4';

export const modelMaxToken = {
  'GPT-4': 4096,
  'GPT-4-32k': 32768,
  'GPT-4-128k': 131072,
  'Claude-3-Opus': 4096,
  'Claude-3-Sonnet': 4096,
  'GPT-3.5-Turbo': 4096,
  'ChatGPT-16k': 16384,
  'Mistral-Large': 32768,
  'Gemini-Pro': 32768,
  'Llama-2-70b-Groq': 4096,
  'Mixtral-8x7b-Groq': 32768,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-0301': 4096,
  'gpt-3.5-turbo-0613': 4096,
  'gpt-3.5-turbo-16k': 16384,
  'gpt-3.5-turbo-16k-0613': 16384,
  'gpt-3.5-turbo-1106': 16384,
  'gpt-3.5-turbo-0125': 16384,
  'gpt-4': 8192,
  'gpt-4-0314': 8192,
  'gpt-4-0613': 8192,
  'gpt-4-32k': 32768,
  'gpt-4-32k-0314': 32768,
  'gpt-4-32k-0613': 32768,
  'gpt-4-1106-preview': 128000,
  'gpt-4-0125-preview': 128000,
};

export const modelCost = {
  'GPT-3.5-Turbo': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'GPT-4': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'GPT-4-32k': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'GPT-4-128k': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Claude-3-Opus': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Claude-3-Sonnet': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'ChatGPT-16k': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Mistral-Large': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Gemini-Pro': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Llama-2-70b-Groq': {
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'Mixtral-8x7b-Groq':{
    prompt: { price: 0.000, unit: 1000 },
    completion: { price: 0.000, unit: 1000 },
  },
  'gpt-3.5-turbo': {
    prompt: { price: 0.0015, unit: 1000 },
    completion: { price: 0.002, unit: 1000 },
  },
  'gpt-3.5-turbo-0301': {
    prompt: { price: 0.0015, unit: 1000 },
    completion: { price: 0.002, unit: 1000 },
  },
  'gpt-3.5-turbo-0613': {
    prompt: { price: 0.0015, unit: 1000 },
    completion: { price: 0.002, unit: 1000 },
  },
  'gpt-3.5-turbo-16k': {
    prompt: { price: 0.003, unit: 1000 },
    completion: { price: 0.004, unit: 1000 },
  },
  'gpt-3.5-turbo-16k-0613': {
    prompt: { price: 0.003, unit: 1000 },
    completion: { price: 0.004, unit: 1000 },
  },
  'gpt-3.5-turbo-1106': {
    prompt: { price: 0.001, unit: 1000 },
    completion: { price: 0.0015, unit: 1000 },
  },
  'gpt-3.5-turbo-0125': {
    prompt: { price: 0.0005, unit: 1000 },
    completion: { price: 0.0015, unit: 1000 },
  },
  'gpt-4': {
    prompt: { price: 0.03, unit: 1000 },
    completion: { price: 0.06, unit: 1000 },
  },
  'gpt-4-0314': {
    prompt: { price: 0.03, unit: 1000 },
    completion: { price: 0.06, unit: 1000 },
  },
  'gpt-4-0613': {
    prompt: { price: 0.03, unit: 1000 },
    completion: { price: 0.06, unit: 1000 },
  },
  'gpt-4-32k': {
    prompt: { price: 0.06, unit: 1000 },
    completion: { price: 0.12, unit: 1000 },
  },
  'gpt-4-32k-0314': {
    prompt: { price: 0.06, unit: 1000 },
    completion: { price: 0.12, unit: 1000 },
  },
  'gpt-4-32k-0613': {
    prompt: { price: 0.06, unit: 1000 },
    completion: { price: 0.12, unit: 1000 },
  },
  'gpt-4-1106-preview': {
    prompt: { price: 0.01, unit: 1000 },
    completion: { price: 0.03, unit: 1000 },
  },
  'gpt-4-0125-preview': {
    prompt: { price: 0.01, unit: 1000 },
    completion: { price: 0.03, unit: 1000 },
  },
};

export const defaultUserMaxToken = 4000;

export const _defaultChatConfig: ConfigInterface = {
  model: defaultModel,
  max_tokens: defaultUserMaxToken,
  temperature: 1,
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
