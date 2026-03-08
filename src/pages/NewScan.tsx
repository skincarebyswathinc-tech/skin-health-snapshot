import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

export default function NewScan() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('scan-images').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('scan-images').getPublicUrl(path);

      // Create scan record with pending status
      const { data: scan, error: insertError } = await supabase.from('scans').insert({
        user_id: user.id,
        image_url: publicUrl,
        status: 'analyzing',
      }).select('id').single();

      if (insertError) throw insertError;
      navigate(`/scan/analyzing/${scan.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader title="New Scan" subtitle="Upload a clear, well-lit photo of your face" />

        {/* Instructions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3 fade-in stagger-1">
          {[
            { icon: '☀️', text: 'Use natural, even lighting' },
            { icon: '📸', text: 'Face the camera directly' },
            { icon: '🧴', text: 'Remove makeup if possible' },
          ].map((tip, i) => (
            <div key={i} className="glass-card flex items-center gap-3 p-4">
              <span className="text-xl">{tip.icon}</span>
              <span className="text-sm">{tip.text}</span>
            </div>
          ))}
        </div>

        {/* Upload Area */}
        <div className="fade-in stagger-2">
          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`glass-card flex cursor-pointer flex-col items-center justify-center py-20 transition-all ${dragOver ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'hsl(var(--teal-light))' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--teal))" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mb-1 font-medium">Drop your photo here</p>
              <p className="text-sm text-muted-foreground">or click to browse from your device</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="glass-card">
              <div className="mb-4 overflow-hidden rounded-xl">
                <img src={preview} alt="Scan preview" className="mx-auto max-h-80 object-contain" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setPreview(null); setFile(null); }} className="btn-secondary flex-1">Choose Different</button>
                <button onClick={handleUpload} disabled={uploading} className="btn-primary flex-1 disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Analyze My Skin'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-xl p-4 text-center fade-in stagger-3" style={{ background: 'hsl(var(--lavender-light))' }}>
          <p className="text-xs text-muted-foreground">
            ℹ️ SkinPulse provides general wellness insights only. This is not a medical diagnosis or substitute for professional dermatological care.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
