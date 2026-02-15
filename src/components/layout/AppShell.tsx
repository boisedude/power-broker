import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header.tsx';
import { BottomNav } from '@/components/layout/BottomNav.tsx';

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
