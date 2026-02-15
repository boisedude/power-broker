import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { FundraisingSnapshot } from '@/types/game.ts';

interface FundingChartProps {
  history: FundraisingSnapshot[];
}

export function FundingChart({ history }: FundingChartProps) {
  const data = history.map((h) => ({
    turn: `Wk ${h.turn}`,
    Raised: Math.round(h.raised),
    Spent: Math.round(h.spent),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="turn" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
        <Bar dataKey="Raised" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
