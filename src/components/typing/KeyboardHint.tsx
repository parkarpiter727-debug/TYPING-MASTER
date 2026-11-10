import React, { useState } from 'react';
import { useTypingStore } from '../../store/typingStore.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { isUrduChar, getEnglishKeyForUrdu, URDU_PHONETIC_MAP } from '../../lib/urduPhonetic.ts';
import { soundService } from '../../lib/soundService.ts';

export const KeyboardHint: React.FC = () => {
  const { isUrdu } = useLanguage();
  const originalText = useTypingStore((s) => s.originalText);
  const currentIndex = useTypingStore((s) => s.currentIndex);
  const handleInput = useTypingStore((s) => s.handleInput);
  const handleBackspace = useTypingStore((s) => s.handleBackspace);

  const [isShiftActive, setIsShiftActive] = useState(false);

  const nextChar =
    currentIndex < originalText.length ? originalText[currentIndex] : '';
  const textHasUrdu = isUrdu || isUrduChar(nextChar);

  // Standard QWERTY Layout rows
  const normalRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Backspace'],
    ['Space'],
  ];

  const shiftRows = [
    ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 'Backspace'],
    ['Space'],
  ];

  const rows = isShiftActive ? shiftRows : normalRows;

  // Compute what English physical key or Urdu character is expected next
  const getTargetKey = (): { primary: string; needsShift: boolean } => {
    if (!nextChar) return { primary: '', needsShift: false };
    if (nextChar === ' ') return { primary: 'Space', needsShift: false };

    if (textHasUrdu) {
      const enKey = getEnglishKeyForUrdu(nextChar);
      const needsShift = enKey.length === 1 && enKey === enKey.toUpperCase() && enKey !== enKey.toLowerCase();
      return { primary: enKey, needsShift };
    }

    const needsShift = nextChar === nextChar.toUpperCase() && nextChar !== nextChar.toLowerCase();
    return { primary: nextChar, needsShift };
  };

  const { primary: targetKey, needsShift: targetNeedsShift } = getTargetKey();

  const handleKeyClick = (key: string) => {
    if (key === 'Space') {
      if (currentIndex < originalText.length && originalText[currentIndex] === ' ') {
        soundService.playCorrectKey(true);
      }
      handleInput(' ');
      return;
    }
    if (key === 'Backspace') {
      handleBackspace();
      return;
    }
    if (key === 'Shift') {
      setIsShiftActive((prev) => !prev);
      return;
    }
    if (key === 'Tab' || key === 'Caps' || key === 'Enter') {
      return;
    }

    const charToInput = textHasUrdu ? (URDU_PHONETIC_MAP[key] || key) : key;
    if (currentIndex < originalText.length && originalText[currentIndex] === charToInput) {
      soundService.playCorrectKey(charToInput === ' ');
    }
    handleInput(charToInput);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-[#0D0F14]/90 border border-[#2A3447] select-none">
      {/* Top Status */}
      <div className="flex items-center justify-between w-full max-w-xl px-2 mb-2 text-xs text-[#8892A4]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#E8EBF0]">
            {textHasUrdu ? 'اردو صوتی کی بورڈ (کلک بھی کر سکتے ہیں)' : 'Interactive Virtual Keyboard'}
          </span>
          {textHasUrdu && targetNeedsShift && (
            <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
              Shift + Key
            </span>
          )}
        </div>

        <div className="font-mono text-cyan-400 flex items-center gap-2">
          <span>اگلا حرف:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 font-bold text-white text-sm font-urdu">
            {nextChar === ' ' ? 'SPACE' : nextChar || 'None'}
          </span>
          {textHasUrdu && targetKey && targetKey !== 'Space' && (
            <span className="text-xs text-[#8892A4]">
              (Key: <strong className="text-cyan-300 font-mono">{targetKey}</strong>)
            </span>
          )}
        </div>
      </div>

      {/* Keyboard Grid */}
      <div className="overflow-x-auto w-full pb-1">
        <div className="min-w-[620px] flex flex-col items-center gap-1.5">
          {rows.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="flex gap-1 justify-center w-full">
              {row.map((key, kIdx) => {
                const isSpecial =
                  key === 'Tab' ||
                  key === 'Caps' ||
                  key === 'Enter' ||
                  key === 'Shift' ||
                  key === 'Backspace' ||
                  key === 'Space';

                // In Urdu mode, show the Urdu phonetic character on top of letter
                const urduMappedChar =
                  textHasUrdu && !isSpecial ? URDU_PHONETIC_MAP[key] : null;

                const isTarget =
                  key.toLowerCase() === targetKey.toLowerCase() ||
                  (key === 'Space' && targetKey === 'Space') ||
                  (key === 'Shift' && targetNeedsShift);

                let widthClass = 'w-10 h-11 text-xs';
                if (key === 'Space') widthClass = 'w-72 h-10 text-xs';
                else if (key === 'Tab' || key === 'Caps' || key === 'Enter')
                  widthClass = 'w-14 h-11 text-[10px]';
                else if (key === 'Shift' || key === 'Backspace')
                  widthClass = 'w-16 h-11 text-[10px]';

                const isShiftButtonActive = key === 'Shift' && isShiftActive;

                return (
                  <button
                    key={`${key}-${rIdx}-${kIdx}`}
                    type="button"
                    onClick={() => handleKeyClick(key)}
                    className={`flex flex-col items-center justify-center rounded-lg font-mono transition-all duration-150 border cursor-pointer select-none active:scale-95 ${widthClass} ${
                      isTarget
                        ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-black font-extrabold border-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.7)] scale-105 animate-pulse'
                        : isShiftButtonActive
                        ? 'bg-purple-600 text-white font-bold border-purple-400'
                        : 'bg-[#161B27] border-[#2A3447] text-[#8892A4] hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {/* Primary Urdu character if available */}
                    {urduMappedChar ? (
                      <span className="font-urdu text-sm font-bold leading-none text-cyan-200">
                        {urduMappedChar}
                      </span>
                    ) : null}

                    {/* Physical Key label */}
                    <span
                      className={`text-[10px] ${
                        urduMappedChar ? 'text-[9px] text-[#6B7280] font-sans' : 'font-semibold'
                      }`}
                    >
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
