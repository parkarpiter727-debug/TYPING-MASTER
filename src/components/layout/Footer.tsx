import React from 'react';
import { Link } from 'react-router-dom';
import { Keyboard, Shield, Zap, Globe, Heart } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage.ts';

export const Footer: React.FC = () => {
  const { isUrdu } = useLanguage();

  return (
    <footer className="w-full border-t border-[#2A3447] bg-[#090B0F] text-[#8892A4] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0 border border-cyan-400/30">
                <img src="/logo.png" alt="Inspire Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#E8EBF0] leading-none">INSPIRE</span>
                <span className="text-[10px] text-[#8892A4]">All Solution in One Platform</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#8892A4]">
              {isUrdu
                ? 'انگریزی اور اردو زبانوں میں ٹائپنگ کی رفتار اور درستگی بڑھانے کے لیے جدید پلیٹ فارم۔'
                : 'Advanced bilingual typing platform for serious typists in English and Urdu.'}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EBF0] mb-3">
              {isUrdu ? 'پروڈکٹ' : 'Platform'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/lessons" className="hover:text-cyan-400 transition-colors">
                  {isUrdu ? 'ٹائپنگ اسباق' : 'Interactive Lessons'}
                </Link>
              </li>
              <li>
                <Link to="/test" className="hover:text-cyan-400 transition-colors">
                  {isUrdu ? 'اسپیڈ ٹیسٹ' : 'Speed Tests (1/2/5 min)'}
                </Link>
              </li>
              <li>
                <Link to="/custom" className="hover:text-cyan-400 transition-colors">
                  {isUrdu ? 'کسٹم پیراگراف' : 'Custom Text Practice'}
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">
                  {isUrdu ? 'گلوبل لیڈر بورڈ' : 'Global Leaderboard'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EBF0] mb-3">
              {isUrdu ? 'خصوصیات' : 'Features'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isUrdu ? 'نستعلیق فونٹ سپورٹ' : 'Nastaliq Font & RTL'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>{isUrdu ? 'لائیو ڈبلیو پی ایم میٹرکس' : 'Real-time WPM Engine'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isUrdu ? 'ڈیٹا محفوظ اور پرائیویٹ' : 'Progress & Streak Tracking'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E8EBF0] mb-3">
              {isUrdu ? 'معلومات' : 'About'}
            </h4>
            <p className="text-xs leading-relaxed">
              {isUrdu
                ? 'ٹائپسٹس کے ذریعے ٹائپسٹس کے لیے ڈیزائن کیا گیا ہے۔'
                : 'Engineered for accuracy, muscle memory, and competitive typing mastery.'}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400">
              <span>{isUrdu ? 'بنایا گیا برائے' : 'Built with passion'}</span>
              <Heart className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 inline" />
            </div>
          </div>
        </div>

        <div className="border-t border-[#2A3447]/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} TypeMaster Pro. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            English (Inter / JetBrains Mono) • Urdu (Noto Nastaliq)
          </p>
        </div>
      </div>
    </footer>
  );
};
