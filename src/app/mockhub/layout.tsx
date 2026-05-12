'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { TabId } from '@/components/layout/Sidebar';
import SettingsModal from '@/components/layout/SettingsModal';
import { useApp } from '@/context/AppContext';
import { Globe, Target, Trophy, Clock, LayoutGrid } from 'lucide-react';

const NAV_TABS = [
  { id: 'overview', label: 'Overview', path: '/mockhub', icon: LayoutGrid, exact: true },
  { id: 'arena', label: 'Live Arena', path: '/mockhub/arena', icon: Globe },
  { id: 'assessment', label: 'Assessments', path: '/mockhub/assessment', icon: Target },
  { id: 'leaderboard', label: 'Leaderboard', path: '/mockhub/leaderboard', icon: Trophy },
  { id: 'history', label: 'History', path: '/mockhub/interview/history', icon: Clock },
];

export default function MockHubLayout({ children }: { children: ReactNode }) {
  const { state, isSidebarHovered } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth < 768);
    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const handleTabChange = (id: TabId) => {
    if (id === 'mocks') router.push('/mockhub');
    else if (id === 'dashboard') router.push('/');
    else router.push(`/${id}`);
  };

  const isActive = (tab: typeof NAV_TABS[0]) => {
    if (tab.exact) return pathname === tab.path;
    return pathname.startsWith(tab.path);
  };

  const collapsed = state.sidebarCollapsed;
  const mainPaddingLeft = isMobileViewport ? '0px' : (isSidebarHovered ? '240px' : (collapsed ? '80px' : '240px'));
  const premiumEasing = [0.32, 0.72, 0, 1] as any;

  return (
    <div className="flex min-h-screen bg-background text-[#EDEDED] selection:bg-primary/30 selection:text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.025)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.025)_0%,transparent_70%)] blur-3xl" />
      </div>

      <Sidebar activeTab="mocks" onTabChange={handleTabChange} onSettingsOpen={() => setSettingsOpen(true)} />

      <motion.main
        initial={false}
        animate={{ paddingLeft: mainPaddingLeft }}
        transition={{ duration: 0.4, ease: premiumEasing }}
        className="flex-1 min-w-0 min-h-screen relative pb-24 md:pb-0 z-10 flex flex-col"
      >
        {/* Sub-Navigation Header */}
        <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-2xl border-b border-white/[0.06]">
          <div className="px-6 md:px-10 h-14 flex items-center gap-1">
            {/* Brand Mark */}
            <div className="flex items-center gap-2 mr-4 pr-4 border-r border-white/10">
              <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="text-xs font-black tracking-tight text-white/80 hidden sm:block">Mock Hub</span>
            </div>

            {/* Nav Pills */}
            <nav className="flex items-center gap-0.5">
              {NAV_TABS.map((tab) => {
                const active = isActive(tab);
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.path)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                      active
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/10 rounded-lg"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <tab.icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden sm:block">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
