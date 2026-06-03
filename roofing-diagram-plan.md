# Roofing Interactive Measurement Diagram — Plan

## Context
Replace the manual roofing **Measurements** pane with an aerial-report-style top-down roof plan. Every facet is a tappable polygon, all selected by default; tapping toggles a facet, and **only selected facets contribute** their area + edge lengths to the pricing engine. Penetrations (pipe boots, box/bath vents, skylights, chimneys) leave measurements and live in Materials/Labor where size and cost belong. **Roofing only** this pass — gutters (eave edges, same diagram) and siding (elevations) follow in later sessions.

## How it plugs in (no calc-layer changes)
Everything downstream already keys off the flat `envelope.roofing.measurements` dict via `recomputeLineItems()` in `docs/screens-inspection.jsx:240`. The diagram becomes a layer above that: it owns a facet-selection set, derives the aggregate measurements, and pushes them through the existing `updateEnvelope({ measurements, lineItems })` path. `data-pricing.jsx` calc functions are untouched.

## New files

### 1. docs/data-aerial.jsx — roof model + derivation
- `ROOF_MODEL`: a `viewBox` plus `facets[]` and `edges[]`.
  - facet: `{ id, label, pts:[[x,y]…], areaSq, pitch, slope:'steep'|'flat', stepFlash?, apronFlash? }`
  - edge: `{ id, type:'eave'|'rake'|'ridge'|'hip'|'valley', len, a:[x,y], b:[x,y], facets:[ids] }` — eave/rake belong to one facet; ridge/hip/valley are shared between two.
  - ~10–14 facets, hand-authored to look like a real Hover roof plan (L-shaped house + garage + porch w/ hips & valleys). Numbers tuned so all-selected sums match today's seed (~34.9 sq, eaves 248, rakes 155, ridge 120, hip 80, valley 100, drip 403, step 77, apron 58).
- `deriveRoofMeasurements(model, selectedIds, { waste, stories })` → measurements object. Shared edges deduped (counted once if either owner facet selected); `drip_edge = eaves + rakes`; predominant `pitch` = pitch of the largest selected facet.

### 2. docs/screens-roof-diagram.jsx — RoofDiagram component
- Persisted on envelope: `env.roofSelection` (facet ids, default all), `env.roofWaste` (12), `env.roofStories` (2). Overlay mode (Area/Pitch) is local state.
- SVG roof plan: facets as `<path>` (selected = tinted fill, deselected = hollow/gray + dimmed); edges color-coded (Eave gray · Rake green · Ridge red · Hip orange · Valley purple); per-facet area label.
- Tap facet → toggle → recompute → `onApplyMeasurements(derived, { roofSelection })`.
- Below plan: legend, live readout (Area sq w/ steep+flat, eaves, rakes, ridge, hip, valley), waste segmented control (0/7/10/12/14/17/22, suggested 12), stories stepper, Select all / Clear, source chip ("Hover · synced today").

## Edits to existing files
- `docs/screens-inspection.jsx` (~line 409): when `activeSection==='measurements'` and `activeFacet==='roofing'`, render `<RoofDiagram>` instead of `SourceBanner`+`MeasurementsPane`. Pass `env` + `onApplyMeasurements(next, patch)` → `updateEnvelope({ ...patch, measurements: next, lineItems: recomputeLineItems(next) })`. Roofing continue-gate → "≥1 facet selected".
- `docs/data-pricing.jsx`: remove Penetrations fields from `MEASUREMENT_SCHEMA.roofing`; drop penetration values from `SEED_MEASUREMENTS.roofing`; set geometric seed = model all-selected totals; keep `waste_pct`/`stories`.
- `docs/index.html`: add `<script>` tags (data-aerial before screens-inspection, then screens-roof-diagram).
- `docs/styles.css`: facet/edge/legend/summary/waste-control classes.

## Risks
- Shared-edge dedup (ridge/hip/valley counted once).
- Empty selection → area 0, pitch "—".
- Penetration items unlinked → start at 0, rep-driven (intended).
- Continue-gate/lock logic reads `MEASUREMENT_SCHEMA.roofing`; roofing gate switches to selection-based.
- `roofSelection` deep-clones through copy-from-previous.

## Build order
1. data-aerial.jsx: model + deriveRoofMeasurements + window export.
2. Tune model to seed; update SEED/schema in data-pricing.jsx.
3. screens-roof-diagram.jsx: SVG + controls.
4. Wire index.html + styles.css.
5. Branch in screens-inspection.jsx.
6. Verify: inspect → Roofing → Measurements, deselect a facet, confirm readout drops AND GAF Timberline qty on Materials falls; console clean.
