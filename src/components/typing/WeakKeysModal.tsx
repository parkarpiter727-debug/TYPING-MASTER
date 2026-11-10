import React, { useState } from 'react';
import { Target, Zap, AlertTriangle, CheckCircle, RotateCcw, X, Sparkles } from 'lucide-react';
import { getTopWeakKeys, generateWeakKeyDrill, KeyStat } from '../../lib/weakKeysService.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { Button } from '../ui/Button.tsx';

interface WeakKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDrill: (drillText: string) => void;
}

export const WeakKeysModal: React.FC<WeakKeysModalProps> = ({
  isOpen,
  onClose,
  onStartDrill,
}) => {
  const { isUrdu, language } = useLanguage();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  if (!isOpen) return null;

  const weakKeys = getTopWeakKeys(10, language);

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleLaunchDrill = () => {
    const keysToDrill = selectedKeys.length > 0 ? selectedKeys : weakKeys.map((k) => k.key);
    const drillText = generateWeakKeyDrill(keysToDrill, language);
    onStartDrill(drillText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#161B27] border border-[#2A3447] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8892A4] hover:text-white hover:bg-[#1E2535] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#E8EBF0]">
              {isUrdu ? 'کمزور حروف کی نشاندہی اور مشق' : 'Weak Keys Diagnostics'}
            </h2>
            <p className="text-xs text-[#8892A4]">
              {isUrdu
                ? 'وہ حروف جن میں غلطیوں کی شرح زیادہ ہے اور جن کی مشق ضروری ہے'
                : 'Keys with the highest error rates identified from your recent typing'}
            </p>
          </div>
        </div>

        {/* Weak Keys Grid */}
        <div className="mt-6">
          {weakKeys.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0D0F14] border border-[#2A3447] text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-[#E8EBF0]">
                {isUrdu ? 'ماشاءاللہ! کوئی نمایاں کمزور حرف نہیں' : 'Excellent Accuracy!'}
              </p>
              <p className="text-xs text-[#8892A4] max-w-sm mx-auto">
                {isUrdu
                  ? 'آپ کی ٹائپنگ میں ابھی کوئی کمزور حروف نہیں ملے ہیں۔ مزید ٹیسٹ دیں تاکہ سسٹم آپ کے فنگر پیٹرن کا تجزیہ کر سکے۔'
                  : 'You have minimal key errors so far. Keep practicing to build more biometric finger stats!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8892A4]">
                <span>{isUrdu ? 'کمزور حروف منتخب کریں:' : 'Select keys to include in custom drill:'}</span>
                <button
                  onClick={() =>
                    setSelectedKeys(
                      selectedKeys.length === weakKeys.length ? [] : weakKeys.map((k) => k.key)
                    )
                  }
                  className="text-cyan-400 hover:underline"
                >
                  {selectedKeys.length === weakKeys.length ? 'Clear All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {weakKeys.map((item) => {
                  const isSelected =
                    selectedKeys.includes(item.key) ||
                    (selectedKeys.length === 0 && true);
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleKey(item.key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'border-[#2A3447] bg-[#0D0F14] text-[#8892A4] hover:border-[#3B4760]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#1E2535] border border-[#2A3447] flex items-center justify-center font-mono-code text-base font-bold text-white">
                          {item.key === ' ' ? '␣' : item.key}
                        </span>
                        <div>
                          <span className="text-[10px] text-[#8892A4] block">
                            {item.errors} {isUrdu ? 'غلطیاں' : 'misses'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-red-400">
                        {item.errorRate}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-[#2A3447] flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {isUrdu ? 'بند کریں' : 'Cancel'}
          </Button>
          <Button
            variant="primary"
            onClick={handleLaunchDrill}
            icon={<Sparkles className="w-4 h-4 fill-current" />}
            className="shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            {isUrdu ? 'کمزور حروف کی مشق شروع کریں' : 'Generate Targeted Drill'}
          </Button>
        </div>
      </div>
    </div>
  );
};
