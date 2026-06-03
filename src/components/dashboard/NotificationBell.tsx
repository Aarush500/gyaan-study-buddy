import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotifications, markAllRead, type AppNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, CalendarCheck, GraduationCap, BookOpen, Info } from 'lucide-react';

const ICONS: Record<string, typeof Info> = {
  attendance: CalendarCheck,
  exam: GraduationCap,
  topic: BookOpen,
  info: Info,
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setItems(await fetchNotifications(user.id));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unread = items.filter((i) => !i.read).length;

  async function handleOpen(o: boolean) {
    setOpen(o);
    if (o && unread > 0 && user) {
      await markAllRead(user.id);
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-weak text-weak-foreground text-[10px] font-bold grid place-items-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b font-semibold text-sm">Notifications</div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <div key={n.id} className="px-4 py-3 border-b last:border-0 flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft grid place-items-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
