import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';

interface FormData {
  sleep_hours: number;
  water_intake_liters: number;
  stress_level: number;
  diet_quality: number;
  exercise_minutes: number;
  sugar_intake_level: string;
  dairy_intake_level: string;
  notes: string;
}

const defaults: FormData = {
  sleep_hours: 7,
  water_intake_liters: 2,
  stress_level: 3,
  diet_quality: 3,
  exercise_minutes: 0,
  sugar_intake_level: 'medium',
  dairy_intake_level: 'medium',
  notes: '',
};

const presets: { label: string; emoji: string; values: Partial<FormData> }[] = [
  { label: 'Healthy Day', emoji: '🌿', values: { sleep_hours: 8, water_intake_liters: 3, stress_level: 1, diet_quality: 5, exercise_minutes: 45, sugar_intake_level: 'low', dairy_intake_level: 'low' } },
  { label: 'Average Day', emoji: '☁️', values: { sleep_hours: 7, water_intake_liters: 2, stress_level: 3, diet_quality: 3, exercise_minutes: 15, sugar_intake_level: 'medium', dairy_intake_level: 'medium' } },
  { label: 'Stressful Day', emoji: '😓', values: { sleep_hours: 5, water_intake_liters: 1, stress_level: 5, diet_quality: 2, exercise_minutes: 0, sugar_intake_level: 'high', dairy_intake_level: 'high' } },
];

export default function Journal() {
  const { user, signOut } = useAuth();
  const [form, setForm] = useState<FormData>(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    supabase
      .from('lifestyle_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id);
          setForm({
            sleep_hours: data.sleep_hours ?? 7,
            water_intake_liters: data.water_intake_liters ?? 2,
            stress_level: data.stress_level ?? 3,
            diet_quality: data.diet_quality ?? 3,
            exercise_minutes: data.exercise_minutes ?? 0,
            sugar_intake_level: data.sugar_intake_level ?? 'medium',
            dairy_intake_level: data.dairy_intake_level ?? 'medium',
            notes: data.notes ?? '',
          });
        }
      });
  }, [user, today]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (existingId) {
        await supabase.from('lifestyle_logs').update({ ...form }).eq('id', existingId);
      } else {
        const { data } = await supabase.from('lifestyle_logs').insert({ ...form, user_id: user.id, date: today }).select('id').single();
        if (data) setExistingId(data.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (p: typeof presets[0]) => {
    setForm(f => ({ ...f, ...p.values }));
  };

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => setForm(f => ({ ...f, [key]: val }));

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <div className="section-header fade-in">
          <h1 className="text-page-title">Daily Skin Journal</h1>
          <p>Log your daily habits to unlock skin health correlations.</p>
        </div>

        {/* Presets */}
        <div className="mb-6 flex flex-wrap gap-3 fade-in stagger-1">
          {presets.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)} className="btn-secondary flex items-center gap-2 text-sm">
              <span>{p.emoji}</span> {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 fade-in stagger-2">
          {/* Sliders */}
          <div className="glass-panel space-y-6">
            <SliderField label="Sleep Hours" value={form.sleep_hours} min={0} max={12} step={0.5} unit="hrs" onChange={v => set('sleep_hours', v)} />
            <SliderField label="Water Intake" value={form.water_intake_liters} min={0} max={5} step={0.5} unit="L" onChange={v => set('water_intake_liters', v)} />
            <SliderField label="Stress Level" value={form.stress_level} min={1} max={5} step={1} unit="" labels={['Low', '', 'Mid', '', 'High']} onChange={v => set('stress_level', v)} />
            <SliderField label="Diet Quality" value={form.diet_quality} min={1} max={5} step={1} unit="" labels={['Poor', '', 'OK', '', 'Great']} onChange={v => set('diet_quality', v)} />
            <SliderField label="Exercise" value={form.exercise_minutes} min={0} max={120} step={5} unit="min" onChange={v => set('exercise_minutes', v)} />
          </div>

          {/* Toggles & Notes */}
          <div className="space-y-6">
            <div className="glass-panel">
              <label className="text-card-title mb-3 block">Sugar Intake</label>
              <ToggleGroup options={['low', 'medium', 'high']} value={form.sugar_intake_level} onChange={v => set('sugar_intake_level', v)} />
            </div>
            <div className="glass-panel">
              <label className="text-card-title mb-3 block">Dairy Intake</label>
              <ToggleGroup options={['low', 'medium', 'high']} value={form.dairy_intake_level} onChange={v => set('dairy_intake_level', v)} />
            </div>
            <div className="glass-panel">
              <label className="text-card-title mb-3 block">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                className="input-field min-h-[80px] resize-none"
                placeholder="How does your skin feel today?"
                maxLength={500}
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-50">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : existingId ? 'Update Today\'s Log' : 'Log Today'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Slider Field ───
function SliderField({ label, value, min, max, step, unit, labels, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  labels?: string[]; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-body font-medium">{label}</label>
        <span className="text-card-title" style={{ color: 'hsl(var(--teal))' }}>
          {value}{unit && ` ${unit}`}
          {labels && labels[value - min] ? ` · ${labels[value - min]}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-teal cursor-pointer"
        style={{
          accentColor: 'hsl(var(--teal))',
        }}
      />
    </div>
  );
}

// ─── Toggle Group ───
function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="flex-1 rounded-xl py-2.5 text-sm font-medium capitalize transition-all"
          style={{
            background: value === opt ? 'hsl(var(--teal))' : 'hsl(var(--muted))',
            color: value === opt ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
