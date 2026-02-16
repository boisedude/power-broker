import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Zap, Target, BarChart3, DollarSign } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: LayoutDashboard, path: '/game' },
  { id: 'actions', label: 'Actions', icon: Zap, path: '/game/actions' },
  { id: 'strategy', label: 'Strategy', icon: Target, path: '/game/strategy' },
  { id: 'polls', label: 'Polls', icon: BarChart3, path: '/game/polls' },
  { id: 'finance', label: 'Finance', icon: DollarSign, path: '/game/finance' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-t border-navy-700 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === '/game'
            ? ['/game', '/game/', '/game/events', '/game/debate'].includes(location.pathname)
            : location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] transition-colors ${
                isActive ? 'text-red-campaign' : 'text-text-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
