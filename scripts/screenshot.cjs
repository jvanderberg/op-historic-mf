#!/usr/bin/env node
/**
 * Headless render check: loads the built site, fails on any console error,
 * page error or failed request, and writes light, dark, interaction and
 * phone-width screenshots. Needs playwright (npm i -D --no-save playwright).
 *   node scripts/screenshot.cjs http://localhost:4173/op-historic-mf/ /tmp/shots
 */
const { chromium } = require('playwright');

async function main() {
	const [base, out] = process.argv.slice(2);
	if (!base || !out) {
		throw new Error('usage: screenshot.cjs <url> <outdir>');
	}
	const browser = await chromium.launch();
	const errors = [];
	async function shot(name, opts, actions) {
		const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 }, ...opts });
		const page = await ctx.newPage();
		page.on('console', (m) => {
			if (m.type() === 'error' || m.type() === 'warning') {
				errors.push(`${name} console.${m.type()}: ${m.text()}`);
			}
		});
		page.on('pageerror', (e) => errors.push(`${name} pageerror: ${e.message}`));
		page.on('requestfailed', (r) => errors.push(`${name} requestfailed: ${r.url()}`));
		await page.goto(base, { waitUntil: 'networkidle' });
		await page.waitForSelector('svg[role=img]', { timeout: 15000 });
		if (actions) {
			await actions(page);
		}
		await page.waitForTimeout(300);
		await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
		await ctx.close();
	}
	await shot('light', {});
	await shot('dark', { colorScheme: 'dark' });
	await shot('selected-table', {}, async (page) => {
		const targets = page.locator('figure').first().locator('button[aria-pressed]');
		await targets.nth(12).hover();
		await targets.nth(12).dblclick();
	});
	await shot('ridgeland', {}, async (page) => {
		await page.locator('label', { hasText: 'Ridgeland - Oak Park' }).click();
	});
	await shot('phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
	await browser.close();
	if (errors.length > 0) {
		process.stderr.write(`ERRORS:\n${errors.join('\n')}\n`);
		process.exit(1);
	}
	process.stdout.write('no console, page or request errors\n');
}

main().catch((e) => {
	process.stderr.write(`${e instanceof Error ? e.stack : String(e)}\n`);
	process.exit(1);
});
