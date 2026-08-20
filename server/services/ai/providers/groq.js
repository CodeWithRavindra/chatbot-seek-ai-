import axios from 'axios';

/**
 * Groq API Provider
 * Groq uses an OpenAI-compatible chat completions API.
 */
class GroqProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async sendMessage(messages, options = {}) {
    const {
      model = 'openai/gpt-oss-20b',
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
        throw new Error('No response from Groq');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);
      throw new Error(`Groq API failed: ${error.message}`);
    }
  }

  async validateApiKey() {
    try {
      await this.client.post('/chat/completions', {
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default GroqProvider;
