# Oak Park historic districts: multi-family buildings by year built

Interactive explorer of every building with two or more dwelling units standing
in Oak Park's Frank Lloyd Wright and Ridgeland-Oak Park historic districts,
placed at the year it was built, with the local designation year marked.
Filter by units per building; hover or tap a bar for the breakdown; click it
to list the buildings.

Live: https://jvanderberg.github.io/op-historic-mf/

## Data

`public/data/mf_buildings.json` is produced by stage `s12_explorer_data.py` of
[op-block-typology](https://github.com/jvanderberg/op-block-typology), which
derives it from the Cook County Assessor's 2026 roll (residential and
condominium characteristics, commercial valuation data) and the Village of Oak
Park GIS historic-district and zoning layers, with a verified provenance chain.
`npm run data` copies the file and its provenance record from a local clone of
that repo; `public/data/mf_buildings.provenance.json` records the source hash.

Only buildings standing in 2026 are visible. Condominium buildings are dated by
the structure, not the conversion. Designation dates and their sources are in
that repo's `config.py`.

## Development

```sh
npm install
npm run dev        # Vite dev server
npm run check      # tsc strict, Biome lint + format, vitest
npm run build
node scripts/screenshot.cjs http://localhost:4173/op-historic-mf/ /tmp/shots   # after `npm run preview`; needs playwright
```

React 19, Vite, TypeScript (all strict flags), Tailwind v4, Zustand, Biome.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on push to main.
