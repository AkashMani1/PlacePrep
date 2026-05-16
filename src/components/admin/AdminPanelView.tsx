import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Plus, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/ui/ModalPortal';

// --- Generic DB API Caller ---
async function dbCall(action: string, table: string, payload?: any, match?: any) {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, table, payload, match }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'DB call failed');
  }
  return (await res.json()).data;
}

export default function AdminPanelView() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'assessments' | 'questions' | 'global'>('assessments');
  const [assessments, setAssessments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit/Add State
  const [editingAssessment, setEditingAssessment] = useState<any | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  
  // Global Content State
  const [activeGlobalTab, setActiveGlobalTab] = useState<'dsa' | 'aptitude' | 'kb'>('dsa');
  const [globalQuestions, setGlobalQuestions] = useState<any[]>([]);
  const GLOBAL_IDS = {
    dsa: '11111111-1111-1111-1111-111111111111',
    aptitude: '22222222-2222-2222-2222-222222222222',
    kb: '33333333-3333-3333-3333-333333333333'
  };

  // Extra security check
  if (user?.email !== 'akashmani9955@gmail.com') {
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
      const data = await dbCall('SELECT', 'assessments');
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
      const data = await dbCall('SELECT', 'questions', undefined, { assessment_id: assessmentId });
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions' && selectedAssessmentId) {
      loadQuestions(selectedAssessmentId);
    } else if (activeTab === 'global') {
      loadGlobalQuestions();
    }
  }, [activeTab, selectedAssessmentId, activeGlobalTab]);

  const loadGlobalQuestions = async () => {
    setLoading(true);
    try {
      const data = await dbCall('SELECT', 'questions', undefined, { assessment_id: GLOBAL_IDS[activeGlobalTab] });
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
        await dbCall('INSERT', 'assessments', [payload]);
      } else {
        await dbCall('UPDATE', 'assessments', editingAssessment, { id: editingAssessment.id });
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
      await dbCall('DELETE', 'assessments', undefined, { id });
      loadAssessments();
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
        await dbCall('INSERT', 'questions', [payload]);
      } else {
        await dbCall('UPDATE', 'questions', payload, { id: editingQuestion.id });
      }
      setEditingQuestion(null);
      if (activeTab === 'global') loadGlobalQuestions();
      else loadQuestions(selectedAssessmentId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await dbCall('DELETE', 'questions', undefined, { id });
      if (activeTab === 'global') loadGlobalQuestions();
      else loadQuestions(selectedAssessmentId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Admin <span className="text-primary">Dashboard</span></h1>
        <p className="text-muted-foreground mt-1">Full control over assignments, options, answers, and data.</p>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/30 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'assessments' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted/30 text-muted-foreground'}`}
        >
          Mock Hub Assessments
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'questions' ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted/30 text-muted-foreground'}`}
        >
          Mock Hub Questions
        </button>
        <button
          onClick={() => setActiveTab('global' as any)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'global' as any ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-muted/30 text-muted-foreground'}`}
        >
          Global Site Content (DSA / Aptitude / KB)
        </button>
      </div>

      {/* ASSESSMENTS TAB */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Assessments / Assignments</h2>
            <button
              onClick={() => setEditingAssessment({ isNew: true, id: `test-${Date.now()}`, title: '', difficulty: 'Medium', is_active: true })}
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Assessment
            </button>
          </div>

          {loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {assessments.map(a => (
                <div key={a.id} className="glass p-5 rounded-2xl border border-border/20 flex flex-col gap-2 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingAssessment(a)} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteAssessment(a.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h3 className="font-bold text-lg pr-20">{a.title} <span className="text-xs font-normal text-muted-foreground ml-2">({a.id})</span></h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  <div className="flex gap-2 mt-auto pt-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold ${a.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {a.is_active ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.difficulty}</span>
                    <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.duration_minutes} Mins</span>
                    <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{a.total_questions || 0} Qs</span>
                    {a.category && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-bold">{a.category}</span>}
                    {(a.company_tags || []).map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-md uppercase font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUESTIONS TAB */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1 w-full max-w-sm">
              <label className="text-sm font-bold text-muted-foreground">Select Assessment to view questions</label>
              <select 
                className="bg-muted/20 border border-border/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground w-full"
                value={selectedAssessmentId}
                onChange={e => setSelectedAssessmentId(e.target.value)}
              >
                <option value="">-- Choose Assessment --</option>
                {assessments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            
            {selectedAssessmentId && (
              <button
                onClick={() => setEditingQuestion({ isNew: true, id: `q-${Date.now()}`, assessment_id: selectedAssessmentId, title: '', content: '', options: '', correct_answer: 0, difficulty: 'Medium' })}
                className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            )}
          </div>

          {selectedAssessmentId && (
            loading ? <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</div> : (
              <div className="space-y-4">
                {questions.length === 0 && <p className="text-muted-foreground text-sm italic">No questions found for this assessment.</p>}
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
                        <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{q.content}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-muted/40 px-2 py-1 rounded-md uppercase font-bold">{q.type}</span>
                      {q.topic && <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md uppercase font-bold">{q.topic}</span>}
                      {q.company && <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-1 rounded-md uppercase font-bold">{q.company}</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-7">
                      {(Array.isArray(q.options) ? q.options : []).map((opt: string, i: number) => (
                        <div key={i} className={`text-sm p-2 rounded-lg border ${q.correct_answer === i ? 'bg-green-500/10 border-green-500/30 text-green-400 font-bold' : 'bg-muted/10 border-border/10 text-muted-foreground'}`}>
                          {String.fromCharCode(65 + i)}. {opt}
                          {q.correct_answer === i && <span className="ml-2 text-xs uppercase bg-green-500 text-white px-1.5 py-0.5 rounded">Answer</span>}
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
            )
          )}
        </div>
      )}

      {/* GLOBAL CONTENT TAB */}
      {activeTab === 'global' as any && (
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
              {globalQuestions.length === 0 && <p className="text-muted-foreground text-sm italic">No items found.</p>}
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
              <h3 className="text-xl font-bold">{editingAssessment.isNew ? 'Create Assessment' : 'Edit Assessment'}</h3>
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
                <Save className="w-5 h-5" /> Save Assessment
              </button>
            </form>
          </div>
        </ModalPortal>
      )}

      {editingQuestion && (
        <ModalPortal onClose={() => setEditingQuestion(null)}>
          <div className="glass w-full rounded-[24px] border border-border/20 p-6 flex flex-col overflow-y-auto">
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
