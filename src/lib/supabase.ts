import { supabase } from '@/integrations/supabase/client';

export { supabase };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function callEdgeFunction<T>(functionName: string, payload: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
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

    const text = await response.text();
    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return { data: result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
