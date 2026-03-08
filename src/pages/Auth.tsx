import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Check your email for a reset link.');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center fade-in">
          <a href="/" className="text-2xl font-medium tracking-tight">
            <span className="gradient-text font-semibold">Skin</span>Pulse
          </a>
          <p className="mt-3 text-body text-muted-foreground">
            {mode === 'signin' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 fade-in stagger-1">
          <div>
            <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required placeholder="you@example.com" />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required minLength={6} placeholder="••••••••" />
            </div>
          )}
          {error && (
            <div className="rounded-xl p-3 text-micro" style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl p-3 text-micro" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
              {success}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-5 text-center text-micro text-muted-foreground fade-in stagger-2">
          {mode === 'signin' && (
            <>
              <button onClick={() => setMode('reset')} className="underline hover:text-foreground transition-colors">Forgot password?</button>
              <span className="mx-2">·</span>
              <button onClick={() => setMode('signup')} className="underline hover:text-foreground transition-colors">Create account</button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => setMode('signin')} className="underline hover:text-foreground transition-colors">Already have an account?</button>
          )}
          {mode === 'reset' && (
            <button onClick={() => setMode('signin')} className="underline hover:text-foreground transition-colors">Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}
