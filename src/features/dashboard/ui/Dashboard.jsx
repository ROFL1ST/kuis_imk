import { BookOpen, Target, Flame, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Replace MOCK with real data from useDashboard() hook
const MOCK = {
  user: { name: 'Danendra', level: 7, xp: 3240, xpToNext: 4000, streak: 12 },
  stats: [
    { label: 'Quizzes Done',    value: 48,    delta: '+3 this week',   icon: BookOpen,   color: 'brand'   },
    { label: 'Avg SBERT Score', value: '0.74',delta: '+0.06 vs last',  icon: Target,     color: 'teal'    },
    { label: 'Day Streak',      value: 12,    delta: 'Personal best!', icon: Flame,      color: 'fire'    },
    { label: 'Accuracy',        value: '81%', delta: '+2% this week',  icon: TrendingUp, color: 'emerald' },
  ],
  recentQuizzes: [
    { id: 1, title: 'Ecosystems & Food Webs', score: 0.82, time: '14m', date: 'Today'     },
    { id: 2, title: 'Cell Division',          score: 0.67, time: '18m', date: 'Yesterday' },
    { id: 3, title: "Newton's Laws",          score: 0.91, time: '11m', date: '2d ago'    },
  ],
};

export function Dashboard() {
  const { user, stats, recentQuizzes } = MOCK;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Greeting */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-ghost font-medium uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-display text-ink">
            Good morning, {user.name.split(' ')[0]} 👋
          </h1>
        </div>
        <XPProgressWidget user={user} />
      </div>

      {/* Bento stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

        {/* Recent quizzes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Activity</h2>
            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium
                               flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentQuizzes.map(q => <RecentQuizRow key={q.id} quiz={q} />)}
          </div>
        </div>

        {/* Quick start */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-ink">Quick Start</h2>
          <button className="w-full flex items-center justify-between
                             p-3.5 rounded-xl bg-brand-gradient
                             text-white text-sm font-medium
                             hover:opacity-90 active:opacity-100 transition-opacity
                             shadow-glow-brand">
            <span>Start Random Quiz</span>
            <BookOpen size={16} />
          </button>
          <button className="w-full flex items-center justify-between
                             p-3.5 rounded-xl border border-ring
                             text-ink text-sm font-medium
                             hover:bg-canvas transition-colors">
            <span>Review Last Session</span>
            <Clock size={16} className="text-sub" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, icon: Icon, color }) {
  const colorMap = {
    brand:   'bg-brand-50 text-brand-600',
    teal:    'bg-teal-50 text-teal-600',
    fire:    'bg-orange-50 text-orange-500',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="card-lifted p-4 space-y-3">
      <div className={cn('inline-flex p-2 rounded-lg', colorMap[color])}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div>
        <p className="text-xl font-semibold text-ink tabular">{value}</p>
        <p className="text-xs text-ghost">{label}</p>
      </div>
      <p className="text-2xs text-sub font-medium">{delta}</p>
    </div>
  );
}

function XPProgressWidget({ user }) {
  const pct = Math.round((user.xp / user.xpToNext) * 100);
  return (
    <div className="flex items-center gap-3 card px-4 py-2.5">
      <div className="text-right">
        <p className="text-xs text-ghost">Level {user.level}</p>
        <p className="text-xs font-semibold text-xp tabular">
          {user.xp.toLocaleString()} XP
        </p>
      </div>
      <div className="w-24 space-y-1">
        <div className="h-1.5 rounded-full bg-ring overflow-hidden">
          <div
            className="h-full rounded-full bg-xp-gradient transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-2xs text-ghost text-right tabular">
          {user.xpToNext - user.xp} to next
        </p>
      </div>
    </div>
  );
}

function RecentQuizRow({ quiz }) {
  const score = quiz.score;
  const scoreColor =
    score >= 0.85 ? 'text-teal-600 bg-teal-50'     :
    score >= 0.65 ? 'text-emerald-600 bg-emerald-50' :
    score >= 0.40 ? 'text-amber-600 bg-amber-50'   :
                    'text-red-600 bg-red-50';
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-ring/60 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink font-medium truncate">{quiz.title}</p>
        <p className="text-xs text-ghost">{quiz.date} · {quiz.time}</p>
      </div>
      <span className={cn(
        'text-xs font-semibold tabular px-2 py-1 rounded-md font-mono',
        scoreColor
      )}>
        {score.toFixed(2)}
      </span>
    </div>
  );
}
