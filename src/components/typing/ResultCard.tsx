import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, LayoutDashboard, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { TypingStats } from '../../types/index.ts';
import { formatTime, getStarRating } from '../../lib/typingUtils.ts';
import { Button } from '../ui/Button.tsx';

interface ResultCardProps {
  stats: TypingStats;
  onRetry: () => void;
  onNext?: () => void;
  onLeaderboard?: () => void;
  onDashboard?: () => void;
  stars?: number;
  improvement?: number;
  isLesson?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  stats,
  onRetry,
  onNext,
  onLeaderboard,
  onDashboard,
  stars,
  improvement = 0,
  isLesson = false,
}) => {
  const calculatedStars = stars ?? getStarRating(stats.wpm, stats.accuracy);

  useEffect(() => {
    // Fire confetti for impressive runs
    if (stats.wpm >= 65 || stats.accuracy >= 95) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#A855F7', '#22C55E', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }
  }, [stats.wpm, stats.accuracy]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#161B27] border border-[#2A3447] p-8 sm:p-12 shadow-2xl relative overflow-hidden animate-scaleUp">
      {/* Background glow orbs */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8892A4]">
          Session Completed
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8EBF0] mt-1">
          {stats.accuracy >= 95 ? 'Outstanding Performance!' : 'Great Practice Session!'}
        </h2>

        {/* Stars for lessons */}
        {isLesson && (
          <div className="flex justify-center items-center gap-2 mt-3">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-7 h-7 transition-all ${
                  star <= calculatedStars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hero Center WPM */}
      <div className="my-8 flex flex-col items-center justify-center relative z-10">
        <div className="w-44 h-44 rounded-full border-4 border-cyan-400/30 flex flex-col items-center justify-center bg-gradient-to-b from-[#1E2535] to-[#0D0F14] shadow-[0_0_35px_rgba(0,229,255,0.25)] relative">
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-1">
            Speed
          </span>
          <span className="text-6xl sm:text-7xl font-extrabold font-mono-code bg-gradient-to-r from-[#00E5FF] to-[#A855F7] bg-clip-text text-transparent">
            {stats.wpm}
          </span>
          <span className="text-xs font-semibold text-[#8892A4] mt-1 font-mono-code">WPM</span>
        </div>

        {/* Improvement Indicator */}
        {improvement !== 0 && (
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {improvement > 0 ? `▲ +${improvement}` : `▼ ${improvement}`} WPM vs last test
            </span>
          </div>
        )}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#0D0F14]/80 border border-[#2A3447] font-mono-code relative z-10">
        <div className="text-center">
          <span className="text-[10px] text-[#8892A4] uppercase block">Accuracy</span>
          <span className="text-2xl font-bold text-[#A855F7]">{stats.accuracy}%</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#8892A4] uppercase block">Errors</span>
          <span className="text-2xl font-bold text-red-400">{stats.errors}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#8892A4] uppercase block">Time</span>
          <span className="text-2xl font-bold text-emerald-400">{formatTime(stats.elapsedSeconds)}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-[#8892A4] uppercase block">Characters</span>
          <span className="text-2xl font-bold text-cyan-400">{stats.totalTyped}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative z-10">
        <Button variant="secondary" onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
          Try Again
        </Button>

        {onNext && (
          <Button variant="primary" onClick={onNext} icon={<ArrowRight className="w-4 h-4" />}>
            Next Lesson
          </Button>
        )}

        {onLeaderboard && (
          <Button variant="secondary" onClick={onLeaderboard} icon={<Trophy className="w-4 h-4" />}>
            Leaderboard
          </Button>
        )}

        {onDashboard && (
          <Button variant="ghost" onClick={onDashboard} icon={<LayoutDashboard className="w-4 h-4" />}>
            Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};
