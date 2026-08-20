import { createAIProvider } from './providers/index.js';

/**
 * AI Service
 * Wraps AI provider and manages chat interactions
 */
class AIService {
  constructor() {
    this.provider = null;
    this.initialized = false;
  }

  initializeProvider() {
    if (this.initialized) return; // Already initialized
    this.initialized = true;

    const apiKey = process.env.AI_API_KEY;
    const providerName = process.env.AI_PROVIDER || 'openai';
    
    this.model = process.env.AI_MODEL || 'gpt-3.5-turbo';
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || 0.7);
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || 2000);

    if (!apiKey) {
      console.warn(`⚠️  AI_API_KEY not configured. Using mock responses.`);
      this.provider = null;
      return;
    }

    try {
      this.provider = createAIProvider(providerName, apiKey);
      console.log(`✅ AI Provider initialized: ${providerName}`);
    } catch (error) {
      console.error(`❌ Failed to initialize AI provider: ${error.message}`);
      this.provider = null;
    }
  }

  /**
   * Send a message and get AI response
   * @param {Array} messages - Array of { role, content } objects
   * @returns {Promise<string>}
   */
  async sendMessage(messages) {
    // Initialize provider on first use (lazy initialization)
    if (!this.initialized) {
      this.initializeProvider();
    }

    if (!this.provider) {
      return this.getMockResponse();
    }

    try {
      const response = await this.provider.sendMessage(messages, {
        model: this.model,
        temperature: this.temperature,
        maxTokens: this.maxTokens,
      });

      return response;
    } catch (error) {
      console.error('AI Service Error:', error.message);
      return `I encountered an error: ${error.message}`;
    }
  }

  /**
   * Get a mock response (used when no API key is configured)
   */
  getMockResponse() {
    const mockResponses = [
      'That\'s an interesting question. I\'d need a real API key to give you a proper answer. Please configure AI_API_KEY in your .env file.',
      'I\'m running in demo mode right now. Connect your OpenAI or Anthropic API key to get real responses.',
      'This is a mock response. To enable real AI responses, set your API key in the environment variables.',
      'I\'m currently offline. Please configure your AI provider API key to enable real conversations.',
    ];

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  /**
   * Validate the current AI provider
   */
  async validate() {
    if (!this.provider) {
      return { valid: false, message: 'No AI provider configured' };
    }

    const isValid = await this.provider.validateApiKey();
    return {
      valid: isValid,
      provider: process.env.AI_PROVIDER || 'openai',
      message: isValid ? 'API key is valid' : 'API key is invalid',
    };
  }
}

// Create singleton instance
const aiService = new AIService();

export default aiService;
