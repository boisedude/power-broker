import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { ProgressBar } from '@/components/ui/ProgressBar.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatPercent } from '@/utils/formatters.ts';
import { PollChart } from '@/components/charts/PollChart.tsx';

export function Polls() {
  const polls = useGameStore((s) => s.polls);
  const marginOfError = useGameStore((s) => s.polls.margin_of_error);

  return (
    <PageContainer title="Polling Data">
      {/* Overall */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-text-primary mb-3">Overall Standing</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <div className="flex items-center gap-2">
                <img src="/images/steve-profile.jpg" alt="Steve Gonzalez" className="w-6 h-6 rounded-full object-cover object-[center_25%]" />
                <span className="text-red-campaign font-medium">Steve Gonzalez (R)</span>
              </div>
              <span className="font-bold">{formatPercent(polls.player_support)}</span>
            </div>
            <ProgressBar value={polls.player_support} color="red" />
          </div>
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <div className="flex items-center gap-2">
                <img src="/images/susie-profile.jpg" alt="Susie Lee" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-blue-campaign font-medium">Susie Lee (D)</span>
              </div>
              <span className="font-bold">{formatPercent(polls.opponent_support)}</span>
            </div>
            <ProgressBar value={polls.opponent_support} color="blue" />
          </div>
          <p className="text-xs text-text-muted text-center">
            Undecided: {formatPercent(polls.undecided)} • MoE: ±{marginOfError.toFixed(1)}%
          </p>
        </div>
      </Card>

      {/* Trend Chart */}
      {polls.history.length > 1 && (
        <Card className="mb-4">
          <h3 className="text-sm font-bold text-text-primary mb-3">Polling Trend</h3>
          <PollChart history={polls.history} />
        </Card>
      )}

      {/* Demographics */}
      <h3 className="text-sm font-bold text-text-primary mb-3">By Demographic</h3>
      <div className="space-y-2">
        {polls.demographics.map((d) => (
          <Card key={d.id} className="py-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-primary">{d.name}</span>
              <Badge variant={d.current_support > d.opponent_support ? 'success' : d.current_support < d.opponent_support ? 'danger' : 'default'}>
                {d.electorate_pct}% of voters
              </Badge>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <span className="text-red-campaign w-12 text-right">{formatPercent(d.current_support, 0)}</span>
              <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-bg-elevated">
                <div className="bg-red-campaign h-full" style={{ width: `${d.current_support}%` }} />
                <div className="bg-blue-campaign h-full" style={{ width: `${d.opponent_support}%` }} />
              </div>
              <span className="text-blue-campaign w-12">{formatPercent(d.opponent_support, 0)}</span>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
