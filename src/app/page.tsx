'use client';

import React, { useState } from 'react';
import { 
  Scissors, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  RefreshCw, 
  Flame, 
  Home, 
  ClipboardList, 
  Calendar, 
  User, 
  ArrowLeft,
  Sparkles,
  Target
} from 'lucide-react';

interface MicroStep {
  action: string;
  estimated_mins: number;
  completed?: boolean;
}

interface ShredResponse {
  estimated_total_time_mins: number;
  micro_steps: MicroStep[];
}

const GRANULARITY_OPTIONS = [
  { level: 1, label: '1 • Milestones', desc: 'High-level broad goals' },
  { level: 2, label: '2 • Chunks', desc: 'Logical sub-tasks' },
  { level: 3, label: '3 • Standard', desc: 'Manageable action items' },
  { level: 4, label: '4 • Detailed', desc: 'Low activation steps' },
  { level: 5, label: '5 • Microscopic', desc: '30s - 2m physical actions' },
];

const ITEM_COLOR_THEMES = [
  { cardBg: 'bg-blue-500', textBg: 'text-white', badgeBg: 'bg-white/20 text-white' },
  { cardBg: 'bg-[#FF6B6B]', textBg: 'text-white', badgeBg: 'bg-white/20 text-white' },
  { cardBg: 'bg-[#9D85FF]', textBg: 'text-white', badgeBg: 'bg-white/20 text-white' },
  { cardBg: 'bg-[#FF8A00]', textBg: 'text-white', badgeBg: 'bg-white/20 text-white' },
];

export default function TaskShredderApp() {
  const [task, setTask] = useState('');
  const [spiciness, setSpiciness] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ShredResponse | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const handleShred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/shred', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, spiciness }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to shred task.');
      }

      const formattedSteps = (result.micro_steps || []).map((step: MicroStep) => ({
        ...step,
        completed: false,
      }));

      setData({
        estimated_total_time_mins: result.estimated_total_time_mins || 0,
        micro_steps: formattedSteps,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    if (!data) return;
    const updatedSteps = [...data.micro_steps];
    updatedSteps[index].completed = !updatedSteps[index].completed;
    setData({ ...data, micro_steps: updatedSteps });
  };

  const completedCount = data?.micro_steps.filter((s) => s.completed).length || 0;
  const totalCount = data?.micro_steps.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F4F6F9] pb-24 lg:pb-12">
      {/* Top Header / App Navigation */}
      <header className="max-w-5xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF8A00] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              T-Shred
            </span>
            <span className="text-xs text-orange-500 font-semibold block -mt-1">
              AI Task Shredder
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Hi, Shredder! 👋</p>
            <p className="text-xs text-slate-500">Ready to conquer tasks?</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-base">🧑‍💻</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area (Responsive Grid: PC Multi-Column, Phone Single-Column) */}
      <main className="max-w-5xl mx-auto px-4 mt-2">
        {/* Title Banner */}
        <section className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Shred your daily task with <span className="text-[#FF8A00]">T-Shred</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Break overwhelming goals into tiny, low-activation physical steps.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Card & Granularity Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <form onSubmit={handleShred} className="space-y-5">
                <div>
                  <label htmlFor="task" className="block text-sm font-bold text-slate-800 mb-2">
                    What task feels overwhelming?
                  </label>
                  <textarea
                    id="task"
                    rows={3}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., File my taxes, write assignment draft, clean living room..."
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A00] focus:bg-white transition-all text-sm resize-none"
                    required
                  />
                </div>

                {/* Granularity Pills (Inspired by screenshot tabs) */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <span>Granularity Level</span>
                    <span className="text-xs font-semibold text-orange-500 flex items-center">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      Level {spiciness}
                    </span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {GRANULARITY_OPTIONS.map((opt) => {
                      const isActive = spiciness === opt.level;
                      return (
                        <button
                          key={opt.level}
                          type="button"
                          onClick={() => setSpiciness(opt.level)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label.split(' • ')[1]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {GRANULARITY_OPTIONS.find((g) => g.level === spiciness)?.desc}
                  </p>
                </div>

                {/* Primary Orange Action Button */}
                <button
                  type="submit"
                  disabled={loading || !task.trim()}
                  className="w-full bg-[#FF8A00] hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 text-base cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Shredding Goal...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-amber-200 fill-amber-200" />
                      <span>Shred Task</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl flex items-start space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Unable to shred task</p>
                  <p className="text-xs text-rose-600/90">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output Checklist & Progress Dashboard */}
          <div className="lg:col-span-7">
            {data ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Progress Card (Inspired by Screenshot's 1/2 Task card) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="font-black text-slate-900 text-lg">
                        {completedCount}/{totalCount} Micro-Steps
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Orange Progress Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden my-3">
                    <div
                      className="bg-[#FF8A00] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                    <span>
                      {completedCount === totalCount && totalCount > 0
                        ? '🎉 All steps complete! Great job!'
                        : 'One step at a time, keep it up!'}
                    </span>
                    <span className="flex items-center font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-orange-500 mr-1" />
                      ~{data.estimated_total_time_mins} mins
                    </span>
                  </div>
                </div>

                {/* Micro-Steps List (Styled as Colorful Task Cards from Screenshot) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">Shredded Steps</h3>
                    <span className="text-xs font-semibold text-slate-400">
                      Tap any step to mark complete
                    </span>
                  </div>

                  <div className="space-y-3">
                    {data.micro_steps.map((step, idx) => {
                      const theme = ITEM_COLOR_THEMES[idx % ITEM_COLOR_THEMES.length];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className={`p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between space-x-3 shadow-sm ${
                            step.completed
                              ? 'bg-slate-100 text-slate-400 line-through border border-slate-200'
                              : `${theme.cardBg} ${theme.textBg} hover:opacity-95`
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {step.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-white/80 shrink-0" />
                            )}
                            <span className="font-semibold text-sm sm:text-base leading-snug">
                              {step.action}
                            </span>
                          </div>

                          <span
                            className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-xl ${
                              step.completed
                                ? 'bg-slate-200 text-slate-500'
                                : theme.badgeBg
                            }`}
                          >
                            ⏱️ {step.estimated_mins}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State Placeholder */
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[360px]">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#FF8A00] mb-4">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Ready to shred your goal?
                </h3>
                <p className="text-sm text-slate-400 max-w-xs">
                  Enter your task on the left, pick a granularity level, and press ⚡ Shred Task.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Tab Bar for Phone View (Inspired by screenshot) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2.5 px-6 flex items-center justify-around max-w-md mx-auto rounded-t-3xl shadow-lg lg:hidden">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'home' ? 'text-[#FF8A00]' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'tasks' ? 'text-[#FF8A00]' : 'text-slate-400'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] font-bold">Tasks</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'calendar' ? 'text-[#FF8A00]' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold">Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-1 ${
            activeTab === 'profile' ? 'text-[#FF8A00]' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}

