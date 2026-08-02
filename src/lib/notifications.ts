import { supabase } from '@/lib/supabase';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export async function pushNotification(
  userId: string,
  n: { type?: string; title: string; body?: string; link?: string }
) {
  // Notifications are created through a validated server-side function.
  // The row is always written for the signed-in user (auth.uid()), the type is
  // checked against an allowlist and links are restricted to in-app paths.
  await (supabase as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<unknown>;
  }).rpc('create_notification', {
    p_type: n.type || 'info',
    p_title: n.title,
    p_body: n.body || '',
    p_link: n.link || '',
  });
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data || []) as AppNotification[];
}

export async function markAllRead(userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
}
