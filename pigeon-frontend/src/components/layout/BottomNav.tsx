import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { CoopIcon, MessagesIcon, SendIcon } from '../icons/DuskIcons';

export const BottomNav = () => {
  const location = useLocation();

  const links = [
    { to: '/home', icon: CoopIcon, label: 'Coop' },
    { to: '/inbox', icon: MessagesIcon, label: 'Messages' },
    { to: '/send', icon: SendIcon, label: 'Send' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav aria-label="Primary" style={{ background: 'var(--coop-char)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="mx-auto flex max-w-md justify-around py-2">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to === '/inbox' && location.pathname.startsWith('/conversation'));
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-lg px-3 transition-colors"
              style={{ color: isActive ? 'var(--petrol)' : 'var(--text-secondary)' }}
            >
              <Icon size={22} strokeWidth={1.65} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
