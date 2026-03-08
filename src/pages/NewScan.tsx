import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription, incrementScanCount, trackEvent } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import ScanLimitBanner from '@/components/ScanLimitBanner';
import CameraCapture from '@/components/CameraCapture';

const TIPS = [
  { icon: '☀️', title: 'Natural Lighting', desc: 'Use even, natural light — avoid harsh shadows' },
  { icon: '📸', title: 'Face Camera', desc: 'Look directly at the camera at eye level' },
  { icon: '🧴', title: 'Clean Skin', desc: 'Remove makeup for the most accurate results' },
  { icon: '😐', title: 'Neutral Expression', desc: 'Keep a relaxed, neutral face' },
];

export default function NewScan() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { canScan, scanCount, scanLimit, isPremium } = useSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    if (!canScan) {
      navigate('/upgrade');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('scan-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('scan-images').getPublicUrl(path);
      const { data: scan, error: insertError } = await supabase.from('scans').insert({
        user_id: user.id,
        image_url: publicUrl,
        status: 'analyzing',
      }).select('id').single();
      if (insertError) throw insertError;

      // Increment scan count and track event
      await Promise.all([
        incrementScanCount(user.id),
        trackEvent(user.id, 'scan_uploaded'),
      ]);

      navigate(`/scan/analyzing/${scan.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-3xl">
        <PageHeader title="New Scan" subtitle="Upload a clear, well-lit photo of your face" />

        <ScanLimitBanner scanCount={scanCount} scanLimit={typeof scanLimit === 'number' ? scanLimit : 999} isPremium={isPremium} />

        {/* Tips */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 fade-in stagger-1">
          {TIPS.map((tip, i) => (
            <div key={i} className="glass-card flex items-start gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: 'hsl(var(--teal-light))' }}>{tip.icon}</span>
              <div>
                <p className="text-card-title">{tip.title}</p>
                <p className="text-micro text-muted-foreground mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        <div className="fade-in stagger-2">
          {!canScan ? (
            <div className="glass-panel text-center py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--lavender-light))' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--accent))" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-card-title mb-1">Monthly scan limit reached</p>
              <p className="text-micro text-muted-foreground mb-5">Upgrade to Premium for unlimited scans.</p>
              <button onClick={() => navigate('/upgrade')} className="btn-primary">Upgrade to Premium</button>
            </div>
          ) : !preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel flex cursor-pointer flex-col items-center justify-center py-24 transition-all"
              style={{
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: dragOver ? 'hsl(var(--teal))' : 'hsl(var(--border))',
              }}
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--teal))" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="text-card-title mb-1">Drop your photo here</p>
              <p className="text-micro text-muted-foreground">or click to browse from your device</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="glass-panel">
              <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: 'hsl(var(--muted))' }}>
                <img src={preview} alt="Scan preview" className="mx-auto max-h-80 object-contain p-4" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setPreview(null); setFile(null); }} className="btn-secondary flex-1">Choose Different</button>
                <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1 disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Analyze My Skin'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl p-5 text-center fade-in stagger-3" style={{ background: 'hsl(var(--lavender-light))' }}>
          <p className="text-micro text-muted-foreground">
            ℹ️ SkinPulse provides general wellness insights only. This is not a medical diagnosis or substitute for professional dermatological care.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
