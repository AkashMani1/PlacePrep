import { useState, memo } from 'react';
import { Target, PenTool, CalendarDays, Activity, CheckSquare, Settings, Minus, Plus, CheckCheck, Save, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { today, calcCurrentWeek } from '@/lib/utils';
import { DEFAULT_HABIT_GROUPS } from '@/lib/defaultData';

export const DailyTaskChecklist = memo(function DailyTaskChecklist() {
  const { state, updateDailyLog, toggleHabit, addHabitItem, updateHabitItem, deleteHabitItem, updateHabitGroupTitle } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const todayStr = today();
  const log = state.dailyLogs.find(l => l.date === todayStr) || {
    date: todayStr, completedHabits: [], problemsSolved: { easy: 0, medium: 0, hard: 0 },
    hours: 0, energy: 5, confidence: 5, conceptsLearned: ['', '', ''],
    struggles: '', tomorrowPlan: { morning: '', afternoon: '' }
  };

  const habitGroups = state.habitGroups && state.habitGroups.length > 0 ? state.habitGroups : DEFAULT_HABIT_GROUPS;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const updateProbs = (diff: 'easy' | 'medium' | 'hard', delta: number) => {
    const current = log.problemsSolved ?? { easy: 0, medium: 0, hard: 0 };
    updateDailyLog({ ...log, problemsSolved: { ...current, [diff]: Math.max(0, current[diff] + delta) } });
  };
  const updateVitals = (key: string, val: number) => updateDailyLog({ ...log, [key]: val });
  const updateConcepts = (idx: number, val: string) => {
    const next = [...(log.conceptsLearned || ['', '', ''])]; next[idx] = val; updateDailyLog({ ...log, conceptsLearned: next });
  };
  const updatePlan = (key: 'morning' | 'afternoon', val: string) => {
    const currentPlan = log.tomorrowPlan ?? { morning: '', afternoon: '' }; updateDailyLog({ ...log, tomorrowPlan: { ...currentPlan, [key]: val } });
  };

  const currentWeek = calcCurrentWeek(state.startDate);
  const totalTasks = habitGroups.reduce((acc, g) => acc + g.items.length, 0);
  const doneCount = log.completedHabits.length;
  const pct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-6 py-4 border-b border-white/[0.05] px-2">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground opacity-60">Date</span>
            <span className="text-xs font-bold text-foreground">{todayStr}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.05]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground opacity-60">Phase</span>
            <span className="text-xs font-bold text-primary">Week {currentWeek} / {(state.goalDurationMonths || 3) * 4}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/[0.05] hidden sm:block" />
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground opacity-60">Efficiency</span>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-24 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] font-bold text-primary tabular-nums">{pct}%</span>
            </div>
          </div>
        </div>

        <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-semibold tracking-wider transition-all ${isEditing ? 'bg-primary text-white' : 'bg-white/[0.03] text-muted-foreground hover:bg-white/[0.08]'}`}>
          {isEditing ? <CheckSquare className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
          {isEditing ? 'Save Template' : 'Edit Plan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-2 items-start">
        {habitGroups.map((group) => (
          <div key={group.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
              {isEditing ? (
                <input type="text" value={group.title} onChange={(e) => updateHabitGroupTitle(group.id, e.target.value)} className="bg-white/[0.02] border border-white/[0.05] rounded-lg px-2 py-1.5 text-[11px] font-semibold tracking-wide text-primary focus:outline-none w-full mr-2" />
              ) : (
                <h4 className="text-[11px] font-semibold tracking-wider text-primary flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" /> {group.title}
                </h4>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {group.items.map((item) => {
                const isChecked = log.completedHabits.includes(item.id);
                return (
                  <div key={item.id} className="group relative">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <input type="text" value={item.label} onChange={(e) => updateHabitItem(group.id, item.id, { label: e.target.value })} className="bg-transparent text-[11px] font-medium tracking-tight w-full focus:outline-none text-foreground" />
                          <button onClick={() => deleteHabitItem(group.id, item.id)} className="text-rose-500/50 hover:text-rose-500 transition-colors"><Minus className="w-3 h-3" /></button>
                        </div>
                        <input type="text" value={item.detail} onChange={(e) => updateHabitItem(group.id, item.id, { detail: e.target.value })} className="bg-transparent text-[10px] font-medium text-muted-foreground/60 w-full focus:outline-none" placeholder="Details..." />
                      </div>
                    ) : (
                      <button onClick={() => toggleHabit(item.id)} className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${isChecked ? 'bg-primary/10 border-primary/20 text-foreground' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] text-muted-foreground'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white' : 'border-white/20'}`}>
                          {isChecked && <CheckCheck className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-tight leading-tight">{item.label}</p>
                          {item.detail && <p className="text-[10px] text-muted-foreground/60 font-medium tracking-tight mt-1">{item.detail}</p>}
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <button onClick={() => addHabitItem(group.id, 'New Goal', '')} className="p-3 rounded-xl border border-dashed border-white/[0.1] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wider">
                  <Plus className="w-3.5 h-3.5" /> ADD ITEM
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-10 pt-8 border-t border-white/[0.05] px-2 max-w-4xl">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-foreground/80">Problem Solving</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pl-2">
            {(['easy', 'medium', 'hard'] as const).map(diff => (
              <div key={diff} className="flex flex-col gap-2.5">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground/60 capitalize">{diff} Problems</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => updateProbs(diff, -1)} className="w-7 h-7 rounded bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-muted-foreground transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="text-base font-bold text-foreground tabular-nums w-6 text-center">{(log.problemsSolved ?? { easy: 0, medium: 0, hard: 0 })[diff]}</span>
                  <button onClick={() => updateProbs(diff, 1)} className="w-7 h-7 rounded bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <PenTool className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[11px] font-semibold tracking-widest uppercase text-foreground/80">Notes & Learnings</h4>
            </div>
            <textarea value={(log.conceptsLearned ?? [])[0] || ''} onChange={(e) => updateConcepts(0, e.target.value)} className="w-full bg-transparent border border-white/[0.05] rounded-xl p-3 text-[12px] font-medium text-foreground/90 focus:outline-none focus:border-primary/50 transition-colors resize-y min-h-[120px] shadow-inner" placeholder="Log your insights here..." />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <h4 className="text-[11px] font-semibold tracking-widest uppercase text-foreground/80">Tomorrow's Plan</h4>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground/80">Morning</span>
                <textarea value={(log.tomorrowPlan ?? { morning: '', afternoon: '' }).morning} onChange={(e) => updatePlan('morning', e.target.value)} className="w-full bg-transparent border border-white/[0.05] rounded-xl p-2.5 text-[12px] font-medium focus:outline-none focus:border-primary/50 transition-colors resize-y min-h-[60px]" placeholder="Objectives..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium tracking-wider text-muted-foreground/80">Afternoon/Evening</span>
                <textarea value={(log.tomorrowPlan ?? { morning: '', afternoon: '' }).afternoon} onChange={(e) => updatePlan('afternoon', e.target.value)} className="w-full bg-transparent border border-white/[0.05] rounded-xl p-2.5 text-[12px] font-medium focus:outline-none focus:border-primary/50 transition-colors resize-y min-h-[60px]" placeholder="Objectives..." />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-rose-400" />
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-foreground/80">Biometrics</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pl-2">
            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground/60">Energy (1-10)</p>
              <button onClick={() => updateVitals('energy', (log.energy % 10) + 1)} className="text-2xl font-bold text-rose-400 tabular-nums hover:text-rose-300 transition-colors">
                {log.energy < 10 ? `0${log.energy}` : '10'}
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground/60">Confidence (1-10)</p>
              <button onClick={() => updateVitals('confidence', (log.confidence % 10) + 1)} className="text-2xl font-bold text-primary tabular-nums hover:text-primary/80 transition-colors">
                {log.confidence < 10 ? `0${log.confidence}` : '10'}
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-medium tracking-wider text-muted-foreground/60">Hours Logged</p>
              <div className="flex items-baseline gap-1.5">
                <input type="number" step="0.5" value={log.hours} onChange={(e) => updateVitals('hours', Number(e.target.value))} className="bg-transparent font-bold text-foreground text-2xl focus:outline-none w-14" />
                <span className="text-[10px] font-bold text-muted-foreground/40">HR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button onClick={handleSave} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold tracking-wider text-[11px] transition-all ${saved ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90'}`}>
            {saved ? <ShieldCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Data Saved' : 'Commit Log'}
          </button>
        </div>
      </div>
    </div>
  );
});
