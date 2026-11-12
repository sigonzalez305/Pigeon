import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppShell = () => {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-md flex-col" style={{ background: 'var(--slate-dusk)' }}>
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
