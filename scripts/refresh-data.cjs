#!/usr/bin/env node
/**
 * Copy the explorer data file from the op-block-typology pipeline, together
 * with that stage's provenance record, so the committed data traces back to
 * the assessor sources through the pipeline's hashes.
 *
 *   node scripts/refresh-data.cjs [path-to-op-block-typology]
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const pipeline = process.argv[2] ?? path.join(process.env.HOME ?? '', 'git', 'op-block-typology');
const src = path.join(pipeline, 'outputs', 'explorer_data', 'mf_buildings.json');
const prov = path.join(pipeline, 'outputs', 'provenance', 's12_explorer_data.json');
const destDir = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, path.join(destDir, 'mf_buildings.json'));
const record = JSON.parse(fs.readFileSync(prov, 'utf8'));
const sha = crypto.createHash('sha256').update(fs.readFileSync(src)).digest('hex');
const out = record.outputs.find((o) => o.path.endsWith('mf_buildings.json'));
if (!out || out.sha256 !== sha) {
	throw new Error(`hash mismatch: file ${sha} vs provenance ${out?.sha256}`);
}
fs.writeFileSync(
	path.join(destDir, 'mf_buildings.provenance.json'),
	JSON.stringify({ copiedFrom: src, sha256: sha, stage: record }, null, '\t'),
);
process.stdout.write(`copied ${src} (sha256 ${sha.slice(0, 16)})\n`);
