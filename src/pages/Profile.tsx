import React, { useState, useEffect } from 'react';
import { User, Globe, Check, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { getUserStats } from '../lib/testResultsService.ts';
import { getInitials, getAvatarColor } from '../lib/typingUtils.ts';
import { Language } from '../types/index.ts';
import { Card } from '../components/ui/Card.tsx';
import { Button } from '../components/ui/Button.tsx';

export const Profile: React.FC = () => {
  const { user, profile, updateUserDisplayName, updatePreferredLanguage } = useAuth();
  const { isUrdu } = useLanguage();

  const [displayName, setDisplayName] = useState('');
  const [preferredLang, setPreferredLang] = useState<Language>('english');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [stats, setStats] = useState({ bestWpm: 0, avgAccuracy: 0, totalTests: 0 });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPreferredLang(profile.preferred_language || 'english');
    } else if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name);
    }

    if (user) {
      getUserStats(user.id).then((res) => {
        setStats({
          bestWpm: res.bestWpm,
          avgAccuracy: res.avgAccuracy,
          totalTests: res.totalTests,
        });
      });
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      await updateUserDisplayName(displayName.trim());
    }
    await updatePreferredLanguage(preferredLang);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const nameForAvatar = displayName || profile?.display_name || 'Pro Typist';
  const avatarInitials = getInitials(nameForAvatar);
  const avatarColor = getAvatarColor(nameForAvatar);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            {isUrdu ? 'ترجیحات اور نام' : 'Personalization & Settings'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#E8EBF0] mt-1">
          {isUrdu ? 'پروفائل اور ترتیبات' : 'Profile & Settings'}
        </h1>
        <p className="text-sm text-[#8892A4] mt-1">
          {isUrdu
            ? 'اپنا نام اور ترجیحی زبان تبدیل کریں، جو لیڈر بورڈ اور نتائج پر ظاہر ہوگی۔'
            : 'Customize your public display name and default practice language.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card & Avatar */}
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <div className="flex flex-col items-center">
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl mb-4 border-2 border-white/20`}
            >
              {avatarInitials}
            </div>
            <h3 className="text-lg font-bold text-[#E8EBF0]">{displayName || 'Pro Typist'}</h3>
            <p className="text-xs text-cyan-400 mt-0.5">{isUrdu ? 'مقامی ٹائپسٹ پروفائل' : 'Local Typist Profile'}</p>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Active in TypeMaster Pro</span>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="mt-6 pt-6 border-t border-[#2A3447]/60 w-full grid grid-cols-3 gap-2 font-mono text-center">
            <div>
              <span className="text-[10px] text-[#8892A4] uppercase block">Best</span>
              <span className="text-base font-bold text-cyan-400">{stats.bestWpm} WPM</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8892A4] uppercase block">Accuracy</span>
              <span className="text-base font-bold text-purple-400">{stats.avgAccuracy}%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8892A4] uppercase block">Tests</span>
              <span className="text-base font-bold text-emerald-400">{stats.totalTests}</span>
            </div>
          </div>
        </Card>

        {/* Profile Edit Form */}
        <Card className="md:col-span-2 p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-2">
                {isUrdu ? 'ڈسپلے نام (Display Name)' : 'Display Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8892A4]" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Vance or حمزہ"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0F14] border border-[#2A3447] text-sm text-[#E8EBF0] focus:outline-none focus:border-cyan-400"
                />
              </div>
              <p className="text-[11px] text-[#6B7280] mt-1.5">
                {isUrdu
                  ? 'یہ نام لیڈر بورڈ اور آپ کے تمام ٹیسٹ کارڈز پر نمایاں ہوگا۔'
                  : 'This name appears on the global leaderboard, dashboard, and completion cards.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8892A4] mb-2">
                {isUrdu ? 'ترجیحی زبان' : 'Preferred Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreferredLang('english')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                    preferredLang === 'english'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                      : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>English (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredLang('urdu')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                    preferredLang === 'urdu'
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
                      : 'border-[#2A3447] bg-[#1E2535] text-[#8892A4]'
                  }`}
                >
                  <span className="font-urdu text-sm">اردو</span>
                  <span>Urdu (نستعلیق)</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A3447] flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" />
                  {isUrdu ? 'نام اور ترتیبات محفوظ ہو گئیں!' : 'Profile updated successfully!'}
                </span>
              ) : (
                <div />
              )}
              <Button type="submit" variant="primary">
                {isUrdu ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
