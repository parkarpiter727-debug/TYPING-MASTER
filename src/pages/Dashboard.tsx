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
  Award,
  Download,
  Gamepad2,
  FileSpreadsheet,
} from 'lucide-react';
import { WpmProgressChart } from '../components/dashboard/WpmProgressChart.tsx';
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

  const exportAsCSV = () => {
    if (stats.history.length === 0) return;
    const headers = ['ID', 'Date', 'Language', 'DurationSeconds', 'WPM', 'Accuracy', 'Errors', 'CharactersTyped'];
    const rows = stats.history.map((h) => [
      h.id,
      new Date(h.created_at).toISOString(),
      h.language,
      h.duration_seconds,
      h.wpm,
      h.accuracy,
      h.errors,
      h.characters_typed,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inspire_pro_typing_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      {/* Top Welcome Header with Streak & Certificate Action */}
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

        <div className="flex flex-wrap items-center gap-3">
          {/* Certificate Quick Button */}
          <Link to={`/certificate?name=${encodeURIComponent(displayName)}&wpm=${stats.bestWpm || 60}&accuracy=${stats.avgAccuracy || 98}`}>
            <Button
              variant="primary"
              size="sm"
              icon={<Award className="w-4 h-4 text-amber-300 fill-amber-300" />}
              className="shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold"
            >
              {isUrdu ? 'سرٹیفکیٹ حاصل کریں' : 'My Certificate'}
            </Button>
          </Link>

          {/* Daily Streak Highlight */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0D0F14]/90 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] shrink-0">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
            <div className="text-left font-mono-code">
              <span className="text-[10px] text-[#8892A4] uppercase block font-medium">
                {isUrdu ? 'حاضری' : 'Streak'}
              </span>
              <span className="text-lg font-extrabold text-white">
                {streak?.current_streak ?? 1} {isUrdu ? 'دن' : 'days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Quick Launch Tools Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/game"
          className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#161B27] to-[#161B27] border border-cyan-500/30 hover:border-cyan-400 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">
                {isUrdu ? 'الفاظ کی بارش (گیم)' : 'Word Rain Arcade'}
              </h4>
              <p className="text-[11px] text-[#8892A4]">
                {isUrdu ? 'اردو و انگلش الفاظ کی تیز گیم' : 'Play fun typing reflex game'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-cyan-400 transition-colors" />
        </Link>

        <Link
          to="/test"
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#161B27] to-[#161B27] border border-purple-500/30 hover:border-purple-400 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300">
                {isUrdu ? 'اسپیڈ ٹیسٹ و گھوسٹ ریسر' : 'Ghost Pacer Test'}
              </h4>
              <p className="text-[11px] text-[#8892A4]">
                {isUrdu ? 'اپنی رفتار کا مقابلہ کریں' : 'Race against target WPM'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-purple-400 transition-colors" />
        </Link>

        <Link
          to="/certificate"
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#161B27] to-[#161B27] border border-amber-500/30 hover:border-amber-400 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300">
                {isUrdu ? 'سرکاری سرٹیفکیٹ' : 'Verified Certificate'}
              </h4>
              <p className="text-[11px] text-[#8892A4]">
                {isUrdu ? 'پرنٹ و ڈاؤن لوڈ کریں' : 'Official typing proficiency seal'}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#8892A4] group-hover:text-amber-400 transition-colors" />
        </Link>
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
        {/* WPM Progress Line Chart (Last 10 Tests) */}
        <div className="lg:col-span-2">
          <WpmProgressChart history={stats.history} isUrdu={isUrdu} />
        </div>

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2A3447]">
          <div>
            <h3 className="text-lg font-bold text-[#E8EBF0]">
              {isUrdu ? 'حالیہ ٹیسٹس کی تفصیل' : 'Recent Test Activity'}
            </h3>
            <span className="text-xs text-[#8892A4]">
              {stats.history.length} {isUrdu ? 'ریکارڈ شدہ ٹیسٹس' : 'total recorded tests'}
            </span>
          </div>

          {stats.history.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={exportAsCSV}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              {isUrdu ? 'ایکسپورٹ (CSV)' : 'Export CSV'}
            </Button>
          )}
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
