import React, { useState } from 'react';
import { X, Search, Keyboard, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage.ts';

interface UrduKeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KeyEntry {
  en: string;
  ur: string;
  name: string;
  isShift?: boolean;
  category: 'basic' | 'shift' | 'punctuation' | 'number';
}

const URDU_GUIDE_DATA: KeyEntry[] = [
  // Basic lowercase
  { en: 'a', ur: 'ا', name: 'الف (Alif)', category: 'basic' },
  { en: 'b', ur: 'ب', name: 'بے (Bay)', category: 'basic' },
  { en: 'p', ur: 'پ', name: 'پے (Pay)', category: 'basic' },
  { en: 't', ur: 'ت', name: 'تے (Tay)', category: 'basic' },
  { en: 'c', ur: 'چ', name: 'چے (Chay)', category: 'basic' },
  { en: 'j', ur: 'ج', name: 'جیم (Jeem)', category: 'basic' },
  { en: 'h', ur: 'ح', name: 'حے (Bari Hay)', category: 'basic' },
  { en: 'd', ur: 'د', name: 'دال (Daal)', category: 'basic' },
  { en: 'r', ur: 'ر', name: 'رے (Ray)', category: 'basic' },
  { en: 'z', ur: 'ز', name: 'زے (Zay)', category: 'basic' },
  { en: 's', ur: 'س', name: 'سین (Seen)', category: 'basic' },
  { en: 'x', ur: 'ش', name: 'شین (Sheen)', category: 'basic' },
  { en: 'v', ur: 'ط', name: 'طوئیں (Toye)', category: 'basic' },
  { en: 'e', ur: 'ع', name: 'عین (Ain)', category: 'basic' },
  { en: 'f', ur: 'ف', name: 'فے (Fay)', category: 'basic' },
  { en: 'q', ur: 'ق', name: 'قاف (Qaaf)', category: 'basic' },
  { en: 'k', ur: 'ک', name: 'کاف (Kaaf)', category: 'basic' },
  { en: 'g', ur: 'گ', name: 'گاف (Gaaf)', category: 'basic' },
  { en: 'l', ur: 'ل', name: 'لام (Laam)', category: 'basic' },
  { en: 'm', ur: 'م', name: 'میم (Meem)', category: 'basic' },
  { en: 'n', ur: 'ن', name: 'نون (Noon)', category: 'basic' },
  { en: 'w', ur: 'و', name: 'واؤ (Wao)', category: 'basic' },
  { en: 'o', ur: 'ہ', name: 'ہ گول (Gol Hay)', category: 'basic' },
  { en: 'u', ur: 'ء', name: 'ہمزہ (Hamza)', category: 'basic' },
  { en: 'i', ur: 'ی', name: 'چھوٹی ی (Choti Yay)', category: 'basic' },
  { en: 'y', ur: 'ے', name: 'بڑی ے (Bari Yay)', category: 'basic' },

  // Shift combinations
  { en: 'Shift + A', ur: 'آ', name: 'الف مد آ (Alif Madda)', isShift: true, category: 'shift' },
  { en: 'Shift + T', ur: 'ٹ', name: 'ٹے (Tay with toye)', isShift: true, category: 'shift' },
  { en: 'Shift + C', ur: 'ث', name: 'ثے (Say)', isShift: true, category: 'shift' },
  { en: 'Shift + K', ur: 'خ', name: 'خے (Khay)', isShift: true, category: 'shift' },
  { en: 'Shift + D', ur: 'ڈ', name: 'ڈال (Daal with toye)', isShift: true, category: 'shift' },
  { en: 'Shift + Z', ur: 'ذ', name: 'ذال (Zaal)', isShift: true, category: 'shift' },
  { en: 'Shift + R', ur: 'ڑ', name: 'ڑے (Arday)', isShift: true, category: 'shift' },
  { en: 'Shift + X', ur: 'ژ', name: 'ژے (Zhay)', isShift: true, category: 'shift' },
  { en: 'Shift + S', ur: 'ص', name: 'صاد (Suad)', isShift: true, category: 'shift' },
  { en: 'Shift + J', ur: 'ض', name: 'ضاد (Zuaad)', isShift: true, category: 'shift' },
  { en: 'Shift + V', ur: 'ظ', name: 'ظوئیں (Zoye)', isShift: true, category: 'shift' },
  { en: 'Shift + G', ur: 'غ', name: 'غین (Ghain)', isShift: true, category: 'shift' },
  { en: 'Shift + H', ur: 'ھ', name: 'دو چشمی ھ (Do Chashmi Hay)', isShift: true, category: 'shift' },
  { en: 'Shift + N', ur: 'ں', name: 'نون غنہ (Noon Ghunna)', isShift: true, category: 'shift' },
  { en: 'Shift + W', ur: 'ؤ', name: 'واؤ مع ہمزہ (Wao with hamza)', isShift: true, category: 'shift' },
  { en: 'Shift + U', ur: 'ئ', name: 'ہمزہ بر ی (Hamza on yay)', isShift: true, category: 'shift' },

  // Punctuation
  { en: '?', ur: '؟', name: 'سوالیہ نشان (Question Mark)', category: 'punctuation' },
  { en: ',', ur: '،', name: 'سکتہ / کوما (Urdu Comma)', category: 'punctuation' },
  { en: '.', ur: '۔', name: 'ختمہ / فل اسٹاپ (Urdu Period)', category: 'punctuation' },
  { en: ';', ur: '؛', name: 'وقفہ / سیمی کولن (Semicolon)', category: 'punctuation' },

  // Numbers
  { en: '0', ur: '۰', name: 'صفر (Zero)', category: 'number' },
  { en: '1', ur: '۱', name: 'ایک (One)', category: 'number' },
  { en: '2', ur: '۲', name: 'دو (Two)', category: 'number' },
  { en: '3', ur: '۳', name: 'تین (Three)', category: 'number' },
  { en: '4', ur: '۴', name: 'چار (Four)', category: 'number' },
  { en: '5', ur: '۵', name: 'پانچ (Five)', category: 'number' },
  { en: '6', ur: '۶', name: 'چھ (Six)', category: 'number' },
  { en: '7', ur: '۷', name: 'سات (Seven)', category: 'number' },
  { en: '8', ur: '۸', name: 'آٹھ (Eight)', category: 'number' },
  { en: '9', ur: '۹', name: 'نو (Nine)', category: 'number' },
];

export const UrduKeyboardGuideModal: React.FC<UrduKeyboardGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isUrdu } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'basic' | 'shift' | 'punctuation' | 'number'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = URDU_GUIDE_DATA.filter((item) => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.en.toLowerCase().includes(term) ||
      item.ur.includes(term) ||
      item.name.toLowerCase().includes(term);
    return matchesTab && matchesSearch;
  });

  const handleCopy = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopiedKey(char);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#161B27] border border-[#2A3447] p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#8892A4] hover:text-white hover:bg-[#1E2535] transition-colors"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#E8EBF0]">
              {isUrdu ? 'اردو فونیٹک کی بورڈ گائیڈ' : 'Urdu Phonetic Keyboard Chart'}
            </h2>
            <p className="text-xs text-[#8892A4]">
              {isUrdu
                ? 'انگلش کی بورڈ سے اردو ٹائپ کرنے کا مکمل چارٹ (NLA / CRULP اسٹینڈرڈ)'
                : 'Type Urdu naturally on any English QWERTY keyboard without installing language packs'}
            </p>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8892A4] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isUrdu ? 'حرف یا کی تلاش کریں...' : 'Search by English key or Urdu letter...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F14] border border-[#2A3447] text-sm text-[#E8EBF0] placeholder-[#8892A4] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { id: 'all', label: isUrdu ? 'تمام حروف' : 'All Keys' },
              { id: 'basic', label: isUrdu ? 'بنیادی حروف (a-z)' : 'Basic (a-z)' },
              { id: 'shift', label: isUrdu ? 'شفٹ والے حروف (Shift+)' : 'Shift Keys' },
              { id: 'punctuation', label: isUrdu ? 'رموز و اوقاف' : 'Punctuation' },
              { id: 'number', label: isUrdu ? 'اعداد (۰-۹)' : 'Numbers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                    : 'border-[#2A3447] bg-[#0D0F14] text-[#8892A4] hover:text-[#E8EBF0]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Key Card Grid */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#0D0F14] border border-[#2A3447] hover:border-cyan-500/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="font-urdu text-2xl font-bold text-white w-9 h-9 rounded-lg bg-[#1E2535] flex items-center justify-center border border-[#2A3447] group-hover:text-cyan-300">
                    {item.ur}
                  </span>
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 block">
                      {item.en}
                    </span>
                    <span className="text-[10px] text-[#8892A4] truncate block max-w-[90px]">
                      {item.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.ur)}
                  className="p-1.5 rounded-lg text-[#8892A4] hover:text-white hover:bg-[#1E2535] transition-colors"
                  title="Copy character"
                >
                  {copiedKey === item.ur ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-[#8892A4]">
              {isUrdu ? 'کوئی نتیجہ نہیں ملا' : 'No matching keys found.'}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-[#2A3447] flex items-center justify-between text-xs text-[#8892A4]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {isUrdu ? 'فونٹ: جمیل نوری نستعلیق و نوٹو نستعلیق' : 'Standard Pakistani National Language Authority (NLA) Standard'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            {isUrdu ? 'ٹھیک ہے' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
