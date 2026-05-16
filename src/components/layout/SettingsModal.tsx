/* Developed by Akash Mani - This site is developed by Akash Mani. Original watermark of Akash Mani. */
import { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { syncService } from '@/lib/syncService';
import { toast } from 'sonner';
import ModalPortal from '@/components/ui/ModalPortal';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { state, updateProfile } = useApp();
  const { user, signOut } = useAuth();
  const [name, setName] = useState(state.userName);
  const [role, setRole] = useState(state.targetRole);
  const [startDate, setStartDate] = useState(state.startDate);
  const [goalDuration, setGoalDuration] = useState(state.goalDurationMonths || 3);
  const [isSyncing, setIsSyncing] = useState(false);

  const save = () => {
    updateProfile(name.trim() || 'Student', role, startDate, goalDuration);
    onClose();
  };

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    const result = await syncService.pushLocalState(user.id, state);
    setIsSyncing(false);
    
    if (result.success) {
      toast.success('Local data synced to cloud successfully!');
    } else {
      toast.error('Sync failed: ' + result.error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    toast.info('Signed out successfully');
  };

  const resetAll = () => {
    if (confirm('⚠️ This will delete ALL your local data and reset to defaults. Cloud data will remain. Are you sure?')) {
      localStorage.removeItem('placeprep_v5');
      window.location.reload();
    }
  };

  return (
    <ModalPortal onClose={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <h2 className="text-slate-100 font-bold tracking-tight">System Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Cloud Account Section */}
          <div className="space-y-3">
            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1">Persistence Shield</label>
            {user ? (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-500/20">
                    <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-100 text-xs font-bold truncate">{user.user_metadata.full_name}</p>
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-tighter">Cloud Backup Active</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-[11px] font-medium mb-1">Cloud Sync is disabled</p>
                <p className="text-slate-500 text-[9px] leading-relaxed px-4">Sign in with Google in the sidebar to sync your progress across devices.</p>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800" />

          {/* User Info Section */}
          <div className="space-y-4">
            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1">Personal Identity</label>
            <div>
              <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">Target Career Path</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500">
                <option>Software Engineer</option>
                <option>SDE 1</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>Data Analyst</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">Prep Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-indigo-500" />
              <p className="text-slate-600 text-[9px] mt-1.5 leading-relaxed italic">Defines your starting point for the roadmap trajectory.</p>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] font-bold mb-1.5 block">Goal Duration (Months)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="1" max="12" step="1" 
                  value={goalDuration} 
                  onChange={(e) => setGoalDuration(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-slate-100 text-xs font-black min-w-[2.5rem] text-center bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                  {goalDuration} M
                </span>
              </div>
              <p className="text-slate-600 text-[9px] mt-1.5 leading-relaxed italic">Currently set to {goalDuration * 4} weeks.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-800 space-y-3">
          <button onClick={save}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            Commit Changes
          </button>
          <button onClick={resetAll}
            className="w-full py-2.5 rounded-xl text-red-400 hover:bg-red-500/5 text-[9px] font-bold transition-colors flex items-center justify-center gap-2 opacity-50 hover:opacity-100">
            <RotateCcw className="w-3 h-3" /> Hard Reset Local Cache
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
