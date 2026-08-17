import { describe, expect, it } from 'vitest';
import { ceremonyPhaseDuration, nextCeremonyPhase } from './ceremonySequence';

/**
 * The launch ceremony shipped deadlocked: it advanced on animation-complete
 * callbacks, and its opening phase uses a looping sprite strip that never
 * completes. These tests assert the property that was actually violated — the
 * sequence reaches its terminal phase from a standing start — rather than
 * re-testing the phase names.
 */
describe('launch ceremony phase machine', () => {
  it('advances from the launch phase to a terminal phase in bounded steps', () => {
    let phase = nextCeremonyPhase('carry-scroll');
    const visited: string[] = ['carry-scroll'];

    // Bounded so a cycle fails the test instead of hanging it.
    for (let step = 0; step < 20 && phase !== null; step += 1) {
      visited.push(phase);
      if (ceremonyPhaseDuration(phase) === null) break;
      phase = nextCeremonyPhase(phase);
    }

    expect(visited).toContain('glide');
    expect(visited.length).toBeLessThan(20);
  });

  it('gives every non-terminal phase a finite duration to advance on', () => {
    let phase: ReturnType<typeof nextCeremonyPhase> = 'carry-scroll';

    while (phase !== null) {
      const duration = ceremonyPhaseDuration(phase);
      if (duration === null) break;
      expect(duration).toBeGreaterThan(0);
      expect(Number.isFinite(duration)).toBe(true);
      phase = nextCeremonyPhase(phase);
    }
  });

  it('treats the terminal phase as terminal so the exit is reachable', () => {
    expect(ceremonyPhaseDuration('glide')).toBeNull();
    expect(nextCeremonyPhase('glide')).toBeNull();
  });

  it('does not advance from a phase outside the sequence', () => {
    expect(nextCeremonyPhase('ready')).toBeNull();
  });
});
