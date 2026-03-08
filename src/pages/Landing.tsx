import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import heroBg from '@/assets/hero-bg.jpg';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 sm:px-12">
        <span className="text-lg font-light tracking-tight">
          <span className="gradient-text font-medium">Skin</span>Pulse
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="btn-ghost text-sm">Sign In</button>
              <button onClick={() => navigate('/auth')} className="btn-primary text-sm">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-32">
        <div className="fade-in">
          <span className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
            Your Skin, Understood
          </span>
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight sm:text-6xl">
            Discover your skin's <br />
            <span className="gradient-text font-normal">wellness story</span>
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            SkinPulse analyzes your skin with a simple photo, delivering personalized wellness insights and tracking your progress over time.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button onClick={() => navigate(user ? '/scan/new' : '/auth')} className="btn-primary px-8 py-4 text-base">
              Scan Your Skin
            </button>
            <button onClick={() => navigate(user ? '/dashboard' : '/auth')} className="btn-secondary px-8 py-4 text-base">
              View Demo Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-light tracking-tight">How It Works</h2>
          <p className="text-muted-foreground">Three simple steps to better understand your skin</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            { step: '01', title: 'Take a Photo', desc: 'Snap a well-lit selfie using your phone or upload an existing photo.' },
            { step: '02', title: 'Get Your Analysis', desc: 'Our wellness engine evaluates hydration, texture, pigmentation, and more.' },
            { step: '03', title: 'Track Progress', desc: 'Monitor your skin wellness over time and optimize your routine.' },
          ].map((item, i) => (
            <div key={i} className={`glass-card-hover text-center fade-in stagger-${i + 1}`}>
              <div className="mb-3 text-3xl font-light gradient-text">{item.step}</div>
              <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20" style={{ background: 'hsl(var(--secondary))' }}>
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-light tracking-tight">Why SkinPulse?</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: 'Science-Backed Metrics', desc: 'Five key dimensions of skin health, measured and tracked consistently.' },
              { title: 'Privacy First', desc: 'Your photos and data stay secure. We never share your information.' },
              { title: 'Track Over Time', desc: 'See how your skin evolves with each scan and refine your routine.' },
              { title: 'No Medical Claims', desc: 'Wellness insights to complement — not replace — professional care.' },
            ].map((item, i) => (
              <div key={i} className="glass-card">
                <h3 className="mb-2 font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="mb-3 text-3xl font-light tracking-tight">Simple Pricing</h2>
        <p className="mb-10 text-muted-foreground">Start free. Upgrade when you're ready.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="glass-card text-center">
            <h3 className="mb-1 text-lg font-medium">Free</h3>
            <div className="mb-4 text-3xl font-light">$0</div>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li>3 scans per month</li>
              <li>Basic metrics</li>
              <li>Scan history</li>
            </ul>
            <button onClick={() => navigate('/auth')} className="btn-secondary w-full">Get Started</button>
          </div>
          <div className="glass-card text-center" style={{ border: '2px solid hsl(var(--teal))' }}>
            <span className="mb-2 inline-block rounded-full px-3 py-1 text-xs" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>Popular</span>
            <h3 className="mb-1 text-lg font-medium">Premium</h3>
            <div className="mb-4 text-3xl font-light">$9<span className="text-sm text-muted-foreground">/mo</span></div>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
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
      <footer className="border-t border-border px-6 py-10 text-center">
        <span className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SkinPulse · Wellness insights, not medical advice
        </span>
      </footer>
    </div>
  );
}
