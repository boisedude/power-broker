import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { StatChange } from '@/components/ui/StatChange.tsx';
import { formatMoney, formatMoneyFull } from '@/utils/formatters.ts';

export function Finance() {
  const finances = useGameStore((s) => s.finances);
  const lastResult = useGameStore((s) => s.last_turn_result);

  return (
    <PageContainer title="Campaign Finances">
      {/* Overview */}
      <Card accent="green" className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-text-muted">Cash on Hand</p>
            <p className="text-2xl font-black text-success">{formatMoney(finances.cash_on_hand)}</p>
          </div>
          {lastResult && (
            <StatChange value={lastResult.financial_summary.net} prefix="$" />
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <p className="text-xs text-text-muted">Total Raised</p>
          <p className="text-lg font-bold text-success">{formatMoney(finances.total_raised)}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Total Spent</p>
          <p className="text-lg font-bold text-danger">{formatMoney(finances.total_spent)}</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Weekly Burn Rate</p>
          <p className="text-lg font-bold text-warning">{formatMoney(finances.weekly_burn_rate)}/wk</p>
        </Card>
        <Card>
          <p className="text-xs text-text-muted">Online Income</p>
          <p className="text-lg font-bold text-info">{formatMoney(finances.online_income_rate)}/wk</p>
        </Card>
      </div>

      {/* Revenue Sources */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-text-primary mb-3">Revenue Sources</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Small Donors</span>
            <span className="text-text-primary font-medium">{formatMoneyFull(finances.small_donors)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Large Donors</span>
            <span className="text-text-primary font-medium">{formatMoneyFull(finances.large_donors)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">PAC Money</span>
            <span className="text-text-primary font-medium">{formatMoneyFull(finances.pac_money)}</span>
          </div>
        </div>
      </Card>

      {/* Email List */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-text-muted">Email List Size</p>
            <p className="text-lg font-bold text-text-primary">{finances.email_list_size.toLocaleString()}</p>
          </div>
          <p className="text-xs text-text-muted">Grows with fundraising</p>
        </div>
      </Card>
    </PageContainer>
  );
}
