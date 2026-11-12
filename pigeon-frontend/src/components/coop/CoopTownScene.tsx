import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import sky from '../../assets/asset-bank/production/coop-town/sky.png';
import city from '../../assets/asset-bank/production/coop-town/city.png';
import rooftop from '../../assets/asset-bank/production/coop-town/rooftop.png';

/**
 * Coop Town: a rooftop wider than the screen that you drag to look around.
 *
 * Three layers move at different speeds as you pan (sky slowest, rooftop 1:1),
 * which is what makes it read as a place rather than a picture. The rooftop
 * objects are the navigation: the art is the menu.
 */

/** The rooftop layer's own proportions; everything else is laid out against it. */
const ROOFTOP_ASPECT = 1482 / 387;
const STAGE_HEIGHT = 380;
const ROOFTOP_HEIGHT = 190;
const WORLD_WIDTH = Math.round(ROOFTOP_HEIGHT * ROOFTOP_ASPECT);

export type CoopHotspot = {
  id: string;
  label: string;
  /** Position on the rooftop layer, as percentages of its width and height. */
  left: number;
  top: number;
  width: number;
  height: number;
  badge?: number;
  onSelect: () => void;
};

export const CoopTownScene = ({ hotspots, children }: { hotspots: CoopHotspot[]; children?: ReactNode }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(390);
  const x = useMotionValue(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setStageWidth(stage.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const overflow = Math.max(0, WORLD_WIDTH - stageWidth);

  // Start centred on the launch pad, where Pico stands.
  useEffect(() => {
    x.set(-overflow / 2);
  }, [overflow, x]);

  const skyX = useTransform(x, (value) => (value + overflow / 2) * 0.12);
  const cityX = useTransform(x, (value) => (value + overflow / 2) * 0.4);

  const pan = (direction: 1 | -1) => {
    const target = Math.max(-overflow, Math.min(0, x.get() + direction * stageWidth * 0.6));
    animate(x, target, { type: 'spring', stiffness: 220, damping: 30 });
  };

  return (
    <div
      ref={stageRef}
      className="relative w-full overflow-hidden rounded-[28px] border"
      style={{ height: STAGE_HEIGHT, borderColor: 'var(--border-subtle)', background: '#0b0e17' }}
    >
      <motion.img
        src={sky}
        alt=""
        draggable={false}
        className="absolute left-1/2 top-0 max-w-none select-none"
        style={{ x: skyX, height: 236, width: 'auto', marginLeft: -236 * (1170 / 612) / 2 }}
      />
      <motion.img
        src={city}
        alt=""
        draggable={false}
        className="absolute left-1/2 max-w-none select-none"
        style={{
          x: cityX,
          top: 128,
          height: 132,
          width: 'auto',
          marginLeft: -132 * (1170 / 228) / 2,
          // The city art has its own flat night sky above the skyline. Fading
          // its top edge lets the sunset show through instead of a hard line.
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 42%)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 42%)',
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ x, width: WORLD_WIDTH, height: STAGE_HEIGHT }}
        drag={overflow > 0 ? 'x' : false}
        dragConstraints={{ left: -overflow, right: 0 }}
        dragElastic={0.08}
      >
        <img
          src={rooftop}
          alt=""
          draggable={false}
          className="absolute bottom-0 left-0 max-w-none select-none"
          style={{ width: WORLD_WIDTH, height: ROOFTOP_HEIGHT }}
        />

        <div className="absolute bottom-0 left-0" style={{ width: WORLD_WIDTH, height: ROOFTOP_HEIGHT }}>
          {hotspots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={spot.onSelect}
              aria-label={spot.label}
              className="group absolute rounded-xl"
              style={{ left: `${spot.left}%`, top: `${spot.top}%`, width: `${spot.width}%`, height: `${spot.height}%` }}
            >
              <span
                className="pointer-events-none absolute -top-7 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em]"
                style={{ background: 'rgba(18,21,29,.86)', borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}
              >
                {spot.label}
                {spot.badge ? (
                  <span
                    className="rounded-full px-1.5 text-[10px] font-bold"
                    style={{ background: 'var(--feather-magenta)', color: '#fff' }}
                  >
                    {spot.badge}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>

        {/* Pico stands on the launch pad, which sits just right of centre. */}
        <div className="absolute" style={{ left: WORLD_WIDTH * 0.527, bottom: 30, transform: 'translateX(-50%)' }}>
          {children}
        </div>
      </motion.div>

      {overflow > 0 && (
        <>
          <PanButton side="left" onClick={() => pan(1)} />
          <PanButton side="right" onClick={() => pan(-1)} />
        </>
      )}
    </div>
  );
};

const PanButton = ({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={side === 'left' ? 'Look left' : 'Look right'}
    className="absolute top-3 flex h-9 w-9 items-center justify-center rounded-full border"
    style={{ [side]: 12, background: 'rgba(18,21,29,.7)', borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={side === 'left' ? 'M15 5L8 12L15 19' : 'M9 5L16 12L9 19'} />
    </svg>
  </button>
);
