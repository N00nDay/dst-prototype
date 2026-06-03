/* global React */
/* Aerial roof model — drives the interactive roofing / gutters diagrams.
   ───────────────────────────────────────────────────────────────
   The diagram is a schematic top-down roof plan (Hover-style). Each FACET
   is a tappable polygon; each EDGE is a color-coded line typed eave / rake /
   ridge / hip / valley. Drawing coordinates are schematic (viewBox space) —
   the real measurements live as data on each facet/edge (areaSq, len in feet)
   so the plan reads like a report without having to be drawn to scale.

   Edge ownership: eave/rake belong to ONE facet; ridge/hip/valley are SHARED
   between two facets. When summing, a shared edge counts ONCE if either owner
   is selected (deduped by edge id).

   Gutters: selection is on EAVE edges. Downspouts are independent, placeable
   markers — each pinned to a point (t ∈ 0..1) along an eave. The rep can add,
   remove, and drag them. A downspout's drop length defaults from the height of
   the facet it hangs on (stories × STORY_DROP_FT) and can be overridden.

   The all-selected totals here are the source of truth for the seed roofing /
   gutters measurements in data-pricing.jsx — keep them in sync if you retune. */

const STORY_DROP_FT = 10; // estimated downspout drop per story (gutter → grade)

const ROOF_MODEL = {
  source: 'hover',
  sourceId: 'HV-7024146',
  viewBox: '0 0 430 300',
  // ── Facets (top-down polygons). slope drives steep/low-slope; stories drives
  //    the default downspout drop length for downspouts hung on its eaves. ──
  facets: [
    // Main hip roof (8/12), 2-story
    { id: 'F1', label: 'Main · front', pts: [[70, 210], [250, 210], [200, 140], [120, 140]], areaSq: 8.4, pitch: '8/12', slope: 'steep', stories: 2, apronFlash: 30 },
    { id: 'F2', label: 'Main · back',  pts: [[70, 70], [250, 70], [200, 140], [120, 140]],   areaSq: 8.4, pitch: '8/12', slope: 'steep', stories: 2 },
    { id: 'F3', label: 'Main · left',  pts: [[70, 70], [70, 210], [120, 140]],                areaSq: 3.3, pitch: '8/12', slope: 'steep', stories: 2 },
    { id: 'F4', label: 'Main · right', pts: [[250, 70], [250, 210], [200, 140]],              areaSq: 3.3, pitch: '8/12', slope: 'steep', stories: 2 },
    // Garage gable (8/12), 1-story, abuts main on its west edge (valley)
    { id: 'F5', label: 'Garage · front', pts: [[250, 185], [360, 185], [360, 140], [250, 140]], areaSq: 3.1, pitch: '8/12', slope: 'steep', stories: 1, stepFlash: 20 },
    { id: 'F6', label: 'Garage · back',  pts: [[250, 95], [360, 95], [360, 140], [250, 140]],    areaSq: 3.1, pitch: '8/12', slope: 'steep', stories: 1, stepFlash: 20 },
    // Front entry gable (8/12), 2-story, projects from main front (valleys into F1)
    { id: 'F7', label: 'Entry · west', pts: [[140, 210], [165, 210], [165, 255], [140, 262]], areaSq: 0.6, pitch: '8/12', slope: 'steep', stories: 2, stepFlash: 9 },
    { id: 'F8', label: 'Entry · east', pts: [[165, 210], [190, 210], [190, 262], [165, 255]], areaSq: 0.6, pitch: '8/12', slope: 'steep', stories: 2, stepFlash: 8 },
    // Front porch — low slope shed (3/12), 1-story, against house wall (apron)
    { id: 'F9',  label: 'Porch · west', pts: [[70, 210], [105, 210], [105, 255], [70, 255]],  areaSq: 2.4, pitch: '3/12', slope: 'flat', stories: 1, apronFlash: 14 },
    { id: 'F10', label: 'Porch · east', pts: [[105, 210], [140, 210], [140, 262], [105, 255]], areaSq: 2.4, pitch: '3/12', slope: 'flat', stories: 1, apronFlash: 14 }
  ],
  // ── Edges (color-coded). facets = owner ids (shared edges list two). ──
  edges: [
    // Main hip roof
    { id: 'E1', type: 'eave',   len: 56, a: [70, 210], b: [250, 210], facets: ['F1'] },
    { id: 'E2', type: 'eave',   len: 56, a: [70, 70],  b: [250, 70],  facets: ['F2'] },
    { id: 'E3', type: 'eave',   len: 26, a: [70, 70],  b: [70, 210],  facets: ['F3'] },
    { id: 'E4', type: 'eave',   len: 26, a: [250, 70], b: [250, 210], facets: ['F4'] },
    { id: 'E5', type: 'ridge',  len: 30, a: [120, 140], b: [200, 140], facets: ['F1', 'F2'] },
    { id: 'E6', type: 'hip',    len: 20, a: [70, 210], b: [120, 140], facets: ['F1', 'F3'] },
    { id: 'E7', type: 'hip',    len: 20, a: [250, 210], b: [200, 140], facets: ['F1', 'F4'] },
    { id: 'E8', type: 'hip',    len: 20, a: [70, 70],  b: [120, 140], facets: ['F2', 'F3'] },
    { id: 'E9', type: 'hip',    len: 20, a: [250, 70], b: [200, 140], facets: ['F2', 'F4'] },
    // Garage gable
    { id: 'E10', type: 'eave',   len: 30, a: [250, 185], b: [360, 185], facets: ['F5'] },
    { id: 'E11', type: 'eave',   len: 30, a: [250, 95],  b: [360, 95],  facets: ['F6'] },
    { id: 'E12', type: 'ridge',  len: 26, a: [250, 140], b: [360, 140], facets: ['F5', 'F6'] },
    { id: 'E13', type: 'rake',   len: 22, a: [360, 185], b: [360, 140], facets: ['F5'] },
    { id: 'E14', type: 'rake',   len: 22, a: [360, 95],  b: [360, 140], facets: ['F6'] },
    { id: 'E15', type: 'valley', len: 25, a: [250, 185], b: [250, 140], facets: ['F5', 'F4'] },
    { id: 'E16', type: 'valley', len: 25, a: [250, 95],  b: [250, 140], facets: ['F6', 'F4'] },
    // Front entry gable
    { id: 'E17', type: 'ridge',  len: 10, a: [165, 210], b: [165, 255], facets: ['F7', 'F8'] },
    { id: 'E18', type: 'valley', len: 14, a: [140, 210], b: [165, 210], facets: ['F7', 'F1'] },
    { id: 'E19', type: 'valley', len: 14, a: [165, 210], b: [190, 210], facets: ['F8', 'F1'] },
    { id: 'E20', type: 'rake',   len: 13, a: [140, 210], b: [140, 262], facets: ['F7'] },
    { id: 'E21', type: 'rake',   len: 13, a: [190, 210], b: [190, 262], facets: ['F8'] },
    { id: 'E22', type: 'eave',   len: 8,  a: [140, 262], b: [165, 255], facets: ['F7'] },
    { id: 'E23', type: 'eave',   len: 8,  a: [165, 255], b: [190, 262], facets: ['F8'] },
    // Front porch (low slope)
    { id: 'E24', type: 'eave', len: 14, a: [70, 255],  b: [105, 255], facets: ['F9'] },
    { id: 'E25', type: 'eave', len: 10, a: [105, 255], b: [140, 262], facets: ['F10'] },
    { id: 'E26', type: 'rake', len: 18, a: [70, 210],  b: [70, 255],  facets: ['F9'] },
    { id: 'E27', type: 'rake', len: 17, a: [105, 210], b: [105, 255], facets: ['F10'] }
  ]
};

// Default downspout placement (from the aerial report) — the rep edits this set.
// Each marker is pinned to a point t ∈ [0,1] along its eave. dropLf omitted →
// auto from the owning facet's stories.
const SEED_DOWNSPOUTS = [
  { id: 'D1', eaveId: 'E1',  t: 0.05 },
  { id: 'D2', eaveId: 'E1',  t: 0.95 },
  { id: 'D3', eaveId: 'E2',  t: 0.95 },
  { id: 'D4', eaveId: 'E10', t: 0.93 },
  { id: 'D5', eaveId: 'E24', t: 0.10 }
];

// Visual identity per edge type — matches the report legend color language.
const EDGE_STYLE = {
  eave:   { label: 'Eave',   color: 'oklch(0.6 0.02 80)' },
  rake:   { label: 'Rake',   color: 'oklch(0.62 0.17 145)' },
  ridge:  { label: 'Ridge',  color: 'oklch(0.6 0.21 25)' },
  hip:    { label: 'Hip',    color: 'oklch(0.68 0.16 55)' },
  valley: { label: 'Valley', color: 'oklch(0.55 0.17 295)' }
};

// ── lookups & geometry ──
const edgeById = (id) => (ROOF_MODEL.edges || []).find((e) => e.id === id) || null;
const facetById = (id) => (ROOF_MODEL.facets || []).find((f) => f.id === id) || null;
function pointOnEave(eave, t) {
  return [eave.a[0] + (eave.b[0] - eave.a[0]) * t, eave.a[1] + (eave.b[1] - eave.a[1]) * t];
}
// Downspouts live at corners, never mid-run. Snap a raw t to whichever end of
// the eave is closer, inset ~9 viewBox units so the marker sits just inside the
// corner (and stays visible on short eaves).
function snapEaveEndT(eave, t) {
  if (!eave) return t < 0.5 ? 0 : 1;
  const len = Math.hypot(eave.b[0] - eave.a[0], eave.b[1] - eave.a[1]) || 1;
  const inset = Math.min(0.45, 9 / len);
  return t < 0.5 ? inset : 1 - inset;
}
// Auto drop length for a downspout: explicit override, else owning facet's
// stories × STORY_DROP_FT (default 2 stories if unknown).
function downspoutDropLf(ds) {
  if (ds && ds.dropLf != null) return ds.dropLf;
  const eave = edgeById(ds && ds.eaveId);
  const facet = eave && facetById(eave.facets[0]);
  return ((facet && facet.stories) || 2) * STORY_DROP_FT;
}
function downspoutAutoDrop(ds) {
  const eave = edgeById(ds && ds.eaveId);
  const facet = eave && facetById(eave.facets[0]);
  return ((facet && facet.stories) || 2) * STORY_DROP_FT;
}
// Project a viewBox point onto the closest SELECTED eave; returns the snap.
function nearestEavePoint(selectedEaveIds, x, y) {
  const sel = new Set(selectedEaveIds || []);
  let best = null;
  (ROOF_MODEL.edges || []).forEach((e) => {
    if (e.type !== 'eave' || !sel.has(e.id)) return;
    const dx = e.b[0] - e.a[0], dy = e.b[1] - e.a[1];
    const l2 = dx * dx + dy * dy || 1;
    let t = ((x - e.a[0]) * dx + (y - e.a[1]) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const px = e.a[0] + dx * t, py = e.a[1] + dy * t;
    const d = Math.hypot(x - px, y - py);
    if (!best || d < best.dist) best = { eaveId: e.id, t, x: px, y: py, dist: d };
  });
  return best;
}

// ─── Selection → measurements ──────────────────────────────────
// Roofing: shared edges deduped, drip_edge = eaves + rakes, predominant pitch
// = largest selected facet.
function deriveRoofMeasurements(model, selectedIds, opts) {
  const sel = new Set(selectedIds || []);
  const facets = (model.facets || []).filter((f) => sel.has(f.id));
  let area = 0, steep = 0, flat = 0, step = 0, apron = 0;
  let pitch = '', maxArea = -1;
  facets.forEach((f) => {
    area += f.areaSq;
    if (f.slope === 'flat') flat += f.areaSq; else steep += f.areaSq;
    if (f.stepFlash) step += f.stepFlash;
    if (f.apronFlash) apron += f.apronFlash;
    if (f.areaSq > maxArea) { maxArea = f.areaSq; pitch = f.pitch; }
  });
  const byType = { eave: 0, rake: 0, ridge: 0, hip: 0, valley: 0 };
  (model.edges || []).forEach((e) => {
    if (e.facets.some((id) => sel.has(id))) byType[e.type] += e.len;
  });
  const r1 = (n) => Math.round(n * 10) / 10;
  const r0 = (n) => Math.round(n);
  return {
    area: r1(area), area_steep: r1(steep), area_flat: r1(flat), pitch,
    eaves: r0(byType.eave), rakes: r0(byType.rake), ridge: r0(byType.ridge),
    hip: r0(byType.hip), valley: r0(byType.valley),
    drip_edge: r0(byType.eave + byType.rake),
    step_flashing: r0(step), apron_flashing: r0(apron),
    waste_pct: opts && opts.waste != null ? opts.waste : 12,
    stories: opts && opts.stories != null ? opts.stories : 2
  };
}

// Gutters: run from selected eaves; downspout count + drop length from the
// markers sitting on those selected eaves. Guards run the full selected length.
function deriveGutterMeasurements(model, selectedEaveIds, downspouts, opts) {
  const sel = new Set(selectedEaveIds || []);
  let lf = 0;
  (model.edges || []).forEach((e) => { if (e.type === 'eave' && sel.has(e.id)) lf += e.len; });
  const active = (downspouts || []).filter((d) => sel.has(d.eaveId));
  let dsLf = 0;
  active.forEach((d) => { dsLf += downspoutDropLf(d); });
  const guards = !!(opts && opts.guards);
  const r0 = (n) => Math.round(n);
  return { gutter_lf: r0(lf), downspouts: active.length, downspout_lf: r0(dsLf), guards_lf: guards ? r0(lf) : 0 };
}

// ─── Elevations (Windows & Doors / Siding) ────────────────────
// Real Hover elevation renders (pages 11/13/15/17 → front/right/back/left),
// cropped to docs/elevations/*.png at 880×489. Each opening is a tappable PIN
// anchored over its labeled window/door on the image; selected pins drive the
// windoors counts. Pin coords are in the 880×490 image space. Window/door
// positions for front/right/back came from the report's colored label tags;
// left was placed by inspection. (Garage door excluded — siding scope.)
const ELEVATION_MODEL = {
  source: 'hover',
  sourceId: 'HV-7024146',
  imgW: 880,
  imgH: 489,
  sides: [
    { id: 'front', label: 'Front', img: 'elevations/front.png', openings: [
      { id: 'fr-w1', type: 'window', cx: 363, cy: 210 },
      { id: 'fr-w2', type: 'window', cx: 108, cy: 363 },
      { id: 'fr-w3', type: 'window', cx: 322, cy: 360 },
      { id: 'fr-w4', type: 'window', cx: 384, cy: 360 },
      { id: 'fr-w5', type: 'window', cx: 434, cy: 360 },
      { id: 'fr-d1', type: 'door',   cx: 235, cy: 380 }
    ] },
    { id: 'right', label: 'Right', img: 'elevations/right.png', openings: [
      { id: 'rt-w1', type: 'window', cx: 135, cy: 331 },
      { id: 'rt-w2', type: 'window', cx: 324, cy: 302 },
      { id: 'rt-w3', type: 'window', cx: 602, cy: 327 },
      { id: 'rt-w4', type: 'window', cx: 844, cy: 328 },
      { id: 'rt-d1', type: 'door',   cx: 262, cy: 358 },
      { id: 'rt-d2', type: 'door',   cx: 658, cy: 348 }
    ] },
    { id: 'back', label: 'Back', img: 'elevations/back.png', openings: [
      { id: 'bk-w1',  type: 'window', cx: 423, cy: 210 },
      { id: 'bk-w2',  type: 'window', cx: 567, cy: 210 },
      { id: 'bk-w3',  type: 'window', cx: 346, cy: 330 },
      { id: 'bk-w4',  type: 'window', cx: 83,  cy: 350 },
      { id: 'bk-w5',  type: 'window', cx: 219, cy: 350 },
      { id: 'bk-w6',  type: 'window', cx: 474, cy: 356 },
      { id: 'bk-w7',  type: 'window', cx: 527, cy: 354 },
      { id: 'bk-w8',  type: 'window', cx: 580, cy: 355 },
      { id: 'bk-w9',  type: 'window', cx: 661, cy: 356 },
      { id: 'bk-w10', type: 'window', cx: 715, cy: 355 },
      { id: 'bk-w11', type: 'window', cx: 771, cy: 356 },
      { id: 'bk-w12', type: 'window', cx: 143, cy: 437 }
    ] },
    { id: 'left', label: 'Left', img: 'elevations/left.png', openings: [
      { id: 'lf-w1', type: 'window', cx: 52,  cy: 315 },
      { id: 'lf-w2', type: 'window', cx: 110, cy: 318 },
      { id: 'lf-w3', type: 'window', cx: 215, cy: 318 },
      { id: 'lf-w4', type: 'window', cx: 800, cy: 320 },
      { id: 'lf-d1', type: 'door',   cx: 405, cy: 365 },
      { id: 'lf-s1', type: 'slider', cx: 625, cy: 320 }
    ] }
  ]
};

const OPENING_STYLE = {
  window: { label: 'Window', color: 'oklch(0.55 0.14 235)' },
  door:   { label: 'Door',   color: 'oklch(0.62 0.16 55)' },
  slider: { label: 'Slider', color: 'oklch(0.6 0.12 165)' }
};

function deriveWindoorMeasurements(model, selectedIds) {
  const sel = new Set(selectedIds || []);
  let windows = 0, doors = 0, sliders = 0;
  (model.sides || []).forEach((s) => (s.openings || []).forEach((o) => {
    if (!sel.has(o.id)) return;
    if (o.type === 'window') windows += 1;
    else if (o.type === 'door') doors += 1;
    else if (o.type === 'slider') sliders += 1;
  }));
  return { windows, doors, sliders };
}
function allWindoorOpeningIds() {
  const ids = [];
  (ELEVATION_MODEL.sides || []).forEach((s) => (s.openings || []).forEach((o) => ids.push(o.id)));
  return ids;
}

// Convenience: every facet id / every eave id (default "all selected" sets).
function allRoofFacetIds() {
  return (ROOF_MODEL.facets || []).map((f) => f.id);
}
function allRoofEaveIds() {
  return (ROOF_MODEL.edges || []).filter((e) => e.type === 'eave').map((e) => e.id);
}

Object.assign(window, {
  ROOF_MODEL, EDGE_STYLE, SEED_DOWNSPOUTS, STORY_DROP_FT,
  ELEVATION_MODEL, OPENING_STYLE,
  deriveRoofMeasurements, deriveGutterMeasurements, deriveWindoorMeasurements,
  allRoofFacetIds, allRoofEaveIds, allWindoorOpeningIds,
  edgeById, facetById, pointOnEave, snapEaveEndT, downspoutDropLf, downspoutAutoDrop, nearestEavePoint
});
