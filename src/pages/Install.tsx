import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) setIsInstalled(true);

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <AppLayout>
      <div className="page-container max-w-2xl">
        <PageHeader title="Install SkinPulse" subtitle="Get the full mobile experience" />

        <div className="glass-panel text-center py-12 fade-in">
          {isInstalled ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-card-title mb-2">Already Installed!</h2>
              <p className="text-muted-foreground text-sm mb-6">SkinPulse is running as an app on your device.</p>
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
            </>
          ) : deferredPrompt ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-3xl">📲</span>
              </div>
              <h2 className="text-card-title mb-2">Install SkinPulse</h2>
              <p className="text-muted-foreground text-sm mb-6">Add SkinPulse to your home screen for quick access, offline support, and a native app experience.</p>
              <button onClick={handleInstall} className="btn-primary">Install App</button>
            </>
          ) : isIOS ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-3xl">📱</span>
              </div>
              <h2 className="text-card-title mb-2">Install on iPhone</h2>
              <p className="text-muted-foreground text-sm mb-6">To install SkinPulse on your iPhone:</p>
              <ol className="text-left text-sm text-muted-foreground space-y-3 mb-6 max-w-xs mx-auto">
                <li className="flex gap-3"><span className="font-semibold text-foreground">1.</span> Tap the <strong>Share</strong> button in Safari</li>
                <li className="flex gap-3"><span className="font-semibold text-foreground">2.</span> Scroll down and tap <strong>Add to Home Screen</strong></li>
                <li className="flex gap-3"><span className="font-semibold text-foreground">3.</span> Tap <strong>Add</strong> to confirm</li>
              </ol>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-3xl">📲</span>
              </div>
              <h2 className="text-card-title mb-2">Install SkinPulse</h2>
              <p className="text-muted-foreground text-sm mb-6">Use your browser menu to add SkinPulse to your home screen for a native app experience.</p>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Dashboard</button>
            </>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 fade-in stagger-1">
          {[
            { icon: '⚡', title: 'Fast & Smooth', desc: 'Instant loading with offline support' },
            { icon: '📸', title: 'Camera Access', desc: 'Take skin scans directly from the app' },
            { icon: '🔔', title: 'Notifications', desc: 'Get reminders for scans & routines' },
          ].map((f, i) => (
            <div key={i} className="glass-card p-5 text-center">
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <p className="text-card-title text-sm">{f.title}</p>
              <p className="text-micro text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
