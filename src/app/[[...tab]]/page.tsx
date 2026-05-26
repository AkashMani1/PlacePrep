/* Developed by Akash Mani - Refactored for Premium Performance */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { LayoutDashboard, GitMerge, Code2, Video, BookOpen, Target, Layers, Settings } from 'lucide-react';
import Sidebar, { TabId } from '@/components/layout/Sidebar';
import MobileTopBar from '@/components/layout/MobileTopBar';
import { useApp } from '@/context/AppContext';
import { useKeyboardStatus } from '@/hooks/useKeyboardStatus';

// 🚀 PERFORMANCE OPTIMIZATION: Lazy Load all heavy views
// This prevents downloading the entire app bundle on initial load.
const DashboardView = dynamic(() => import('@/components/dashboard/DashboardView'), { 
  loading: () => <PageLoader /> 
});
const RoadmapView = dynamic(() => import('@/components/roadmap/RoadmapView'), { loading: () => <PageLoader /> });
const DSATrackerView = dynamic(() => import('@/components/dsa/DSATrackerView'), { loading: () => <PageLoader /> });
const DSASheetView = dynamic(() => import('@/components/dsa-sheet/DSASheetView'), { loading: () => <PageLoader /> });
const MockHubView = dynamic(() => import('@/components/mocks/MockHubView'), { loading: () => <PageLoader /> });
const NotesVaultView = dynamic(() => import('@/components/notes/NotesVaultView'), { loading: () => <PageLoader /> });
const ProjectLabView = dynamic(() => import('@/components/projects/ProjectLabView'), { loading: () => <PageLoader /> });
const AdminPanelView = dynamic(() => import('@/components/admin/AdminPanelView'), { loading: () => <PageLoader /> });
const SettingsModal = dynamic(() => import('@/components/layout/SettingsModal'), { ssr: false });

const TAB_LABELS: Record<TabId, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Overview', icon: LayoutDashboard },
  roadmap: { label: 'Roadmap', icon: GitMerge },
  dsa: { label: 'Must Do List', icon: Target },
  dsaSheet: { label: 'DSA Sheet', icon: Code2 },
  mocks: { label: 'Mock Hub', icon: Video },
  notes: { label: 'Knowledge', icon: BookOpen },
  projects: { label: 'Projects', icon: Layers },
  admin: { label: 'Admin', icon: Settings },
};

const MOBILE_NAV_TABS: Array<{ id: TabId; mobileLabel?: string }> = [
  { id: 'dashboard' },
  { id: 'roadmap' },
  { id: 'dsa' },
  { id: 'dsaSheet', mobileLabel: 'Sheet' },
  { id: 'notes' },
];

// Custom Premium Easing (Linear/Vercel style)
const premiumEasing = [0.32, 0.72, 0, 1] as any;

import { MobileDashboardSkeleton, Skeleton } from '@/components/common/Skeleton';

function PageLoader() {
  return (
    <div className="w-full h-full p-4">
      <div className="hidden md:flex flex-col gap-6">
         <Skeleton className="w-1/3 h-12" />
         <div className="grid grid-cols-4 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
         </div>
      </div>
      <MobileDashboardSkeleton />
    </div>
  );
}

export default function AppShell() {
  const { state, isSidebarHovered } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  // Detects when the software keyboard is open on mobile.
  // Used to hide the bottom nav so it doesn't overlap the keyboard.
  const isKeyboardOpen = useKeyboardStatus();
  
  const currentTab = (pathname.split('/').filter(Boolean)[0] || 'dashboard') as TabId;
  const resolvedTab = TAB_LABELS[currentTab] ? currentTab : 'dashboard';
  
  const [activeTab, setActiveTab] = useState<TabId>(resolvedTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync state with URL changes
  useEffect(() => {
    if (currentTab === 'mocks') {
      router.replace('/mockhub');
      return;
    }
    if (!TAB_LABELS[currentTab]) {
      setActiveTab('dashboard');
      router.replace('/');
      return;
    }
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab, activeTab, router]);

  useEffect(() => {
    const syncViewport = () => setIsMobileViewport(window.innerWidth < 768);
    syncViewport(); // Initial check
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const handleTabChange = (id: TabId) => {
    if (id === 'mocks') {
      router.push('/mockhub');
      return;
    }
    setActiveTab(id);
    router.push(id === 'dashboard' ? '/' : `/${id}`);
  };

  const collapsed = state.sidebarCollapsed;
  const mainPaddingLeft = isMobileViewport ? '0px' : (isSidebarHovered ? '240px' : (collapsed ? '80px' : '240px'));

  return (
    <div className="flex min-h-[100dvh] bg-background text-[#EDEDED] selection:bg-primary/30 selection:text-white">
      
      {/* 🎨 UI/UX UPGRADE: Premium Soothing Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.03)_0%,transparent_70%)] blur-3xl" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.03)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Desktop sidebar (hidden on mobile via CSS) */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onSettingsOpen={() => setSettingsOpen(true)} />

      <motion.main 
        initial={false}
        animate={{ paddingLeft: mainPaddingLeft }}
        transition={{ duration: 0.4, ease: premiumEasing }}
        className="relative z-10 flex min-h-[100dvh] min-w-0 flex-1 flex-col overflow-x-clip pb-[7.5rem] transition-all md:pb-0"
      >
        {/* Frosted glass sticky top bar — mobile only, replaces hamburger */}
        <MobileTopBar onSettingsOpen={() => setSettingsOpen(true)} />
        <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 px-4 pb-8 pt-3 md:px-12 md:py-12">
          
          {/* Header Section Removed as per new Awwwards-style UI */}

          {/* Dynamic Tab Content with Smooth Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: premiumEasing }}
              className="min-w-0 flex-1"
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'roadmap' && <RoadmapView />}
              {activeTab === 'dsa' && <DSATrackerView />}
              {activeTab === 'dsaSheet' && <DSASheetView />}
              {activeTab === 'mocks' && <MockHubView />}
              {activeTab === 'notes' && <NotesVaultView />}
              {activeTab === 'projects' && <ProjectLabView />}
              {activeTab === 'admin' && <AdminPanelView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimalist Footer */}
        <footer className="w-full border-t border-border/50 dark:border-white/[0.04] px-8 py-6 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-background/80 backdrop-blur-md">
          <p className="text-muted-foreground text-xs font-medium flex items-center gap-2">
            PlacePrep © {new Date().getFullYear()} • Designed by Akash Mani
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
             <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Local Sync Active</span>
             <span>v5.4.0</span>
          </div>
        </footer>
      </motion.main>

      {/* Mobile Nav — hidden when keyboard is open to prevent overlap */}
      <AnimatePresence>
        {!isKeyboardOpen && (
          <motion.nav
            key="bottom-nav"
            initial={{ y: 0 }}
            exit={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="safe-bottom fixed inset-x-0 bottom-0 z-[45] flex border-t border-white/10 bg-black/70 px-3 pb-4 pt-3 shadow-[0_-14px_40px_rgba(0,0,0,0.42),0_-1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-black/55 md:hidden"
          >
            {MOBILE_NAV_TABS.map(({ id, mobileLabel }) => {
              const { label, icon: Icon } = TAB_LABELS[id];
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-2xl px-2 py-2 transition-all duration-300 btn-press-anim ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-6 h-6 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'opacity-60 grayscale'}`} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.div layoutId="mobilenav-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                    )}
                  </div>
                  <span className={`max-w-full truncate tracking-tight text-[10px] ${isActive ? 'font-black opacity-100' : 'font-medium opacity-70'}`}>{mobileLabel ?? label.split(' ')[0]}</span>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
