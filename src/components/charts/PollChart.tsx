import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PollSnapshot } from '@/types/game.ts';

interface PollChartProps {
  history: PollSnapshot[];
}

export function PollChart({ history }: PollChartProps) {
  const data = history.map((h) => ({
    turn: `Wk ${h.turn}`,
    Gonzalez: Number(h.player_support.toFixed(1)),
    Lee: Number(h.opponent_support.toFixed(1)),
    Undecided: Number(h.undecided.toFixed(1)),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="turn" tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <YAxis domain={[30, 60]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Line type="monotone" dataKey="Gonzalez" stroke="#c41e3a" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Lee" stroke="#1a56db" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Undecided" stroke="#64748b" strokeWidth={1} dot={false} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
