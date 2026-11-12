export type CeremonyPhase = 'ready' | 'carry-scroll' | 'takeoff' | 'flap' | 'glide';

/**
 * The launch ceremony runs on its own clock.
 *
 * It previously advanced when PicoSprite reported an animation had finished,
 * but the first phase uses a looping strip, and a loop has no completion by
 * definition — so the ceremony froze on its opening frame and never offered the
 * exit. Explicit durations make the sequence terminate whatever the sprites do.
 *
 * Kept separate from the SendFlow component so the sequence can be tested as
 * the pure state machine it is, without mounting the page.
 */
const CEREMONY_SEQUENCE: ReadonlyArray<{ phase: CeremonyPhase; durationMs: number }> = [
  { phase: 'carry-scroll', durationMs: 2200 },
  { phase: 'takeoff', durationMs: 1400 },
  { phase: 'flap', durationMs: 1800 },
];

/** Terminal phase: the pigeon is away and the flight view is offered. */
export const FINAL_PHASE: CeremonyPhase = 'glide';

export const nextCeremonyPhase = (phase: CeremonyPhase): CeremonyPhase | null => {
  const index = CEREMONY_SEQUENCE.findIndex((step) => step.phase === phase);
  if (index === -1) return null;
  return CEREMONY_SEQUENCE[index + 1]?.phase ?? FINAL_PHASE;
};

export const ceremonyPhaseDuration = (phase: CeremonyPhase): number | null =>
  CEREMONY_SEQUENCE.find((step) => step.phase === phase)?.durationMs ?? null;
