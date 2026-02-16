import type { AdMedium, AdTone } from '@/types/game.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { getAdCostPerWeek } from '@/engine/AdvertisingEngine.ts';
import { formatMoney } from '@/utils/formatters.ts';
import { Tv, Smartphone, Mail, Radio } from 'lucide-react';

const mediumIcons: Record<AdMedium, typeof Tv> = {
  tv: Tv,
  digital: Smartphone,
  mailers: Mail,
  radio: Radio,
};

const mediumLabels: Record<AdMedium, string> = {
  tv: 'Television',
  digital: 'Digital',
  mailers: 'Mailers',
  radio: 'Radio',
};

const toneLabels: Record<AdTone, string> = {
  'positive-bio': 'Positive Bio',
  'positive-issue': 'Positive Issue',
  'contrast': 'Contrast',
  'attack': 'Attack',
};

interface AdCardProps {
  medium: AdMedium;
  active: boolean;
  currentTone?: AdTone;
  onToggle: (medium: AdMedium) => void;
  onSetTone: (tone: AdTone) => void;
}

export function AdCard({ medium, active, currentTone, onToggle, onSetTone }: AdCardProps) {
  const Icon = mediumIcons[medium];
  const cost = getAdCostPerWeek(medium);

  return (
    <Card className={active ? 'ring-1 ring-red-campaign' : ''}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className={active ? 'text-red-campaign' : 'text-text-muted'} />
          <span className="text-sm font-bold text-text-primary">{mediumLabels[medium]}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{formatMoney(cost)}/wk</span>
          <Button size="sm" variant={active ? 'danger' : 'secondary'} onClick={() => onToggle(medium)}>
            {active ? 'Stop' : 'Run'}
          </Button>
        </div>
      </div>
      {active && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {(Object.keys(toneLabels) as AdTone[]).map((tone) => (
            <button
              key={tone}
              onClick={() => onSetTone(tone)}
              className={`px-3 py-2 text-xs rounded-md transition-colors min-h-[36px] ${
                currentTone === tone ? 'bg-red-campaign text-white' : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {toneLabels[tone]}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
