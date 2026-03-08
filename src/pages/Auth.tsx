import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lovable } from '@/integrations/lovable/index';

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

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-micro text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setError('');
                  const { error } = await lovable.auth.signInWithOAuth('google', {
                    redirect_uri: window.location.origin,
                  });
                  if (error) setError(error.message || 'Google sign-in failed');
                }}
                className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </>
          )}

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
