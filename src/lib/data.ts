/**
 * Data file contract and runtime validation. The file is produced by stage
 * s12_explorer_data.py of github.com/jvanderberg/op-block-typology and copied
 * here by `npm run data`; nothing in it is hand-typed.
 */
export const SIZE_CLASSES = ['2', '3', '4', '5', '6', '7+'] as const;
export type SizeClass = (typeof SIZE_CLASSES)[number];

export const DISTRICT_SLUGS = ['flw', 'ridgeland', 'gunderson', 'rest'] as const;
export type DistrictSlug = (typeof DISTRICT_SLUGS)[number];

export type BuildingType = 'small_mf' | 'large_mf' | 'condo';

export interface District {
	readonly name: string;
	readonly slug: DistrictSlug;
	/** Year of the Village's local designation; null for the rest-of-village comparison. */
	readonly localYear: number | null;
	readonly localDate: string;
	readonly localOrdinance: string;
	readonly nrYear: number | null;
	readonly nrDate: string;
	readonly boundaryNote: string;
	readonly sensitivityYear: number | null;
	/** Land area in square miles, from the Village district polygons and the TIGER place polygon. */
	readonly areaSqMi: number;
}

export interface Building {
	readonly id: string;
	readonly address: string;
	readonly district: DistrictSlug;
	readonly year: number | null;
	readonly units: number;
	readonly size: SizeClass;
	readonly type: BuildingType;
	readonly zone: string;
	readonly yearSource: string;
	readonly pins: number;
}

export interface ExplorerData {
	readonly generated: {
		readonly stage: string;
		readonly source: string;
		readonly sourceSha256: string;
	};
	readonly sizeClasses: readonly SizeClass[];
	readonly districts: readonly District[];
	readonly buildings: readonly Building[];
}

export function isSizeClass(v: unknown): v is SizeClass {
	return typeof v === 'string' && (SIZE_CLASSES as readonly string[]).includes(v);
}

export function isDistrictSlug(v: unknown): v is DistrictSlug {
	return typeof v === 'string' && (DISTRICT_SLUGS as readonly string[]).includes(v);
}

function isBuildingType(v: unknown): v is BuildingType {
	return v === 'small_mf' || v === 'large_mf' || v === 'condo';
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function str(o: Record<string, unknown>, k: string): string {
	const v = o[k];
	if (typeof v !== 'string') {
		throw new TypeError(`expected string at ${k}`);
	}
	return v;
}

function num(o: Record<string, unknown>, k: string): number {
	const v = o[k];
	if (typeof v !== 'number' || !Number.isFinite(v)) {
		throw new TypeError(`expected number at ${k}`);
	}
	return v;
}

function numOrNull(o: Record<string, unknown>, k: string): number | null {
	const v = o[k];
	if (v === null || v === undefined) {
		return null;
	}
	return num(o, k);
}

function parseDistrict(v: unknown): District {
	if (!isRecord(v)) {
		throw new TypeError('district is not an object');
	}
	const slug = v['slug'];
	if (!isDistrictSlug(slug)) {
		throw new TypeError(`unknown district slug ${String(slug)}`);
	}
	return {
		name: str(v, 'name'),
		slug,
		localYear: numOrNull(v, 'localYear'),
		localDate: str(v, 'localDate'),
		localOrdinance: str(v, 'localOrdinance'),
		nrYear: numOrNull(v, 'nrYear'),
		nrDate: str(v, 'nrDate'),
		boundaryNote: str(v, 'boundaryNote'),
		sensitivityYear: numOrNull(v, 'sensitivityYear'),
		areaSqMi: num(v, 'areaSqMi'),
	};
}

function parseBuilding(v: unknown): Building {
	if (!isRecord(v)) {
		throw new TypeError('building is not an object');
	}
	const district = v['district'];
	const size = v['size'];
	const type = v['type'];
	const year = v['year'];
	if (!isDistrictSlug(district)) {
		throw new TypeError(`unknown district ${String(district)}`);
	}
	if (!isSizeClass(size)) {
		throw new TypeError(`unknown size class ${String(size)}`);
	}
	if (!isBuildingType(type)) {
		throw new TypeError(`unknown building type ${String(type)}`);
	}
	if (year !== null && typeof year !== 'number') {
		throw new TypeError('year must be a number or null');
	}
	return {
		id: str(v, 'id'),
		address: str(v, 'address'),
		district,
		year,
		units: num(v, 'units'),
		size,
		type,
		zone: str(v, 'zone'),
		yearSource: str(v, 'yearSource'),
		pins: num(v, 'pins'),
	};
}

export function parseExplorerData(raw: unknown): ExplorerData {
	if (!isRecord(raw)) {
		throw new TypeError('data file is not an object');
	}
	const generated = raw['generated'];
	if (!isRecord(generated)) {
		throw new TypeError('missing generated block');
	}
	const districts = raw['districts'];
	const buildings = raw['buildings'];
	const sizeClasses = raw['sizeClasses'];
	if (!Array.isArray(districts) || !Array.isArray(buildings) || !Array.isArray(sizeClasses)) {
		throw new TypeError('districts, buildings and sizeClasses must be arrays');
	}
	const classes = sizeClasses.map((c) => {
		if (!isSizeClass(c)) {
			throw new TypeError(`unknown size class ${String(c)}`);
		}
		return c;
	});
	return {
		generated: {
			stage: str(generated, 'stage'),
			source: str(generated, 'source'),
			sourceSha256: str(generated, 'sourceSha256'),
		},
		sizeClasses: classes,
		districts: districts.map(parseDistrict),
		buildings: buildings.map(parseBuilding),
	};
}

export async function loadExplorerData(url: string): Promise<ExplorerData> {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`failed to load ${url}: ${res.status}`);
	}
	return parseExplorerData(await res.json());
}
