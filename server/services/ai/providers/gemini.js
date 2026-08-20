import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiProvider {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.AI_MODEL || 'gemini-2.5-pro';
  }

  async validateApiKey() {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('Gemini Validation Error:', error.message);
      return false;
    }
  }

  async sendMessage(messages, options = {}) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: options.model || this.modelName,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 2000,
        }
      });

      // Gemini expects format: { role: 'user'|'model', parts: [{ text: '...' }] }
      // Convert standard role/content messages to Gemini format
      const history = [];
      let lastUserMessage = '';

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (i === messages.length - 1 && msg.role === 'user') {
          lastUserMessage = msg.content;
        } else {
          history.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUserMessage);
      
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
}

export default GeminiProvider;
