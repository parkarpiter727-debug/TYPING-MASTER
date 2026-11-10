/**
 * Typing utility calculations according to PRD & TRD specifications.
 */

export function calculateWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || correctChars <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const wpm = (correctChars / 5) / minutes;
  return Math.round(wpm * 10) / 10;
}

export function calculateAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped <= 0) return 100;
  const acc = (correctChars / totalTyped) * 100;
  return Math.min(100, Math.max(0, Math.round(acc * 10) / 10));
}

export function getStarRating(wpm: number, accuracy: number, targetWpm: number = 25): 1 | 2 | 3 {
  if (accuracy >= 95 && wpm >= targetWpm) {
    return 3;
  }
  if (accuracy >= 88 && wpm >= targetWpm * 0.7) {
    return 2;
  }
  return 1;
}

export function formatTime(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const remainingSecs = safeSec % 60;
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
}

export function getInitials(name: string): string {
  if (!name) return 'TP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-orange-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
