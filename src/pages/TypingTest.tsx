import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Clock, Globe, RotateCcw, StopCircle, Trophy } from 'lucide-react';
import { SAMPLE_TEST_PASSAGES } from '../lib/lessonData.ts';
import { insertTestResult, getUserTestHistory } from '../lib/testResultsService.ts';
import { updateStreak } from '../lib/streakService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useTypingStore } from '../store/typingStore.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { Language, TypingStats } from '../types/index.ts';
import { LiveStatsBar } from '../components/typing/LiveStatsBar.tsx';
import { TypingArea } from '../components/typing/TypingArea.tsx';
import { KeyboardHint } from '../components/typing/KeyboardHint.tsx';
import { ResultCard } from '../components/typing/ResultCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';

export const TypingTest: React.FC = () => {
  const { user } = useAuth();
  const { language: defaultLang, isUrdu } = useLanguage();
  const navigate = useNavigate();

  // Settings
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // 60, 120, 300
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(defaultLang);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'running' | 'finished'>('idle');
  const [countdownValue, setCountdownValue] = useState<number>(3);

  const [finishedStats, setFinishedStats] = useState<TypingStats | null>(null);
  const [improvementWpm, setImprovementWpm] = useState<number>(0);

  const initSession = useTypingStore((s) => s.initSession);
  const getStats = useTypingStore((s) => s.getStats);
  const endSession = useTypingStore((s) => s.endSession);
  const tickTimer = useTypingStore((s) => s.tickTimer);

  const {
    timeLeft,
    elapsed,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimer({
    mode: 'countdown',
    initialDurationSeconds: selectedDuration,
    onTimeUp: () => {
      finishTest();
    },
  });

  // Ticking typing store elapsed time
  useEffect(() => {
    if (gameState === 'running') {
      const interval = setInterval(() => {
        tickTimer();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [gameState, tickTimer]);

  const getRandomPassage = (lang: Language) => {
    const list = SAMPLE_TEST_PASSAGES[lang];
    const randomIndex = Math.floor(Math.random() * list.length);
    // Combine 2 passages for longer tests
    if (selectedDuration > 60) {
      return `${list[randomIndex]} ${list[(randomIndex + 1) % list.length]}`;
    }
    return list[randomIndex];
  };

  const startCountdown = () => {
    const passage = getRandomPassage(selectedLanguage);
    initSession(passage);
    setGameState('countdown');
    setCountdownValue(3);

    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('running');
          resetTimer(selectedDuration);
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 900);
  };

  const finishTest = async () => {
    stopTimer();
    endSession();
    const finalStats = getStats();
    setFinishedStats(finalStats);
    setGameState('finished');

    // Calculate improvement vs last test
    const userId = user?.id || 'guest-session';
    const history = await getUserTestHistory(userId, 5);
    if (history.length > 0) {
      const lastWpm = history[0].wpm;
      setImprovementWpm(Math.round((finalStats.wpm - lastWpm) * 10) / 10);
    }

    await insertTestResult({
      user_id: user.id,
      language: selectedLanguage,
      duration_seconds: selectedDuration,
      wpm: finalStats.wpm,
      accuracy: finalStats.accuracy,
      errors: finalStats.errors,
      characters_typed: finalStats.totalTyped,
      correct_characters: finalStats.correctChars,
    });
    await updateStreak(user.id);
  };

  const handleRetry = () => {
    setGameState('idle');
    setFinishedStats(null);
  };

  const liveStats = getStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 3... 2... 1... Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center animate-bounce">
            <span className="text-8xl sm:text-9xl font-extrabold font-mono-code bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
              {countdownValue > 0 ? countdownValue : 'GO!'}
            </span>
            <p className="text-sm font-semibold text-cyan-300 mt-4 tracking-widest uppercase">
              {isUrdu ? 'تیار ہو جائیں!' : 'Get Ready!'}
            </p>
          </div>
        </div>
      )}

      {/* IDLE: Test Configuration Panel */}
      {gameState === 'idle' && (
        <div className="space-y-8 animate-fadeIn">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                {isUrdu ? 'سرکاری ٹائپنگ امتحان' : 'Official Speed Benchmark'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-1">
              {isUrdu ? 'ٹائپنگ اسپیڈ ٹیسٹ' : 'Typing Speed Test'}
            </h1>
            <p className="text-sm text-[#8892A4] mt-1.5">
              {isUrdu
                ? 'مقررہ وقت میں اپنی حتمی ٹائپنگ رفتار اور درستگی جانچیں اور اپنا نیا ریکارڈ قائم کریں۔'
                : 'Select your duration, choose English or Urdu, and test your maximum words per minute.'}
            </p>
          </div>

          <Card className="p-8 max-w-2xl mx-auto space-y-6">
            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-3">
                {isUrdu ? 'ٹیسٹ کا دورانیہ منتخب کریں' : 'Select Test Duration'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { seconds: 60, label: isUrdu ? '۱ منٹ' : '1 Minute', icon: '⚡' },
                  { seconds: 120, label: isUrdu ? '۲ منٹ' : '2 Minutes', icon: '⏱' },
                  { seconds: 300, label: isUrdu ? '۵ منٹ' : '5 Minutes', icon: '🔥' },
                ].map((opt) => (
                  <button
                    key={opt.seconds}
                    type="button"
                    onClick={() => setSelectedDuration(opt.seconds)}
                    className={`py-3.5 px-4 rounded-xl border text-sm font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selectedDuration === opt.seconds
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                        : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4] hover:text-[#E8EBF0] hover:border-[#2A3447]'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-3">
                {isUrdu ? 'زبان منتخب کریں' : 'Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('english')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedLanguage === 'english'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                      : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4] hover:text-[#E8EBF0]'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>English (Latin QWERTY)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLanguage('urdu')}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedLanguage === 'urdu'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                      : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4] hover:text-[#E8EBF0]'
                  }`}
                >
                  <span className="font-urdu text-base">اردو</span>
                  <span>Urdu (نستعلیق)</span>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4 border-t border-[#2A3447]">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-base font-bold shadow-[0_0_25px_rgba(0,229,255,0.4)]"
                onClick={startCountdown}
                icon={<Zap className="w-5 h-5 fill-current" />}
              >
                {isUrdu ? 'ٹیسٹ شروع کریں' : 'Start Speed Test'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* RUNNING: Active Test Stage */}
      {gameState === 'running' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              {selectedDuration / 60} Min {selectedLanguage === 'urdu' ? 'اردو' : 'English'} Test
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={finishTest}
              icon={<StopCircle className="w-3.5 h-3.5" />}
            >
              {isUrdu ? 'ٹیسٹ ختم کریں' : 'End Test Early'}
            </Button>
          </div>

          {/* Live Stats Countdown Bar */}
          <LiveStatsBar
            wpm={liveStats.wpm}
            accuracy={liveStats.accuracy}
            errors={liveStats.errors}
            timeRemaining={timeLeft}
            isCountdown
          />

          {/* Main Typing Passage Box */}
          <TypingArea onComplete={finishTest} />

          {/* Keyboard hint */}
          <KeyboardHint />
        </div>
      )}

      {/* FINISHED: Results Screen */}
      {gameState === 'finished' && finishedStats && (
        <ResultCard
          stats={finishedStats}
          improvement={improvementWpm}
          onRetry={handleRetry}
          onLeaderboard={() => navigate('/leaderboard')}
          onDashboard={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
};
