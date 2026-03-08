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
        first_name: firstName, age_range: ageRange, skin_type: skinType, goals, skin_concerns: concerns, consent_accepted: consent,
      }).eq('user_id', user.id);
      await supabase.from('app_preferences').update({ onboarding_complete: true }).eq('user_id', user.id);
      navigate('/dashboard');
    } catch { /* silent */ } finally { setSaving(false); }
  };

  const chipClass = (active: boolean) =>
    `rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ${active ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`;

  const steps = [
    <div key="name" className="space-y-5 fade-in">
      <h2 className="text-page-title">What should we call you?</h2>
      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" placeholder="First name" maxLength={50} />
      <button disabled={!firstName.trim()} onClick={() => setStep(1)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    <div key="age" className="space-y-5 fade-in">
      <h2 className="text-page-title">Your age range</h2>
      <div className="grid grid-cols-2 gap-3">
        {AGE_RANGES.map(r => (
          <button key={r} onClick={() => setAgeRange(r)} className={chipClass(ageRange === r)}>{r}</button>
        ))}
      </div>
      <button disabled={!ageRange} onClick={() => setStep(2)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    <div key="type" className="space-y-5 fade-in">
      <h2 className="text-page-title">Your skin type</h2>
      <div className="grid grid-cols-2 gap-3">
        {SKIN_TYPES.map(t => (
          <button key={t} onClick={() => setSkinType(t)} className={chipClass(skinType === t)}>{t}</button>
        ))}
      </div>
      <button disabled={!skinType} onClick={() => setStep(3)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    <div key="concerns" className="space-y-5 fade-in">
      <h2 className="text-page-title">Top skin concerns</h2>
      <p className="text-body text-muted-foreground">Select all that apply</p>
      <div className="flex flex-wrap gap-2.5">
        {SKIN_CONCERNS.map(c => (
          <button key={c} onClick={() => toggleItem(concerns, setConcerns, c)} className={chipClass(concerns.includes(c))}>{c}</button>
        ))}
      </div>
      <button disabled={concerns.length === 0} onClick={() => setStep(4)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    <div key="goals" className="space-y-5 fade-in">
      <h2 className="text-page-title">Your skin goals</h2>
      <div className="flex flex-wrap gap-2.5">
        {GOALS.map(g => (
          <button key={g} onClick={() => toggleItem(goals, setGoals, g)} className={chipClass(goals.includes(g))}>{g}</button>
        ))}
      </div>
      <button disabled={goals.length === 0} onClick={() => setStep(5)} className="btn-primary w-full disabled:opacity-50">Continue</button>
    </div>,
    <div key="consent" className="space-y-5 fade-in">
      <h2 className="text-page-title">Almost there</h2>
      <div className="glass-card">
        <p className="mb-5 text-body text-muted-foreground leading-relaxed">
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
        <div className="mb-10 text-center">
          <span className="text-lg font-medium tracking-tight">
            <span className="gradient-text font-semibold">Skin</span>Pulse
          </span>
          <div className="mx-auto mt-5 flex max-w-xs gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-500" style={{ background: i <= step ? 'hsl(var(--teal))' : 'hsl(var(--border))' }} />
            ))}
          </div>
        </div>
        {steps[step]}
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost mt-4 w-full">Back</button>
        )}
      </div>
    </div>
  );
}
