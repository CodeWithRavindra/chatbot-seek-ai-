# SeekAI - AI Integration Guide

## Quick Start with AI API

### Option 1: Using OpenAI (Recommended)

1. **Get your API key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Sign up or log in
   - Create a new API key
   - Copy the key (you'll only see it once!)

2. **Add to `.env` file** (`/server/.env`):
   ```
   AI_API_KEY=sk-your-key-here
   AI_PROVIDER=openai
   AI_MODEL=gpt-3.5-turbo
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

### Option 2: Using Anthropic (Claude)

1. **Get your API key:**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Create an API key in settings
   - Copy the key

2. **Add to `.env` file**:
   ```
   AI_API_KEY=sk-ant-your-key-here
   AI_PROVIDER=anthropic
   AI_MODEL=claude-3-haiku-20240307
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

## How It Works

### Architecture

```
Frontend (React) 
    ↓ POST /api/chat/:id/message (user message)
Backend (Express)
    ↓ AI Service
    ↓ OpenAI/Anthropic API
    ↓ Get response
Backend saves user + AI response to MongoDB
    ↓ returns chat with all messages
Frontend displays conversation
```

### Flow

1. **User sends message** → Frontend sends to `/api/chat/:id/message`
2. **Backend receives message** → Saves to MongoDB
3. **AI Service processes** → Calls OpenAI/Anthropic API
4. **Response received** → Backend saves AI response
5. **Chat returned** → Frontend updates message list
6. **Display** → Both messages shown in UI

## Configuration Options

In `/server/.env`:

```env
# AI Provider (openai or anthropic)
AI_PROVIDER=openai

# Model to use
AI_MODEL=gpt-3.5-turbo

# Temperature (0.0-1.0) - lower = more consistent, higher = more creative
AI_TEMPERATURE=0.7

# Max tokens to generate
AI_MAX_TOKENS=2000
```

## Testing

### Without API Key (Mock Mode)
If you don't set `AI_API_KEY`, the app will return mock responses so you can test the UI.

### With API Key
Once configured, real AI responses will be generated automatically.

## Pricing & Cost

### OpenAI
- **gpt-3.5-turbo**: ~$0.0005 per 1K input tokens, $0.0015 per 1K output tokens
- **gpt-4**: ~$0.003 per 1K input tokens, $0.006 per 1K output tokens
- Free trial credits: $5

### Anthropic (Claude)
- **claude-3-haiku**: ~$0.00025 per 1K input tokens, $0.00125 per 1K output tokens
- **claude-3-sonnet**: ~$0.003 per 1K input tokens, $0.015 per 1K output tokens

## Troubleshooting

### "No response from AI"
- Check your API key is correct
- Verify it's in `.env` file
- Restart the server after changing `.env`
- Check your API provider account is active and has credit

### "API key is invalid"
- The key format is wrong (should start with `sk-` for OpenAI)
- The key has been revoked or disabled
- Try creating a new key

### Rate Limited
- Wait a few minutes before making more requests
- Consider upgrading your API plan
- Add request queueing (future feature)

## Next Steps

- **Search Integration**: Add real search API (Bing, Tavily, etc.)
- **Streaming**: Implement real-time response streaming
- **Fine-tuning**: Create custom AI models
- **Logging**: Track API costs and usage
- **Caching**: Cache common responses to reduce costs

## Support

For issues with API keys:
- OpenAI: [Help Center](https://help.openai.com/)
- Anthropic: [Documentation](https://docs.anthropic.com/)
