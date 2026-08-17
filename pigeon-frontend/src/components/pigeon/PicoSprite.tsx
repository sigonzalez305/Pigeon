import { useEffect, useMemo, useRef, useState } from 'react';
import { picoStrips, type PicoAnimation } from '../../assets/picoRuntime';

type AnimationConfig = {
  fps: number;
  loop: boolean;
  frames: number;
};

const CONFIG: Record<PicoAnimation, AnimationConfig> = {
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

// Walk remains a deliberate alias until its dedicated strip is authored. All
// flight and delivery states have one-to-one runtime assets.
const ASSET_ALIAS: Partial<Record<PicoAnimation, string>> = {
  walk: 'idle',
};

export type PicoSpriteProps = {
  animation?: PicoAnimation;
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
  const src = picoStrips[ASSET_ALIAS[animation] ?? animation];

  // Held in a ref so changing the callback identity does not restart the
  // animation, which would reset the strip to frame 0 on every parent render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setFrame(0);
    setAssetFailed(false);
  }, [animation]);

  useEffect(() => {
    if (paused) return;

    const frameMs = 1000 / config.fps;
    const nominalDurationMs = config.frames * frameMs;

    // onComplete means "this animation has played for its nominal duration",
    // not "the frame counter reached the end". Deriving it from the frame loop
    // meant it could never fire for a looping strip, and never fired at all
    // under reduced motion where the loop does not run. Callers use it to
    // sequence steps, so it has to be honoured in both cases.
    const completionTimer = config.loop
      ? undefined
      : window.setTimeout(() => onCompleteRef.current?.(), nominalDurationMs);

    if (reducedMotion || assetFailed) {
      return () => {
        if (completionTimer !== undefined) window.clearTimeout(completionTimer);
      };
    }

    const frameTimer = window.setInterval(() => {
      setFrame((current) => {
        const next = current + 1;
        if (next < config.frames) return next;
        return config.loop ? 0 : config.frames - 1;
      });
    }, frameMs);

    return () => {
      window.clearInterval(frameTimer);
      if (completionTimer !== undefined) window.clearTimeout(completionTimer);
    };
  }, [animation, assetFailed, config.fps, config.frames, config.loop, paused, reducedMotion]);

  if (assetFailed || !src) {
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
        // The art is pixel-based and two strips are authored at a quarter
        // resolution, so smoothing them on upscale reads as blur.
        imageRendering: 'pixelated',
      }}
    >
      <img src={src} alt="" className="hidden" onError={() => setAssetFailed(true)} />
    </div>
  );
};
