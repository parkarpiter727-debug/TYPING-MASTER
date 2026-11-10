import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Keyboard,
  Trophy,
  LayoutDashboard,
  Zap,
  BookOpen,
  Edit3,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.ts';
import { useLanguage } from '../../hooks/useLanguage.ts';
import { useThemeStore } from '../../store/themeStore.ts';
import { useTypingStore } from '../../store/typingStore.ts';
import { getInitials, getAvatarColor } from '../../lib/typingUtils.ts';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, setLanguage, isUrdu } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();
  const isActiveTyping = useTypingStore((s) => s.isActive);
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/lessons', label: isUrdu ? 'اسباق' : 'Lessons', icon: BookOpen },
    { to: '/test', label: isUrdu ? 'ٹائپنگ ٹیسٹ' : 'Typing Test', icon: Zap },
    { to: '/custom', label: isUrdu ? 'کسٹم' : 'Custom', icon: Edit3 },
    { to: '/leaderboard', label: isUrdu ? 'لیڈر بورڈ' : 'Leaderboard', icon: Trophy },
    { to: '/dashboard', label: isUrdu ? 'ڈیش بورڈ' : 'Dashboard', icon: LayoutDashboard },
  ];

  const displayName = profile?.display_name || user?.user_metadata?.display_name || 'Pro Typist';
  const avatarInitials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2A3447] bg-[#0D0F14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:scale-105 transition-transform">
            <Keyboard className="w-5 h-5 text-gray-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#00E5FF] via-cyan-200 to-[#A855F7] bg-clip-text text-transparent">
              TypeMaster<span className="text-[#00E5FF] text-xs uppercase px-1.5 py-0.5 ml-1 rounded bg-cyan-950/80 border border-cyan-800/60 font-mono">PRO</span>
            </span>
            <span className="text-[10px] text-[#8892A4] font-medium tracking-wider -mt-1 hidden sm:block">
              {isUrdu ? 'انگلش اور اردو ٹائپنگ ماسٹر' : 'Bilingual Typing System'}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#00E5FF] bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                    : 'text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E5FF]' : 'text-[#8892A4]'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls (Language Toggle, Theme Toggle, Profile Settings) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Pill [EN | اردو] */}
          <div
            className={`flex items-center p-0.5 rounded-full bg-[#161B27] border border-[#2A3447] text-xs font-semibold select-none ${
              isActiveTyping ? 'opacity-40 pointer-events-none cursor-not-allowed' : ''
            }`}
            title={isActiveTyping ? 'Language toggle is disabled during an active typing session' : 'Toggle English / Urdu'}
          >
            <button
              onClick={() => setLanguage('english')}
              disabled={isActiveTyping}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                language === 'english'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                  : 'text-[#8892A4] hover:text-[#E8EBF0]'
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('urdu')}
              disabled={isActiveTyping}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                language === 'urdu'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                  : 'text-[#8892A4] hover:text-[#E8EBF0]'
              }`}
              aria-label="Switch to Urdu"
            >
              اردو
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27] border border-[#2A3447] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* User Profile / Settings Direct Access */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-[#161B27] border border-[#2A3447] transition-all cursor-pointer"
              aria-expanded={profileDropdownOpen}
              aria-label="Open profile settings menu"
            >
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}
              >
                {avatarInitials}
              </div>
              <span className="text-xs font-medium text-[#E8EBF0] pr-1 hidden lg:inline-block max-w-[100px] truncate">
                {displayName}
              </span>
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#161B27] border border-[#2A3447] shadow-2xl py-1 z-40 animate-scaleUp">
                  <div className="px-4 py-2 border-b border-[#2A3447]">
                    <p className="text-xs font-bold text-[#E8EBF0] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#8892A4]">{isUrdu ? 'مقامی ٹائپسٹ' : 'Personal Typist Profile'}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#E8EBF0] hover:bg-[#1E2535] hover:text-cyan-400 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{isUrdu ? 'ڈیش بورڈ' : 'My Dashboard'}</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#E8EBF0] hover:bg-[#1E2535] hover:text-cyan-400 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{isUrdu ? 'پروفائل کی ترتیبات' : 'Profile Settings'}</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27] border border-[#2A3447] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A3447] bg-[#0D0F14] px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-[#00E5FF] bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27]'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#161B27]"
          >
            <UserIcon className="w-4 h-4 text-purple-400" />
            <span>{isUrdu ? 'پروفائل اور نام کی ترتیبات' : 'Profile & Name Settings'}</span>
          </Link>
        </div>
      )}
    </header>
  );
};
