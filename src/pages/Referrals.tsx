import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

export default function Referrals() {
  const { user, signOut } = useAuth();
  const { referralCode, referralCount } = useSubscription();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = Math.min(referralCount, 3);
  const rewardUnlocked = progress >= 3;

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-2xl">
        <PageHeader title="Refer Friends" subtitle="Invite friends and earn extra scans" />

        {/* Reward progress */}
        <div className="glass-panel mb-8 fade-in stagger-1">
          <div className="text-center mb-6">
            <p className="text-display mb-1">{progress}/3</p>
            <p className="text-body text-muted-foreground">friends referred</p>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full mb-4" style={{ background: 'hsl(var(--muted))' }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${(progress / 3) * 100}%`, background: 'hsl(var(--teal))' }}
            />
          </div>

          <div className="flex items-center justify-between text-micro text-muted-foreground">
            <span>0 friends</span>
            <span className="font-medium" style={{ color: rewardUnlocked ? 'hsl(var(--teal))' : undefined }}>
              {rewardUnlocked ? '🎉 Reward unlocked!' : '3 friends = +3 bonus scans'}
            </span>
          </div>
        </div>

        {/* Share link */}
        <div className="glass-card mb-8 fade-in stagger-2">
          <h2 className="text-section-title mb-4">Your Referral Link</h2>
          <div className="flex gap-3">
            <input
              readOnly
              value={referralCode ? shareUrl : 'Loading...'}
              className="input-field flex-1 text-micro"
            />
            <button onClick={handleCopy} className="btn-primary text-sm shrink-0">
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="glass-card fade-in stagger-3">
          <h2 className="text-section-title mb-4">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Send your unique referral link to friends.' },
              { step: '2', title: 'Friends sign up', desc: 'When they create an account using your link, you get credit.' },
              { step: '3', title: 'Earn rewards', desc: 'After 3 successful referrals, you unlock 3 extra scans.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
                  {s.step}
                </div>
                <div>
                  <p className="text-card-title">{s.title}</p>
                  <p className="text-micro text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
