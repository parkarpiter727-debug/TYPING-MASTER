import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, RotateCcw, CheckCircle2 } from 'lucide-react';
import { LESSONS } from '../lib/lessonData.ts';
import { upsertLessonCompletion, getUserCompletions } from '../lib/lessonService.ts';
import { updateStreak } from '../lib/streakService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useTypingStore } from '../store/typingStore.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { getStarRating } from '../lib/typingUtils.ts';
import { LiveStatsBar } from '../components/typing/LiveStatsBar.tsx';
import { TypingArea } from '../components/typing/TypingArea.tsx';
import { KeyboardHint } from '../components/typing/KeyboardHint.tsx';
import { ResultCard } from '../components/typing/ResultCard.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { LessonCompletion, TypingStats } from '../types/index.ts';

export const LessonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isUrdu } = useLanguage();

  const lesson = LESSONS.find((l) => l.id === id);
  const [existingCompletion, setExistingCompletion] = useState<LessonCompletion | null>(null);
  const [finishedStats, setFinishedStats] = useState<TypingStats | null>(null);
  const [showResult, setShowResult] = useState(false);

  const initSession = useTypingStore((s) => s.initSession);
  const getStats = useTypingStore((s) => s.getStats);
  const isComplete = useTypingStore((s) => s.isComplete);
  const resetSession = useTypingStore((s) => s.resetSession);
  const tickTimer = useTypingStore((s) => s.tickTimer);

  const { elapsed, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer({
    mode: 'elapsed',
  });

  // Keep typingStore timer in sync
  useEffect(() => {
    const timerInterval = setInterval(() => {
      tickTimer();
    }, 500);
    return () => clearInterval(timerInterval);
  }, [tickTimer]);

  useEffect(() => {
    if (!lesson) return;

    initSession(lesson.text);
    resetTimer();
    startTimer();
    setShowResult(false);
    setFinishedStats(null);

    // Fetch prior completion
    async function loadPrior() {
      if (user && lesson) {
        const comps = await getUserCompletions(user.id);
        const match = comps.find((c) => c.lesson_id === lesson.id);
        if (match) setExistingCompletion(match);
      }
    }
    loadPrior();
  }, [id, lesson, initSession, resetTimer, startTimer, user]);

  const handleComplete = async () => {
    stopTimer();
    const finalStats = getStats();
    setFinishedStats(finalStats);
    setShowResult(true);

    if (user && lesson) {
      const stars = getStarRating(finalStats.wpm, finalStats.accuracy);
      await upsertLessonCompletion({
        user_id: user.id,
        lesson_id: lesson.id,
        language: lesson.language,
        level: lesson.level,
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        errors: finalStats.errors,
        stars,
      });
      await updateStreak(user.id);
    }
  };

  const handleRetry = () => {
    if (!lesson) return;
    initSession(lesson.text);
    resetTimer();
    startTimer();
    setShowResult(false);
    setFinishedStats(null);
  };

  // Find next lesson in the curriculum
  const currentIdx = LESSONS.findIndex((l) => l.id === id);
  const nextLesson =
    currentIdx >= 0 && currentIdx < LESSONS.length - 1 ? LESSONS[currentIdx + 1] : null;

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#E8EBF0]">Lesson not found</h2>
        <p className="text-xs text-[#8892A4] mt-2">The requested lesson ID does not exist.</p>
        <Link to="/lessons" className="mt-6 inline-block">
          <Button variant="primary">Back to Lessons</Button>
        </Link>
      </div>
    );
  }

  const liveStats = getStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <Link
          to="/lessons"
          className="flex items-center gap-1.5 text-xs text-[#8892A4] hover:text-[#00E5FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isUrdu ? 'اسباق کی فہرست پر واپس جائیں' : 'Back to Lessons'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleRetry} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            {isUrdu ? 'دوبارہ شروع کریں' : 'Restart'}
          </Button>
        </div>
      </div>

      {/* Lesson Header Banner */}
      <div className="p-6 rounded-2xl bg-[#161B27] border border-[#2A3447] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Badge level={lesson.level} />
            <Badge variant={lesson.language === 'urdu' ? 'purple' : 'cyan'}>
              {lesson.language === 'urdu' ? 'اردو' : 'English'}
            </Badge>
            {existingCompletion && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Best: {existingCompletion.wpm} WPM ({existingCompletion.stars}★)
              </span>
            )}
          </div>
          <h1 className={`text-2xl font-bold text-[#E8EBF0] ${isUrdu ? 'font-urdu text-3xl' : ''}`}>
            {lesson.title}
          </h1>
          <p className={`text-xs text-[#8892A4] mt-1 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Main Interactive Stage or Result Screen */}
      {showResult && finishedStats ? (
        <ResultCard
          stats={finishedStats}
          onRetry={handleRetry}
          onNext={nextLesson ? () => navigate(`/lessons/${nextLesson.id}`) : undefined}
          onDashboard={() => navigate('/dashboard')}
          isLesson
        />
      ) : (
        <div className="space-y-6">
          {/* Real-time stats HUD */}
          <LiveStatsBar
            wpm={liveStats.wpm}
            accuracy={liveStats.accuracy}
            errors={liveStats.errors}
            elapsedSeconds={elapsed}
          />

          {/* Typing interactive box */}
          <TypingArea onComplete={handleComplete} />

          {/* Virtual keyboard assistance */}
          <KeyboardHint />
        </div>
      )}
    </div>
  );
};
