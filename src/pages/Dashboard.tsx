import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Gauge,
  Target,
  Trophy,
  BookOpen,
  Zap,
  Edit3,
  Calendar,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { getUserStats } from '../lib/testResultsService.ts';
import { getUserCompletions } from '../lib/lessonService.ts';
import { getStreak } from '../lib/streakService.ts';
import { StatCard } from '../components/ui/StatCard.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';
import { TestResult, LessonCompletion, DailyStreak } from '../types/index.ts';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { isUrdu } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    bestWpm: number;
    avgAccuracy: number;
    totalTests: number;
    englishTests: number;
    urduTests: number;
    history: TestResult[];
  }>({
    bestWpm: 0,
    avgAccuracy: 0,
    totalTests: 0,
    englishTests: 0,
    urduTests: 0,
    history: [],
  });

  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [streak, setStreak] = useState<DailyStreak | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        const [statsData, compData, streakData] = await Promise.all([
          getUserStats(user.id),
          getUserCompletions(user.id),
          getStreak(user.id),
        ]);
        setStats(statsData);
        setCompletions(compData);
        setStreak(streakData);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Typist';

  // Chart data: chronological WPM progression
  const chartData = stats.history.slice(0, 15).reverse().map((item, idx) => ({
    name: `#${idx + 1}`,
    wpm: item.wpm,
    acc: item.accuracy,
    date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  }));

  // If no tests taken yet, provide a gentle demo path for the chart
  const displayChartData =
    chartData.length > 0
      ? chartData
      : [
          { name: 'Start', wpm: 25, acc: 90, date: 'Day 1' },
          { name: 'Goal', wpm: 75, acc: 98, date: 'Target' },
        ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Skeleton height={60} className="w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </div>
        <Skeleton height={320} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Welcome Header with Streak banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#161B27] via-[#1E2535] to-[#161B27] border border-[#2A3447] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {isUrdu ? 'آپ کا ذاتی ڈیش بورڈ' : 'Personal Performance Hub'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-1">
            {isUrdu ? `خوش آمدید، ${displayName}!` : `Welcome, ${displayName}!`}
          </h1>
          <p className="text-xs sm:text-sm text-[#8892A4] mt-1.5">
            {isUrdu
              ? 'روزانہ کی مشق آپ کی ٹائپنگ رفتار کو مستقل نئی بلندیوں پر لے جاتی ہے۔'
              : 'Keep practicing consistently to unlock faster muscle memory and reflexes.'}
          </p>
        </div>

        {/* Daily Streak Highlight */}
        <div className="flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-[#0D0F14]/90 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] shrink-0">
          <div className="p-2.5 rounded-xl bg-amber-500/15">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block font-medium">
              {isUrdu ? 'مسلسل حاضری' : 'Active Streak'}
            </span>
            <div className="flex items-baseline gap-1 font-mono-code">
              <span className="text-2xl font-extrabold text-white">
                {streak?.current_streak ?? 1}
              </span>
              <span className="text-xs text-amber-300">
                {isUrdu ? 'دن' : 'days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isUrdu ? 'بہترین رفتار' : 'Best Speed'}
          value={`${stats.bestWpm} WPM`}
          subtitle={isUrdu ? 'تمام ٹیسٹس میں سب سے زیادہ' : 'All-time personal record'}
          icon={<Gauge className="w-5 h-5 text-cyan-400" />}
          accent="cyan"
        />

        <StatCard
          title={isUrdu ? 'اوسط درستگی' : 'Average Accuracy'}
          value={`${stats.avgAccuracy || 100}%`}
          subtitle={isUrdu ? 'کی اسٹروک پر درستگی کی شرح' : 'Precision rate across sessions'}
          icon={<Target className="w-5 h-5 text-purple-400" />}
          accent="purple"
        />

        <StatCard
          title={isUrdu ? 'ٹیسٹس کی تعداد' : 'Tests Taken'}
          value={stats.totalTests}
          subtitle={`${stats.englishTests} English • ${stats.urduTests} Urdu`}
          icon={<Trophy className="w-5 h-5 text-amber-400" />}
          accent="amber"
        />

        <StatCard
          title={isUrdu ? 'مکمل شدہ اسباق' : 'Lessons Finished'}
          value={completions.length}
          subtitle={isUrdu ? '۶۰ میں سے مکمل ہوئے' : 'Out of 60 total lessons'}
          icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
          accent="emerald"
        />
      </div>

      {/* Middle Section: Progress Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart (2 Cols) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#2A3447]">
            <div>
              <h3 className="text-lg font-bold text-[#E8EBF0]">
                {isUrdu ? 'رفتار کی پیش رفت (WPM Progression)' : 'Speed Progression (WPM)'}
              </h3>
              <p className="text-xs text-[#8892A4] mt-0.5">
                {chartData.length > 0
                  ? isUrdu
                    ? 'آپ کے حالیہ ٹائپنگ ٹیسٹس کا گراف'
                    : 'Your chronological test speed over time'
                  : isUrdu
                  ? 'پہلا ٹیسٹ مکمل کریں تاکہ آپ کا گراف نظر آئے'
                  : 'Take your first test to track live progression'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                WPM
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3447" opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['dataMin - 5', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161B27',
                    borderColor: '#2A3447',
                    borderRadius: '0.75rem',
                    color: '#E8EBF0',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="#00E5FF"
                  strokeWidth={3}
                  dot={{ fill: '#00E5FF', r: 4 }}
                  activeDot={{ r: 6, fill: '#A855F7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#E8EBF0] mb-1">
              {isUrdu ? 'فوری مشق شروع کریں' : 'Quick Actions'}
            </h3>
            <p className="text-xs text-[#8892A4] mb-6">
              {isUrdu ? 'اپنی رفتار بڑھانے کے لیے کسی ایک کو منتخب کریں:' : 'Jump directly into your daily typing routine:'}
            </p>

            <div className="space-y-3">
              <Link to="/test" className="block">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E2535] hover:bg-[#2A3447] border border-[#2A3447] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#E8EBF0]">
                        {isUrdu ? 'اسپیڈ ٹیسٹ (۱ / ۲ / ۵ منٹ)' : 'Timed Speed Test'}
                      </h4>
                      <p className="text-[11px] text-[#8892A4]">
                        {isUrdu ? 'لائیو رینکنگ کے لیے جانچ' : '1 min, 2 min, or 5 min'}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>

              <Link to="/lessons" className="block">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E2535] hover:bg-[#2A3447] border border-[#2A3447] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#E8EBF0]">
                        {isUrdu ? 'نئے اسباق جاری رکھیں' : 'Continue Lessons'}
                      </h4>
                      <p className="text-[11px] text-[#8892A4]">
                        {isUrdu ? 'مبتدی، متوسط اور اعلیٰ' : 'Beginner, Inter, Advanced'}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>

              <Link to="/custom" className="block">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1E2535] hover:bg-[#2A3447] border border-[#2A3447] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Edit3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#E8EBF0]">
                        {isUrdu ? 'کسٹم پیراگراف بنائیں' : 'Custom Text Session'}
                      </h4>
                      <p className="text-[11px] text-[#8892A4]">
                        {isUrdu ? 'اپنی مرضی کی تحریر پیسٹ کریں' : 'Paste any article or notes'}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2A3447] flex justify-between items-center text-xs text-[#8892A4]">
            <span>{isUrdu ? 'عالمی درجہ بندی:' : 'Global Standings:'}</span>
            <Link to="/leaderboard" className="text-cyan-400 hover:underline font-medium">
              {isUrdu ? 'لیڈر بورڈ پر پوزیشن دیکھیں →' : 'View Leaderboard →'}
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3447]">
          <h3 className="text-lg font-bold text-[#E8EBF0]">
            {isUrdu ? 'حالیہ ٹیسٹس کی تفصیل' : 'Recent Test Activity'}
          </h3>
          <span className="text-xs text-[#8892A4]">
            {stats.history.length} {isUrdu ? 'ریکارڈ شدہ ٹیسٹس' : 'total recorded tests'}
          </span>
        </div>

        {stats.history.length === 0 ? (
          <div className="py-12 text-center text-[#8892A4]">
            <Trophy className="w-8 h-8 mx-auto text-[#4B5563] mb-2" />
            <p className="text-sm">
              {isUrdu
                ? 'آپ نے ابھی تک کوئی ٹیسٹ نہیں لیا۔ پہلا ٹیسٹ شروع کریں!'
                : "You haven't taken any tests yet. Start your first speed test now!"}
            </p>
            <div className="mt-4">
              <Link to="/test">
                <Button variant="primary" size="sm">
                  {isUrdu ? 'پہلا ٹیسٹ شروع کریں' : 'Take 1-Min Test'}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2A3447] text-[#8892A4] font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-3">{isUrdu ? 'تاریخ' : 'Date'}</th>
                  <th className="pb-3 px-3">{isUrdu ? 'زبان' : 'Language'}</th>
                  <th className="pb-3 px-3">{isUrdu ? 'دورانیہ' : 'Duration'}</th>
                  <th className="pb-3 px-3 font-mono">{isUrdu ? 'رفتار (WPM)' : 'Speed (WPM)'}</th>
                  <th className="pb-3 px-3 font-mono">{isUrdu ? 'درستگی' : 'Accuracy'}</th>
                  <th className="pb-3 px-3 font-mono">{isUrdu ? 'غلطیاں' : 'Errors'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3447]/60">
                {stats.history.slice(0, 5).map((test) => (
                  <tr key={test.id} className="hover:bg-[#1E2535]/60 transition-colors">
                    <td className="py-3 px-3 text-[#E8EBF0] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8892A4]" />
                      <span>{new Date(test.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={test.language === 'urdu' ? 'purple' : 'cyan'}>
                        {test.language === 'urdu' ? 'اردو' : 'English'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-[#8892A4] font-mono">
                      {test.duration_seconds}s
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {test.wpm}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-purple-400">
                      {test.accuracy}%
                    </td>
                    <td className="py-3 px-3 font-mono text-red-400">
                      {test.errors}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
