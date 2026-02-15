import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SpendingChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#c41e3a', '#1a56db', '#22c55e', '#f59e0b', '#8b5cf6', '#64748b'];

export function SpendingChart({ data }: SpendingChartProps) {
  const filteredData = data.filter((d) => d.value > 0);

  if (filteredData.length === 0) {
    return <p className="text-xs text-text-muted text-center py-4">No spending data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={filteredData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
          {filteredData.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
