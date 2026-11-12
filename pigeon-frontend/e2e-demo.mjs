import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

/**
 * Drives the demo build end to end in a real browser, with no backend.
 *
 *   npm run build:demo
 *   (serve the repo root, e.g. `python3 -m http.server 4180` from the repo root)
 *   PIGEON_BASE_URL=http://localhost:4180/app/ node e2e-demo.mjs
 *
 * It signs in, pets Pico, sends a regular message, sends a Pigeon Message,
 * watches the launch ceremony, waits for the flight to land, and checks the
 * scroll shows up in the conversation. It fails on any console error, any
 * failed request, or any sprite that fell back to its text placeholder.
 */
const BASE = process.env.PIGEON_BASE_URL || 'http://localhost:4180/app/';
const SHOTS = process.env.PIGEON_SHOT_DIR || './e2e-shots';
mkdirSync(SHOTS, { recursive: true });

// PLAYWRIGHT_EXECUTABLE_PATH covers environments with a preinstalled browser.
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
);
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const problems = [];
// Only the app's own files count. Fonts and live weather come from third
// parties and are allowed to be unreachable (offline, sandboxed CI): the app
// falls back to system fonts and neutral weather. Their failures are listed
// separately so they are visible without failing the run.
const ORIGIN = new URL(BASE).origin;
const external = [];
const own = (url) => url.startsWith(ORIGIN);
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(`console: ${m.text()}`); });
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('requestfailed', (r) => (own(r.url()) ? problems : external).push(`requestfailed: ${r.url().split('?')[0]} ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) (own(r.url()) ? problems : external).push(`${r.status()} ${r.url().split('?')[0]}`); });

const shot = async (name) => { await page.screenshot({ path: `${SHOTS}/${name}.png` }); console.log(`   [shot] ${name}`); };
const step = (name) => console.log(`\n== ${name}`);
const noPlaceholders = async (where) => {
  const count = await page.locator('[aria-label$="sprite loading placeholder"]').count();
  if (count) problems.push(`${where}: ${count} sprite placeholder(s)`);
};

step('login');
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await noPlaceholders('login');
await shot('01-login');
await page.getByRole('button', { name: /Alice/ }).click();
await page.waitForURL(/#\/home/);

step('coop town');
await page.waitForTimeout(1200);
await noPlaceholders('home');
await shot('02-coop-town');
await page.getByRole('button', { name: 'Pet Pico' }).click();
await page.waitForTimeout(450);
await shot('03-pet');
await page.getByRole('button', { name: 'Look left' }).click();
await page.waitForTimeout(900);
await shot('04-coop-left');

step('mailbox hotspot -> messages');
await page.getByRole('button', { name: 'Look right' }).click();
await page.waitForTimeout(700);
await page.getByRole('button', { name: 'Look right' }).click();
await page.waitForTimeout(900);
await page.getByRole('button', { name: 'Mailbox' }).click();
await page.waitForURL(/#\/inbox/);
await page.waitForTimeout(600);
await shot('05-messages');

step('regular message with receipts and a reply');
await page.getByRole('button', { name: /Bob/ }).click();
await page.waitForURL(/#\/conversation\//);
await page.getByRole('textbox', { name: 'Message' }).fill('Testing the loft line.');
await page.getByRole('button', { name: 'Send', exact: true }).click();
await page.getByText('Testing the loft line.').waitFor();
await page.getByRole('img', { name: 'Read' }).last().waitFor({ timeout: 6000 });
await page.waitForTimeout(2500);
const bubbles = await page.locator('p.text-sm').count();
console.log(`   bubbles: ${bubbles}`);
await shot('06-conversation');

step('pigeon message: send flow');
await page.goto(`${BASE}#/send`);
await page.getByPlaceholder('(305) 555-0178').fill('(305) 555-0178');
await page.waitForTimeout(300);
await shot('07-send-recipient');
await page.getByRole('button', { name: 'Continue' }).click();
await page.waitForTimeout(500);
await noPlaceholders('choose pigeon');
await page.getByRole('button', { name: 'Continue' }).click();
await page.locator('textarea').fill('Meet me on the roof at dusk. Bring seeds.');
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByText('Route', { exact: true }).waitFor();
await page.waitForTimeout(2500);
await shot('08-skies');
await page.getByRole('button', { name: 'Continue' }).click();
await page.waitForTimeout(400);
await shot('09-ready');
await page.getByRole('button', { name: /Launch/ }).click();

step('launch ceremony');
await page.getByText('Scroll secured', { exact: false }).waitFor();
await noPlaceholders('ceremony');
await shot('10-ceremony-carry');
await page.getByText('Wings open', { exact: false }).waitFor({ timeout: 6000 });
await page.waitForTimeout(350);
await shot('11-ceremony-takeoff');
await page.getByRole('button', { name: 'Open Flight View' }).waitFor({ timeout: 10000 });
await shot('12-ceremony-away');
await page.getByRole('button', { name: 'Open Flight View' }).click();

step('live flight');
await page.waitForURL(/#\/flight/);
await page.waitForTimeout(1500);
await noPlaceholders('flight');
await shot('13-flight');

step('home shows the flight in progress');
await page.goto(`${BASE}#/home`);
await page.getByText('Pigeon in flight').waitFor();
await shot('14-home-in-flight');
await page.getByText('Pigeon in flight').click();
await page.waitForURL(/#\/flight/);

step('arrival');
await page.getByText('Scroll delivered', { exact: false }).waitFor({ timeout: 150000 });
await page.waitForTimeout(500);
await shot('15-landing');
await page.waitForTimeout(2200);
await shot('16-delivered');
await page.getByRole('button', { name: 'Open conversation' }).click();
await page.waitForURL(/#\/conversation\//);
await page.getByText('Meet me on the roof at dusk. Bring seeds.').waitFor();
await shot('17-scroll-in-thread');

step('reload keeps the session');
await page.reload({ waitUntil: 'networkidle' });
await page.goto(`${BASE}#/profile`);
await page.getByText('Alice').first().waitFor();
await shot('18-profile');

await browser.close();
if (external.length) {
  console.log('\nThird-party requests that did not load (not a failure):');
  for (const p of [...new Set(external)]) console.log(' - ' + p);
}
if (problems.length) {
  console.log('\nPROBLEMS:');
  for (const p of [...new Set(problems)]) console.log(' - ' + p);
  process.exit(1);
}
console.log('\nALL STEPS PASSED: no console errors, no failed app requests, no sprite placeholders.');
