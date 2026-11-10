import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { TestResult } from '../../types/index.ts';
import { Card } from '../ui/Card.tsx';

interface WpmProgressChartProps {
  history: TestResult[];
  isUrdu?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: {
      testNumber: string;
      label: string;
      wpm: number;
      accuracy: number;
      errors: number;
      duration: number;
      language: string;
      date: string;
      time: string;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isUrduSession = data.language === 'urdu';

  return (
    <div className="bg-[#161B27]/95 border border-[#2A3447] backdrop-blur-md rounded-xl p-3.5 shadow-2xl text-xs space-y-2 min-w-[190px]">
      <div className="flex items-center justify-between border-b border-[#2A3447]/80 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-[#E8EBF0]">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{data.testNumber}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isUrduSession
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
          }`}
        >
          {isUrduSession ? 'اردو' : 'English'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 py-0.5">
        <div className="space-y-0.5">
          <span className="text-[10px] text-[#8892A4]">Speed</span>
          <div className="text-base font-extrabold text-cyan-400 font-mono">
            {data.wpm} <span className="text-[10px] text-cyan-300 font-normal">WPM</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-[#8892A4]">Accuracy</span>
          <div className="text-base font-extrabold text-purple-400 font-mono">
            {data.accuracy}%
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#2A3447]/80 flex items-center justify-between text-[10px] text-[#8892A4]">
        <span>Errors: <strong className="text-red-400 font-mono">{data.errors}</strong></span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#64748B]" />
          <span>{data.date} {data.time}</span>
        </span>
      </div>
    </div>
  );
};

export const WpmProgressChart: React.FC<WpmProgressChartProps> = ({
  history,
  isUrdu = false,
}) => {
  const [langFilter, setLangFilter] = useState<'all' | 'english' | 'urdu'>('all');
  const [showAccuracy, setShowAccuracy] = useState<boolean>(true);
  const [showAvgLine, setShowAvgLine] = useState<boolean>(true);

  // Filter history by language if requested
  const filteredHistory = useMemo(() => {
    if (langFilter === 'all') return history;
    return history.filter((item) => item.language === langFilter);
  }, [history, langFilter]);

  // Extract the most recent 10 tests, then arrange chronologically (oldest -> newest)
  const last10Tests = useMemo(() => {
    const sortedDesc = [...filteredHistory].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedDesc.slice(0, 10).reverse();
  }, [filteredHistory]);

  // Prepare chart series
  const chartData = useMemo(() => {
    return last10Tests.map((item, idx) => {
      const dateObj = new Date(item.created_at);
      return {
        testIndex: idx + 1,
        testNumber: `Test #${idx + 1}`,
        label: `T${idx + 1}`,
        wpm: Number(item.wpm),
        accuracy: Number(item.accuracy),
        errors: Number(item.errors),
        duration: Number(item.duration_seconds),
        language: item.language,
        date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
  }, [last10Tests]);

  // Analytics for the last 10 tests
  const stats = useMemo(() => {
    if (!last10Tests.length) {
      return { avgWpm: 0, peakWpm: 0, minWpm: 0, avgAcc: 0, deltaWpm: 0, count: 0 };
    }
    const wpms = last10Tests.map((t) => Number(t.wpm));
    const accs = last10Tests.map((t) => Number(t.accuracy));
    const avgWpm = Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length);
    const avgAcc = Math.round((accs.reduce((a, b) => a + b, 0) / accs.length) * 10) / 10;
    const peakWpm = Math.max(...wpms);
    const minWpm = Math.min(...wpms);
    const deltaWpm = wpms[wpms.length - 1] - wpms[0];
    return { avgWpm, peakWpm, minWpm, avgAcc, deltaWpm, count: last10Tests.length };
  }, [last10Tests]);

  // Demo trajectory if no tests exist yet
  const demoData = [
    { label: 'T1', testNumber: 'Test #1', wpm: 28, accuracy: 92, errors: 4, duration: 60, language: 'english', date: 'Start', time: '' },
    { label: 'T2', testNumber: 'Test #2', wpm: 32, accuracy: 94, errors: 3, duration: 60, language: 'english', date: '', time: '' },
    { label: 'T3', testNumber: 'Test #3', wpm: 35, accuracy: 95, errors: 2, duration: 60, language: 'urdu', date: '', time: '' },
    { label: 'T4', testNumber: 'Test #4', wpm: 41, accuracy: 96, errors: 2, duration: 60, language: 'english', date: '', time: '' },
    { label: 'T5', testNumber: 'Test #5', wpm: 45, accuracy: 95, errors: 3, duration: 60, language: 'english', date: '', time: '' },
    { label: 'T6', testNumber: 'Test #6', wpm: 50, accuracy: 97, errors: 1, duration: 60, language: 'urdu', date: '', time: '' },
    { label: 'T7', testNumber: 'Test #7', wpm: 54, accuracy: 96, errors: 2, duration: 60, language: 'english', date: '', time: '' },
    { label: 'T8', testNumber: 'Test #8', wpm: 60, accuracy: 98, errors: 1, duration: 60, language: 'english', date: '', time: '' },
    { label: 'T9', testNumber: 'Test #9', wpm: 66, accuracy: 98, errors: 1, duration: 60, language: 'urdu', date: '', time: '' },
    { label: 'T10', testNumber: 'Test #10', wpm: 72, accuracy: 99, errors: 0, duration: 60, language: 'english', date: 'Goal', time: '' },
  ];

  const activeData = chartData.length > 0 ? chartData : demoData;
  const isDemo = chartData.length === 0;

  return (
    <Card className="p-6 flex flex-col justify-between space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2A3447]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#E8EBF0]">
              {isUrdu
                ? 'آخری ۱۰ ٹیسٹس کی رفتار کا گراف (WPM Progress)'
                : "WPM Progress (Last 10 Tests)"}
            </h3>
            {isDemo ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono">
                {isUrdu ? 'ڈیمو پیش نظارہ' : 'Preview Target'}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                {stats.count}/10 {isUrdu ? 'ٹیسٹس' : 'Tests'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#8892A4] mt-1">
            {isDemo
              ? isUrdu
                ? 'اپنا پہلا ٹیسٹ مکمل کریں تاکہ آپ کے اصل نتائج اس چارٹ پر لائیو نمودار ہوں۔'
                : 'Take speed tests to plot your real typing trajectory over your last 10 attempts.'
              : isUrdu
              ? 'آپ کے آخری ۱۰ ٹیسٹس کی رفتار، اتار چڑھاؤ اور مسلسل بہتری کا گراف۔'
              : 'Chronological speed development, consistency, and accuracy over your 10 most recent sessions.'}
          </p>
        </div>

        {/* Filter and Option Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Language selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#161B27] border border-[#2A3447]">
            <button
              onClick={() => setLangFilter('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                langFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-[#8892A4] hover:text-[#E8EBF0]'
              }`}
            >
              {isUrdu ? 'سب' : 'All'}
            </button>
            <button
              onClick={() => setLangFilter('english')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                langFilter === 'english'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-[#8892A4] hover:text-[#E8EBF0]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLangFilter('urdu')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                langFilter === 'urdu'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-[#8892A4] hover:text-[#E8EBF0]'
              }`}
            >
              اردو
            </button>
          </div>

          {/* Toggle Accuracy line */}
          <button
            onClick={() => setShowAccuracy(!showAccuracy)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              showAccuracy
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                : 'bg-[#161B27] border-[#2A3447] text-[#8892A4]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showAccuracy ? 'bg-purple-400' : 'bg-[#64748B]'
              }`}
            />
            <span>{isUrdu ? 'درستگی' : 'Accuracy %'}</span>
          </button>

          {/* Toggle Avg Line */}
          <button
            onClick={() => setShowAvgLine(!showAvgLine)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              showAvgLine
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-[#161B27] border-[#2A3447] text-[#8892A4]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                showAvgLine ? 'bg-cyan-400' : 'bg-[#64748B]'
              }`}
            />
            <span>{isUrdu ? 'اوسط' : 'Avg Line'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0D0F14]/70 p-3.5 rounded-2xl border border-[#2A3447]/60">
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block font-medium">
            {isUrdu ? '۱۰ ٹیسٹس کی اوسط' : 'Last 10 Avg WPM'}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
            {isDemo ? '49' : stats.avgWpm}{' '}
            <span className="text-xs font-normal text-[#8892A4]">WPM</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block font-medium">
            {isUrdu ? 'بہترین اسپیڈ (Peak)' : 'Last 10 Peak WPM'}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#E8EBF0] font-mono">
            {isDemo ? '72' : stats.peakWpm}{' '}
            <span className="text-xs font-normal text-emerald-400">Peak</span>
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block font-medium">
            {isUrdu ? 'اوسط درستگی' : 'Last 10 Avg Accuracy'}
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono">
            {isDemo ? '96.2' : stats.avgAcc}%
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block font-medium">
            {isUrdu ? '۱۰ ٹیسٹس کا فرق' : 'Net Trend'}
          </span>
          <div className="flex items-center gap-1 font-mono">
            {stats.deltaWpm > 0 ? (
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-5 h-5 inline" />+{isDemo ? 44 : stats.deltaWpm}
              </span>
            ) : stats.deltaWpm < 0 ? (
              <span className="text-xl sm:text-2xl font-extrabold text-red-400 flex items-center">
                <ArrowDownRight className="w-5 h-5 inline" />{stats.deltaWpm}
              </span>
            ) : (
              <span className="text-xl sm:text-2xl font-extrabold text-[#8892A4] flex items-center">
                <Minus className="w-5 h-5 inline" />0
              </span>
            )}
            <span className="text-[10px] text-[#8892A4]">WPM</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart */}
      <div className="h-72 sm:h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activeData}
            margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
          >
            <defs>
              <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2A3447" opacity={0.4} vertical={false} />

            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2A3447' }}
            />

            {/* Left Y Axis: WPM */}
            <YAxis
              yAxisId="wpm"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#2A3447' }}
              domain={['dataMin - 5', 'dataMax + 10']}
              tickFormatter={(v) => `${v}`}
            />

            {/* Right Y Axis: Accuracy (only if showAccuracy is on) */}
            <YAxis
              yAxisId="acc"
              orientation="right"
              stroke="#A855F7"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[60, 100]}
              tickFormatter={(v) => `${v}%`}
              hide={!showAccuracy}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Average WPM Reference Line */}
            {showAvgLine && stats.avgWpm > 0 && !isDemo && (
              <ReferenceLine
                yAxisId="wpm"
                y={stats.avgWpm}
                stroke="#00E5FF"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                label={{
                  value: `Avg: ${stats.avgWpm} WPM`,
                  fill: '#00E5FF',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}

            {/* WPM Area Fill */}
            <Area
              yAxisId="wpm"
              type="monotone"
              dataKey="wpm"
              fill="url(#wpmGradient)"
              stroke="none"
            />

            {/* Primary Line: WPM */}
            <Line
              yAxisId="wpm"
              type="monotone"
              dataKey="wpm"
              name="Speed (WPM)"
              stroke="#00E5FF"
              strokeWidth={3}
              dot={{
                fill: '#0D0F14',
                stroke: '#00E5FF',
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 7,
                fill: '#00E5FF',
                stroke: '#FFFFFF',
                strokeWidth: 2,
              }}
            />

            {/* Secondary Line: Accuracy % */}
            {showAccuracy && (
              <Line
                yAxisId="acc"
                type="monotone"
                dataKey="accuracy"
                name="Accuracy (%)"
                stroke="#A855F7"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{
                  fill: '#0D0F14',
                  stroke: '#A855F7',
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 6,
                  fill: '#A855F7',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend and Helper text */}
      <div className="pt-3 border-t border-[#2A3447] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#8892A4] gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-cyan-300">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            WPM (Words Per Minute)
          </span>
          {showAccuracy && (
            <span className="flex items-center gap-1.5 font-medium text-purple-300">
              <span className="w-3 h-0.5 bg-purple-400 rounded-full border-dashed" />
              Accuracy (%)
            </span>
          )}
        </div>

        <span className="text-[11px] font-mono text-[#64748B]">
          {isUrdu
            ? 'ہر پوائنٹ ایک مکمل ٹائپنگ ٹیسٹ کی عکاسی کرتا ہے'
            : 'Each point represents 1 completed speed test session'}
        </span>
      </div>
    </Card>
  );
};
