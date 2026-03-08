import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onSignOut?: () => void;
  userName?: string;
}

export default function AppLayout({ children, showNav = true, onSignOut, userName }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNav && (
        <nav className="sticky top-0 z-50 border-b border-border" style={{ background: 'hsl(var(--background) / 0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <a href="/dashboard" className="text-lg font-light tracking-tight">
              <span className="gradient-text font-medium">Skin</span>Pulse
            </a>
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="btn-ghost text-xs">Dashboard</a>
              <a href="/scan/new" className="btn-ghost text-xs">New Scan</a>
              <a href="/history" className="btn-ghost text-xs">History</a>
              <a href="/settings" className="btn-ghost text-xs">Settings</a>
              {onSignOut && (
                <button onClick={onSignOut} className="btn-ghost text-xs">Sign Out</button>
              )}
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
}
