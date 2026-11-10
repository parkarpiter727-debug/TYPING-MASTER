import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Printer,
  Download,
  Share2,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { getUserStats } from '../lib/testResultsService.ts';
import { Button } from '../components/ui/Button.tsx';

export const Certificate: React.FC = () => {
  const { user, profile } = useAuth();
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const certificateRef = useRef<HTMLDivElement>(null);

  // Read params if coming from a specific test
  const paramWpm = searchParams.get('wpm');
  const paramAcc = searchParams.get('accuracy');
  const paramLang = searchParams.get('lang');
  const paramName = searchParams.get('name');

  const defaultDisplayName =
    paramName ||
    profile?.display_name ||
    user?.user_metadata?.display_name ||
    'Pro Typist';

  const [candidateName, setCandidateName] = useState(defaultDisplayName);
  const [wpm, setWpm] = useState<number>(paramWpm ? Number(paramWpm) : 68);
  const [accuracy, setAccuracy] = useState<number>(paramAcc ? Number(paramAcc) : 98);
  const [language, setLanguage] = useState<string>(paramLang || 'english');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
  const [copied, setCopied] = useState(false);

  // Unique Certificate Serial Number
  const [certId] = useState(
    () => `ISP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  useEffect(() => {
    // If not provided in URL params, load user's best stats
    if (!paramWpm && user) {
      getUserStats(user.id).then((data) => {
        if (data.bestWpm > 0) {
          setWpm(data.bestWpm);
          setAccuracy(data.avgAccuracy);
          if (data.urduTests > data.englishTests) {
            setLanguage('urdu');
          }
        }
      });
    }
  }, [user, paramWpm]);

  // Determine Badge & Rank
  const getProficiencyRank = (speed: number) => {
    if (speed >= 90) return { rank: 'Grandmaster Speed Typist', color: 'from-amber-400 to-yellow-200' };
    if (speed >= 75) return { rank: 'Master Speed Typist', color: 'from-purple-400 to-pink-300' };
    if (speed >= 55) return { rank: 'Professional Typist', color: 'from-cyan-400 to-blue-200' };
    if (speed >= 40) return { rank: 'Intermediate Typist', color: 'from-emerald-400 to-teal-200' };
    return { rank: 'Certified Typist', color: 'from-gray-300 to-gray-100' };
  };

  const rankInfo = getProficiencyRank(wpm);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🏆 Official Typing Certificate by INSPIRE PRO!\nCandidate: ${candidateName}\nTyping Speed: ${wpm} WPM (${rankInfo.rank})\nAccuracy: ${accuracy}%\nCertificate ID: ${certId}\nVerify: ${window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top action header (hidden during printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#161B27] border border-[#2A3447]">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#1E2535] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#E8EBF0] flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              {isUrdu ? 'سرکاری ٹائپنگ سرٹیفکیٹ' : 'Official Speed Certificate'}
            </h1>
            <p className="text-xs text-[#8892A4]">
              {isUrdu
                ? 'اپنا نام درج کریں اور اپنا تصدیق شدہ سرٹیفکیٹ پرنٹ یا محفوظ کریں۔'
                : 'Verified Certificate of Achievement in Typing Proficiency by INSPIRE PRO'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
            {copied ? (isUrdu ? 'کاپی ہوگیا!' : 'Copied!') : isUrdu ? 'شیئر کریں' : 'Share'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            className="shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          >
            {isUrdu ? 'سرٹیفکیٹ پرنٹ کریں' : 'Print Certificate'}
          </Button>
        </div>
      </div>

      {/* Real-time Customizer bar (hidden during print) */}
      <div className="print:hidden p-4 rounded-xl bg-[#0D0F14] border border-[#2A3447] flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-[#8892A4] font-semibold">{isUrdu ? 'امیدوار کا نام:' : 'Candidate Name:'}</span>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#161B27] border border-[#2A3447] text-white focus:outline-none focus:border-cyan-400"
            placeholder="Enter name"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#8892A4] font-semibold">{isUrdu ? 'زبان:' : 'Language:'}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#161B27] border border-[#2A3447] text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="english">English (Latin QWERTY)</option>
            <option value="urdu">اردو (نستعلیق NLA)</option>
          </select>
        </div>
      </div>

      {/* THE OFFICIAL CERTIFICATE CANVAS (Styled for screen & print) */}
      <div
        ref={certificateRef}
        id="printable-certificate"
        className="w-full rounded-3xl bg-gradient-to-br from-[#0D111A] via-[#161B27] to-[#0A0D14] border-[6px] border-amber-500/40 p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center print:border-[4px] print:border-amber-600 print:bg-white print:text-black print:p-8 print:shadow-none"
      >
        {/* Ornate corner borders */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />

        {/* Background watermark badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <img src="/logo.png" alt="Inspire Watermark" className="w-96 h-96 object-contain" />
        </div>

        {/* Certificate Header Branding */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] mb-3 border border-amber-400/40">
            <img src="/logo.png" alt="Inspire Logo" className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent print:text-amber-700">
              INSPIRE PRO
            </span>
            <span className="text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 font-mono font-bold print:border-amber-700 print:text-amber-900">
              ACADEMY
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#8892A4] font-semibold print:text-gray-600">
            All Solution in One Platform • Official Typing Benchmark
          </span>
        </div>

        {/* Certificate Title */}
        <div className="mt-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-amber-300 tracking-wider print:text-amber-800">
            CERTIFICATE OF PROFICIENCY
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#8892A4] mt-1 print:text-gray-600">
            This is to officially certify that
          </p>
        </div>

        {/* Candidate Name in Calligraphic Style */}
        <div className="my-6 relative z-10">
          <div className="inline-block border-b-2 border-amber-400/60 pb-2 px-8">
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-wide font-serif print:text-black">
              {candidateName || 'Pro Typist'}
            </h3>
          </div>
        </div>

        {/* Certification Statement */}
        <p className="max-w-2xl mx-auto text-sm text-[#A0AEC0] leading-relaxed relative z-10 print:text-gray-700">
          has successfully passed the comprehensive speed and accuracy evaluation in{' '}
          <span className="font-bold text-white print:text-black">
            {language === 'urdu' ? 'Urdu (نستعلیق خط)' : 'English (Touch Typing)'}
          </span>
          , demonstrating exemplary keyboard dexterity, muscle memory, and professional proficiency.
        </p>

        {/* Score & Rank Highlights */}
        <div className="my-8 max-w-xl mx-auto grid grid-cols-3 gap-4 relative z-10">
          {/* Speed Card */}
          <div className="p-4 rounded-2xl bg-[#0D0F14]/90 border border-[#2A3447] shadow-lg print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase font-bold text-[#8892A4] tracking-wider block print:text-gray-600">
              Typing Speed
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1 font-mono-code">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 print:text-cyan-800">
                {wpm}
              </span>
              <span className="text-xs text-[#8892A4] font-semibold">WPM</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="p-4 rounded-2xl bg-[#0D0F14]/90 border border-[#2A3447] shadow-lg print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase font-bold text-[#8892A4] tracking-wider block print:text-gray-600">
              Accuracy
            </span>
            <div className="flex items-baseline justify-center gap-1 mt-1 font-mono-code">
              <span className="text-3xl sm:text-4xl font-extrabold text-purple-400 print:text-purple-800">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Rating Rank Card */}
          <div className="p-4 rounded-2xl bg-[#0D0F14]/90 border border-[#2A3447] shadow-lg print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] uppercase font-bold text-[#8892A4] tracking-wider block print:text-gray-600">
              Rank
            </span>
            <div className="mt-1">
              <span className="text-xs sm:text-sm font-bold text-amber-400 leading-tight block print:text-amber-800">
                {rankInfo.rank}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Date, Official Seal, Authorized Signature */}
        <div className="mt-10 pt-6 border-t border-[#2A3447] flex items-end justify-between px-2 sm:px-8 relative z-10 print:border-gray-300">
          {/* Issue Date & ID */}
          <div className="text-left font-mono-code">
            <span className="text-[10px] text-[#8892A4] uppercase block print:text-gray-600">
              Date Issued
            </span>
            <span className="text-xs text-[#E8EBF0] font-semibold print:text-black">
              {issueDate}
            </span>
            <span className="text-[9px] text-[#8892A4] block mt-1">
              ID: {certId}
            </span>
          </div>

          {/* Golden Seal */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400/80 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] text-black font-extrabold text-[10px] uppercase text-center p-1 leading-tight transform rotate-[-6deg]">
              ★ OFFICIAL ★
              <br />
              SEAL
            </div>
          </div>

          {/* Signature */}
          <div className="text-right">
            <div className="font-serif italic text-lg sm:text-xl text-amber-300 border-b border-[#2A3447] pb-1 px-4 print:text-black print:border-gray-400">
              Inspire Pro Director
            </div>
            <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block mt-1 print:text-gray-600">
              Authorized Signature
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
