import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Keyboard,
  Copy,
  Check,
  RotateCcw,
  Play,
  Sparkles,
  Volume2,
  BookOpen,
  Info,
} from 'lucide-react';
import { translateKeyToUrdu, URDU_PHONETIC_MAP } from '../lib/urduPhonetic.ts';
import { soundService } from '../lib/soundService.ts';
import { SoundControl } from '../components/typing/SoundControl.tsx';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useTypingStore } from '../store/typingStore.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';

const URDU_LETTERS = [
  'ا', 'آ', 'ب', 'پ', 'ت', 'ٹ', 'ث',
  'ج', 'چ', 'ح', 'خ', 'د', 'ڈ', 'ذ',
  'ر', 'ڑ', 'ز', 'ژ', 'س', 'ش', 'ص',
  'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق',
  'ک', 'گ', 'ل', 'م', 'ن', 'ں', 'و',
  'ہ', 'ھ', 'ء', 'ی', 'ے', 'ئ', 'ؤ',
  '؟', '،', '؛', '۔',
];

const PRESET_URDU_SAMPLES = [
  {
    title: 'بنیادی تعارف',
    text: 'میرا نام ٹائپ ماسٹر ہے اور میں اردو میں تیز رفتاری کے ساتھ لکھ سکتا ہوں۔',
  },
  {
    title: 'اقوال زریں',
    text: 'محنت میں عظمت ہے اور علم حاصل کرنا ہر انسان پر فرض ہے۔ وقت کی قدر کریں۔',
  },
  {
    title: 'شاعری (اقبال)',
    text: 'ستاروں سے آگے جہاں اور بھی ہیں، ابھی عشق کے امتحان اور بھی ہیں۔',
  },
  {
    title: 'جدید ٹیکنالوجی',
    text: 'کمپیوٹر اور انٹرنیٹ نے دنیا کو ایک گلوبل ولیج بنا دیا ہے اور رابطے تیز تر ہو چکے ہیں۔',
  },
];

export const UrduPad: React.FC = () => {
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<number>(24);
  const [phoneticEnabled, setPhoneticEnabled] = useState(true);

  const initSession = useTypingStore((s) => s.initSession);

  // Handle physical keyboard typing with instant phonetic conversion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!phoneticEnabled) return;

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
      setText((prev) => prev + char);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + char + text.substring(end);
    setText(newText);
    soundService.playCorrectKey(char === ' ');

    // Reposition cursor right after inserted character
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleStartPractice = () => {
    if (!text.trim()) return;
    initSession(text.trim());
    navigate(`/custom?lang=urdu&text=${encodeURIComponent(text.trim())}`);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              ✨ اردو ٹائپنگ اور ایڈیٹر پیڈ
            </span>
            <span className="text-xs text-[#8892A4]">Urdu Typing Pad & Keyboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-1.5 font-urdu">
            اردو ٹائپنگ پیڈ (Urdu Keyboard Pad)
          </h1>
          <p className="text-xs sm:text-sm text-[#8892A4] mt-1 leading-relaxed">
            اپنے عام انگلش کی بورڈ (QWERTY) سے براہِ راست اردو لکھیں، یا نیچے دیے گئے اردو حروف پر کلک کریں۔
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!text}
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'کاپی ہو گیا!' : 'متن کاپی کریں'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStartPractice}
            disabled={charCount < 10}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            ٹائپنگ ٹیسٹ میں پریکٹس کریں
          </Button>
        </div>
      </div>

      {/* Main Text Area Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2A3447]">
          {/* Phonetic mode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhoneticEnabled(!phoneticEnabled)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                phoneticEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[#1E2535] border-[#2A3447] text-[#8892A4]'
              }`}
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>
                {phoneticEnabled
                  ? '✓ خودکار صوتی ٹائپنگ آن ہے (QWERTY → اردو)'
                  : 'صوتی ٹائپنگ آف (عام کی بورڈ)'}
              </span>
            </button>

            <span className="text-[11px] text-[#6B7280] hidden sm:inline">
              (A = ا، B = ب، P = پ، T = ت)
            </span>
          </div>

          {/* Font Size & Counter */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#8892A4]">
              <span>فونٹ سائز:</span>
              <button
                onClick={() => setFontSize((s) => Math.max(18, s - 2))}
                className="px-2 py-0.5 rounded bg-[#1E2535] border border-[#2A3447] text-white hover:border-cyan-400"
              >
                -
              </button>
              <span className="text-cyan-300 font-bold">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(36, s + 2))}
                className="px-2 py-0.5 rounded bg-[#1E2535] border border-[#2A3447] text-white hover:border-cyan-400"
              >
                +
              </button>
            </div>

            <div className="text-[#8892A4]">
              حروف: <strong className="text-cyan-400 font-bold">{charCount}</strong> | الفاظ:{' '}
              <strong className="text-purple-400 font-bold">{wordCount}</strong>
            </div>

            {text && (
              <button
                onClick={() => setText('')}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
                title="صاف کریں"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <SoundControl compact />
          </div>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          dir="rtl"
          placeholder="یہاں اپنے کی بورڈ سے اردو لکھنا شروع کریں... (مثلاً A دبائیں تو 'ا' لکھا جائے گا)"
          style={{ fontSize: `${fontSize}px` }}
          className="w-full p-4 sm:p-6 rounded-2xl bg-[#0D0F14] border border-[#2A3447] focus:border-cyan-400 text-[#E8EBF0] placeholder-[#4B5563] focus:outline-none font-urdu leading-[2.4] transition-all resize-y"
        />

        {/* Clickable On-screen Urdu Keyboard Letters Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2 text-xs text-[#8892A4]">
            <span className="font-semibold text-cyan-300 font-urdu">
              کلک ایبل اردو حروفِ تہجی (کسی بھی حرف پر کلک کر کے شامل کریں):
            </span>
            <span className="text-[11px] font-sans text-[#6B7280]">Click to insert letter</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#0D0F14] border border-[#2A3447]" dir="rtl">
            {URDU_LETTERS.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => insertChar(letter)}
                className="w-9 h-10 rounded-lg bg-[#161B27] hover:bg-cyan-500 hover:text-black border border-[#2A3447] text-cyan-300 font-urdu text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                {letter}
              </button>
            ))}
            <button
              type="button"
              onClick={() => insertChar(' ')}
              className="px-4 h-10 rounded-lg bg-[#161B27] hover:bg-cyan-500 hover:text-black border border-[#2A3447] text-xs font-semibold flex items-center justify-center transition-all cursor-pointer font-sans"
            >
              SPACE (اسپیس)
            </button>
          </div>
        </div>
      </Card>

      {/* Preset Sample Paragraphs */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#E8EBF0] font-urdu flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>تیار شدہ اردو نمونے (پریکٹس کے لیے منتخب کریں):</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_URDU_SAMPLES.map((sample, idx) => (
            <Card
              key={idx}
              hover
              onClick={() => setText(sample.text)}
              className="p-4 cursor-pointer border-[#2A3447] hover:border-cyan-400/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 font-urdu">
                  {sample.title}
                </span>
                <span className="text-[10px] text-[#8892A4]">کلک کریں</span>
              </div>
              <p className="text-sm text-[#E8EBF0] font-urdu leading-[2.2]" dir="rtl">
                {sample.text}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
