import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface Profile {
  first_name: string | null;
  age_range: string | null;
  skin_type: string | null;
  goals: string[] | null;
  skin_concerns: string[] | null;
}

interface Prefs {
  reminder_pref: string | null;
  theme_pref: string | null;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isPremium, plan } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [skinType, setSkinType] = useState('');
  const [ageRange, setAgeRange] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('first_name, age_range, skin_type, goals, skin_concerns').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setFirstName(data.first_name || '');
          setSkinType(data.skin_type || '');
          setAgeRange(data.age_range || '');
        }
      });
    supabase.from('app_preferences').select('reminder_pref, theme_pref').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setPrefs(data); });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ first_name: firstName, skin_type: skinType, age_range: ageRange }).eq('user_id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-2xl">
        <PageHeader title="Settings" subtitle="Manage your profile and preferences" />

        {/* Profile */}
        <div className="mb-6 glass-card fade-in stagger-1">
          <h2 className="text-section-title mb-5">Profile</h2>
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-micro font-medium text-muted-foreground">First Name</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-field" maxLength={50} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Age Range</label>
                <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {['18-24', '25-34', '35-44', '45-54', '55+'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-micro font-medium text-muted-foreground">Skin Type</label>
                <select value={skinType} onChange={(e) => setSkinType(e.target.value)} className="input-field">
                  <option value="">Select</option>
                  {['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              {saved && <span className="text-micro font-medium" style={{ color: 'hsl(var(--teal))' }}>✓ Saved</span>}
            </div>
          </div>
        </div>

        {/* Goals */}
        {profile?.goals && profile.goals.length > 0 && (
          <div className="mb-6 glass-card fade-in stagger-2">
            <h2 className="text-section-title mb-4">Your Goals</h2>
            <div className="flex flex-wrap gap-2">
              {profile.goals.map(g => (
                <span key={g} className="rounded-full border border-border px-4 py-1.5 text-micro font-medium">{g}</span>
              ))}
            </div>
          </div>
        )}

        {/* Concerns */}
        {profile?.skin_concerns && profile.skin_concerns.length > 0 && (
          <div className="mb-6 glass-card fade-in stagger-3">
            <h2 className="text-section-title mb-4">Skin Concerns</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skin_concerns.map(c => (
                <span key={c} className="rounded-full border border-border px-4 py-1.5 text-micro font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="mb-6 glass-card fade-in stagger-4">
          <h2 className="text-section-title mb-4">Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border p-5">
              <div>
                <p className="text-card-title">Reminders</p>
                <p className="text-micro text-muted-foreground">Scan reminders — coming soon</p>
              </div>
              <span className="rounded-full px-3 py-1 text-micro font-medium" style={{ background: 'hsl(var(--muted))' }}>
                {prefs?.reminder_pref || 'Weekly'}
              </span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="mb-6 glass-card fade-in stagger-5">
          <h2 className="text-section-title mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border p-5">
              <div>
                <p className="text-card-title">Subscription</p>
                <p className="text-micro text-muted-foreground">{isPremium ? 'Premium plan — all features unlocked' : 'Free plan — limited features'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full px-3 py-1.5 text-micro font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
                  {isPremium ? '👑 Premium' : 'Free'}
                </span>
                {!isPremium && (
                  <button onClick={() => navigate('/upgrade')} className="btn-primary text-micro py-1.5 px-4">Upgrade</button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border p-5">
              <div>
                <p className="text-card-title">Email</p>
                <p className="text-micro text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="btn-ghost w-full text-sm" style={{ color: 'hsl(var(--destructive))' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
