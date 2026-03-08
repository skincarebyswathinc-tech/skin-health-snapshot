import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface SubscriptionState {
  plan: 'free' | 'premium';
  isPremium: boolean;
  scanCount: number;
  bonusScans: number;
  scanLimit: number;
  canScan: boolean;
  referralCode: string | null;
  referralCount: number;
  loading: boolean;
}

const FREE_SCAN_LIMIT = 2;

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'free',
    isPremium: false,
    scanCount: 0,
    bonusScans: 0,
    scanLimit: FREE_SCAN_LIMIT,
    canScan: true,
    referralCode: null,
    referralCount: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    Promise.all([
      supabase.from('subscriptions').select('plan_type, status').eq('user_id', user.id).single(),
      supabase.from('scan_usage').select('scan_count, bonus_scans').eq('user_id', user.id).eq('month', month).eq('year', year).maybeSingle(),
      supabase.from('referrals').select('referral_code').eq('referrer_user_id', user.id).limit(1).maybeSingle(),
      supabase.from('referrals').select('id').eq('referrer_user_id', user.id).not('referred_user_id', 'is', null),
    ]).then(([subRes, usageRes, refRes, refCountRes]) => {
      const plan = (subRes.data?.plan_type === 'premium' && subRes.data?.status === 'active') ? 'premium' : 'free';
      const isPremium = plan === 'premium';
      const scanCount = usageRes.data?.scan_count ?? 0;
      const bonusScans = usageRes.data?.bonus_scans ?? 0;
      const scanLimit = isPremium ? Infinity : FREE_SCAN_LIMIT + bonusScans;
      const canScan = isPremium || scanCount < scanLimit;
      const referralCode = refRes.data?.referral_code ?? null;
      const referralCount = refCountRes.data?.length ?? 0;

      setState({
        plan, isPremium, scanCount, bonusScans, scanLimit, canScan,
        referralCode, referralCount, loading: false,
      });
    });
  }, [user]);

  return state;
}

// Track usage events
export async function trackEvent(userId: string, eventType: string, metadata?: Record<string, any>) {
  await supabase.from('usage_events').insert({
    user_id: userId,
    event_type: eventType,
    metadata: metadata || {},
  });
}

// Increment scan count for current month
export async function incrementScanCount(userId: string) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data } = await supabase
    .from('scan_usage')
    .select('id, scan_count')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (data) {
    await supabase.from('scan_usage').update({ scan_count: data.scan_count + 1 }).eq('id', data.id);
  } else {
    await supabase.from('scan_usage').insert({ user_id: userId, month, year, scan_count: 1 });
  }
}

// Check if user can scan
export async function checkCanScan(userId: string): Promise<boolean> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [subRes, usageRes] = await Promise.all([
    supabase.from('subscriptions').select('plan_type, status').eq('user_id', userId).single(),
    supabase.from('scan_usage').select('scan_count, bonus_scans').eq('user_id', userId).eq('month', month).eq('year', year).maybeSingle(),
  ]);

  if (subRes.data?.plan_type === 'premium' && subRes.data?.status === 'active') return true;
  const count = usageRes.data?.scan_count ?? 0;
  const bonus = usageRes.data?.bonus_scans ?? 0;
  return count < FREE_SCAN_LIMIT + bonus;
}
