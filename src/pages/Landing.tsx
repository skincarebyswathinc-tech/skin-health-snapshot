import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import heroBg from '@/assets/hero-bg.jpg';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b" style={{ background: 'hsl(var(--background) / 0.9)', backdropFilter: 'blur(16px)', borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <span className="text-lg font-medium tracking-tight">
            <span className="gradient-text font-semibold">Skin</span>Pulse
          </span>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary">Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} className="btn-ghost">Sign In</button>
                <button onClick={() => navigate('/auth')} className="btn-primary">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroBg} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-24 sm:py-36 text-center">
          <div className="fade-in">
            <span className="mb-5 inline-block rounded-full px-5 py-2 text-micro font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
              Your Skin, Understood
            </span>
            <h1 className="text-display mx-auto max-w-2xl leading-[1.1] sm:text-[56px]">
              Discover your skin's{' '}
              <span className="gradient-text">wellness story</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-body text-muted-foreground text-[16px] leading-relaxed">
              SkinPulse analyzes your skin with a simple photo, delivering personalized wellness insights and tracking your progress over time.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button onClick={() => navigate(user ? '/scan/new' : '/auth')} className="btn-primary px-10 py-4 text-base">
                Scan Your Skin
              </button>
              <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="btn-secondary px-10 py-4 text-base">
                View Demo Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="text-page-title mb-3">How It Works</h2>
          <p className="text-body text-muted-foreground">Three simple steps to better understand your skin</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: '01', title: 'Take a Photo', desc: 'Snap a well-lit selfie using your phone or upload an existing photo.' },
            { step: '02', title: 'Get Your Analysis', desc: 'Our wellness engine evaluates hydration, texture, pigmentation, and more.' },
            { step: '03', title: 'Track Progress', desc: 'Monitor your skin wellness over time and optimize your routine.' },
          ].map((item, i) => (
            <div key={i} className={`glass-card-feature text-center fade-in stagger-${i + 1}`}>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
                <span className="text-lg font-semibold gradient-text">{item.step}</span>
              </div>
              <h3 className="text-card-title mb-2">{item.title}</h3>
              <p className="text-body text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24" style={{ background: 'hsl(var(--secondary))' }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-14 text-center">
            <h2 className="text-page-title mb-3">Why SkinPulse?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: 'Science-Backed Metrics', desc: 'Five key dimensions of skin health, measured and tracked consistently.' },
              { title: 'Privacy First', desc: 'Your photos and data stay secure. We never share your information.' },
              { title: 'Track Over Time', desc: 'See how your skin evolves with each scan and refine your routine.' },
              { title: 'No Medical Claims', desc: 'Wellness insights to complement — not replace — professional care.' },
            ].map((item, i) => (
              <div key={i} className="glass-card-feature">
                <h3 className="text-card-title mb-2">{item.title}</h3>
                <p className="text-body text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 text-center">
        <h2 className="text-page-title mb-3">Simple Pricing</h2>
        <p className="mb-12 text-body text-muted-foreground">Start free. Upgrade when you're ready.</p>
        <div className="grid gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
          <div className="glass-card-feature text-center">
            <h3 className="text-card-title mb-1">Free</h3>
            <div className="text-display mb-5">$0</div>
            <ul className="mb-8 space-y-3 text-body text-muted-foreground">
              <li>3 scans per month</li>
              <li>Basic metrics</li>
              <li>Scan history</li>
            </ul>
            <button onClick={() => navigate('/auth')} className="btn-secondary w-full">Get Started</button>
          </div>
          <div className="glass-card-feature text-center" style={{ border: '2px solid hsl(var(--teal))' }}>
            <span className="mb-3 inline-block rounded-full px-4 py-1.5 text-micro font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>Popular</span>
            <h3 className="text-card-title mb-1">Premium</h3>
            <div className="text-display mb-5">$9<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="mb-8 space-y-3 text-body text-muted-foreground">
              <li>Unlimited scans</li>
              <li>Advanced insights</li>
              <li>Progress trends</li>
              <li>Downloadable reports</li>
            </ul>
            <button onClick={() => navigate('/auth')} className="btn-primary w-full">Coming Soon</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12 text-center" style={{ borderColor: 'hsl(var(--border))' }}>
        <span className="text-micro text-muted-foreground">
          © {new Date().getFullYear()} SkinPulse · Wellness insights, not medical advice
        </span>
      </footer>
    </div>
  );
}
