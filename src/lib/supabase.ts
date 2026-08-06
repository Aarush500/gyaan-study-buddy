import { supabase } from '@/integrations/supabase/client';

export { supabase };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const pendingCalls = new Map<string, Promise<{ data?: unknown; error?: string }>>();

export async function callEdgeFunction<T>(functionName: string, payload: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const requestKey = `${functionName}:${JSON.stringify(payload)}`;
  const pending = pendingCalls.get(requestKey);
  if (pending) return pending as Promise<{ data?: T; error?: string }>;

  const request = executeEdgeFunction<T>(functionName, payload);
  pendingCalls.set(requestKey, request as Promise<{ data?: unknown; error?: string }>);
  try {
    return await request;
  } finally {
    pendingCalls.delete(requestKey);
  }
}

async function executeEdgeFunction<T>(functionName: string, payload: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { error: 'Backend is still starting. Please try again in a moment.' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      return { error: 'Please sign in again to continue.' };
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(payload),
    });

    const text = (await response.text()).trim();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return { error: result.message || result.error || 'Request failed' };
    }

    // Streamed responses always return 200; errors are carried in the body.
    if (result && typeof result === 'object' && result.error) {
      return { error: result.message || result.error };
    }

    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
