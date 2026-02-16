import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { StaffCard } from '@/components/game/StaffCard.tsx';
import { AdCard } from '@/components/game/AdCard.tsx';
import { EndorsementCard } from '@/components/game/EndorsementCard.tsx';
import { canAffordStaff, isStaffAvailable } from '@/engine/StaffEngine.ts';
import { canPursueEndorsement } from '@/engine/EndorsementEngine.ts';
import type { AdMedium, AdTone } from '@/types/game.ts';
import type { AdAllocation } from '@/types/actions.ts';
import { getAdCostPerWeek } from '@/engine/AdvertisingEngine.ts';

type StrategyTab = 'ads' | 'staff' | 'endorsements';

export function Strategy() {
  const [tab, setTab] = useState<StrategyTab>('ads');
  const staff = useGameStore((s) => s.staff);
  const endorsements = useGameStore((s) => s.endorsements);
  const finances = useGameStore((s) => s.finances);
  const currentTurn = useGameStore((s) => s.current_turn);
  const playerSupport = useGameStore((s) => s.polls.player_support);
  const hireStaff = useGameStore((s) => s.hireStaff);
  const pursueEndorsement = useGameStore((s) => s.pursueEndorsement);
  const setAds = useGameStore((s) => s.setAds);

  const currentAds = useGameStore((s) => s.ads);
  const [adConfig, setAdConfig] = useState<Record<AdMedium, { active: boolean; tone: AdTone }>>(() => {
    const config: Record<AdMedium, { active: boolean; tone: AdTone }> = {
      tv: { active: false, tone: 'positive-bio' },
      digital: { active: false, tone: 'positive-bio' },
      mailers: { active: false, tone: 'positive-bio' },
      radio: { active: false, tone: 'positive-bio' },
    };
    for (const ad of currentAds) {
      config[ad.medium] = { active: true, tone: ad.tone };
    }
    return config;
  });

  const toggleAd = (medium: AdMedium) => {
    const newConfig = { ...adConfig, [medium]: { ...adConfig[medium], active: !adConfig[medium].active } };
    setAdConfig(newConfig);
    applyAds(newConfig);
  };

  const setAdTone = (medium: AdMedium, tone: AdTone) => {
    const newConfig = { ...adConfig, [medium]: { ...adConfig[medium], tone } };
    setAdConfig(newConfig);
    applyAds(newConfig);
  };

  const applyAds = (config: typeof adConfig) => {
    const allocations: AdAllocation[] = Object.entries(config)
      .filter(([, v]) => v.active)
      .map(([medium, v]) => ({
        medium: medium as AdMedium,
        tone: v.tone,
        budget: getAdCostPerWeek(medium as AdMedium),
      }));
    setAds(allocations);
  };

  const tabs: { id: StrategyTab; label: string }[] = [
    { id: 'ads', label: 'Advertising' },
    { id: 'staff', label: 'Staff' },
    { id: 'endorsements', label: 'Endorsements' },
  ];

  return (
    <PageContainer title="Campaign Strategy">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-bg-secondary rounded-lg p-1 mb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
              tab === t.id ? 'bg-red-campaign text-white' : 'text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ads Tab */}
      {tab === 'ads' && (
        <div className="space-y-2">
          {(['tv', 'digital', 'mailers', 'radio'] as AdMedium[]).map((medium) => (
            <AdCard
              key={medium}
              medium={medium}
              active={adConfig[medium].active}
              currentTone={adConfig[medium].tone}
              onToggle={toggleAd}
              onSetTone={(tone) => setAdTone(medium, tone)}
            />
          ))}
        </div>
      )}

      {/* Staff Tab */}
      {tab === 'staff' && (
        <div className="space-y-2">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              canAfford={canAffordStaff(member.role, staff, finances) && isStaffAvailable(member, currentTurn)}
              onHire={() => hireStaff(member.role)}
            />
          ))}
        </div>
      )}

      {/* Endorsements Tab */}
      {tab === 'endorsements' && (
        <div className="space-y-2">
          {endorsements.map((e) => (
            <EndorsementCard
              key={e.id}
              endorsement={e}
              canPursue={canPursueEndorsement(e, playerSupport)}
              onPursue={() => pursueEndorsement(e.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
