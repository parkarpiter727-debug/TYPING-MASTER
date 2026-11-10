import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Heart,
  Trophy,
  Zap,
  RotateCcw,
  Sparkles,
  Volume2,
  Globe,
  ArrowLeft,
  Flame,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { soundService } from '../lib/soundService.ts';
import { translateKeyToUrdu, isUrduChar } from '../lib/urduPhonetic.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { Button } from '../components/ui/Button.tsx';
import confetti from 'canvas-confetti';

interface FallingWord {
  id: string;
  word: string;
  x: number; // percentage from left (5% to 85%)
  y: number; // percentage from top (0% to 100%)
  speed: number;
}

const ENGLISH_WORDS = [
  'apple', 'brave', 'cloud', 'dream', 'eagle', 'flame', 'grace', 'heart',
  'island', 'jewel', 'knight', 'light', 'magic', 'noble', 'ocean', 'peace',
  'queen', 'river', 'stone', 'tiger', 'unity', 'voice', 'water', 'youth',
  'zenith', 'bright', 'cyber', 'energy', 'future', 'global', 'matrix', 'planet',
  'speed', 'rocket', 'galaxy', 'silver', 'victory', 'wonder', 'inspire', 'champion',
];

const URDU_WORDS = [
  'کتاب', 'قلم', 'روشنی', 'ستارہ', 'چاند', 'سورج', 'پھول', 'خواب',
  'محبت', 'دوستی', 'محنت', 'امید', 'ہمت', 'تعلیم', 'ترقی', 'شہر',
  'راستہ', 'منزل', 'پیغام', 'زندگی', 'خوشی', 'سکون', 'پاکستان', 'اقبال',
  'بہار', 'دریا', 'پہاڑ', 'پرواز', 'شاہین', 'سلام', 'وطن', 'جذبہ',
];

const LOCAL_STORAGE_HIGH_SCORE = 'typemaster_word_rain_high_score';

export const WordRainGame: React.FC = () => {
  const { language: defaultLang, isUrdu: appIsUrdu } = useLanguage();
  const [gameLang, setGameLang] = useState<'english' | 'urdu'>(defaultLang);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    try {
      return Number(localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE) || 0);
    } catch {
      return 0;
    }
  });

  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Speed multiplier based on difficulty
  const speedMultiplier = difficulty === 'easy' ? 0.45 : difficulty === 'medium' ? 0.75 : 1.1;

  // Start / restart game
  const startGame = () => {
    setWords([]);
    setScore(0);
    setCombo(0);
    setLives(3);
    setCurrentInput('');
    setGameState('playing');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Focus input automatically
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Word spawner loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnIntervalMs = difficulty === 'easy' ? 2400 : difficulty === 'medium' ? 1800 : 1300;
    const wordList = gameLang === 'urdu' ? URDU_WORDS : ENGLISH_WORDS;

    const interval = setInterval(() => {
      setWords((prev) => {
        if (prev.length >= 6) return prev; // max 6 words on screen
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        const newWord: FallingWord = {
          id: `${Date.now()}-${Math.random()}`,
          word: randomWord,
          x: Math.floor(Math.random() * 70) + 10, // 10% to 80%
          y: 0,
          speed: (Math.random() * 0.4 + 0.6) * speedMultiplier,
        };
        return [...prev, newWord];
      });
    }, spawnIntervalMs);

    return () => clearInterval(interval);
  }, [gameState, gameLang, difficulty, speedMultiplier]);

  // Physics animation frame loop (falling words)
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setWords((prev) => {
        let missedCount = 0;
        const updated: FallingWord[] = [];

        for (const w of prev) {
          const nextY = w.y + w.speed * delta * 15;
          if (nextY >= 92) {
            // Word hit laser bottom barrier!
            missedCount += 1;
          } else {
            updated.push({ ...w, y: nextY });
          }
        }

        if (missedCount > 0) {
          setLives((l) => {
            const nextL = l - missedCount;
            if (nextL <= 0) {
              setGameState('gameover');
              return 0;
            }
            return nextL;
          });
          setCombo(0);
        }

        return updated;
      });

      if (gameState === 'playing') {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // Update high score on game over
  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE, String(score));
      } catch {
        // ignore
      }
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00E5FF', '#A855F7', '#22C55E', '#F59E0B'],
        });
      } catch {
        // ignore
      }
    }
  }, [gameState, score, highScore]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (gameLang === 'urdu') {
      val = Array.from(val)
        .map((ch) => (isUrduChar(ch) ? ch : translateKeyToUrdu(ch, true)))
        .join('');
    }
    setCurrentInput(val);

    // Check if input matches any falling word
    const trimmed = val.trim();
    if (!trimmed) return;

    const matchedIndex = words.findIndex(
      (w) => w.word.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedIndex !== -1) {
      // Word cleared!
      const matchedWord = words[matchedIndex];
      soundService.playCorrectKey(false);

      const wordScore = matchedWord.word.length * 10 * (combo >= 5 ? 2 : 1);
      setScore((s) => s + wordScore);
      setCombo((c) => c + 1);

      // Remove the matched word
      setWords((prev) => prev.filter((_, idx) => idx !== matchedIndex));
      setCurrentInput('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#1E2535] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E8EBF0] flex items-center gap-2">
              <Gamepad2 className="w-7 h-7 text-cyan-400" />
              <span>{appIsUrdu ? 'الفاظ کی بارش (ورڈ رین گیم)' : 'Word Rain Arcade'}</span>
            </h1>
            <p className="text-xs text-[#8892A4]">
              {appIsUrdu
                ? 'الفاظ نیچے گرنے سے پہلے ٹائپ کریں اور اپنا نیا ہائی اسکور بنائیں!'
                : 'Type falling words before they hit the laser barrier to build epic combos!'}
            </p>
          </div>
        </div>

        {/* High score badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono-code text-xs">
          <Trophy className="w-4 h-4 fill-amber-400/20" />
          <span>High Score: {highScore}</span>
        </div>
      </div>

      {/* GAME MENU STATE */}
      {gameState === 'menu' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#161B27] border border-[#2A3447] text-center max-w-xl mx-auto space-y-6 shadow-2xl animate-scaleUp">
          <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,229,255,0.3)]">
            <Zap className="w-10 h-10 fill-current animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {appIsUrdu ? 'ٹائپنگ آرکیڈ گیم' : 'Word Rain Challenge'}
            </h2>
            <p className="text-xs text-[#8892A4] mt-1.5 max-w-sm mx-auto">
              {appIsUrdu
                ? 'تیزی سے ٹائپ کر کے گرتے ہوئے الفاظ کو تباہ کریں اور اپنی فنگر ریفلیکسز بہتر بنائیں۔'
                : 'Defend against descending words by typing them accurately. Combos grant double points!'}
            </p>
          </div>

          {/* Language select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8892A4] uppercase tracking-wider block">
              {appIsUrdu ? 'گیم کی زبان منتخب کریں' : 'Game Language'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameLang('english')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  gameLang === 'english'
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border-[#2A3447] bg-[#0D0F14] text-[#8892A4]'
                }`}
              >
                English Words
              </button>
              <button
                type="button"
                onClick={() => setGameLang('urdu')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  gameLang === 'urdu'
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border-[#2A3447] bg-[#0D0F14] text-[#8892A4]'
                }`}
              >
                اردو الفاظ (Urdu)
              </button>
            </div>
          </div>

          {/* Difficulty select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8892A4] uppercase tracking-wider block">
              {appIsUrdu ? 'مشکل کی سطح' : 'Difficulty Level'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                      : 'border-[#2A3447] bg-[#0D0F14] text-[#8892A4]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full text-base font-bold shadow-[0_0_25px_rgba(0,229,255,0.4)]"
            onClick={startGame}
            icon={<Gamepad2 className="w-5 h-5 fill-current" />}
          >
            {appIsUrdu ? 'گیم شروع کریں' : 'Start Arcade Game'}
          </Button>
        </div>
      )}

      {/* ACTIVE GAME CANVAS */}
      {gameState === 'playing' && (
        <div
          onClick={focusInput}
          className="relative w-full h-[520px] rounded-3xl bg-[#0B0E14] border-2 border-cyan-500/30 overflow-hidden shadow-2xl cursor-text select-none"
        >
          {/* Top In-Game Status Bar */}
          <div className="absolute top-0 inset-x-0 h-14 bg-[#161B27]/80 backdrop-blur-md border-b border-[#2A3447] px-6 flex items-center justify-between z-20 font-mono-code text-sm">
            {/* Score */}
            <div className="flex items-center gap-2">
              <span className="text-[#8892A4] text-xs uppercase font-bold">Score:</span>
              <span className="text-xl font-extrabold text-cyan-400">{score}</span>
            </div>

            {/* Combo streak */}
            {combo > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{combo}x COMBO!</span>
              </div>
            )}

            {/* Lives / Hearts */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 transition-all ${
                    heart <= lives
                      ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                      : 'text-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Words Falling Zone */}
          <div className="absolute inset-0 pt-16 pb-20 pointer-events-none">
            {words.map((item) => {
              const matchesPrefix =
                currentInput.length > 0 &&
                item.word.toLowerCase().startsWith(currentInput.toLowerCase());

              return (
                <div
                  key={item.id}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  className={`absolute transform -translate-x-1/2 px-3.5 py-1.5 rounded-xl border font-bold text-sm sm:text-base transition-colors ${
                    gameLang === 'urdu' ? 'font-urdu text-lg' : 'font-mono-code'
                  } ${
                    matchesPrefix
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.6)] scale-110 z-10'
                      : 'border-[#2A3447] bg-[#161B27]/90 text-white shadow-md'
                  }`}
                >
                  {item.word}
                </div>
              );
            })}
          </div>

          {/* Bottom Laser Barrier Line */}
          <div className="absolute bottom-16 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-400 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-10" />

          {/* Bottom Input typing dock */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-[#161B27] border-t border-[#2A3447] px-6 flex items-center justify-center z-20">
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder={
                gameLang === 'urdu'
                  ? 'یہاں لفظ ٹائپ کریں...'
                  : 'Type falling words here...'
              }
              className={`w-full max-w-md px-5 py-2.5 rounded-xl bg-[#0D0F14] border border-cyan-400/50 text-white text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner ${
                gameLang === 'urdu' ? 'font-urdu text-lg' : 'font-mono-code'
              }`}
            />
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#161B27] border border-[#2A3447] text-center max-w-xl mx-auto space-y-6 shadow-2xl animate-scaleUp">
          <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <Trophy className="w-10 h-10 fill-current" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white">
              {appIsUrdu ? 'کھیل ختم! (Game Over)' : 'Game Over!'}
            </h2>
            <p className="text-xs text-[#8892A4] mt-1">
              {appIsUrdu ? 'شاندار کوشش! آپ کا آخری اسکور:' : 'Great reflexes! Your final score:'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0F14] border border-[#2A3447] font-mono-code">
            <span className="text-xs text-[#8892A4] uppercase block">Final Score</span>
            <span className="text-5xl font-extrabold text-cyan-400">{score}</span>
            {score >= highScore && score > 0 && (
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> NEW HIGH SCORE!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setGameState('menu')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Menu
            </Button>
            <Button
              variant="primary"
              onClick={startGame}
              icon={<RotateCcw className="w-4 h-4" />}
              className="shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {appIsUrdu ? 'دوبارہ کھیلیں' : 'Play Again'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
