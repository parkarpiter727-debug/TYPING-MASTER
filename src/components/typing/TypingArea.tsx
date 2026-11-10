import React, { useRef, useEffect, useState } from 'react';
import { useTypingStore } from '../../store/typingStore.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { translateKeyToUrdu, isUrduChar } from '../../lib/urduPhonetic.ts';
import { Keyboard, HelpCircle, Check, Info } from 'lucide-react';

interface TypingAreaProps {
  onComplete?: () => void;
  disabled?: boolean;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  onComplete,
  disabled = false,
}) => {
  const { isUrdu } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  const [phoneticEnabled, setPhoneticEnabled] = useState(true);
  const [showHelperModal, setShowHelperModal] = useState(false);

  const originalText = useTypingStore((s) => s.originalText);
  const typedChars = useTypingStore((s) => s.typedChars);
  const currentIndex = useTypingStore((s) => s.currentIndex);
  const isComplete = useTypingStore((s) => s.isComplete);
  const handleInput = useTypingStore((s) => s.handleInput);
  const handleBackspace = useTypingStore((s) => s.handleBackspace);

  // Focus input automatically on mount and on container click
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, originalText]);

  // Notify on completion
  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  // Keep active character scrolled into view smoothly
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const charEl = activeCharRef.current;
      const containerRect = container.getBoundingClientRect();
      const charRect = charEl.getBoundingClientRect();

      if (charRect.bottom > containerRect.bottom - 40 || charRect.top < containerRect.top + 20) {
        charEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentIndex]);

  const expectedNextChar =
    currentIndex < originalText.length ? originalText[currentIndex] : '';
  const textHasUrdu = isUrdu || isUrduChar(expectedNextChar);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isComplete) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    // Only process printable single character inputs
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();

      let charToInput = e.key;
      // If typing in Urdu mode or expected character is Urdu, apply phonetic transliteration
      if (textHasUrdu && phoneticEnabled) {
        charToInput = translateKeyToUrdu(e.key, true);
      }

      handleInput(charToInput);
    }
  };

  const focusInput = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const textLength = originalText.length;
  const progressPercent = textLength > 0 ? (currentIndex / textLength) * 100 : 0;

  return (
    <div
      onClick={focusInput}
      className={`relative w-full rounded-2xl bg-[#161B27] border border-[#2A3447] p-6 sm:p-8 cursor-text transition-all duration-200 select-none shadow-xl ${
        disabled ? 'opacity-60 pointer-events-none' : 'hover:border-cyan-500/40'
      }`}
    >
      {/* Hidden input to catch keyboard events on all devices */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none -left-9999px"
        onKeyDown={handleKeyDown}
        disabled={disabled || isComplete}
        autoFocus
        tabIndex={0}
        aria-label="Typing input catcher"
      />

      {/* Top Bar with Live Indicator & Urdu Phonetic Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span className="font-medium text-[#E8EBF0]">
            {textHasUrdu
              ? 'اردو ٹائپنگ ایریا (کی بورڈ سے لکھنا شروع کریں)'
              : 'Active Typing Area (Click & Type)'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Urdu Phonetic Assist Pill */}
          {textHasUrdu && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0D0F14] border border-cyan-500/30 text-[11px]">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhoneticEnabled(!phoneticEnabled);
                }}
                className="flex items-center gap-1.5 font-medium text-cyan-300 hover:text-cyan-200 cursor-pointer"
                title="Toggle English QWERTY to Urdu Phonetic auto-transliteration"
              >
                <span className={phoneticEnabled ? 'text-emerald-400 font-bold' : 'text-[#8892A4]'}>
                  {phoneticEnabled ? '✓ صوتی کی بورڈ آن ہے' : 'صوتی کی بورڈ آف'}
                </span>
                <span className="text-[#64748B]">
                  ({phoneticEnabled ? 'QWERTY → اردو' : 'Native OS Urdu'})
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHelperModal(!showHelperModal);
                }}
                className="text-[#8892A4] hover:text-[#E8EBF0] p-0.5"
                title="Urdu typing guide"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <span className="font-mono-code text-cyan-400 font-semibold">
            {currentIndex} / {textLength} ({Math.round(progressPercent)}%)
          </span>
        </div>
      </div>

      {/* Phonetic Helper Tooltip / Guide */}
      {showHelperModal && textHasUrdu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mb-4 p-4 rounded-xl bg-[#0D0F14] border border-cyan-500/40 text-xs text-[#E8EBF0] space-y-2 animate-fadeIn"
        >
          <div className="flex items-center justify-between font-bold text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              اردو ٹائپنگ گائیڈ (Urdu Typing Guide)
            </span>
            <button
              onClick={() => setShowHelperModal(false)}
              className="text-[#8892A4] hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[#8892A4] leading-relaxed">
            آپ بغیر کسی الگ اردو کی بورڈ انسٹال کیے اپنے عام انگریزی کی بورڈ سے براہ راست اردو لکھ سکتے ہیں:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">A = ا (Alif)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">B = ب (Bay)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">P = پ (Pay)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">T = ت (Tay)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">Shift+T = ٹ</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">S = س (Seen)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">K = ک (Kaaf)</span>
            <span className="p-1 rounded bg-[#161B27] border border-[#2A3447]">M = م (Meem)</span>
          </div>
        </div>
      )}

      {/* Main Text Display */}
      <div
        ref={containerRef}
        className={`max-h-[300px] overflow-y-auto pr-2 text-xl sm:text-2xl leading-relaxed tracking-wide select-none ${
          textHasUrdu ? 'font-urdu text-2xl sm:text-3xl text-right leading-[2.6]' : 'font-mono-code text-left'
        }`}
        dir={textHasUrdu ? 'rtl' : 'ltr'}
      >
        {originalText.split('').map((char, index) => {
          let statusClass = 'char-upcoming';
          const isCurrent = index === currentIndex;
          const isTyped = index < currentIndex;

          if (isTyped) {
            const typedChar = typedChars[index];
            const wasCorrect = typedChar === char;
            statusClass = wasCorrect ? 'char-correct' : 'char-error';
          } else if (isCurrent) {
            statusClass = 'char-current';
          }

          const isSpace = char === ' ';

          return (
            <span
              key={index}
              ref={isCurrent ? activeCharRef : null}
              className={`transition-colors duration-100 ${statusClass} ${
                isCurrent ? 'ring-2 ring-cyan-400/80 rounded px-0.5' : ''
              } ${isSpace && isCurrent ? 'bg-cyan-500/20 px-1' : ''}`}
            >
              {isSpace ? '\u00A0' : char}
              {isCurrent && <span className="typing-cursor" />}
            </span>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="mt-5 pt-3 border-t border-[#2A3447]/60 flex items-center justify-between text-xs text-[#6B7280]">
        <span>
          {textHasUrdu
            ? 'غلطی کی صورت میں بیک اسپیس (Backspace) دبائیں۔ نیچے ورچوئل کی بورڈ پر کلک بھی کر سکتے ہیں۔'
            : 'Press Backspace to correct errors. Keep eyes on the screen.'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            focusInput();
          }}
          className="text-cyan-400 hover:underline cursor-pointer"
        >
          {textHasUrdu ? 'فوکس بحال کریں' : 'Click to Focus'}
        </button>
      </div>
    </div>
  );
};
