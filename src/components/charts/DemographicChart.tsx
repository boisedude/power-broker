import type { DemographicData } from '@/types/game.ts';

interface DemographicChartProps {
  demographics: DemographicData[];
}

export function DemographicChart({ demographics }: DemographicChartProps) {
  return (
    <div className="space-y-3">
      {demographics.map((d) => {
        const lead = d.current_support - d.opponent_support;
        return (
          <div key={d.id}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-primary font-medium">{d.name}</span>
              <span className={lead > 0 ? 'text-success' : lead < 0 ? 'text-danger' : 'text-text-muted'}>
                {lead > 0 ? '+' : ''}{lead.toFixed(1)}%
              </span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-bg-elevated">
              <div className="bg-red-campaign transition-all duration-500" style={{ width: `${d.current_support}%` }} />
              <div className="bg-blue-campaign transition-all duration-500" style={{ width: `${d.opponent_support}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
