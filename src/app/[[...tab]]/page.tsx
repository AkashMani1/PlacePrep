/* Developed by Akash Mani - Refactored for Premium Performance */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LayoutDashboard, GitMerge, Code2, Video, BookOpen, Target, Layers, Loader2, Settings } from 'lucide-react';
import Sidebar, { TabId } from '@/components/layout/Sidebar';
import SettingsModal from '@/components/layout/SettingsModal';
import { useApp } from '@/context/AppContext';

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

// Custom Premium Easing (Linear/Vercel style)
const premiumEasing = [0.32, 0.72, 0, 1] as any;

function PageLoader() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
    </div>
  );
}

export default function AppShell() {
  const { state, isSidebarHovered } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  
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

  const { label, icon: Icon } = TAB_LABELS[activeTab] ?? TAB_LABELS.dashboard;
  const collapsed = state.sidebarCollapsed;
  const mainPaddingLeft = isMobileViewport ? '0px' : (isSidebarHovered ? '240px' : (collapsed ? '80px' : '240px'));

  return (
    <div className="flex min-h-screen bg-background text-[#EDEDED] selection:bg-primary/30 selection:text-white">
      
      {/* 🎨 UI/UX UPGRADE: Premium Soothing Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.03)_0%,transparent_70%)] blur-3xl" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.03)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Floating Toggle for Mobile */}
      {isMobileViewport && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-[60] w-12 h-12 rounded-xl bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl active:scale-95 transition-all flex items-center justify-center group"
        >
          <div className="w-5 h-4 flex flex-col justify-between items-start">
            <div className="w-5 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors" />
            <div className="w-3 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors" />
            <div className="w-5 h-0.5 bg-foreground rounded-full group-hover:bg-primary transition-colors" />
          </div>
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileViewport && sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[80] bg-background border-r border-white/10 shadow-[20px_0_60px_rgba(0,0,0,0.5)]"
            >
              <div className="h-full flex flex-col">
                <Sidebar 
                  activeTab={activeTab} 
                  onTabChange={(id) => { setSidebarOpen(false); handleTabChange(id); }} 
                  onSettingsOpen={() => { setSidebarOpen(false); setSettingsOpen(true); }}
                  isMobile={true}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onSettingsOpen={() => setSettingsOpen(true)} />

      <motion.main 
        initial={false}
        animate={{ paddingLeft: mainPaddingLeft }}
        transition={{ duration: 0.4, ease: premiumEasing }}
        className="flex-1 min-w-0 min-h-screen relative pb-32 md:pb-0 transition-all z-10 flex flex-col"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-12 pt-16 md:pt-12 pb-6 md:py-12 flex-1">
          
          {/* Header Section Removed as per new Awwwards-style UI */}

          {/* Dynamic Tab Content with Smooth Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: premiumEasing }}
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

      {/* Mobile Nav - Minimalist Production Feel */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-2xl border-t border-white/[0.08] flex md:hidden z-50 px-4 pb-6 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        {(Object.entries(TAB_LABELS) as [TabId, { label: string; icon: React.ElementType }][])
          .filter(([id]) => ['dashboard', 'roadmap', 'dsa', 'mocks', 'notes'].includes(id))
          .map(([id, { label, icon: Icon }]) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' : 'opacity-60 grayscale'}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div layoutId="mobilenav-dot" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                )}
              </div>
              <span className={`tracking-tight text-[10px] ${isActive ? 'font-black opacity-100' : 'font-medium opacity-40'}`}>{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
