'use client';

/* Developed by Akash Mani - PlacePrep Premium OS */

import { Target, LayoutDashboard, Compass, ListChecks, Code2, PlayCircle, Library, FlaskConical, Settings, Sun, Moon, Cloud, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { calcStreak, calcCurrentWeek, getStreakStatus } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export type TabId = 'dashboard' | 'roadmap' | 'dsa' | 'dsaSheet' | 'mocks' | 'notes' | 'projects' | 'admin';

const NAV_ITEMS: { id: TabId; icon: React.ElementType; label: string; badge?: string; adminOnly?: boolean }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'roadmap', icon: Compass, label: '3-Month Roadmap' },
  { id: 'dsa', icon: ListChecks, label: 'Must Do List' },
  { id: 'dsaSheet', icon: Code2, label: 'DSA Sheet' },
  { id: 'mocks', icon: PlayCircle, label: 'Mock Hub' },
  { id: 'notes', icon: Library, label: 'Knowledge Base' },
  { id: 'projects', icon: FlaskConical, label: 'Project Lab' },
  { id: 'admin', icon: Settings, label: 'Admin Panel', adminOnly: true },
];

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  onSettingsOpen: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ activeTab, onTabChange, onSettingsOpen, isMobile = false }: SidebarProps) {
  const { state, toggleSidebar, toggleTheme, setSidebarHovered, isSidebarHovered } = useApp();
  const { user, signInWithGoogle, signOut } = useAuth();
  const isExpanded = isMobile || isSidebarHovered; // Always expanded on mobile drawer
  
  const streak = calcStreak(state.dailyLogs);
  const currentWeek = calcCurrentWeek(state.startDate);
  const goalWeeks = (state.goalDurationMonths || 3) * 4;
  const progressPct = Math.min(100, Math.round((currentWeek / goalWeeks) * 100));
  const totalDone = state.problems.filter((p) => p.status === 'Done').length;

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isExpanded ? '280px' : '80px',
        boxShadow: (isMobile || isSidebarHovered) ? '40px 0 80px rgba(0,0,0,0.6)' : '0 0 0 rgba(0,0,0,0)'
      }}
      onMouseEnter={() => !isMobile && setSidebarHovered(true)}
      onMouseLeave={() => !isMobile && setSidebarHovered(false)}
      className={`${isMobile ? 'flex' : 'hidden md:flex'} fixed left-0 top-0 h-screen bg-background/80 backdrop-blur-2xl border-r border-white/5 flex flex-col z-[100] select-none overflow-hidden transition-colors duration-500`}
    >
      {/* Logo Area */}
      <div className="py-8 flex items-center border-b border-border/10 px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Target className="w-6 h-6 text-primary relative z-10" />
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="whitespace-nowrap ml-1"
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-foreground font-black text-xl tracking-tighter">PLACE</span>
                  <span className="text-primary font-black text-xl tracking-tighter">PREP</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 space-y-1.5 overflow-y-auto custom-scrollbar px-3">
        {NAV_ITEMS.filter(item => !item.adminOnly || user?.email === 'akashmani9955@gmail.com').map(({ id, icon: Icon, label, badge }) => (
          <Link
            key={id}
            href={id === 'dashboard' ? '/' : `/${id}`}
            onClick={(e) => {
              onTabChange(id);
            }}
            className={`w-full group relative flex items-center h-12 rounded-xl transition-all duration-300 text-left px-3 ${
              activeTab === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>
               <Icon className={`w-5 h-5 ${activeTab === id ? 'text-primary' : 'group-hover:text-primary/80 opacity-60'}`} />
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex-1 text-[13px] font-bold tracking-tight whitespace-nowrap ml-3"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            
            {activeTab === id && (
              <motion.div layoutId="sidebar-active-indicator" className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
            )}

            <AnimatePresence initial={false}>
              {isExpanded && badge && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ml-auto mr-1 ${activeTab === id ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}
                >
                  {badge}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>
      {/* ── Control Hub (Footer Navigation Style) ─────────────────────────────────── */}
      <div className="mt-auto py-6 space-y-2 border-t border-border/10">
        
        {/* Profile Control */}
        <button 
          onClick={onSettingsOpen}
          className="w-full group relative flex items-center rounded-[18px] transition-all duration-300 text-left px-4 text-muted-foreground hover:text-foreground hover:bg-muted/20"
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary via-primary/80 to-secondary flex items-center justify-center text-white font-black text-[9px] overflow-hidden border border-border/20 shadow-sm">
              {user?.user_metadata.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="opacity-90">{(user?.user_metadata.full_name || state.userName || 'S').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 flex flex-col justify-center ml-2 overflow-hidden"
              >
                <span className="text-sm font-bold tracking-tight whitespace-nowrap truncate group-hover:text-primary transition-colors">
                  {user?.user_metadata.full_name || state.userName || 'Account'}
                </span>
                {!user && (
                   <span 
                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); signInWithGoogle(); }}
                     className="text-[9px] font-black uppercase tracking-wider text-primary hover:underline underline-offset-2 w-fit mt-0.5 cursor-pointer"
                   >
                     Connect Account
                   </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="w-full group relative flex items-center rounded-[18px] transition-all duration-300 text-left px-4 text-muted-foreground hover:text-foreground hover:bg-muted/20"
        >
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            {state.theme === 'dark' ? (
              <Sun className="w-5 h-5 group-hover:text-amber-400 group-hover:rotate-45 transition-all duration-500" />
            ) : (
              <Moon className="w-5 h-5 group-hover:text-sh-blue-400 group-hover:-rotate-12 transition-all duration-500" />
            )}
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex-1 text-sm font-bold tracking-tight whitespace-nowrap ml-2"
              >
                {state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
