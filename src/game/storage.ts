const BEST_KEY = 'dtf_best_time_v1';
const RULE_BREAK_KEY = 'dtf_rule_break_v1';

export function getRuleBreakUnlocked(): boolean {
  return localStorage.getItem(RULE_BREAK_KEY) === 'true';
}

export function saveRuleBreakUnlocked(): void {
  localStorage.setItem(RULE_BREAK_KEY, 'true');
}

export function getBestTime(): number | null {
  const raw = localStorage.getItem(BEST_KEY);
  if (raw === null) return null;
  const n = parseFloat(raw);
  return isNaN(n) ? null : n;
}

export function saveBestTime(time: number): void {
  const current = getBestTime();
  if (current === null || time < current) {
    localStorage.setItem(BEST_KEY, time.toFixed(3));
  }
}

export function getRank(time: number): string {
  if (time < 6) return 'S';
  if (time < 8) return 'A';
  if (time < 11) return 'B';
  return 'C';
}

export function getRankColor(rank: string): string {
  switch (rank) {
    case 'S': return '#FFD700';
    case 'A': return '#39FF88';
    case 'B': return '#5DA9FF';
    case 'C': return '#A8A3C7';
    default:  return '#F5F3FF';
  }
}
