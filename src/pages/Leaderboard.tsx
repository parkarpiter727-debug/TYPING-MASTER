import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Globe, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLeaderboard } from '../lib/leaderboardService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { Language, LeaderboardEntry } from '../types/index.ts';
import { getInitials, getAvatarColor } from '../lib/typingUtils.ts';
import { Card } from '../components/ui/Card.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Skeleton } from '../components/ui/Skeleton.tsx';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const { language: defaultLang, isUrdu } = useLanguage();

  const [activeLang, setActiveLang] = useState<Language>(defaultLang);
  const [period, setPeriod] = useState<'all_time' | 'this_week'>('all_time');
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await getLeaderboard(activeLang, period, user?.id);
        setEntries(res.entries);
        setUserRank(res.userRank);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLang, period, user]);

  const top3 = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  const totalPages = Math.max(1, Math.ceil(restEntries.length / pageSize));
  const pagedEntries = restEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>{isUrdu ? 'عالمی درجہ بندی' : 'Global Speed Hierarchy'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#E8EBF0]">
          {isUrdu ? 'عالمی ٹائپنگ لیڈر بورڈ' : 'Top Speed Typists'}
        </h1>
        <p className="text-sm text-[#8892A4] mt-2">
          {isUrdu
            ? 'دنیا بھر سے بہترین ٹائپسٹس کی رفتار، درستگی اور کارکردگی کا موازنہ کریں۔'
            : 'Compete for the top spot. Verified accuracy and speed calculations.'}
        </p>
      </div>

      {/* Language Tabs & Period Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2A3447] pb-5">
        {/* Language Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#161B27] border border-[#2A3447]">
          <button
            onClick={() => {
              setActiveLang('english');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLang === 'english'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'text-[#8892A4] hover:text-[#E8EBF0]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌍 English</span>
          </button>
          <button
            onClick={() => {
              setActiveLang('urdu');
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeLang === 'urdu'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                : 'text-[#8892A4] hover:text-[#E8EBF0]'
            }`}
          >
            <span className="font-urdu text-sm">اردو</span>
            <span>اردو (Urdu)</span>
          </button>
        </div>

        {/* Sub-tabs: All Time / This Week */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161B27] border border-[#2A3447] text-xs">
          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'all_time'
                ? 'bg-[#1E2535] text-cyan-400 font-bold'
                : 'text-[#8892A4] hover:text-[#E8EBF0]'
            }`}
          >
            {isUrdu ? 'تمام وقت' : 'All Time'}
          </button>
          <button
            onClick={() => setPeriod('this_week')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              period === 'this_week'
                ? 'bg-[#1E2535] text-cyan-400 font-bold'
                : 'text-[#8892A4] hover:text-[#E8EBF0]'
            }`}
          >
            {isUrdu ? 'اس ہفتے' : 'This Week'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton height={200} />
            <Skeleton height={220} />
            <Skeleton height={190} />
          </div>
          <Skeleton height={400} />
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Silver #2 */}
              {top3[1] && (
                <div className="order-2 md:order-1">
                  <PodiumCard entry={top3[1]} rank={2} medalColor="from-slate-300 to-gray-400" />
                </div>
              )}

              {/* Gold #1 */}
              {top3[0] && (
                <div className="order-1 md:order-2 md:-translate-y-4">
                  <PodiumCard entry={top3[0]} rank={1} medalColor="from-amber-300 to-yellow-500" isWinner />
                </div>
              )}

              {/* Bronze #3 */}
              {top3[2] && (
                <div className="order-3 md:order-3">
                  <PodiumCard entry={top3[2]} rank={3} medalColor="from-amber-600 to-amber-800" />
                </div>
              )}
            </div>
          )}

          {/* Table: Ranks 4 to 100 */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2A3447] text-[#8892A4] font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-4">{isUrdu ? 'درجہ' : 'Rank'}</th>
                    <th className="pb-3 px-4">{isUrdu ? 'ٹائپسٹ' : 'Typist'}</th>
                    <th className="pb-3 px-4 font-mono">{isUrdu ? 'رفتار' : 'Best Speed'}</th>
                    <th className="pb-3 px-4 font-mono">{isUrdu ? 'درستگی' : 'Accuracy'}</th>
                    <th className="pb-3 px-4 font-mono">{isUrdu ? 'ٹیسٹس' : 'Tests'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3447]/60">
                  {pagedEntries.map((row) => {
                    const isCurrentUser = user && row.user_id === user.id;
                    const avatarColor = getAvatarColor(row.display_name);
                    const initials = getInitials(row.display_name);

                    return (
                      <tr
                        key={row.user_id + row.rank}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                            : 'hover:bg-[#1E2535]/50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#8892A4]">
                          #{row.rank}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                            >
                              {initials}
                            </div>
                            <span className="font-semibold text-[#E8EBF0] truncate max-w-[150px] sm:max-w-none">
                              {row.display_name}
                              {isCurrentUser && (
                                <span className="ml-2 px-1.5 py-0.5 rounded bg-cyan-400 text-black text-[10px] font-bold">
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-cyan-400 text-sm">
                          {row.best_wpm} WPM
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#A855F7] font-semibold">
                          {row.avg_accuracy}%
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#8892A4]">
                          {row.tests_count}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#2A3447] pt-4 mt-4 text-xs text-[#8892A4]">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[#2A3447] disabled:opacity-40 hover:bg-[#1E2535] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[#2A3447] disabled:opacity-40 hover:bg-[#1E2535] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Current User Bottom Float Banner if rank is > 20 */}
          {userRank && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold font-mono">
                  #{userRank.rank}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Your Standing</span>
                    <Badge variant="cyan">Rank #{userRank.rank}</Badge>
                  </h4>
                  <p className="text-xs text-[#8892A4]">
                    Best: {userRank.best_wpm} WPM • Accuracy: {userRank.avg_accuracy}%
                  </p>
                </div>
              </div>
              <span className="text-xs text-cyan-300 font-mono font-semibold">
                {userRank.tests_count} tests completed
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: number;
  medalColor: string;
  isWinner?: boolean;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ entry, rank, medalColor, isWinner }) => {
  const avatarColor = getAvatarColor(entry.display_name);
  const initials = getInitials(entry.display_name);

  return (
    <Card
      className={`relative overflow-hidden text-center p-6 flex flex-col items-center justify-between transition-all ${
        isWinner
          ? 'border-amber-400/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] bg-[#1A1F2C]'
          : 'border-[#2A3447]'
      }`}
    >
      {/* Rank Badge */}
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${medalColor} text-black font-extrabold flex items-center justify-center text-sm shadow-md mb-3`}
      >
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
      </div>

      <div
        className={`w-16 h-16 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-lg font-bold text-white shadow-xl mb-3`}
      >
        {initials}
      </div>

      <h3 className="font-bold text-base text-[#E8EBF0] truncate max-w-[180px]">
        {entry.display_name}
      </h3>
      <p className="text-xs text-[#8892A4] mt-0.5">{entry.tests_count} tests taken</p>

      <div className="mt-4 pt-4 border-t border-[#2A3447]/60 w-full flex items-center justify-around font-mono">
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase block">Speed</span>
          <span className="text-xl font-extrabold text-cyan-400">{entry.best_wpm}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase block">Accuracy</span>
          <span className="text-xl font-extrabold text-purple-400">{entry.avg_accuracy}%</span>
        </div>
      </div>
    </Card>
  );
};
