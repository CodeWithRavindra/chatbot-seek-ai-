import axios from 'axios';

/**
 * OpenAI API Provider
 * Handles chat completions and embeddings using OpenAI's API
 */
class OpenAIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {Array} messages - Array of message objects { role, content }
   * @param {Object} options - Configuration options
   * @returns {Promise<string>} - The assistant's response
   */
  async sendMessage(messages, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`OpenAI API failed: ${error.message}`);
    }
  }

  /**
   * Check if API key is valid
   * @returns {Promise<boolean>}
   */
  async validateApiKey() {
    try {
      await this.client.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default OpenAIProvider;
