import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppShell = () => {
  return (
    <div className="h-screen flex flex-col bg-dark-900">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
