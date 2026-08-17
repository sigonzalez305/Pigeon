import { Link, useLocation } from 'react-router-dom';
import { Home, Inbox, Send, User } from 'lucide-react';

export const BottomNav = () => {
  const location = useLocation();

  const links = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/inbox', icon: Inbox, label: 'Inbox' },
    { to: '/send', icon: Send, label: 'Send' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav style={{ background: 'var(--coop-char)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="flex justify-around py-3">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
              style={{ color: isActive ? 'var(--petrol)' : 'var(--text-secondary)' }}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
