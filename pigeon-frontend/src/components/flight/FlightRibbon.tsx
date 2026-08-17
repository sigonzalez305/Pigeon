import { motion } from 'framer-motion';
import type { FlightStatus } from '../../store/flightStore';

export const FlightRibbon = ({ progress, status }: { progress: number; status: FlightStatus }) => {
  const landed = status === 'arrived';
  const pct = Math.round(progress * 100);

  return (
    <div className="w-full" aria-label={`Flight ${status}, ${pct}% complete`}>
      <div className="relative h-8">
        <svg viewBox="0 0 100 26" className="h-full w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
          <path d="M1 22 C 30 2, 70 2, 99 22" fill="none" stroke="rgba(138,147,166,.22)" strokeWidth="1.4" />
          <motion.path
            d="M1 22 C 30 2, 70 2, 99 22"
            fill="none"
            stroke={landed ? 'var(--feather-magenta)' : 'var(--petrol)'}
            strokeWidth="2.2"
            strokeLinecap="round"
            pathLength={1}
            initial={false}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </svg>
        <motion.div
          className="absolute top-[17px] h-3 w-3 -translate-x-1/2 rounded-full border-2"
          style={{
            left: `${Math.max(1, Math.min(99, progress * 100))}%`,
            background: landed ? 'var(--feather-magenta)' : 'var(--slate-dusk)',
            borderColor: landed ? 'var(--feather-magenta)' : 'var(--petrol)',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-secondary)' }}>
        <span>Launch</span>
        <span style={{ color: landed ? 'var(--feather-magenta)' : 'var(--petrol)' }}>{landed ? 'Arrived' : `${pct}%`}</span>
      </div>
    </div>
  );
};
