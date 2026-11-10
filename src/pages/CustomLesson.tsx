import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Edit3, Play, RotateCcw, AlertCircle, Globe, Keyboard, Sparkles } from 'lucide-react';
import { insertCustomSession } from '../lib/customSessionService.ts';
import { updateStreak } from '../lib/streakService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useTypingStore } from '../store/typingStore.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { translateKeyToUrdu, isUrduChar } from '../lib/urduPhonetic.ts';
import { Language, TypingStats } from '../types/index.ts';
import { LiveStatsBar } from '../components/typing/LiveStatsBar.tsx';
import { TypingArea } from '../components/typing/TypingArea.tsx';
import { KeyboardHint } from '../components/typing/KeyboardHint.tsx';
import { ResultCard } from '../components/typing/ResultCard.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';

const QUICK_URDU_SNIPPETS = [
  'علم ایک ایسا نور ہے جو انسان کی عقل کو روشنی عطا کرتا ہے اور ہر مشکل کو آسان بناتا ہے۔',
  'وقت کی قدر کرنے والے ہمیشہ کامیابی حاصل کرتے ہیں اور محنت سے اپنے خوابوں کو پورا کرتے ہیں۔',
  'اردو ہماری قومی زبان ہے جس میں بے پناہ خوبصورتی، شیرینی اور ادب کا وسیع ذخیرہ موجود ہے۔',
];

const URDU_BUTTONS = [
  'ا', 'آ', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ',
  'د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض',
  'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن',
  'ں', 'و', 'ہ', 'ھ', 'ء', 'ی', 'ے', '؟', '،', '۔'
];

export const CustomLesson: React.FC = () => {
  const { user } = useAuth();
  const { language: defaultLang, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const searchParams = new URLSearchParams(location.search);
  const paramText = searchParams.get('text') || '';
  const paramLang = searchParams.get('lang') as Language | null;

  const incomingText = paramText || (location.state as { text?: string; autoStart?: boolean } | null)?.text || '';
  const incomingAutoStart = Boolean(paramText) || (location.state as { text?: string; autoStart?: boolean } | null)?.autoStart || false;

  const initialLang: Language = paramLang || (incomingText && isUrduChar(incomingText.trim()[0]) ? 'urdu' : defaultLang);

  const [customText, setCustomText] = useState(incomingText);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLang);
  const [isTypingActive, setIsTypingActive] = useState(Boolean(incomingText && incomingAutoStart));
  const [finishedStats, setFinishedStats] = useState<TypingStats | null>(null);
  const [urduPhoneticInTextarea, setUrduPhoneticInTextarea] = useState(true);

  const initSession = useTypingStore((s) => s.initSession);
  const getStats = useTypingStore((s) => s.getStats);
  const endSession = useTypingStore((s) => s.endSession);
  const tickTimer = useTypingStore((s) => s.tickTimer);

  const { elapsed, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer({
    mode: 'elapsed',
  });

  useEffect(() => {
    if (incomingText && incomingText.trim().length >= 10 && incomingAutoStart) {
      initSession(incomingText.trim());
      resetTimer();
      startTimer();
      setIsTypingActive(true);
      setFinishedStats(null);
    }
  }, [incomingText, incomingAutoStart]);

  useEffect(() => {
    if (isTypingActive) {
      const interval = setInterval(() => {
        tickTimer();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isTypingActive, tickTimer]);

  // Transliterate keyboard input into Urdu directly inside the textarea
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (selectedLanguage !== 'urdu' || !urduPhoneticInTextarea) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Tab') return;

    if (e.key.length === 1) {
      e.preventDefault();
      const urduChar = translateKeyToUrdu(e.key, true);
      insertChar(urduChar);
    }
  };

  const insertChar = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCustomText((prev) => prev + char);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = customText.substring(0, start) + char + customText.substring(end);
    setCustomText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleStart = () => {
    if (customText.trim().length < 50) return;
    initSession(customText.trim());
    resetTimer();
    startTimer();
    setIsTypingActive(true);
    setFinishedStats(null);
  };

  const handleComplete = async () => {
    stopTimer();
    endSession();
    const stats = getStats();
    setFinishedStats(stats);
    setIsTypingActive(false);

    if (user) {
      await insertCustomSession({
        user_id: user.id,
        language: selectedLanguage,
        text_length: customText.trim().length,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        time_taken_seconds: stats.elapsedSeconds,
      });
      await updateStreak(user.id);
    }
  };

  const handleRetry = () => {
    handleStart();
  };

  const charCount = customText.trim().length;
  const isValid = charCount >= 50;
  const liveStats = getStats();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            {isUrdu ? 'ذاتی ٹیکسٹ ٹریننگ' : 'Personal Practice'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-1">
          {isUrdu ? 'اپنا کسٹم سبق بنائیں' : 'Create Custom Lesson'}
        </h1>
        <p className="text-sm text-[#8892A4] mt-1.5">
          {isUrdu
            ? 'کسی بھی مضمون، کتاب، کوڈ یا تحریر کو یہاں لکھیں یا پیسٹ کریں اور براہ راست اس کی ٹائپنگ مشق کریں۔'
            : 'Paste your own text (minimum 50 characters) to practice specific articles, scripts, or passages.'}
        </p>
      </div>

      {finishedStats ? (
        <ResultCard
          stats={finishedStats}
          onRetry={handleRetry}
          onDashboard={() => navigate('/dashboard')}
        />
      ) : isTypingActive ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              {isUrdu ? 'کسٹم ٹائپنگ سیشن' : 'Custom Session in Progress'}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTypingActive(false)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              {isUrdu ? 'تبدیل کریں' : 'Edit Text'}
            </Button>
          </div>

          <LiveStatsBar
            wpm={liveStats.wpm}
            accuracy={liveStats.accuracy}
            errors={liveStats.errors}
            elapsedSeconds={elapsed}
          />

          <TypingArea onComplete={handleComplete} />

          <KeyboardHint />
        </div>
      ) : (
        <Card className="p-8 max-w-2xl mx-auto space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-2.5">
              {isUrdu ? 'تحریر کی زبان' : 'Text Language'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedLanguage('english')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                  selectedLanguage === 'english'
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English (LTR)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('urdu')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                  selectedLanguage === 'urdu'
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                    : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4]'
                }`}
              >
                <span className="font-urdu text-sm">اردو (RTL)</span>
              </button>
            </div>
          </div>

          {/* Quick Snippets if Urdu is selected */}
          {selectedLanguage === 'urdu' && (
            <div className="space-y-2">
              <span className="text-xs text-cyan-400 font-semibold font-urdu flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>فوری اردو نمونہ شامل کریں (Click to insert):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_URDU_SNIPPETS.map((snip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomText(snip)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[#0D0F14] border border-[#2A3447] hover:border-cyan-400 text-[#8892A4] hover:text-white font-urdu text-right"
                  >
                    نمونہ {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Area */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8892A4]">
                {selectedLanguage === 'urdu'
                  ? 'اپنی اردو تحریر یہاں لکھیں یا پیسٹ کریں'
                  : 'Paste Your Text (min. 50 characters)'}
              </label>
              <span
                className={`text-xs font-mono ${
                  isValid ? 'text-emerald-400 font-semibold' : 'text-[#8892A4]'
                }`}
              >
                {charCount} / 50 characters
              </span>
            </div>

            <textarea
              ref={textareaRef}
              rows={6}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={
                selectedLanguage === 'urdu'
                  ? 'یہاں کی بورڈ سے اردو لکھنا شروع کریں... (صوتی ٹائپنگ آن ہے)'
                  : 'Paste or type at least 50 characters of English text here to convert into a typing practice session...'
              }
              dir={selectedLanguage === 'urdu' ? 'rtl' : 'ltr'}
              className={`w-full p-4 rounded-xl bg-[#0D0F14] border text-sm text-[#E8EBF0] placeholder-[#4B5563] focus:outline-none transition-colors ${
                selectedLanguage === 'urdu' ? 'font-urdu text-lg leading-[2.2]' : 'font-mono'
              } ${
                charCount > 0 && !isValid
                  ? 'border-amber-500/60'
                  : 'border-[#2A3447] focus:border-cyan-400'
              }`}
            />

            {charCount > 0 && !isValid && (
              <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {selectedLanguage === 'urdu'
                    ? `مزید ${50 - charCount} حروف درکار ہیں تاکہ سیشن شروع ہو سکے۔`
                    : `Please add ${50 - charCount} more characters to reach the 50 character minimum.`}
                </span>
              </p>
            )}

            {/* Clickable Urdu buttons toolbar */}
            {selectedLanguage === 'urdu' && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#0D0F14] border border-[#2A3447] space-y-1.5" dir="rtl">
                <div className="flex items-center justify-between text-[11px] text-[#8892A4]">
                  <span className="font-urdu text-cyan-300 font-semibold">حروف کلک کر کے شامل کریں:</span>
                  <button
                    type="button"
                    onClick={() => setUrduPhoneticInTextarea(!urduPhoneticInTextarea)}
                    className="text-cyan-400 hover:underline"
                  >
                    {urduPhoneticInTextarea ? '✓ صوتی ٹائپنگ فعال ہے' : 'صوتی ٹائپنگ آف'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {URDU_BUTTONS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => insertChar(char)}
                      className="w-7 h-8 rounded bg-[#161B27] hover:bg-cyan-500 hover:text-black border border-[#2A3447] text-cyan-200 font-urdu text-sm flex items-center justify-center transition-all cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => insertChar(' ')}
                    className="px-2.5 h-8 rounded bg-[#161B27] hover:bg-cyan-500 hover:text-black border border-[#2A3447] text-xs font-semibold flex items-center justify-center transition-all cursor-pointer font-sans"
                  >
                    SPACE
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isValid}
            onClick={handleStart}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            {isUrdu ? 'کسٹم سیشن شروع کریں' : 'Start Typing Session'}
          </Button>
        </Card>
      )}
    </div>
  );
};
