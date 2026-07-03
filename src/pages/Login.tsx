import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AuthShell, GoogleButton } from '@/components/auth/AuthShell';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      toast({ title: 'Google sign-in failed', description: error, variant: 'destructive' });
    } else {
      navigate('/dashboard');
    }
  }

  return (
    <AuthShell>
      <div className="glass-strong rounded-3xl p-8 shadow-xl">
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl glass grid place-items-center">
            <span className="font-display font-extrabold text-xl text-primary">G</span>
          </div>
          <span className="font-display font-extrabold text-xl">Gyaan</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold">Welcome back 👋</h1>
        <p className="text-muted-foreground text-sm mt-1 mb-6">Sign in to keep scoring more.</p>

        <GoogleButton onClick={handleGoogle} loading={googleLoading} />

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full glass-btn text-primary-foreground h-11" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </AuthShell>
  );
}
