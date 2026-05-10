/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Sidebar, { TabId } from '@/components/layout/Sidebar';
import SettingsModal from '@/components/layout/SettingsModal';
import DashboardView from '@/components/dashboard/DashboardView';
import RoadmapView from '@/components/roadmap/RoadmapView';
import DSATrackerView from '@/components/dsa/DSATrackerView';
import DSASheetView from '@/components/dsa-sheet/DSASheetView';
import MockHubView from '@/components/mocks/MockHubView';
import NotesVaultView from '@/components/notes/NotesVaultView';
import ProjectLabView from '@/components/projects/ProjectLabView';
import { LayoutDashboard, GitMerge, Code2, Video, BookOpen, Target, Layers } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const TAB_LABELS: Record<TabId, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  roadmap: { label: '3-Month Roadmap', icon: GitMerge },
  dsa: { label: 'Must Do List', icon: Target },
  dsaSheet: { label: 'DSA Sheet', icon: Code2 },
  mocks: { label: 'Mock Hub', icon: Video },
  notes: { label: 'Knowledge Base', icon: BookOpen },
  projects: { label: 'Project Lab', icon: Layers },
};

export default function Home() {
  const { state, isSidebarHovered } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  
  // Derive active tab from pathname, default to 'dashboard'
  const currentTab = (pathname.split('/').filter(Boolean)[0] || 'dashboard') as TabId;
  const resolvedTab = TAB_LABELS[currentTab] ? currentTab : 'dashboard';
  const [activeTab, setActiveTab] = useState<TabId>(resolvedTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  // Sync state with URL changes
  useEffect(() => {
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
    const syncViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    router.push(id === 'dashboard' ? '/' : `/${id}`);
  };

  const { label, icon: Icon } = TAB_LABELS[activeTab] ?? TAB_LABELS.dashboard;
  const collapsed = state.sidebarCollapsed;
  const mainPaddingLeft = isMobileViewport ? '0px' : (isSidebarHovered ? '240px' : (collapsed ? '80px' : '240px'));

  return (
    <div className="flex min-h-screen bg-obsidian selection:bg-neon-indigo/30 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} onSettingsOpen={() => setSettingsOpen(true)} />

      {/* Main content */}
      <motion.main 
        initial={false}
        animate={{ paddingLeft: mainPaddingLeft }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="flex-1 min-w-0 min-h-screen relative pb-24 md:pb-0 transition-all duration-300"
      >
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-indigo/5 blur-[120px] rounded-full" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] px-4 md:px-12 py-6 md:py-10">
          {/* Header / Breadcrumb Section - Only visible on Dashboard now */}
          {activeTab === 'dashboard' && (
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Link href="/" className="hover:text-primary transition-colors cursor-pointer">PlacePrep</Link>
                  <span className="text-border">/</span>
                  <div className="flex items-center gap-1.5 text-primary font-black">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </div>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">
                  <span className="opacity-90">Morning,</span> <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{state.userName}</span>
                </h1>
              </div>
            </header>
          )}

          {/* Tab content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'roadmap' && <RoadmapView />}
              {activeTab === 'dsa' && <DSATrackerView />}
              {activeTab === 'dsaSheet' && <DSASheetView />}
              {activeTab === 'mocks' && <MockHubView />}
              {activeTab === 'notes' && <NotesVaultView />}
              {activeTab === 'projects' && <ProjectLabView />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border/20 mt-20 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            Career Accelerator © 2026 
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-primary/60">Designed by Akash Mani</span>
          </p>
          <div className="flex items-center gap-6">
             <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">Encrypted Local Storage</span>
             <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">v5.4.0-obsidian</span>
          </div>
        </footer>
      </motion.main>

      {/* Mobile bottom nav - hidden by CSS but here for structure */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/20 flex md:hidden z-50">
        {(Object.entries(TAB_LABELS) as [TabId, { label: string; icon: React.ElementType }][]).map(([id, { label, icon: Icon }]) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === id ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            {label.split(' ')[0]}
          </button>
        ))}
      </nav>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
