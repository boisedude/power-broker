export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function formatMoneyFull(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPollMargin(player: number, opponent: number): string {
  const margin = player - opponent;
  if (margin > 0) return `+${margin.toFixed(1)}`;
  if (margin < 0) return `${margin.toFixed(1)}`;
  return 'TIED';
}

export function formatChange(value: number, prefix = ''): string {
  if (value > 0) return `+${prefix}${value.toFixed(1)}`;
  if (value < 0) return `${prefix}${value.toFixed(1)}`;
  return `${prefix}0`;
}

export function formatTurnLabel(turn: number, maxTurns: number): string {
  return `Wk ${turn}/${maxTurns}`;
}

export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
