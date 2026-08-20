import OpenAIProvider from './openai.js';
import AnthropicProvider from './anthropic.js';
import GroqProvider from './groq.js';
import GeminiProvider from './gemini.js';

/**
 * AI Provider Factory
 * Returns the appropriate AI provider based on the provider name
 */
export function createAIProvider(providerName, apiKey) {
  const providers = {
    openai: OpenAIProvider,
    anthropic: AnthropicProvider,
    groq: GroqProvider,
    gemini: GeminiProvider,
  };

  const ProviderClass = providers[providerName.toLowerCase()];

  if (!ProviderClass) {
    throw new Error(`Unknown AI provider: ${providerName}`);
  }

  return new ProviderClass(apiKey);
}

export { default as OpenAIProvider } from './openai.js';
export { default as AnthropicProvider } from './anthropic.js';
export { default as GroqProvider } from './groq.js';
export { default as GeminiProvider } from './gemini.js';
