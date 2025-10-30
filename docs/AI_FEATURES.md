# AI Features Setup

This blog includes AI-powered editing features using OpenAI's GPT models.

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Add your OpenAI API key to your environment variables:

```bash
# Add to .env.local or .env.development.local
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. AI Features Available

Once configured, you'll have access to:

#### **AI Copilot** (`/api/ai/copilot`)
- Smart text completion and suggestions
- Context-aware writing assistance
- Available in the rich text editor

#### **AI Commands** (`/api/ai/command`) 
- Generate new content
- Edit existing text
- Add comments and explanations
- Choose appropriate tools based on context

### 4. Using AI Features

In the blog post editor:
- **AI Copilot**: Type naturally and get intelligent suggestions
- **AI Commands**: Use keyboard shortcuts or toolbar buttons to access AI tools
- **Smart Editing**: Select text and use AI to improve, expand, or modify content

### 5. Supported Models

Default model: `gpt-4o-mini` (cost-effective and fast)

You can modify the model in the API routes if needed:
- `gpt-4o-mini` - Fast and economical
- `gpt-4o` - More capable for complex tasks
- `gpt-4-turbo` - Good balance of capability and speed

### 6. Cost Considerations

- OpenAI charges per token (input + output)
- `gpt-4o-mini` is the most cost-effective option
- Monitor usage in your OpenAI dashboard
- Consider setting usage limits

## Troubleshooting

### Error: "Missing OpenAI API key"
- Ensure `OPENAI_API_KEY` is set in your environment
- Restart your development server after adding the key
- Check that the key is valid and has credits

### AI features not working
- Verify your OpenAI account has available credits
- Check network connectivity
- Review server logs for specific error messages

## Development

The AI endpoints are located in:
- `/src/app/api/ai/copilot/route.ts` - Copilot completion
- `/src/app/api/ai/command/route.ts` - AI commands and tools

Both endpoints use the `@ai-sdk/openai` provider with proper error handling and streaming support.