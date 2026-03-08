import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const SKIN_CONCERNS = ['Acne', 'Dryness', 'Wrinkles', 'Dark spots', 'Redness', 'Oiliness', 'Sensitivity', 'Uneven tone'];
const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'];
const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GOALS = ['Clearer skin', 'Anti-aging', 'Hydration', 'Even tone', 'Reduce redness', 'Track progress'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [skinType, setSkinType] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        first_name: firstName,
        age_range: ageRange,
        skin_type: skinType,
        goals,
        skin_concerns: concerns,
        consent_accepted: consent,
      }).eq('user_id', user.id);

      await supabase.from('app_preferences').update({
        onboarding_complete: true,
      }).eq('user_id', user.id);

      navigate('/dashboard');
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    // Step 0: Name
    <div key="name" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">What should we call you?</h2>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="input-field"
        placeholder="First name"
        maxLength={50}
      />
      <button disabled={!firstName.trim()} onClick={() => setStep(1)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    // Step 1: Age
    <div key="age" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">Your age range</h2>
      <div className="grid grid-cols-2 gap-3">
        {AGE_RANGES.map(r => (
          <button key={r} onClick={() => setAgeRange(r)} className={`rounded-xl border p-3 text-sm transition-all ${ageRange === r ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}>{r}</button>
        ))}
      </div>
      <button disabled={!ageRange} onClick={() => setStep(2)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    // Step 2: Skin type
    <div key="type" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">Your skin type</h2>
      <div className="grid grid-cols-2 gap-3">
        {SKIN_TYPES.map(t => (
          <button key={t} onClick={() => setSkinType(t)} className={`rounded-xl border p-3 text-sm transition-all ${skinType === t ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}>{t}</button>
        ))}
      </div>
      <button disabled={!skinType} onClick={() => setStep(3)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    // Step 3: Concerns
    <div key="concerns" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">Top skin concerns</h2>
      <p className="text-sm text-muted-foreground">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {SKIN_CONCERNS.map(c => (
          <button key={c} onClick={() => toggleItem(concerns, setConcerns, c)} className={`rounded-full border px-4 py-2 text-sm transition-all ${concerns.includes(c) ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}>{c}</button>
        ))}
      </div>
      <button disabled={concerns.length === 0} onClick={() => setStep(4)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    // Step 4: Goals
    <div key="goals" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">Your skin goals</h2>
      <div className="flex flex-wrap gap-2">
        {GOALS.map(g => (
          <button key={g} onClick={() => toggleItem(goals, setGoals, g)} className={`rounded-full border px-4 py-2 text-sm transition-all ${goals.includes(g) ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}>{g}</button>
        ))}
      </div>
      <button disabled={goals.length === 0} onClick={() => setStep(5)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    // Step 5: Consent
    <div key="consent" className="space-y-4 fade-in">
      <h2 className="text-2xl font-light">Almost there</h2>
      <div className="glass-card">
        <p className="mb-4 text-sm text-muted-foreground">
          SkinPulse provides general wellness insights based on your uploaded photos.
          This is not a medical diagnosis. Results are informational only and should not
          replace professional dermatological advice.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={() => setConsent(!consent)} className="mt-1 h-4 w-4 rounded accent-primary" />
          <span className="text-sm">I understand and accept that SkinPulse is a wellness tool, not a medical service.</span>
        </label>
      </div>
      <button disabled={!consent || saving} onClick={handleComplete} className="btn-primary w-full disabled:opacity-50">
        {saving ? 'Saving...' : 'Start Exploring'}
      </button>
    </div>,
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-lg font-light tracking-tight">
            <span className="gradient-text font-medium">Skin</span>Pulse
          </span>
          {/* Progress */}
          <div className="mx-auto mt-4 flex max-w-xs gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i <= step ? 'hsl(var(--teal))' : 'hsl(var(--border))' }} />
            ))}
          </div>
        </div>
        {steps[step]}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost mt-4 w-full text-sm">Back</button>
        )}
      </div>
    </div>
  );
}
