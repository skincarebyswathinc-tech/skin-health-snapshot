import { ReactNode } from 'react';
import SidebarNav from './SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  onSignOut?: () => void;
  userName?: string;
}

export default function AppLayout({ children, showNav = true, onSignOut }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {showNav && <SidebarNav onSignOut={onSignOut} />}
      <main
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: showNav && !isMobile ? '240px' : '0', paddingTop: showNav && isMobile ? '56px' : '0' }}
      >
        {children}
      </main>
    </div>
  );
}
