import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { callEdgeFunction } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Smartphone, Landmark, Wallet, ShieldCheck, Check, Lock } from 'lucide-react';

type Method = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: Array<{ id: Method; label: string; hint: string; icon: typeof CreditCard }> = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'card', label: 'Card', hint: 'Debit / Credit', icon: CreditCard },
  { id: 'netbanking', label: 'Net Banking', hint: 'All major banks', icon: Landmark },
  { id: 'wallet', label: 'Wallet', hint: 'Paytm, Amazon Pay', icon: Wallet },
];

export default function Unlock() {
  const { subjectId, chapterId } = useParams<{ subjectId: string; chapterId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const chapterName = decodeURIComponent(chapterId || '');
  const [method, setMethod] = useState<Method>('upi');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [paying, setPaying] = useState(false);

  const ready =
    method === 'upi' ? /.+@.+/.test(upi)
      : method === 'card' ? card.number.replace(/\s/g, '').length >= 12 && card.name.trim() && card.expiry.trim() && card.cvv.length >= 3
        : method === 'netbanking' ? !!bank
          : true;

  async function pay() {
    setPaying(true);
    const { data, error } = await callEdgeFunction<{ unlocked?: boolean; validUntil?: string }>(
      'unlock-chapter',
      { subject: subjectId, chapterName, classLevel: profile?.class_level || '9' },
    );
    setPaying(false);
    if (error || !data?.unlocked) {
      toast.error(error || 'Payment could not be completed. Try again.');
      return;
    }
    toast.success('Unlocked! Valid till ' + (data.validUntil || '30 Apr'));
    navigate(`/subject/${subjectId}/${chapterId}`);
  }

  return (
    <div className="min-h-screen app-bg">
      <header className="glass sticky top-0 z-50 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link to={`/subject/${subjectId}/${chapterId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to chapter
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Choose how you want to pay</h1>
            <p className="text-sm text-muted-foreground mt-1">Unlock every topic of this chapter for a full year.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {METHODS.map((m) => {
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${active ? 'border-primary bg-primary-soft' : 'border-border/60 hover:border-primary/50 bg-card/60'}`}
                >
                  <div className="flex items-center justify-between">
                    <m.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                    {active && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="font-semibold mt-2">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.hint}</div>
                </button>
              );
            })}
          </div>

          <Card className="glass">
            <CardHeader className="pb-3"><CardTitle className="text-base">Payment details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {method === 'upi' && (
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input placeholder="yourname@upi" value={upi} onChange={(e) => setUpi(e.target.value)} />
                </div>
              )}
              {method === 'card' && (
                <>
                  <div className="space-y-2">
                    <Label>Card number</Label>
                    <Input inputMode="numeric" placeholder="1234 5678 9012 3456" value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Name on card</Label>
                    <Input placeholder="As printed on the card" value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input type="password" inputMode="numeric" maxLength={4} placeholder="•••" value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
              {method === 'netbanking' && (
                <div className="grid grid-cols-2 gap-3">
                  {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak', 'Other bank'].map((b) => (
                    <button key={b} onClick={() => setBank(b)}
                      className={`rounded-xl border-2 px-3 py-2.5 text-sm text-left ${bank === b ? 'border-primary bg-primary-soft' : 'border-border/60 hover:border-primary/50'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              )}
              {method === 'wallet' && (
                <p className="text-sm text-muted-foreground">You'll pick your wallet on the next screen and approve the payment there.</p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-strong" /> Payments are encrypted and verified on our servers.
              </p>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="glass-strong sticky top-20">
            <CardContent className="pt-6 space-y-3">
              <Badge>{subjectId} • Class {profile?.class_level || '9'}</Badge>
              <div className="font-display text-lg font-extrabold leading-snug">{chapterName}</div>
              <div className="flex items-end justify-between pt-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-3xl font-extrabold">₹39</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1.5 pt-2">
                <li className="flex gap-2"><Check className="w-4 h-4 text-strong shrink-0" /> Every topic, fully detailed</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-strong shrink-0" /> Diagrams, 3D visuals & numericals</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-strong shrink-0" /> Exam questions + model answers</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-strong shrink-0" /> Valid for a full year</li>
              </ul>
              <Button className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold"
                disabled={!ready || paying} onClick={pay}>
                <Lock className="w-4 h-4 mr-2" /> {paying ? 'Processing…' : 'Pay ₹39 & unlock'}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}