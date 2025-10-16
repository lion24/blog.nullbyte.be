import type { NextRequest } from 'next/server';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    model = 'gpt-4o-mini',
    prompt,
  } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key. Please add OPENAI_API_KEY to your environment variables.' },
      { status: 401 }
    );
  }

  try {
    const openaiProvider = createOpenAI({ apiKey });
    
    const result = await generateText({
      abortSignal: req.signal,
      model: openaiProvider(model),
      prompt: prompt,
      system: `You are an advanced AI writing assistant, similar to VSCode Copilot but for general text. Your task is to predict and generate the next part of the text based on the given context.
        
      Rules:
      - Continue the text naturally up to the next punctuation mark (., ,, ;, :, ?, or !).
      - Maintain style and tone. Don't repeat given text.
      - For unclear context, provide the most likely continuation.
      - Handle code snippets, lists, or structured text if needed.
      - Don't include """ in your response.
      - CRITICAL: Always end with a punctuation mark.
      - CRITICAL: Avoid starting a new block. Do not use block formatting like >, #, 1., 2., -, etc. The suggestion should continue in the same block as the context.
      - If no context is provided or you can't generate a continuation, return "0" without explanation.
      `,
      maxRetries: 3,
      maxOutputTokens: 1500,
      temperature: 0.7,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error('Copilot AI error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
