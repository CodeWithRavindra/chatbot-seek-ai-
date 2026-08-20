/**
 * Anthropic (Claude) API Provider
 * Handles chat completions using Anthropic's API
 */

class AnthropicProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  /**
   * Send a message to Anthropic and get a response
   * @param {Array} messages - Array of message objects { role, content }
   * @param {Object} options - Configuration options
   * @returns {Promise<string>} - The assistant's response
   */
  async sendMessage(messages, options = {}) {
    const {
      model = 'claude-3-haiku-20240307',
      temperature = 0.7,
      maxTokens = 2000,
    } = options;

    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: 'You are a helpful AI assistant.',
          messages: messages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.content || data.content.length === 0) {
        throw new Error('No response from Anthropic');
      }

      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API Error:', error.message);
      throw new Error(`Anthropic API failed: ${error.message}`);
    }
  }

  /**
   * Check if API key is valid
   * @returns {Promise<boolean>}
   */
  async validateApiKey() {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default AnthropicProvider;
