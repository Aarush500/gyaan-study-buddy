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
  await supabase.from('notifications').insert({
    user_id: userId,
    type: n.type || 'info',
    title: n.title,
    body: n.body || '',
    link: n.link || '',
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
