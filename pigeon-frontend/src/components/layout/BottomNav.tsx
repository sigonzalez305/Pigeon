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
    <nav className="bg-dark-800 border-t-2 border-ui-border">
      <div className="flex justify-around py-3">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'text-neon-cyan shadow-neon'
                  : 'text-gray-400 hover:text-white'
              }`}
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
