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

      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onSettingsOpen={() => setSettingsOpen(true)} />

      <motion.main 
        initial={false}
        animate={{ paddingLeft: mainPaddingLeft }}
        transition={{ duration: 0.4, ease: premiumEasing }}
        className="flex-1 min-w-0 min-h-screen relative pb-24 md:pb-0 transition-all z-10 flex flex-col"
      >
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-8 md:py-12 flex-1">
          
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

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 dark:border-white/[0.06] flex md:hidden z-50 px-2 pb-safe">
        {(Object.entries(TAB_LABELS) as [TabId, { label: string; icon: React.ElementType }][]).map(([id, { label, icon: Icon }]) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="tracking-wide">{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
