import { useEffect, useMemo, useState } from 'react';
import type { PicoAnimation } from '../../assets/picoRuntime';

type AnimationConfig = {
  fps: number;
  loop: boolean;
  frames: number;
};

const CONFIG: Record<PicoAnimation | 'land', AnimationConfig> = {
  idle: { fps: 6, loop: true, frames: 8 },
  walk: { fps: 9, loop: true, frames: 8 },
  'pet-happy': { fps: 8, loop: false, frames: 8 },
  eat: { fps: 8, loop: false, frames: 8 },
  'carry-scroll': { fps: 8, loop: true, frames: 8 },
  takeoff: { fps: 12, loop: false, frames: 8 },
  flap: { fps: 12, loop: true, frames: 8 },
  glide: { fps: 8, loop: true, frames: 8 },
  land: { fps: 10, loop: false, frames: 8 },
  deliver: { fps: 8, loop: false, frames: 8 },
};

const RUNTIME_BASE = '/src/assets/asset-bank/production/pico-v1/runtime';

export type PicoSpriteProps = {
  animation?: PicoAnimation | 'land';
  size?: number;
  className?: string;
  paused?: boolean;
  onComplete?: () => void;
  fallbackLabel?: string;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const PicoSprite = ({
  animation = 'idle',
  size = 128,
  className = '',
  paused = false,
  onComplete,
  fallbackLabel = 'Pico',
}: PicoSpriteProps) => {
  const config = CONFIG[animation];
  const [frame, setFrame] = useState(0);
  const [assetFailed, setAssetFailed] = useState(false);
  const reducedMotion = useMemo(prefersReducedMotion, []);
  const src = `${RUNTIME_BASE}/pico-${animation}.png`;

  useEffect(() => {
    setFrame(0);
    setAssetFailed(false);
  }, [animation]);

  useEffect(() => {
    if (paused || reducedMotion || assetFailed) return;

    const frameMs = 1000 / config.fps;
    const timer = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1;
        if (next < config.frames) return next;
        if (config.loop) return 0;
        window.clearInterval(timer);
        onComplete?.();
        return config.frames - 1;
      });
    }, frameMs);

    return () => window.clearInterval(timer);
  }, [animation, assetFailed, config.fps, config.frames, config.loop, onComplete, paused, reducedMotion]);

  if (assetFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full border border-petrol/40 bg-coop-char/70 text-xs text-wheat ${className}`}
        style={{ width: size, height: size }}
        aria-label={`${fallbackLabel} sprite loading placeholder`}
      >
        {fallbackLabel}
      </div>
    );
  }

  const position = config.frames <= 1 ? 0 : (frame / (config.frames - 1)) * 100;

  return (
    <div
      className={className}
      role="img"
      aria-label={`${fallbackLabel} ${animation} animation`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${config.frames * 100}% 100%`,
        backgroundPosition: `${position}% 0`,
        imageRendering: 'auto',
      }}
    >
      <img
        src={src}
        alt=""
        className="hidden"
        onError={() => setAssetFailed(true)}
      />
    </div>
  );
};
