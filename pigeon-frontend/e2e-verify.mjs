import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

/**
 * Drives the whole Pigeon Message flow in a real browser.
 *
 * This exists because the defects that mattered most were invisible to
 * typecheck, tests and build: a ceremony that deadlocked, sprites that 404'd
 * only in a production build, and a bundle that threw before React rendered.
 * Nothing catches those except running the app.
 *
 *   PIGEON_BASE_URL=http://localhost:5173 node e2e-verify.mjs   # dev server
 *   PIGEON_BASE_URL=http://localhost:4173 node e2e-verify.mjs   # production build
 *
 * Requires the backend on :8080 with the demo profile, and a sender who has
 * not yet spent today's pigeon (POST /api/pigeon-messages/reset-daily).
 */
const BASE = process.env.PIGEON_BASE_URL || 'http://localhost:5173';
const SHOTS = process.env.PIGEON_SHOT_DIR || './e2e-shots';
const log = (...a) => console.log(...a);

mkdirSync(SHOTS, { recursive: true });

// PLAYWRIGHT_EXECUTABLE_PATH covers environments with a preinstalled browser;
// otherwise Playwright resolves its own.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {},
);
const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`); });

async function shot(name) {
  await page.screenshot({ path: `${SHOTS}/${name}.png` });
  log(`   [shot] ${name}.png`);
}

log('\n=== 1. LOGIN ===');
await page.goto(BASE, { waitUntil: 'networkidle' });
await shot('01-login');

// Fill login form.
const inputs = await page.locator('input').all();
log(`   inputs on login page: ${inputs.length}`);
await inputs[0].fill('+12025550111');
await inputs[1].fill('password');
await page.getByRole('button', { name: /sign in|log ?in|continue/i }).first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });
log('   logged in, landed on /home');
await page.waitForTimeout(1500);
await shot('02-home');

log('\n=== 2. SPRITE RENDERS (not the text placeholder) ===');
const spriteInfo = await page.evaluate(() => {
  const el = document.querySelector('[role="img"][aria-label*="animation"]');
  if (!el) return { found: false };
  const bg = getComputedStyle(el).backgroundImage;
  return { found: true, backgroundImage: bg, label: el.getAttribute('aria-label') };
});
log(`   ${JSON.stringify(spriteInfo)}`);
const placeholderCount = await page.locator('text=/sprite loading placeholder/').count();
log(`   placeholder fallbacks visible: ${placeholderCount}`);

log('\n=== 3. START SEND FLOW ===');
await page.goto(`${BASE}/send`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('03-send-step0');

const phoneInputs = await page.locator('input[inputmode="tel"]').all();
log(`   phone fields: ${phoneInputs.length}`);
await phoneInputs[0].fill('+12025550111');
await phoneInputs[1].fill('(305) 555-0178');
await page.waitForTimeout(500);

const continueBtn = page.getByRole('button', { name: /continue/i });
log(`   Continue enabled after valid numbers: ${await continueBtn.isEnabled()}`);
await shot('04-step0-filled');
await continueBtn.click();
await page.waitForTimeout(800);

log('\n=== 4. PIGEON STEP ===');
await shot('05-step1-pigeon');
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(600);

log('\n=== 5. SCROLL STEP ===');
await page.locator('textarea').fill('Testing the whole flow end to end, finally.');
await page.waitForTimeout(400);
await shot('06-step2-scroll');
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(600);

log('\n=== 6. SKIES STEP (live weather) ===');
await page.waitForTimeout(4000);
await shot('07-step3-skies');
const skiesText = await page.locator('body').innerText();
log('   ' + skiesText.replace(/\n+/g, ' | ').slice(0, 400));
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(600);

log('\n=== 7. REVIEW + LAUNCH ===');
await shot('08-step4-review');
const launchBtn = page.getByRole('button', { name: /attach scroll/i });
log(`   launch button present: ${await launchBtn.count()}`);
await launchBtn.click();

log('\n=== 8. CEREMONY (this is what used to deadlock) ===');
const phasesSeen = new Set();
let openFlightAppeared = false;
for (let i = 0; i < 40; i += 1) {
  await page.waitForTimeout(500);
  const body = await page.locator('body').innerText().catch(() => '');
  const m = body.match(/^(carry scroll|takeoff|flap|glide|ready)$/im);
  if (m) phasesSeen.add(m[1].toLowerCase());
  if (i === 2) await shot('09-ceremony-early');
  if (await page.getByRole('button', { name: /open flight view/i }).count() > 0) {
    openFlightAppeared = true;
    log(`   "Open Flight View" appeared after ~${((i + 1) * 0.5).toFixed(1)}s`);
    break;
  }
}
log(`   phases observed: ${[...phasesSeen].join(' -> ') || '(none captured)'}`);
log(`   CEREMONY COMPLETED: ${openFlightAppeared}`);
await shot('10-ceremony-complete');

if (!openFlightAppeared) {
  log('   !! ceremony did not reach glide — deadlock still present');
} else {
  log('\n=== 9. FLIGHT VIEW ===');
  await page.getByRole('button', { name: /open flight view/i }).click();
  await page.waitForURL(/\/flight/, { timeout: 10000 });
  await page.waitForTimeout(2500);
  await shot('11-flight-view');
  const flightText = await page.locator('body').innerText();
  log('   ' + flightText.replace(/\n+/g, ' | ').slice(0, 500));
}

log('\n=== 10. FLIGHT SURVIVES RELOAD (server truth, not localStorage) ===');
await page.evaluate(() => localStorage.removeItem('pigeon.flight-weather.v1'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const afterReload = await page.locator('body').innerText();
log(`   flight still shown after clearing local cache + reload: ${/in the air|there|mi\b/i.test(afterReload)}`);
await shot('12-after-reload');

log('\n=== 11. HOME BANNER (flight view reachable) ===');
await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const homeText = await page.locator('body').innerText();
log(`   banner present: ${/pigeon in flight|pigeon has landed/i.test(homeText)}`);
await shot('13-home-with-banner');

log('\n=== 12. DAILY LIMIT ENFORCED IN UI ===');
await page.goto(`${BASE}/send`, { waitUntil: 'networkidle' });
const p2 = await page.locator('input[inputmode="tel"]').all();
await p2[0].fill('+12025550111');
await p2[1].fill('(415) 555-0142');
await page.waitForTimeout(400);
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(400);
await page.locator('textarea').fill('Second message, should be refused.');
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(3500);
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /attach scroll/i }).click();
await page.waitForTimeout(2500);
const limitText = await page.locator('body').innerText();
const refused = /already sent today|one a day/i.test(limitText);
log(`   second send refused with a clear message: ${refused}`);
await shot('14-daily-limit');

log('\n=== CONSOLE ERRORS ===');
log(consoleErrors.length ? consoleErrors.slice(0, 10).join('\n') : '   none');
log('\n=== FAILED REQUESTS ===');
const realFailures = failedRequests.filter((f) => !/429/.test(f));
log(realFailures.length ? realFailures.slice(0, 10).join('\n') : '   none (429 from the daily limit is expected)');

await browser.close();
log('\nDONE');
