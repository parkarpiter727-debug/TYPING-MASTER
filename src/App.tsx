import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { Home } from './pages/Home.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { Lessons } from './pages/Lessons.tsx';
import { LessonDetail } from './pages/LessonDetail.tsx';
import { TypingTest } from './pages/TypingTest.tsx';
import { CustomLesson } from './pages/CustomLesson.tsx';
import { Leaderboard } from './pages/Leaderboard.tsx';
import { Profile } from './pages/Profile.tsx';
import { useAuthStore } from './store/authStore.ts';

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0D0F14] text-[#E8EBF0] font-sans antialiased">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
            <Route path="/test" element={<TypingTest />} />
            <Route path="/custom" element={<CustomLesson />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
