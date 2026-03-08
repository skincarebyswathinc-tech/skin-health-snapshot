import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ClinicRegister() {
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'auth' | 'clinic'>(user ? 'clinic' : 'auth');
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setError('Check your email to confirm your account, then sign in.');
        setMode('signin');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setStep('clinic');
      }
    } catch (err: any) {
      setError(err.message || 'Auth error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.from('clinic_accounts').insert({
        clinic_name: clinicName,
        admin_user_id: user.id,
        subscription_plan: 'starter',
      });
      if (error) throw error;
      navigate('/clinic');
    } catch (err: any) {
      setError(err.message || 'Failed to create clinic');
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
            <span className="ml-2 text-xs font-medium rounded-full px-2 py-0.5 bg-primary/10 text-primary">Clinic</span>
          </a>
          <p className="mt-3 text-body text-muted-foreground">
            {step === 'auth' ? 'Create your clinic account' : 'Set up your clinic'}
          </p>
        </div>

        {step === 'auth' ? (
          <form onSubmit={handleAuth} className="glass-panel space-y-5 fade-in">
            <div>
              <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required placeholder="clinic@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required minLength={6} placeholder="••••••••" />
            </div>
            {error && (
              <div className="rounded-xl p-3 text-micro" style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
            <div className="text-center text-micro text-muted-foreground">
              {mode === 'signup' ? (
                <button type="button" onClick={() => { setMode('signin'); setError(''); }} className="underline hover:text-foreground transition-colors">Already have an account?</button>
              ) : (
                <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="underline hover:text-foreground transition-colors">Create new account</button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateClinic} className="glass-panel space-y-5 fade-in">
            <div>
              <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Clinic Name</label>
              <input type="text" value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="input-field" required placeholder="Radiant Skin Clinic" />
            </div>
            {error && (
              <div className="rounded-xl p-3 text-micro" style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Clinic'}
            </button>
            <p className="text-micro text-center text-muted-foreground">
              You'll start on the <strong>Starter</strong> plan. Upgrade anytime.
            </p>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-micro text-muted-foreground underline hover:text-foreground transition-colors">← Back to SkinPulse</a>
        </div>
      </div>
    </div>
  );
}
