#!/usr/bin/env node
/**
 * Run all checks: TypeScript type-check, Biome lint + format, tests.
 *   node check.cjs          check only
 *   node check.cjs --fix    auto-fix lint and format issues
 */
const { execFileSync } = require('node:child_process');

const fix = process.argv.includes('--fix');
const checks = [
	{ label: 'TypeScript', cmd: ['npx', 'tsc', '-b', '--force'] },
	{
		label: 'Biome (lint + format)',
		cmd: fix
			? ['npx', '@biomejs/biome', 'check', '--write', '.']
			: ['npx', '@biomejs/biome', 'check', '.'],
	},
	{ label: 'Tests', cmd: ['npx', 'vitest', 'run'] },
];

let failed = false;
for (const check of checks) {
	process.stdout.write(`> ${check.label}... `);
	try {
		execFileSync(check.cmd[0], check.cmd.slice(1), { stdio: 'pipe' });
		process.stdout.write('ok\n');
	} catch (err) {
		process.stdout.write('FAILED\n');
		process.stderr.write(err.stderr?.toString() || err.stdout?.toString() || '');
		failed = true;
	}
}
process.exit(failed ? 1 : 0);
