import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Keyboard,
  Zap,
  Trophy,
  Globe,
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { useLanguage } from '../hooks/useLanguage.ts';
import { useAuth } from '../hooks/useAuth.ts';

export const Home: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Animated Typing Demo text
  const demoEnglish = 'Master bilingual touch typing in English and Urdu with precision and speed.';
  const demoUrdu = 'اردو اور انگلش میں تیز رفتار اور بے داغ ٹائپنگ کی مہارت حاصل کریں۔';
  const targetDemo = isUrdu ? demoUrdu : demoEnglish;

  const [demoTyped, setDemoTyped] = useState('');
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    setDemoTyped('');
    setDemoIndex(0);
  }, [isUrdu]);

  useEffect(() => {
    if (demoIndex < targetDemo.length) {
      const timeout = setTimeout(() => {
        setDemoTyped((prev) => prev + targetDemo[demoIndex]);
        setDemoIndex((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDemoTyped('');
        setDemoIndex(0);
      }, 3500);
      return () => clearTimeout(resetTimeout);
    }
  }, [demoIndex, targetDemo]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161B27] border border-cyan-500/30 text-xs text-cyan-300 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">
              {isUrdu ? 'اردو اور انگلش کا پہلا مکمل ٹائپنگ پلیٹ فارم' : 'Bilingual Typing Master — English & Urdu'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#E8EBF0] max-w-4xl mx-auto leading-tight">
            {isUrdu ? (
              <span className="font-urdu block leading-[1.8]">
                اردو اور انگلش میں{' '}
                <span className="bg-gradient-to-r from-[#00E5FF] via-cyan-200 to-[#A855F7] bg-clip-text text-transparent">
                  ٹائپنگ کے ماسٹر
                </span>{' '}
                بنیں
              </span>
            ) : (
              <span>
                Master Typing in{' '}
                <span className="bg-gradient-to-r from-[#00E5FF] via-cyan-200 to-[#A855F7] bg-clip-text text-transparent">
                  English & اردو
                </span>
              </span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-[#8892A4] max-w-2xl mx-auto leading-relaxed">
            {isUrdu
              ? 'اپنی رفتار جانچیں، روزانہ مشق سے ریکارڈ توڑیں اور عالمی لیڈر بورڈ پر اپنا نام روشن کریں۔'
              : 'Track your speed. Beat your records. Build muscle memory and dominate the global leaderboard.'}
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate(isLoggedIn ? '/test' : '/test')}
              icon={<Play className="w-5 h-5 fill-current" />}
            >
              {isUrdu ? 'مفت ٹائپنگ ٹیسٹ شروع کریں' : 'Start Typing Free'}
            </Button>

            <Link to="/leaderboard">
              <Button size="lg" variant="secondary" icon={<Trophy className="w-5 h-5 text-amber-400" />}>
                {isUrdu ? 'لیڈر بورڈ دیکھیں' : 'View Leaderboard'}
              </Button>
            </Link>
          </div>

          {/* Interactive Typing Simulator Mockup */}
          <div className="mt-14 max-w-3xl mx-auto">
            <div className="rounded-2xl bg-[#161B27] border border-[#2A3447] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A3447]/60 text-xs text-[#8892A4]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-[#6B7280]">
                    typemaster-preview.sh
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-cyan-400">WPM: 85</span>
                  <span className="text-purple-400">ACC: 99%</span>
                </div>
              </div>

              <div
                className={`min-h-[90px] text-xl sm:text-2xl font-mono-code leading-relaxed ${
                  isUrdu ? 'font-urdu text-right text-2xl sm:text-3xl leading-[2.4]' : ''
                }`}
                dir={isUrdu ? 'rtl' : 'ltr'}
              >
                <span className="text-cyan-300 font-semibold">{demoTyped}</span>
                <span className="inline-block w-2.5 h-6 bg-cyan-400 ml-1 animate-pulse align-middle" />
                <span className="text-[#4B5563]">
                  {targetDemo.slice(demoIndex)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Bar */}
      <section className="border-y border-[#2A3447] bg-[#090B0F]/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono-code">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00E5FF]">25,000+</span>
              <p className="text-xs text-[#8892A4] mt-1 font-sans">
                {isUrdu ? 'فعال ٹائپسٹس' : 'Active Typists'}
              </p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#A855F7]">180,000+</span>
              <p className="text-xs text-[#8892A4] mt-1 font-sans">
                {isUrdu ? 'مکمل شدہ ٹیسٹ' : 'Tests Completed'}
              </p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">60</span>
              <p className="text-xs text-[#8892A4] mt-1 font-sans">
                {isUrdu ? 'مربوط اسباق' : 'Structured Lessons'}
              </p>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-400">68 WPM</span>
              <p className="text-xs text-[#8892A4] mt-1 font-sans">
                {isUrdu ? 'اوسط تیز رفتار' : 'Average Platform Speed'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            {isUrdu ? 'طاقتور خصوصیات' : 'Why TypeMaster Pro?'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-2">
            {isUrdu ? 'تیز رفتار اور درست ٹائپنگ کا مکمل نظام' : 'Engineered for Serious Typists'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glow="cyan" hover className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#E8EBF0]">
                {isUrdu ? 'مکمل دو لسانی معاونت (Bilingual)' : 'Native Bilingual Engine'}
              </h3>
              <p className="mt-3 text-sm text-[#8892A4] leading-relaxed">
                {isUrdu
                  ? 'انگلش کیوورٹی (QWERTY) اور اردو صوتی (Phonetic) کی بورڈ کی ہم آہنگی۔ نستعلیق رسم الخط کے ساتھ مکمل آر ٹی ایل (RTL) سپورٹ۔'
                  : 'Toggle seamlessly between English and Urdu. Rendered with Google Noto Nastaliq Urdu with complete RTL flow.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2A3447]/60 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUrdu ? 'نستعلیق فونٹ شامل ہے' : 'Noto Nastaliq Preloaded'}</span>
            </div>
          </Card>

          <Card glow="purple" hover className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#E8EBF0]">
                {isUrdu ? 'ریئل ٹائم تجزیات اور اسپیڈ' : 'Millisecond Real-Time Metrics'}
              </h3>
              <p className="mt-3 text-sm text-[#8892A4] leading-relaxed">
                {isUrdu
                  ? 'ہر ایک کی اسٹروک پر ڈبلیو پی ایم، ایکوریسی، اور غلطیوں کا لائیو حساب۔ بیک اسپیس کی مکمل سہولت کے ساتھ۔'
                  : 'Live WPM calculations, precision accuracy meters, keystroke latency, and instant visual error tracking.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2A3447]/60 flex items-center gap-2 text-xs text-purple-400 font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>{isUrdu ? 'درست ڈبلیو پی ایم فارمولا' : 'Accurate WPM Standard'}</span>
            </div>
          </Card>

          <Card hover className="flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#E8EBF0]">
                {isUrdu ? 'عالمی لیڈر بورڈ اور رینک' : 'Global Leaderboard & Streaks'}
              </h3>
              <p className="mt-3 text-sm text-[#8892A4] leading-relaxed">
                {isUrdu
                  ? 'انگریزی اور اردو کے الگ الگ لیڈر بورڈز، ٹاپ ۳ پوڈیم، اور مسلسل مشق کا ڈیلی اسٹریک ٹریکر۔'
                  : 'Separate English and Urdu leaderboards with All-Time and Weekly divisions. Daily streak tracking keeps you consistent.'}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2A3447]/60 flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <Trophy className="w-4 h-4" />
              <span>{isUrdu ? 'پوڈیم اور ٹاپ ۱۰۰' : 'Podium & Top 100 Typists'}</span>
            </div>
          </Card>
        </div>
      </section>

      {/* 3 Level Preview Section */}
      <section className="py-16 bg-[#0B0D12] border-t border-[#2A3447]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                {isUrdu ? '۳ درجاتی نصاب' : '3-Tier Learning Roadmap'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E8EBF0] mt-2">
                {isUrdu ? 'مبتدی سے لے کر گرینڈ ماسٹر تک' : 'From Home Row to Grandmaster'}
              </h2>
            </div>
            <Link to="/lessons" className="mt-4 md:mt-0">
              <Button variant="secondary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                {isUrdu ? 'تمام اسباق دیکھیں' : 'Explore All 60 Lessons'}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-emerald-500">
              <Badge level="beginner" />
              <h4 className="text-lg font-bold text-[#E8EBF0] mt-3">
                {isUrdu ? 'مبتدی (Beginner)' : 'Beginner Drills'}
              </h4>
              <p className="text-xs text-[#8892A4] mt-2 leading-relaxed">
                {isUrdu
                  ? 'ہوم رو (Home Row) کلیدیں، انفرادی انگلیوں کی مشق، اور ۳ تا ۵ حرفی سادہ الفاظ۔'
                  : 'Home row keys (ASDF JKL;), single finger drills, and short 3-5 letter words.'}
              </p>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <Badge level="intermediate" />
              <h4 className="text-lg font-bold text-[#E8EBF0] mt-3">
                {isUrdu ? 'متوسط (Intermediate)' : 'Intermediate Fluency'}
              </h4>
              <p className="text-xs text-[#8892A4] mt-2 leading-relaxed">
                {isUrdu
                  ? 'مکمل کی بورڈ کا استعمال، ۵۰۰ کثیر الاستعمال الفاظ، اور مکمل با معنی جملے۔'
                  : 'Full keyboard reach, top 500 common words, punctuation, and full sentence cadence.'}
              </p>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <Badge level="advanced" />
              <h4 className="text-lg font-bold text-[#E8EBF0] mt-3">
                {isUrdu ? 'اعلیٰ (Advanced)' : 'Advanced Endurance'}
              </h4>
              <p className="text-xs text-[#8892A4] mt-2 leading-relaxed">
                {isUrdu
                  ? 'طویل نثری اقتباسات، ادبی و صحافتی مواد، اور دباؤ میں رفتار کی پختگی۔'
                  : 'Lengthy literary passages, code syntax, technical articles, and high-pressure speed sprints.'}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#161B27] to-purple-950/40 border border-[#2A3447] shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0]">
              {isUrdu ? 'آج ہی اپنی ٹائپنگ رفتار بڑھائیں' : 'Ready to Elevate Your Typing?'}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#8892A4] max-w-xl mx-auto leading-relaxed">
              {isUrdu
                ? 'پلیٹ فارم مکمل طور پر مفت ہے اور کسی بھی انسٹالیشن کے بغیر فورا براؤزر میں چلتا ہے۔'
                : 'Join thousands of bilingual students, software engineers, and writers mastering typing speed daily.'}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/test">
                <Button size="lg" variant="primary">
                  {isUrdu ? 'ٹائپنگ ٹیسٹ شروع کریں' : 'Start Typing Test'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
