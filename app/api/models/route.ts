import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { provider, apiKey, baseUrl } = await req.json();
    let models: { id: string; name: string }[] = [];

    if (provider === 'openai' || provider === 'openrouter' || provider === 'custom' || provider === 'opencodezen') {
      const endpoint = baseUrl || (
        provider === 'openai' ? 'https://api.openai.com/v1' :
        provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : 
        provider === 'opencodezen' ? 'https://api.opencodezen.com/v1' : ''
      );

      if (!endpoint) {
        throw new Error('Base URL is required for this provider.');
      }

      const res = await fetch(`${endpoint.replace(/\/$/, '')}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        let errorMessage = `Failed to fetch models: ${res.statusText} (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = `Provider Error: ${errorData.error.message}`;
          } else if (errorData.message) {
            errorMessage = `Provider Error: ${errorData.message}`;
          }
        } catch (e) {
          // Ignore parsing error, stick to statusText
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data && data.data && Array.isArray(data.data)) {
        models = data.data.map((m: any) => ({ 
          id: m.id, 
          name: m.id 
        }));
      } else {
         throw new Error('Invalid response format from provider.');
      }

    } else if (provider === 'anthropic') {
      // Anthropic doesn't expose a standard /v1/models endpoint for API keys in the same way.
      // We provide the standard models here.
      models = [
        { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
      ];
    } else if (provider === 'gemini') {
      // Standard Gemini models
      models = [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.0-pro-exp', name: 'Gemini 2.0 Pro Experimental' },
        { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
      ];
    } else {
      throw new Error('Unsupported provider.');
    }

    return NextResponse.json({ models });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
