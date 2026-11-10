import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { LESSONS } from '../lib/lessonData.ts';
import { getUserCompletions } from '../lib/lessonService.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import { LessonLevel, LessonCompletion } from '../types/index.ts';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';

export const Lessons: React.FC = () => {
  const { user } = useAuth();
  const { language, isUrdu } = useLanguage();

  const [activeLevel, setActiveLevel] = useState<LessonLevel>('beginner');
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);

  useEffect(() => {
    async function loadCompletions() {
      if (user) {
        const data = await getUserCompletions(user.id);
        setCompletions(data);
      }
    }
    loadCompletions();
  }, [user]);

  // Filter lessons by selected language and active level
  const filteredLessons = LESSONS.filter(
    (l) => l.language === language && l.level === activeLevel
  );

  const getCompletionForLesson = (lessonId: string) => {
    return completions.find((c) => c.lesson_id === lessonId);
  };

  const levelTabs: { id: LessonLevel; label: string; icon: string }[] = [
    { id: 'beginner', label: isUrdu ? 'مبتدی (Beginner)' : 'Beginner', icon: '🌱' },
    { id: 'intermediate', label: isUrdu ? 'متوسط (Intermediate)' : 'Intermediate', icon: '⚡' },
    { id: 'advanced', label: isUrdu ? 'اعلیٰ (Advanced)' : 'Advanced', icon: '🔥' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              {isUrdu ? 'نصابی تربیت' : 'Structured Curriculum'}
            </span>
            <Badge variant={isUrdu ? 'purple' : 'cyan'}>
              {isUrdu ? 'اردو اسباق' : 'English Lessons'}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E8EBF0] mt-1">
            {isUrdu ? 'ٹائپنگ ماسٹری کے اسباق' : 'Interactive Typing Lessons'}
          </h1>
          <p className="text-sm text-[#8892A4] mt-1.5">
            {isUrdu
              ? 'ہوم رو کلیدوں سے لے کر اعلیٰ صحافتی اور ادبی نثری اقتباسات تک مرحلہ وار رہنمائی۔'
              : 'Progressive finger placement drills, vocabulary cadence, and sustained endurance.'}
          </p>
        </div>

        {/* Completion Progress pill */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#161B27] border border-[#2A3447] text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[#8892A4]">
            {isUrdu ? 'مکمل شدہ:' : 'Finished:'}{' '}
            <strong className="text-[#E8EBF0] font-bold">
              {completions.filter((c) => c.language === language).length}
            </strong>{' '}
            / 30
          </span>
        </div>
      </div>

      {/* 3 Level Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#161B27] border border-[#2A3447] max-w-lg">
        {levelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLevel(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeLevel === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#1E2535]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, idx) => {
          const comp = getCompletionForLesson(lesson.id);
          const isDone = Boolean(comp);

          return (
            <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="group block">
              <Card
                hover
                className={`h-full flex flex-col justify-between transition-all ${
                  isDone
                    ? 'border-emerald-500/40 bg-[#161B27]/90'
                    : 'border-[#2A3447] group-hover:border-cyan-400/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-[#8892A4] font-semibold">
                      Lesson {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <Badge level={lesson.level} />
                  </div>

                  <h3 className={`text-base font-bold text-[#E8EBF0] group-hover:text-cyan-400 transition-colors ${
                    isUrdu ? 'font-urdu text-lg leading-[2.2]' : ''
                  }`}>
                    {lesson.title}
                  </h3>

                  <p className={`mt-2 text-xs text-[#8892A4] leading-relaxed line-clamp-2 ${
                    isUrdu ? 'font-urdu text-sm' : ''
                  }`}>
                    {lesson.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A3447]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[#8892A4]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lesson.estimatedMinutes} min</span>
                  </div>

                  {isDone ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= (comp?.stars || 1)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        {comp?.wpm} WPM
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>{isUrdu ? 'شروع کریں' : 'Start'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
