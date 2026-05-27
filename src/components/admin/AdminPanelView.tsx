import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import { Lock, Plus, Edit2, Trash2, Save, X, RefreshCw, ChevronLeft, Building2, Folder, FileQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/ui/ModalPortal';

// --- Generic DB API Caller ---
async function dbCall(token: string | undefined, action: string, table: string, payload?: any, match?: any) {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action, table, payload, match }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'DB call failed');
  }
  return (await res.json()).data;
}

export default function AdminPanelView() {
  const { user, session, isLoading: authLoading } = useAuth();
  const accessToken = session?.access_token;
  
  // Top Level Tabs
  const [activeTab, setActiveTab] = useState<'hub' | 'global'>('hub');
  
  // Mock Hub Hierarchical State (Company -> Assignment -> Question)
  const [hubView, setHubView] = useState<'companies' | 'assignments' | 'questions'>('companies');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const [assessments, setAssessments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit/Add State
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  
  // Global Content State
  const [activeGlobalTab, setActiveGlobalTab] = useState<'dsa' | 'aptitude' | 'kb'>('dsa');
  const [globalQuestions, setGlobalQuestions] = useState<any[]>([]);
  const GLOBAL_IDS = {
    dsa: '11111111-1111-1111-1111-111111111111',
    aptitude: '22222222-2222-2222-2222-222222222222',
    kb: '33333333-3333-3333-3333-333333333333'
  };

  // Extra security check
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        Checking admin access...
      </div>
    );
  }

  if (!isAdminEmail(user?.email)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to view this page. This area is restricted to administrators.
        </p>
      </div>
    );
  }

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const data = await dbCall(accessToken, 'SELECT', 'assessments');
      setAssessments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (assessmentId: string) => {
    setLoading(true);
    try {
      const data = await dbCall(accessToken, 'SELECT', 'questions', undefined, { assessment_id: assessmentId });
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken || !isAdminEmail(user?.email)) return;
    loadAssessments();
  }, [accessToken, user?.email]);

  useEffect(() => {
    if (activeTab === 'hub' && hubView === 'questions' && selectedAssessmentId) {
      loadQuestions(selectedAssessmentId);
    } else if (activeTab === 'global') {
      loadGlobalQuestions();
    }
  }, [activeTab, hubView, selectedAssessmentId, activeGlobalTab]);

  const loadGlobalQuestions = async () => {
    setLoading(true);
    try {
      const data = await dbCall(accessToken, 'SELECT', 'questions', undefined, { assessment_id: GLOBAL_IDS[activeGlobalTab] });
      setGlobalQuestions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssessment.isNew) {
        const { isNew, ...payload } = editingAssessment;
        await dbCall(accessToken, 'INSERT', 'assessments', [payload]);
      } else {
        await dbCall(accessToken, 'UPDATE', 'assessments', editingAssessment, { id: editingAssessment.id });
      }
      setEditingAssessment(null);
      loadAssessments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? All associated questions will be affected.')) return;
    try {
      await dbCall(accessToken, 'DELETE', 'assessments', undefined, { id });
      loadAssessments();
      // If we deleted the only assessment in a company, we might want to navigate back. Handled naturally by empty list.
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let optionsArray = editingQuestion.options;
      if (typeof optionsArray === 'string') {
        optionsArray = optionsArray.split(',').map((o: string) => o.trim());
      }
      
      const payload = { ...editingQuestion, options: optionsArray };
      if (payload.isNew) {
        delete payload.isNew;
        await dbCall(accessToken, 'INSERT', 'questions', [payload]);
      } else {
        await dbCall(accessToken, 'UPDATE', 'questions', payload, { id: editingQuestion.id });
      }
      setEditingQuestion(null);
      if (activeTab === 'global') loadGlobalQuestions();
      else loadQuestions(selectedAssessmentId!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await dbCall(accessToken, 'DELETE', 'questions', undefined, { id });
      if (activeTab === 'global') loadGlobalQuestions();
      else loadQuestions(selectedAssessmentId!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCompany = () => {
    const newCompanyName = prompt('Enter new company name:');
    if (newCompanyName && newCompanyName.trim()) {
      setSelectedCompany(newCompanyName.trim());
      setHubView('assignments');
    }
  };

  // Derive unique companies from assessments
  const companies = Array.from(new Set(
    assessments.flatMap(a => Array.isArray(a.company_tags) ? a.company_tags : [])
  )).sort();

  const companyAssessments = assessments.filter(a => 
    Array.isArray(a.company_tags) && a.company_tags.includes(selectedCompany)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Admin <span className="text-primary">Dashboard</span></h1>
        <p className="text-muted-foreground mt-1">Full control over assignments, options, answers, and data.</p>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold">{error}</div>}

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-border/30 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hub')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'hub' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted/30 text-muted-foreground'}`}
        >
          Mock Hub (Companies & Assignments)
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'global' ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-muted/30 text-muted-foreground'}`}
        >
          Global Site Content (DSA / Aptitude / KB)
        </button>
      </div>

      {/* MOCK HUB TAB (HIERARCHICAL) */}
      {activeTab === 'hub' && (
        <AnimatePresence mode="wait">
          {/* LEVEL 1: COMPANIES */}
          {hubView === 'companies' && (
            <motion.div key="companies" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Companies</h2>
                </div>
                <button
                  onClick={handleCreateCompany}
                  className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20"
                >
                  <Plus className="w-4 h-4" /> Add Company
                </button>
              </div>

              {loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {companies.map(company => {
                    const count = assessments.filter(a => Array.isArray(a.company_tags) && a.company_tags.includes(company)).length;
                    return (
                      <div 
                        key={company} 
                        onClick={() => { setSelectedCompany(company); setHubView('assignments'); }}
                        className="glass p-5 rounded-2xl border border-border/20 flex flex-col gap-2 cursor-pointer hover:border-primary/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">{company}</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{count} Assignments</p>
                      </div>
                    );
                  })}
                  {companies.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground italic border border-dashed border-border/20 rounded-2xl">
                      No companies found. Create one to get started.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* LEVEL 2: ASSIGNMENTS */}
          {hubView === 'assignments' && (
            <motion.div key="assignments" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setHubView('companies')} 
                  className="p-2 hover:bg-muted/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Companies
                </button>
              </div>
              
              <div className="flex justify-between items-center bg-muted/10 p-4 rounded-2xl border border-border/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCompany}</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Assignments Management</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingAssessment({ isNew: true, id: `test-${Date.now()}`, title: '', difficulty: 'Medium', is_active: true, company_tags: [selectedCompany] })}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Assignment
                </button>
              </div>

              {loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-4">
                  {companyAssessments.map((a, idx) => (
                    <div key={a.id} className="glass p-5 rounded-2xl border border-border/20 flex flex-col gap-2 relative group">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingAssessment(a)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteAssessment(a.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                          <Folder className="w-4 h-4 text-foreground/50" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg pr-20">Assignment {idx + 1}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{a.title}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2 mb-4 flex-wrap">
                        <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold ${a.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {a.is_active ? 'Active' : 'Draft'}
                        </span>
                        <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.difficulty}</span>
                        <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.duration_minutes} Mins</span>
                        <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.total_questions || 0} Qs</span>
                      </div>

                      <button 
                        onClick={() => { setSelectedAssessmentId(a.id); setHubView('questions'); }}
                        className="mt-auto w-full py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
                      >
                        <FileQuestion className="w-4 h-4" /> Manage Questions
                      </button>
                    </div>
                  ))}
                  {companyAssessments.length === 0 && (
                    <div className="col-span-full py-10 text-center text-muted-foreground italic border border-dashed border-border/20 rounded-2xl">
                      No assignments found in {selectedCompany}. Create one!
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* LEVEL 3: QUESTIONS */}
          {hubView === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
               <div className="flex items-center gap-4">
                <button 
                  onClick={() => setHubView('assignments')} 
                  className="p-2 hover:bg-muted/20 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Assignments
                </button>
              </div>

              <div className="flex justify-between items-center bg-muted/10 p-4 rounded-2xl border border-border/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Questions Editor</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      {assessments.find(a => a.id === selectedAssessmentId)?.title || 'Unknown Assignment'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingQuestion({ isNew: true, id: `q-${Date.now()}`, assessment_id: selectedAssessmentId, title: '', content: '', options: '', correct_answer: 0, difficulty: 'Medium', company: selectedCompany })}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
                <div className="space-y-4 mt-4">
                  {questions.length === 0 && <p className="text-muted-foreground text-sm italic py-10 text-center border border-dashed border-border/20 rounded-2xl">No questions found for this assignment.</p>}
                  {questions.map((q, idx) => (
                    <div key={q.id} className="glass p-5 rounded-2xl border border-border/20 flex flex-col gap-3 relative group">
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingQuestion({ ...q, options: Array.isArray(q.options) ? q.options.join(', ') : q.options })} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="flex gap-3">
                        <span className="font-black text-muted-foreground">Q{idx + 1}.</span>
                        <div>
                          <h3 className="font-bold text-foreground">{q.title}</h3>
                          <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap font-mono bg-muted/10 p-3 rounded-lg border border-border/10">{q.content}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{q.type}</span>
                        {q.topic && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-bold">{q.topic}</span>}
                        {q.company && <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-md uppercase font-bold">{q.company}</span>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-7">
                        {(Array.isArray(q.options) ? q.options : []).map((opt: string, i: number) => (
                          <div key={i} className={`text-sm p-2 rounded-lg border flex items-start gap-2 ${q.correct_answer === i ? 'bg-green-500/10 border-green-500/30 text-green-400 font-bold' : 'bg-muted/10 border-border/10 text-muted-foreground'}`}>
                            <span className="opacity-50">{String.fromCharCode(65 + i)}.</span>
                            <span>{opt}</span>
                            {q.correct_answer === i && <span className="ml-auto text-[10px] uppercase bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded font-black">Correct</span>}
                          </div>
                        ))}
                      </div>
                      
                      {q.solution_explanation && (
                        <div className="pl-7 mt-2">
                          <p className="text-xs text-muted-foreground"><span className="font-bold text-primary">Explanation:</span> {q.solution_explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* GLOBAL CONTENT TAB */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveGlobalTab('dsa')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeGlobalTab === 'dsa' ? 'bg-foreground text-background' : 'bg-muted/30 text-muted-foreground'}`}>DSA Tracker</button>
            <button onClick={() => setActiveGlobalTab('aptitude')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeGlobalTab === 'aptitude' ? 'bg-foreground text-background' : 'bg-muted/30 text-muted-foreground'}`}>Aptitude Tracker</button>
            <button onClick={() => setActiveGlobalTab('kb')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeGlobalTab === 'kb' ? 'bg-foreground text-background' : 'bg-muted/30 text-muted-foreground'}`}>Knowledge Base</button>
            
            <button
              onClick={() => setEditingQuestion({ isNew: true, id: `g-${Date.now()}`, assessment_id: GLOBAL_IDS[activeGlobalTab], title: '', content: '', options: '', correct_answer: 0, difficulty: 'Medium', type: activeGlobalTab })}
              className="ml-auto flex items-center gap-2 bg-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-500/30"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>

          {loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
            <div className="space-y-4">
              {globalQuestions.length === 0 && <p className="text-muted-foreground text-sm italic py-10 text-center border border-dashed border-border/20 rounded-2xl">No items found.</p>}
              {globalQuestions.map((q, idx) => (
                <div key={q.id} className="glass p-5 rounded-2xl border border-border/20 flex flex-col gap-3 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingQuestion({ ...q, options: Array.isArray(q.options) ? q.options.join(', ') : q.options })} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-black text-muted-foreground">{idx + 1}.</span>
                    <div>
                      <h3 className="font-bold text-foreground">{q.title}</h3>
                      {q.content && <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{q.content}</p>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{q.difficulty}</span>
                    {q.topic && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-bold">{q.topic}</span>}
                    {q.company && <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-md uppercase font-bold">{q.company}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OVERLAYS / FORMS */}
      {editingAssessment && (
        <ModalPortal onClose={() => setEditingAssessment(null)}>
          <div className="glass w-full rounded-[24px] border border-border/20 p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingAssessment.isNew ? 'Create Assignment' : 'Edit Assignment'}</h3>
              <button onClick={() => setEditingAssessment(null)} className="p-2 hover:bg-muted/20 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveAssessment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">ID (Unique URL slug)</label>
                <input required disabled={!editingAssessment.isNew} value={editingAssessment.id} onChange={e => setEditingAssessment({...editingAssessment, id: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground disabled:opacity-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Title</label>
                  <input required value={editingAssessment.title} onChange={e => setEditingAssessment({...editingAssessment, title: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Category</label>
                  <input required value={editingAssessment.category || ''} onChange={e => setEditingAssessment({...editingAssessment, category: e.target.value})} placeholder="e.g. Campus Drive, FAANG OA" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Company Tags (Comma separated)</label>
                <input value={Array.isArray(editingAssessment.company_tags) ? editingAssessment.company_tags.join(', ') : (editingAssessment.company_tags || '')} onChange={e => setEditingAssessment({...editingAssessment, company_tags: e.target.value.split(',').map((t: string) => t.trim())})} placeholder="TCS, Amazon, Google" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Description</label>
                <textarea required value={editingAssessment.description} onChange={e => setEditingAssessment({...editingAssessment, description: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground h-24 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Duration (Mins)</label>
                  <input type="number" required value={editingAssessment.duration_minutes || 60} onChange={e => setEditingAssessment({...editingAssessment, duration_minutes: parseInt(e.target.value)})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Difficulty</label>
                  <select value={editingAssessment.difficulty} onChange={e => setEditingAssessment({...editingAssessment, difficulty: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Status</label>
                  <select value={editingAssessment.is_active ? 'true' : 'false'} onChange={e => setEditingAssessment({...editingAssessment, is_active: e.target.value === 'true'})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                    <option value="true">Active (Visible)</option>
                    <option value="false">Hidden (Draft)</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <Save className="w-5 h-5" /> Save Assignment
              </button>
            </form>
          </div>
        </ModalPortal>
      )}

      {editingQuestion && (
        <ModalPortal onClose={() => setEditingQuestion(null)}>
          <div className="glass w-full rounded-[24px] border border-border/20 p-6 flex flex-col overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{editingQuestion.isNew ? 'Add Question' : 'Edit Question'}</h3>
              <button onClick={() => setEditingQuestion(null)} className="p-2 hover:bg-muted/20 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Question ID</label>
                  <input required disabled={!editingQuestion.isNew} value={editingQuestion.id} onChange={e => setEditingQuestion({...editingQuestion, id: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground disabled:opacity-50" />
                 </div>
                 <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Title</label>
                  <input required value={editingQuestion.title} onChange={e => setEditingQuestion({...editingQuestion, title: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Topic</label>
                  <input value={editingQuestion.topic || ''} onChange={e => setEditingQuestion({...editingQuestion, topic: e.target.value})} placeholder="e.g. Quantitative" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                 </div>
                 <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Type</label>
                  <select value={editingQuestion.type || 'aptitude'} onChange={e => setEditingQuestion({...editingQuestion, type: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                    <option value="aptitude">Aptitude</option>
                    <option value="coding">Coding</option>
                  </select>
                 </div>
                 <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Company</label>
                  <input value={editingQuestion.company || ''} onChange={e => setEditingQuestion({...editingQuestion, company: e.target.value})} placeholder="e.g. TCS" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                 </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Question Content (Text/Code)</label>
                <textarea required value={editingQuestion.content} onChange={e => setEditingQuestion({...editingQuestion, content: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground h-32 font-mono text-xs" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Options (Comma separated)</label>
                  <input required value={editingQuestion.options} onChange={e => setEditingQuestion({...editingQuestion, options: e.target.value})} placeholder="Option A, Option B, Option C, Option D" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Tags (Comma separated)</label>
                  <input value={Array.isArray(editingQuestion.tags) ? editingQuestion.tags.join(', ') : (editingQuestion.tags || '')} onChange={e => setEditingQuestion({...editingQuestion, tags: e.target.value.split(',').map((t: string) => t.trim())})} placeholder="Math, Array, DP" className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Correct Answer (Index 0-3)</label>
                  <input type="number" min="0" required value={editingQuestion.correct_answer} onChange={e => setEditingQuestion({...editingQuestion, correct_answer: parseInt(e.target.value)})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-muted-foreground">Difficulty</label>
                  <select value={editingQuestion.difficulty} onChange={e => setEditingQuestion({...editingQuestion, difficulty: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground">
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-muted-foreground">Solution Explanation (Optional)</label>
                <textarea value={editingQuestion.solution_explanation || ''} onChange={e => setEditingQuestion({...editingQuestion, solution_explanation: e.target.value})} className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground h-20 resize-none" />
              </div>
              
              <button type="submit" className="mt-4 w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <Save className="w-5 h-5" /> Save Question
              </button>
            </form>
          </div>
        </ModalPortal>
      )}
    </motion.div>
  );
}
