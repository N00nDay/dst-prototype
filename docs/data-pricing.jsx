/* global React */
/* Pricing engine — measurement schemas, materials catalogs, labor catalogs.
   Imported by screens-inspection.jsx. Edits live here so reps/admins can
   adjust catalog without touching component logic. */

// ─── Aerial-report sources (mock integration: Hover, EagleView, GAF QuickMeasure) ───
const REPORT_SOURCES = {
  hover:      { id: 'hover',      label: 'Hover',                short: 'Hover',     scope: ['roofing','siding','gutters','windoors'], color: 'oklch(0.62 0.16 280)' },
  eagleview:  { id: 'eagleview',  label: 'EagleView',            short: 'EagleView', scope: ['roofing','gutters'],                     color: 'oklch(0.6 0.18 240)' },
  gafqm:      { id: 'gafqm',      label: 'GAF QuickMeasure',     short: 'GAF QM',    scope: ['roofing'],                               color: 'oklch(0.62 0.16 30)' },
  manual:     { id: 'manual',     label: 'Manual entry',         short: 'Manual',    scope: ['roofing','siding','gutters','windoors'], color: 'var(--text-3)' }
};

// ─── Envelope facets ──────────────────────────────────────────
const ENVELOPE_FACETS = [
  { id: 'repairs',    label: 'Repairs',          icon: 'building', hasPricing: false, sections: ['measurements'] },
  { id: 'roofing',    label: 'Roofing',          icon: 'building', hasPricing: true,  sections: ['measurements','materials','labor','equipment','disposal'] },
  { id: 'siding',     label: 'Siding',           icon: 'building', hasPricing: true,  sections: ['measurements','materials','labor','equipment','disposal'] },
  { id: 'solar',      label: 'Solar',            icon: 'building', hasPricing: false, sections: ['measurements'] },
  { id: 'windoors',   label: 'Windows & Doors',  icon: 'building', hasPricing: false, sections: ['measurements'] },
  { id: 'other',      label: 'Other',            icon: 'building', hasPricing: false, sections: ['measurements'] },
  { id: 'trim',       label: 'Trim Work',        icon: 'building', hasPricing: false, sections: ['measurements'] },
  { id: 'insulation', label: 'Insulation',       icon: 'building', hasPricing: false, sections: ['measurements'] },
  // Kept for back-compat with any existing structures + the Inspect findings
  // grid, which still surfaces a Gutters card. Not offered on the Scope picker.
  { id: 'gutters',    label: 'Gutters',          icon: 'building', hasPricing: false, sections: ['measurements'] }
];

// ─── Measurement schemas ──────────────────────────────────────
// Each field declares unit, expected source(s), and what kind of value it holds.
// `derived` fields are computed from others (e.g. area_steep = sum of pitches ≥ 4/12).
const MEASUREMENT_SCHEMA = {
  roofing: [
    { key: 'area',           label: 'Roof area (total)',     unit: 'sq',   step: 0.5, sources: ['hover','eagleview','gafqm'], group: 'Area' },
    { key: 'area_steep',     label: 'Steep slope area',      unit: 'sq',   step: 0.5, sources: ['hover','eagleview','gafqm'], group: 'Area', hint: 'Pitches ≥ 4/12' },
    { key: 'area_flat',      label: 'Low slope area',        unit: 'sq',   step: 0.5, sources: ['hover','eagleview','gafqm'], group: 'Area', hint: 'Pitches ≤ 3/12' },
    { key: 'pitch',          label: 'Predominant pitch',     unit: '',     step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Area', isText: true },
    { key: 'eaves',          label: 'Eaves',                 unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Edge' },
    { key: 'rakes',          label: 'Rakes',                 unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Edge' },
    { key: 'ridge',          label: 'Ridge',                 unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Edge' },
    { key: 'hip',            label: 'Hip',                   unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Edge' },
    { key: 'valley',         label: 'Valley',                unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Edge' },
    { key: 'step_flashing',  label: 'Step flashing',         unit: 'ft',   step: 1,   sources: ['hover','eagleview'],         group: 'Flashing' },
    { key: 'apron_flashing', label: 'Apron / headwall',      unit: 'ft',   step: 1,   sources: ['hover','eagleview'],         group: 'Flashing' },
    { key: 'drip_edge',      label: 'Drip edge / perimeter', unit: 'ft',   step: 1,   sources: ['hover','eagleview','gafqm'], group: 'Flashing' },
    { key: 'pipe_boots',     label: 'Pipe boots',            unit: 'ea',   step: 1,   sources: ['manual'],                    group: 'Penetrations' },
    { key: 'box_vents',      label: 'Box vents',             unit: 'ea',   step: 1,   sources: ['manual'],                    group: 'Penetrations' },
    { key: 'bath_vents',     label: 'Bath / kitchen vents',  unit: 'ea',   step: 1,   sources: ['manual'],                    group: 'Penetrations' },
    { key: 'skylights',      label: 'Skylights',             unit: 'ea',   step: 1,   sources: ['manual'],                    group: 'Penetrations' },
    { key: 'chimneys',       label: 'Chimneys',              unit: 'ea',   step: 1,   sources: ['manual'],                    group: 'Penetrations' },
    { key: 'stories',        label: 'Stories',               unit: '',     step: 1,   sources: ['hover','manual'],            group: 'Property' },
    { key: 'waste_pct',      label: 'Waste factor',          unit: '%',    step: 1,   sources: ['manual'],                    group: 'Property', hint: 'Applied to shingle quantities' }
  ],
  siding: [
    { key: 'siding_area',    label: 'Siding area',           unit: 'sq',   step: 0.5, sources: ['hover'],            group: 'Area' },
    { key: 'openings_area',  label: 'Openings area',         unit: 'sf',   step: 1,   sources: ['hover'],            group: 'Area' },
    { key: 'trim_area',      label: 'Trim area',             unit: 'sf',   step: 1,   sources: ['hover'],            group: 'Area' },
    { key: 'windows',        label: 'Windows',               unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' },
    { key: 'doors',          label: 'Doors',                 unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' },
    { key: 'garage_doors',   label: 'Garage doors',          unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' },
    { key: 'inside_corners', label: 'Inside corner length',  unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Corners' },
    { key: 'outside_corners',label: 'Outside corner length', unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Corners' },
    { key: 'eaves_fascia',   label: 'Eaves fascia',          unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Trim' },
    { key: 'rakes_fascia',   label: 'Rakes fascia',          unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Trim' },
    { key: 'level_frieze',   label: 'Level frieze board',    unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Trim' },
    { key: 'sloped_frieze',  label: 'Sloped frieze board',   unit: 'ft',   step: 1,   sources: ['hover'],            group: 'Trim' },
    { key: 'soffit_area',    label: 'Soffit area',           unit: 'sf',   step: 1,   sources: ['hover'],            group: 'Trim' },
    { key: 'gable_vents',    label: 'Gable / dryer vents',   unit: 'ea',   step: 1,   sources: ['manual'],           group: 'Accessories' },
    { key: 'shutters_sets',  label: 'Shutters (pairs)',      unit: 'ea',   step: 1,   sources: ['manual'],           group: 'Accessories' },
    { key: 'exterior_lights',label: 'Exterior lights',       unit: 'ea',   step: 1,   sources: ['manual'],           group: 'Accessories' },
    { key: 'waste_pct',      label: 'Waste factor',          unit: '%',    step: 1,   sources: ['manual'],           group: 'Property', hint: 'Applied to siding panel qty' }
  ],
  gutters: [
    { key: 'gutter_lf',      label: 'Gutter run',            unit: 'ft',   step: 1,   sources: ['hover','eagleview'], group: 'Gutters' },
    { key: 'downspouts',     label: 'Downspouts',            unit: 'ea',   step: 1,   sources: ['hover','eagleview'], group: 'Gutters' },
    { key: 'downspout_lf',   label: 'Downspout length',      unit: 'ft',   step: 1,   sources: ['hover','eagleview'], group: 'Gutters' },
    { key: 'guards_lf',      label: 'Gutter guards',         unit: 'ft',   step: 1,   sources: ['manual'],            group: 'Gutters' }
  ],
  windoors: [
    { key: 'windows',        label: 'Windows',               unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' },
    { key: 'doors',          label: 'Doors',                 unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' },
    { key: 'sliders',        label: 'Sliding / patio doors', unit: 'ea',   step: 1,   sources: ['hover','manual'],   group: 'Openings' }
  ],
  attic: [
    { key: 'attic_area',      label: 'Attic floor area',      unit: 'sf',   step: 10,  sources: ['manual'],           group: 'Area' },
    { key: 'insulation_r',    label: 'Insulation R-value',    unit: '',     step: 1,   sources: ['manual'],           group: 'Insulation' },
    { key: 'insulation_depth',label: 'Insulation depth',      unit: 'in',   step: 0.5, sources: ['manual'],           group: 'Insulation' },
    { key: 'soffit_vents',    label: 'Soffit vents',          unit: 'ea',   step: 1,   sources: ['manual'],           group: 'Ventilation' },
    { key: 'ridge_vent_lf',   label: 'Ridge vent',            unit: 'ft',   step: 1,   sources: ['manual'],           group: 'Ventilation' },
    { key: 'bath_fans_vented',label: 'Bath fans vented out',  unit: 'ea',   step: 1,   sources: ['manual'],           group: 'Ventilation' }
  ]
};

// ─── Helpers for linkage formulas (small, readable) ─────────────
const M = (m, k, d = 0) => (m && m[k] != null && m[k] !== '' ? Number(m[k]) || 0 : d);
const W = (m) => 1 + M(m, 'waste_pct', 10) / 100;            // waste multiplier
const ceil = (n) => (n > 0 ? Math.ceil(n) : 0);
const sq2sf = (sq) => sq * 100;

// ─── ROOFING MATERIAL CATALOG (price sheet 02/27/26) ─────────────
const ROOFING_MATERIALS = [
  // Generic / accessories
  { id: 'drip_15t',       group: 'Accessories',  name: '1.5″ T Drip Edge',              unit: 'PC',   price: 9,    linked: 'drip_edge',     calc: (m) => ceil(M(m,'drip_edge') / 10) },
  { id: 'drip_2c',        group: 'Accessories',  name: '2″ C Drip Edge',                unit: 'PC',   price: 12 },
  { id: 'coil_nail',      group: 'Accessories',  name: 'Coil Nail',                     unit: 'BOX',  price: 45,   linked: 'area',          calc: (m) => ceil(M(m,'area') / 12) },
  { id: 'nail_3in',       group: 'Accessories',  name: '3″ 5# Nail',                    unit: 'Box',  price: 11 },
  { id: 't50_staples',    group: 'Accessories',  name: 'T-50 Staples',                  unit: 'BOX',  price: 9 },
  { id: 'pipe_boot_14',   group: 'Accessories',  name: '1–4″ Pipe Boot',                unit: 'PC',   price: 14,   linked: 'pipe_boots',    calc: (m) => M(m,'pipe_boots') },
  { id: 'zipper_boot',    group: 'Accessories',  name: 'Zipper Boot',                   unit: 'PC',   price: 32 },
  { id: 'solar_seal',     group: 'Accessories',  name: 'Solar Seal Caulk',              unit: 'TUBE', price: 10 },
  { id: 'osb_7_16',       group: 'Accessories',  name: '7/16 OSB',                      unit: 'PC',   price: 21 },
  { id: 'trim_coil_a',    group: 'Accessories',  name: 'Trim Coil White/Brown/Black',   unit: 'ROLL', price: 156 },
  { id: 'trim_coil_b',    group: 'Accessories',  name: 'Trim Coil Terratone + Others',  unit: 'ROLL', price: 165 },
  { id: 'step_flash_pc',  group: 'Accessories',  name: 'Step Flashing',                 unit: 'PC',   price: 69,   linked: 'step_flashing', calc: (m) => ceil(M(m,'step_flashing') / 10) },
  { id: 'box_vent',       group: 'Accessories',  name: 'Box Vent',                      unit: 'PC',   price: 20,   linked: 'box_vents',     calc: (m) => M(m,'box_vents') },
  { id: 'bath_vent_4',    group: 'Accessories',  name: 'Bath Vent 4″',                  unit: 'PC',   price: 32,   linked: 'bath_vents',    calc: (m) => M(m,'bath_vents') },
  { id: 'kitchen_vent_8', group: 'Accessories',  name: 'Kitchen Vent 8″',               unit: 'PC',   price: 56 },
  { id: 'smart_plug',     group: 'Accessories',  name: 'Smart Plug',                    unit: 'PC',   price: 15 },
  { id: 'qe_valley',      group: 'Accessories',  name: 'QE Valley',                     unit: 'PC',   price: 28 },
  { id: 'econ_ridge_vent',group: 'Accessories',  name: 'Economy Ridge Vent (Omni Pro)', unit: 'PC',   price: 12,   linked: 'ridge',         calc: (m) => ceil(M(m,'ridge') / 4) },
  { id: 'gen_iw',         group: 'Accessories',  name: 'Generic Ice & Water',           unit: 'ROLL', price: 65,   linked: 'valley',        calc: (m) => ceil(M(m,'valley') / 65) },
  { id: 'econ_syn',       group: 'Accessories',  name: 'Economy Synthetic',             unit: 'ROLL', price: 79 },
  // GAF
  { id: 'gaf_iw',         group: 'GAF',          name: 'GAF WeatherWatch I&W',          unit: 'ROLL', price: 95 },
  { id: 'gaf_syn',        group: 'GAF',          name: 'GAF FeltBuster Synthetic',      unit: 'ROLL', price: 108,  linked: 'area',          calc: (m) => ceil(M(m,'area') / 10) },
  { id: 'gaf_pro_start',  group: 'GAF',          name: 'GAF Pro-Start',                 unit: 'BNDL', price: 52,   linked: 'eaves',         calc: (m) => ceil((M(m,'eaves')+M(m,'rakes')) / 105) },
  { id: 'gaf_snow',       group: 'GAF',          name: 'GAF Snow Country',              unit: 'PC',   price: 13 },
  { id: 'gaf_sealaridge', group: 'GAF',          name: 'GAF Seal-A-Ridge H&R',          unit: 'BNDL', price: 59,   linked: 'ridge',         calc: (m) => ceil((M(m,'ridge')+M(m,'hip')) / 20) },
  { id: 'gaf_hdz',        group: 'GAF',          name: 'GAF Timberline HDZ',            unit: 'SQ',   price: 122,  linked: 'area_steep',    calc: (m) => ceil(M(m,'area_steep') * W(m)) },
  { id: 'gaf_ultra_hdz',  group: 'GAF',          name: 'GAF Ultra HDZ',                 unit: 'SQ',   price: 142 },
  { id: 'gaf_timbertex',  group: 'GAF',          name: 'GAF TimberTex Cap',             unit: 'BNDL', price: 75 },
  // CertainTeed
  { id: 'ct_wg',          group: 'CertainTeed',  name: 'CT WinterGuard / Grace Select', unit: 'ROLL', price: 121 },
  { id: 'ct_runner',      group: 'CertainTeed',  name: 'CT Roof Runner Synthetic',      unit: 'ROLL', price: 103 },
  { id: 'ct_swift',       group: 'CertainTeed',  name: 'CT Swift Start',                unit: 'BNDL', price: 54 },
  { id: 'ct_ridge_vent',  group: 'CertainTeed',  name: 'CT 4′ Ridge Vent',              unit: 'PC',   price: 13 },
  { id: 'ct_shadow_hr',   group: 'CertainTeed',  name: 'CT Shadow Ridge H&R',           unit: 'BNDL', price: 63 },
  { id: 'ct_patriot_xl',  group: 'CertainTeed',  name: 'CT Patriot XL',                 unit: 'SQ',   price: 101 },
  { id: 'ct_landmark',    group: 'CertainTeed',  name: 'CT Landmark',                   unit: 'SQ',   price: 110 },
  { id: 'ct_landmark_pro',group: 'CertainTeed',  name: 'CT Landmark PRO',               unit: 'SQ',   price: 119 },
  { id: 'ct_northgate',   group: 'CertainTeed',  name: 'CT Northgate (4 bndl/SQ)',      unit: 'SQ',   price: 150 },
  { id: 'ct_northgate_cap',group:'CertainTeed',  name: 'CT Northgate Cap',              unit: 'BNDL', price: 98 },
  // Atlas
  { id: 'atlas_iw',       group: 'Atlas',        name: 'Atlas WeatherMaster I&W',       unit: 'ROLL', price: 92 },
  { id: 'atlas_syn',      group: 'Atlas',        name: 'Atlas Summit 60 Synthetic',     unit: 'ROLL', price: 91 },
  { id: 'atlas_starter',  group: 'Atlas',        name: 'Atlas Pro-Cut Starter',         unit: 'BNDL', price: 72 },
  { id: 'atlas_hr',       group: 'Atlas',        name: 'Atlas Pro-Cut Hip & Ridge',     unit: 'BNDL', price: 71 },
  { id: 'atlas_pinnacle', group: 'Atlas',        name: 'Atlas Pinnacle Pristine',       unit: 'SQ',   price: 112 },
  { id: 'atlas_impact',   group: 'Atlas',        name: 'Atlas Impact',                  unit: 'SQ',   price: 128 },
  { id: 'atlas_storm',    group: 'Atlas',        name: 'Atlas StormMaster Shake',       unit: 'SQ',   price: 165 },
  { id: 'atlas_sbs_cap',  group: 'Atlas',        name: 'Atlas SBS Cap',                 unit: 'BNDL', price: 93 },
  // Velux
  { id: 'velux_c06',      group: 'Velux',        name: 'Velux C06 Skylight w/ blinds',  unit: 'PC',   price: 705,  linked: 'skylights',  calc: (m) => M(m,'skylights') },
  { id: 'velux_c04',      group: 'Velux',        name: 'Velux C04 Skylight w/ blinds',  unit: 'PC',   price: 665 },
  { id: 'velux_flash',    group: 'Velux',        name: 'Velux Flashing Kit',            unit: 'PC',   price: 138,  linked: 'skylights',  calc: (m) => M(m,'skylights') },
  // FLAT / LOW SLOPE — Craig (May '26): flat-roof materials live alongside
  // their labor counterparts. Grouped under "Flat / Low slope" so the section
  // renders as a labeled peer to Accessories/GAF/CertainTeed/etc. Not gated
  // by package selection (these aren't shingle manufacturers).
  { id: 'flint_sa_cap',   group: 'Flat / Low slope', name: 'CT Flintlastic SA Cap (granulated)', unit: 'ROLL', price: 145,  linked: 'area_flat',  calc: (m) => ceil(M(m,'area_flat') / 1) },
  { id: 'flint_sa_mid',   group: 'Flat / Low slope', name: 'CT Flintlastic SA MidPly',           unit: 'ROLL', price: 132,  linked: 'area_flat',  calc: (m) => ceil(M(m,'area_flat') / 1) },
  { id: 'flint_sa_nail',  group: 'Flat / Low slope', name: 'CT Flintlastic SA NailBase',         unit: 'ROLL', price: 118 },
  { id: 'flint_primer',   group: 'Flat / Low slope', name: 'FlintPrime SA Primer (5 gal)',       unit: 'PAIL', price: 78,   linked: 'area_flat',  calc: (m) => ceil(M(m,'area_flat') / 8) },
  { id: 'iso_1in',        group: 'Flat / Low slope', name: 'ISO Insulation Board 1″ 4×8',        unit: 'PC',   price: 38,   linked: 'area_flat',  calc: (m) => ceil(sq2sf(M(m,'area_flat')) / 32) },
  { id: 'fiberboard_12',  group: 'Flat / Low slope', name: 'Fiber Board 1/2″ 4×4',               unit: 'PC',   price: 14 },
  { id: 'pipe_boot_flat_m', group: 'Flat / Low slope', name: 'Pipe Boot — flat / EPDM',          unit: 'PC',   price: 24 },
  { id: 'term_bar',       group: 'Flat / Low slope', name: 'Aluminum Termination Bar — 10′',     unit: 'PC',   price: 18 },
  { id: 'roof_cement_5',  group: 'Flat / Low slope', name: 'Wet/Dry Roof Cement (5 gal)',        unit: 'PAIL', price: 52 }
];

// ─── ROOFING LABOR CATALOG (10/01/24 sheet) ─────────────────────
const ROOFING_LABOR = [
  // STEEP SLOPE
  { id: 'tearoff_1',         section: 'steep', group: 'Tear off',     name: 'Tear off 1 layer',                     unit: 'SQ', price: 40,   linked: 'area_steep', calc: (m) => M(m,'area_steep') },
  { id: 'tearoff_2',         section: 'steep', group: 'Tear off',     name: 'Tear off 2 layers',                    unit: 'SQ', price: 50 },
  { id: 'tearoff_3',         section: 'steep', group: 'Tear off',     name: 'Tear off 3 layers',                    unit: 'SQ', price: 60 },
  { id: 'tearoff_cedar',     section: 'steep', group: 'Tear off',     name: 'Tear off cedar shake',                 unit: 'SQ', price: 15 },
  { id: 'tearoff_mansard',   section: 'steep', group: 'Tear off',     name: 'Tear off mansard',                     unit: 'SQ', price: 15 },
  { id: 'install_2_6',       section: 'steep', group: 'Install',      name: 'Install 2/12 – 6/12',                  unit: 'SQ', price: 45 },
  { id: 'install_7_10',      section: 'steep', group: 'Install',      name: 'Install 7/12 – 10/12',                 unit: 'SQ', price: 55,   linked: 'area_steep', calc: (m) => M(m,'area_steep') },
  { id: 'install_11_12',     section: 'steep', group: 'Install',      name: 'Install 11/12 – 12/12',                unit: 'SQ', price: 65 },
  { id: 'install_mansard',   section: 'steep', group: 'Install',      name: 'Install mansard 13/12 +',              unit: 'SQ', price: 90 },
  { id: 'ridge_vent_lbr',    section: 'steep', group: 'Ventilation',  name: 'Ridge vent',                           unit: 'FT', price: 1,    linked: 'ridge',      calc: (m) => M(m,'ridge') },
  { id: 'ridge_cap_lbr',     section: 'steep', group: 'Ventilation',  name: 'Ridge cap',                            unit: 'FT', price: 1,    linked: 'ridge',      calc: (m) => M(m,'ridge') + M(m,'hip') },
  { id: 'step_flash_under',  section: 'steep', group: 'Flashing',     name: 'Step flashing — 50ft and under',       unit: 'FT', price: 5 },
  { id: 'step_flash_over',   section: 'steep', group: 'Flashing',     name: 'Step flashing — 51ft and over',        unit: 'FT', price: 3.5,  linked: 'step_flashing', calc: (m) => M(m,'step_flashing') },
  { id: 'headwall_w',        section: 'steep', group: 'Flashing',     name: 'Headwall flash — with siding work',    unit: 'FT', price: 5 },
  { id: 'headwall_wo',       section: 'steep', group: 'Flashing',     name: 'Headwall flash — without siding work', unit: 'FT', price: 2.5,  linked: 'apron_flashing', calc: (m) => M(m,'apron_flashing') },
  { id: 'box_vent_lbr',      section: 'steep', group: 'Penetrations', name: 'Box vent',                             unit: 'EA', price: 5,    linked: 'box_vents',  calc: (m) => M(m,'box_vents') },
  { id: 'pipe_boot_lbr',     section: 'steep', group: 'Penetrations', name: 'Pipe boot',                            unit: 'EA', price: 5,    linked: 'pipe_boots', calc: (m) => M(m,'pipe_boots') },
  { id: 'bath_vent_lbr',     section: 'steep', group: 'Penetrations', name: 'Bath / stove vent',                    unit: 'EA', price: 5,    linked: 'bath_vents', calc: (m) => M(m,'bath_vents') },
  { id: 'chimney_flash_lo',  section: 'steep', group: 'Chimney',      name: "Chimney flash — up to 12'",            unit: 'EA', price: 125,  linked: 'chimneys',   calc: (m) => M(m,'chimneys') },
  { id: 'chimney_flash_hi',  section: 'steep', group: 'Chimney',      name: "Chimney flash — 13'–25'",              unit: 'EA', price: 175 },
  { id: 'chimney_rem_lo',    section: 'steep', group: 'Chimney',      name: "Chimney removal — up to 12'",          unit: 'EA', price: 200 },
  { id: 'chimney_rem_hi',    section: 'steep', group: 'Chimney',      name: "Chimney removal — 13'–20'",            unit: 'EA', price: 300 },
  { id: 'skylight_std',      section: 'steep', group: 'Skylights',    name: 'Skylight — standard',                  unit: 'EA', price: 125,  linked: 'skylights',  calc: (m) => M(m,'skylights') },
  { id: 'skylight_curb',     section: 'steep', group: 'Skylights',    name: 'Skylight — curb / special',            unit: 'EA', price: 150 },
  { id: 'eyebrow_1',         section: 'steep', group: 'Misc',         name: 'Eyebrow — 1 story',                    unit: 'EA', price: 25 },
  { id: 'eyebrow_2',         section: 'steep', group: 'Misc',         name: 'Eyebrow — 2 story',                    unit: 'EA', price: 50 },
  { id: 'bay_1',             section: 'steep', group: 'Misc',         name: 'Bay window — 1 story',                 unit: 'EA', price: 75 },
  { id: 'bay_2',             section: 'steep', group: 'Misc',         name: 'Bay window — 2 story',                 unit: 'EA', price: 150 },
  { id: 'return_1sq',        section: 'steep', group: 'Misc',         name: 'Return under 1 sq',                    unit: 'EA', price: 125 },
  { id: 'metal_valley',      section: 'steep', group: 'Flashing',     name: 'Metal valley (incl. I&W)',             unit: 'FT', price: 2,    linked: 'valley',     calc: (m) => M(m,'valley') },
  { id: 'sheet_4x8',         section: 'steep', group: 'Decking',      name: 'Sheeting 4×8',                         unit: 'EA', price: 10 },
  { id: 'sheet_4x8_7_12',    section: 'steep', group: 'Decking',      name: 'Sheeting 4×8 above 7/12',              unit: 'EA', price: 13 },
  { id: 'sheet_clips',       section: 'steep', group: 'Decking',      name: 'Clips for sheeting 4×8',               unit: 'EA', price: 2 },
  { id: 'sheet_stuck_iw',    section: 'steep', group: 'Decking',      name: 'Stuck I&W sheeting 4×8',               unit: 'EA', price: 5 },
  { id: 'pine_1x',           section: 'steep', group: 'Decking',      name: '1× pine board replaced',               unit: 'FT', price: 1 },
  { id: 'trim_1x',           section: 'steep', group: 'Trim',         name: '1× trim boards (drip cap, step incl.)',unit: 'FT', price: 11 },
  { id: 'gutter_guard_to',   section: 'steep', group: 'Misc',         name: 'Gutter guard tear off',                unit: 'FT', price: 0.4 },
  { id: 'ladder_shingles',   section: 'steep', group: 'Misc',         name: 'Ladder shingles from ground',          unit: 'SQ', price: 5 },
  { id: 'labor_hr_steep',    section: 'steep', group: 'Misc',         name: 'Labor hours',                          unit: 'EA', price: 50 },
  // FLAT / LOW SLOPE
  { id: 'flintlastic',       section: 'flat',  group: 'Flat install', name: 'Flintlastic SA System (1 LTO incl.)',  unit: 'SQ', price: 150,  linked: 'area_flat', calc: (m) => M(m,'area_flat') },
  { id: 'tearoff_add_flat',  section: 'flat',  group: 'Tear off',     name: 'Tear off additional layer',            unit: 'SQ', price: 10 },
  { id: 'pipe_boot_flat',    section: 'flat',  group: 'Penetrations', name: 'Pipe boot',                            unit: 'EA', price: 25 },
  { id: 'iso_board',         section: 'flat',  group: 'Decking',      name: 'ISO or fiber board',                   unit: 'EA', price: 15 }
];

// ─── SIDING MATERIAL CATALOG (2026) ───────────────────────────────
const SIDING_MATERIALS = [
  { id: 'house_wrap',        group: 'Underlayment',  name: "House Wrap 9'×150'",                   unit: 'Roll', price: 116,   linked: 'siding_area', calc: (m) => ceil(sq2sf(M(m,'siding_area')) / 1350) },
  { id: 'fanfold',           group: 'Underlayment',  name: '3/8″ Fanfold 2sq/bndl',                unit: 'Bndl', price: 60 },
  { id: 'wrap_tape',         group: 'Underlayment',  name: "House Wrap Tape 2″ × 165'",            unit: 'Roll', price: 18 },
  { id: 'window_tape',       group: 'Underlayment',  name: "Window Tape 6″ × 75'",                 unit: 'Roll', price: 41,    linked: 'windows', calc: (m) => ceil(M(m,'windows') / 3) },
  { id: 'starter_strip',     group: 'Accessories',   name: 'Starter Strip 4″',                     unit: 'PC',   price: 12 },
  { id: 't50_staples_s',     group: 'Accessories',   name: 'T-50 Staples',                         unit: 'Box',  price: 10 },
  { id: 'nail_134_5',        group: 'Accessories',   name: '1-3/4″ Siding Nails (5 lb)',           unit: 'Box',  price: 16 },
  { id: 'nail_134_25',       group: 'Accessories',   name: '1-3/4″ Siding Nails (25 lb)',          unit: 'Box',  price: 84 },
  { id: 'osb_716_s',         group: 'Accessories',   name: '7/16 OSB',                             unit: 'PC',   price: 12 },
  { id: 'caulk',             group: 'Accessories',   name: 'Caulk',                                unit: 'PC',   price: 9.5 },
  // Trim goods
  { id: 'garage_strip',      group: 'Trim',          name: 'Garage Door Weather Strip 16′',        unit: 'PC',   price: 23,    linked: 'garage_doors', calc: (m) => M(m,'garage_doors') },
  { id: 'drip_cap_1',        group: 'Trim',          name: 'Drip Cap White 1″',                    unit: 'PC',   price: 11 },
  { id: 'cortex_50',         group: 'Trim',          name: 'Cortex Screws/Plugs 50 Lnf',           unit: 'BX',   price: 44 },
  { id: 'cortex_250',        group: 'Trim',          name: 'Cortex Screws/Plugs 250 Lnf',          unit: 'BX',   price: 194 },
  { id: 'drip_cap_114',      group: 'Trim',          name: 'Drip Cap White 1-1/4″',                unit: 'PC',   price: 13 },
  { id: 'pvc_1x4',           group: 'PVC Trim',      name: 'PVC Trim 1″×4″×18′',                   unit: 'PC',   price: 38 },
  { id: 'pvc_1x6',           group: 'PVC Trim',      name: 'PVC Trim 1″×6″×18′',                   unit: 'PC',   price: 60 },
  { id: 'pvc_1x8',           group: 'PVC Trim',      name: 'PVC Trim 1″×8″×18′',                   unit: 'PC',   price: 79 },
  { id: 'pvc_1x10',          group: 'PVC Trim',      name: 'PVC Trim 1″×10″×18′',                  unit: 'PC',   price: 100 },
  { id: 'pvc_1x12',          group: 'PVC Trim',      name: 'PVC Trim 1″×12″×18′',                  unit: 'PC',   price: 122 },
  { id: 'pvc_54_4',          group: 'PVC Trim',      name: 'PVC Trim 5/4″×4″×18′',                 unit: 'PC',   price: 49 },
  { id: 'pvc_54_6',          group: 'PVC Trim',      name: 'PVC Trim 5/4″×6″×18′',                 unit: 'PC',   price: 78 },
  { id: 'pvc_54_8',          group: 'PVC Trim',      name: 'PVC Trim 5/4″×8″×18′',                 unit: 'PC',   price: 102 },
  { id: 'pvc_54_10',         group: 'PVC Trim',      name: 'PVC Trim 5/4″×10″×18′',                unit: 'PC',   price: 132 },
  { id: 'pvc_54_12',         group: 'PVC Trim',      name: 'PVC Trim 5/4″×12″×18′',                unit: 'PC',   price: 160 },
  { id: 'pvc_sheet_12',      group: 'PVC Trim',      name: 'PVC Sheet 4′×8′ 1/2″',                 unit: 'PC',   price: 176 },
  { id: 'pvc_sheet_58',      group: 'PVC Trim',      name: 'PVC Sheet 5/8″ 4′×8′',                 unit: 'PC',   price: 334 },
  // Aluminum goods
  { id: 'alum_coil_sm',      group: 'Aluminum',      name: 'Trim Coil — Smooth',                   unit: 'Roll', price: 155 },
  { id: 'alum_coil_nm',      group: 'Aluminum',      name: 'Trim Coil — No-Mar',                   unit: 'Roll', price: 197 },
  { id: 'alum_coil_pvc',     group: 'Aluminum',      name: 'Trim Coil — PVC',                      unit: 'Roll', price: 178 },
  { id: 'alum_nail_134',     group: 'Aluminum',      name: '1-3/4″ Trim Nails (1 lb)',             unit: 'Box',  price: 19 },
  { id: 'fascia_4',          group: 'Aluminum',      name: '4″ Fascia (Ribbed/Woodgrain)',         unit: 'PC',   price: 21.1 },
  { id: 'fascia_6',          group: 'Aluminum',      name: '6″ Fascia (Ribbed/Woodgrain)',         unit: 'PC',   price: 23.75,  linked: 'eaves_fascia', calc: (m) => ceil((M(m,'eaves_fascia')+M(m,'rakes_fascia')) / 12) },
  { id: 'fascia_8',          group: 'Aluminum',      name: '8″ Fascia (Ribbed/Woodgrain)',         unit: 'PC',   price: 26 },
  { id: 'soffit_solid',      group: 'Aluminum',      name: 'Solid Soffit',                         unit: 'PC',   price: 33.5 },
  { id: 'soffit_vented',     group: 'Aluminum',      name: 'Vented Soffit',                        unit: 'PC',   price: 33.5,   linked: 'soffit_area', calc: (m) => ceil(M(m,'soffit_area') / 16) },
  { id: 'jchan_alum_38',     group: 'Aluminum',      name: 'Aluminum 3/8″ J-Channel',              unit: 'PC',   price: 10.4 },
  { id: 'fchan_alum',        group: 'Aluminum',      name: 'Aluminum F-Channel',                   unit: 'PC',   price: 18.2 },
  // Royal vinyl
  { id: 'royal_crest_l',     group: 'Royal Vinyl',   name: 'Royal Crest .040 D4 — Light',          unit: 'SQ',   price: 78,    linked: 'siding_area', calc: (m) => ceil(M(m,'siding_area') * W(m)) },
  { id: 'royal_crest_m',     group: 'Royal Vinyl',   name: 'Royal Crest .040 D4 — Medium',         unit: 'SQ',   price: 86 },
  { id: 'royal_res_l',       group: 'Royal Vinyl',   name: 'Royal Residential .042 D4 — Light',    unit: 'SQ',   price: 87 },
  { id: 'royal_res_m',       group: 'Royal Vinyl',   name: 'Royal Residential .042 D4 — Medium',   unit: 'SQ',   price: 87 },
  { id: 'royal_est_l',       group: 'Royal Vinyl',   name: 'Royal Estate .044 — Light',            unit: 'SQ',   price: 100 },
  { id: 'royal_est_m',       group: 'Royal Vinyl',   name: 'Royal Estate .044 — Medium',           unit: 'SQ',   price: 100 },
  { id: 'royal_est_d',       group: 'Royal Vinyl',   name: 'Royal Estate .044 — Dark',             unit: 'SQ',   price: 112 },
  { id: 'royal_bb_l',        group: 'Royal Vinyl',   name: 'Board & Batten 17pcs/sq — Light',      unit: 'SQ',   price: 140 },
  { id: 'royal_bb_m',        group: 'Royal Vinyl',   name: 'Board & Batten 17pcs/sq — Mid',        unit: 'SQ',   price: 152 },
  { id: 'royal_bb_p',        group: 'Royal Vinyl',   name: 'Board & Batten 17pcs/sq — Premium',    unit: 'SQ',   price: 163 },
  { id: 'foundry_shake',     group: 'Royal Vinyl',   name: 'Foundry Shakes Split/Stag 7″',         unit: 'SQ',   price: 395 },
  { id: 'jchan_58_l',        group: 'Royal Vinyl',   name: '5/8″ J-Channel — Light',               unit: 'PC',   price: 4.85 },
  { id: 'jchan_58_m',        group: 'Royal Vinyl',   name: '5/8″ J-Channel — Medium',              unit: 'PC',   price: 5.3 },
  { id: 'jchan_58_d',        group: 'Royal Vinyl',   name: '5/8″ J-Channel — Dark',                unit: 'PC',   price: 5.1 },
  { id: 'jchan_78_l',        group: 'Royal Vinyl',   name: '7/8″ J-Channel — Light',               unit: 'PC',   price: 7.55 },
  { id: 'jchan_78_m',        group: 'Royal Vinyl',   name: '7/8″ J-Channel — Medium',              unit: 'PC',   price: 7.25 },
  { id: 'jchan_78_d',        group: 'Royal Vinyl',   name: '7/8″ J-Channel — Dark',                unit: 'PC',   price: 7.8 },
  { id: 'finish_trim',       group: 'Royal Vinyl',   name: 'Finish Trim L/M/D',                    unit: 'PC',   price: 5.3 },
  { id: 'flex_jchan',        group: 'Royal Vinyl',   name: 'Flex J-Channel 13/16″',                unit: 'PC',   price: 27 },
  { id: 'inside_corner',     group: 'Royal Vinyl',   name: 'Inside Corner Post (L/M/D)',           unit: 'PC',   price: 17,    linked: 'inside_corners', calc: (m) => ceil(M(m,'inside_corners') / 12) },
  { id: 'outside_corner',    group: 'Royal Vinyl',   name: 'Outside Corner Post (L/M/D)',          unit: 'PC',   price: 16,    linked: 'outside_corners', calc: (m) => ceil(M(m,'outside_corners') / 12) },
  { id: 'bay_corner',        group: 'Royal Vinyl',   name: '3/4″ Bay Corner Post — White',         unit: 'PC',   price: 31 },
  { id: 'light_block',       group: 'Royal Vinyl',   name: 'Light Block 7″×8″',                    unit: 'PC',   price: 12,    linked: 'exterior_lights', calc: (m) => M(m,'exterior_lights') },
  { id: 'jumbo_mount',       group: 'Royal Vinyl',   name: 'Jumbo Mount Block 8″×10″',             unit: 'PC',   price: 21 },
  { id: 'split_mini',        group: 'Royal Vinyl',   name: 'Split Mini Block',                     unit: 'PC',   price: 13 },
  { id: 'dryer_vent_4',      group: 'Royal Vinyl',   name: 'Hooded Dryer Vent 4″',                 unit: 'PC',   price: 22 },
  { id: 'dryer_vent_6',      group: 'Royal Vinyl',   name: 'Hooded Dryer Vent 6″',                 unit: 'PC',   price: 56 },
  { id: 'louvered_6',        group: 'Royal Vinyl',   name: 'Louvered Exhaust Vent 6″',             unit: 'PC',   price: 19 },
  { id: 'intake_exhaust',    group: 'Royal Vinyl',   name: 'Intake / Exhaust',                     unit: 'PC',   price: 31 },
  { id: 'gable_vent_12_18',  group: 'Royal Vinyl',   name: 'Gable Vent 12″×18″',                   unit: 'PC',   price: 45,    linked: 'gable_vents', calc: (m) => M(m,'gable_vents') },
  { id: 'gable_vent_18_24',  group: 'Royal Vinyl',   name: 'Gable Vent 18″×24″',                   unit: 'PC',   price: 69 }
];

// ─── SIDING LABOR CATALOG (10/01/24 sheet) ────────────────────────
const SIDING_LABOR = [
  { id: 'siding_std',        section: 'main', group: 'Install',     name: 'Standard vinyl siding install',         unit: 'SQ',   price: 145,  linked: 'siding_area', calc: (m) => M(m,'siding_area') },
  { id: 'siding_bb',         section: 'main', group: 'Install',     name: 'B & B install',                         unit: 'SQ',   price: 155 },
  { id: 'siding_shake',      section: 'main', group: 'Install',     name: 'Vinyl shake install',                   unit: 'SQ',   price: 155 },
  { id: 'siding_ascend',     section: 'main', group: 'Install',     name: 'Alside Ascend',                         unit: 'SQ',   price: 190 },
  { id: 'siding_ascend_bb',  section: 'main', group: 'Install',     name: 'Alside Ascend B & B',                   unit: 'SQ',   price: 200 },
  { id: 'wrap_install',      section: 'main', group: 'Underlayment',name: 'House wrap install',                    unit: 'SQ',   price: 30,   linked: 'siding_area', calc: (m) => M(m,'siding_area') },
  { id: 'fanfold_install',   section: 'main', group: 'Underlayment',name: 'Fanfold / foam board install 1/4″',     unit: 'SQ',   price: 35 },
  { id: 'tearoff_vinyl',     section: 'main', group: 'Tear off',    name: 'Tear off vinyl / aluminum',             unit: 'SQ',   price: 20 },
  { id: 'tearoff_wood',      section: 'main', group: 'Tear off',    name: 'Tear off wood',                         unit: 'SQ',   price: 50 },
  { id: 'tearoff_stone',     section: 'main', group: 'Tear off',    name: 'Tear off stone',                        unit: 'SQ',   price: 50 },
  { id: 'j_block',           section: 'main', group: 'Accessories', name: 'J-block',                               unit: 'EA',   price: 5 },
  { id: 'dryer_vent_lbr',    section: 'main', group: 'Accessories', name: 'Dryer vent',                            unit: 'EA',   price: 5 },
  { id: 'exh_intake_lbr',    section: 'main', group: 'Accessories', name: 'Exhaust / intake vent',                 unit: 'EA',   price: 5 },
  { id: 'split_block_lbr',   section: 'main', group: 'Accessories', name: 'Split block',                           unit: 'EA',   price: 5 },
  { id: 'ext_lights',        section: 'main', group: 'Accessories', name: 'Exterior lights',                       unit: 'EA',   price: 20,   linked: 'exterior_lights', calc: (m) => M(m,'exterior_lights') },
  { id: 'gable_vent_lbr',    section: 'main', group: 'Accessories', name: 'Gable vent',                            unit: 'EA',   price: 10,   linked: 'gable_vents', calc: (m) => M(m,'gable_vents') },
  { id: 'prebent_fascia',    section: 'main', group: 'Fascia/Soffit',name:'Prebent fascia (tear off / install)',   unit: 'FT',   price: 2,    linked: 'eaves_fascia', calc: (m) => M(m,'eaves_fascia') + M(m,'rakes_fascia') },
  { id: 'soffit_124',        section: 'main', group: 'Fascia/Soffit',name:'Alum soffit 1″–24″',                    unit: 'FT',   price: 2 },
  { id: 'soffit_2536',       section: 'main', group: 'Fascia/Soffit',name:'Alum soffit 25″–36″',                   unit: 'FT',   price: 2.25 },
  { id: 'soffit_porch',      section: 'main', group: 'Fascia/Soffit',name:'Alum soffit — porch ceiling',           unit: 'SQFT', price: 2,    linked: 'soffit_area',  calc: (m) => M(m,'soffit_area') },
  { id: 'fascia_custom',     section: 'main', group: 'Fascia/Soffit',name:'Fascia — custom bent',                  unit: 'FT',   price: 3.75 },
  { id: 'pine_wrap',         section: 'main', group: 'Trim',        name: 'Pine board install to be wrapped',      unit: 'FT',   price: 1 },
  { id: 'primed_trim',       section: 'main', group: 'Trim',        name: 'Primed trim install',                   unit: 'FT',   price: 2 },
  { id: 'pvc_trim_install',  section: 'main', group: 'Trim',        name: 'PVC / pre-finished trim install',       unit: 'FT',   price: 3 },
  { id: 'pvc_plugs',         section: 'main', group: 'Trim',        name: 'PVC trim install w/ plugs & screws',    unit: 'FT',   price: 4.5 },
  { id: 'lineal_trim',       section: 'main', group: 'Trim',        name: 'Lineal trim',                           unit: 'FT',   price: 2 },
  { id: 'window_reg',        section: 'main', group: 'Openings',    name: 'Window wrap — regular',                 unit: 'EA',   price: 55,   linked: 'windows',      calc: (m) => M(m,'windows') },
  { id: 'window_xl',         section: 'main', group: 'Openings',    name: 'Window wrap — XL',                      unit: 'EA',   price: 70 },
  { id: 'door_wrap',         section: 'main', group: 'Openings',    name: 'Door wrap',                             unit: 'EA',   price: 65,   linked: 'doors',        calc: (m) => M(m,'doors') },
  { id: 'garage_single',     section: 'main', group: 'Openings',    name: 'Garage door wrap (w/ weather strip)',   unit: 'EA',   price: 150,  linked: 'garage_doors', calc: (m) => M(m,'garage_doors') },
  { id: 'garage_dbl',        section: 'main', group: 'Openings',    name: 'Garage door — double stall (w/ strip)', unit: 'EA',   price: 170 },
  { id: 'trim_custom',       section: 'main', group: 'Trim',        name: 'Trim — custom bent',                    unit: 'FT',   price: 3 },
  { id: 'bird_box',          section: 'main', group: 'Misc',        name: 'Bird box — custom',                     unit: 'EA',   price: 20 },
  { id: 'column_wrap',       section: 'main', group: 'Misc',        name: 'Column — alum wrap / PVC trim',         unit: 'EA',   price: 100 },
  { id: 'beam_wrap',         section: 'main', group: 'Misc',        name: 'Beams — aluminum wrap',                 unit: 'FT',   price: 10 },
  { id: 'wood_sheet',        section: 'main', group: 'Decking',     name: 'Sheet of wood replaced',                unit: 'EA',   price: 15 },
  { id: 'gutter_to',         section: 'main', group: 'Misc',        name: 'Gutter tear off',                       unit: 'FT',   price: 0.4 },
  { id: 'shutter_rem',       section: 'main', group: 'Accessories', name: 'Shutter removal / set',                 unit: 'EA',   price: 10,   linked: 'shutters_sets', calc: (m) => M(m,'shutters_sets') },
  { id: 'shutter_install',   section: 'main', group: 'Accessories', name: 'Shutter install / set',                 unit: 'EA',   price: 40,   linked: 'shutters_sets', calc: (m) => M(m,'shutters_sets') },
  { id: 'labor_hr_siding',   section: 'main', group: 'Misc',        name: 'Labor hours',                           unit: 'PER',  price: 50 }
];

// ─── ROOFING EQUIPMENT CATALOG ───────────────────────────────────
const ROOFING_EQUIPMENT = [
  { id: 're_dump_trailer',  group: 'Hauling',    name: 'Dump trailer (per pull)',     unit: 'EA',  price: 175 },
  { id: 're_ext_ladder',    group: 'Access',     name: 'Extension ladder set',        unit: 'DAY', price: 35 },
  { id: 're_roof_jacks',    group: 'Access',     name: 'Roof jacks + 2×8 planks',     unit: 'SET', price: 45 },
  { id: 're_harness',       group: 'Safety',     name: 'Harness + anchor kit',        unit: 'EA',  price: 25 },
  { id: 're_tarps',         group: 'Site prep',  name: 'Tarps / coverings',           unit: 'EA',  price: 18 },
  { id: 're_magnet',        group: 'Site prep',  name: 'Magnetic sweep (rolling)',    unit: 'DAY', price: 30 },
  { id: 're_compressor',    group: 'Tools',      name: 'Compressor + nailers',        unit: 'DAY', price: 65 },
  { id: 're_lift',          group: 'Access',     name: 'Boom / lift rental',          unit: 'DAY', price: 425, linked: 'stories', calc: (m) => M(m,'stories') >= 3 ? 1 : 0 }
];

// ─── ROOFING DISPOSAL CATALOG ────────────────────────────────────
const ROOFING_DISPOSAL = [
  { id: 'rd_dumpster_20', group: 'Containers', name: 'Dumpster — 20 yd',            unit: 'EA',  price: 425,  linked: 'area', calc: (m) => M(m,'area') <= 30 ? 1 : 0 },
  { id: 'rd_dumpster_30', group: 'Containers', name: 'Dumpster — 30 yd',            unit: 'EA',  price: 525,  linked: 'area', calc: (m) => M(m,'area') > 30 ? 1 : 0 },
  { id: 'rd_tonnage',     group: 'Tipping',    name: 'Tonnage overage',             unit: 'TON', price: 85,   linked: 'area', calc: (m) => ceil(M(m,'area') * 0.18) },
  { id: 'rd_landfill',    group: 'Tipping',    name: 'Landfill tipping fee',        unit: 'EA',  price: 95 },
  { id: 'rd_haul_trip',   group: 'Hauling',    name: 'Hauling (per trip)',          unit: 'EA',  price: 145 }
];

// ─── SIDING EQUIPMENT CATALOG ────────────────────────────────────
const SIDING_EQUIPMENT = [
  { id: 'se_scaffold',     group: 'Access',    name: 'Scaffolding (per side)',      unit: 'SIDE', price: 145 },
  { id: 'se_ext_ladder',   group: 'Access',    name: 'Extension ladder set',        unit: 'DAY',  price: 35 },
  { id: 'se_brake',        group: 'Tools',     name: 'Siding brake rental',         unit: 'DAY',  price: 55 },
  { id: 'se_compressor',   group: 'Tools',     name: 'Compressor + coil nailer',    unit: 'DAY',  price: 65 },
  { id: 'se_lift',         group: 'Access',    name: 'Boom / lift rental',          unit: 'DAY',  price: 425, linked: 'stories', calc: (m) => M(m,'stories') >= 3 ? 1 : 0 },
  { id: 'se_tarps',        group: 'Site prep', name: 'Tarps / coverings',           unit: 'EA',   price: 18 },
  { id: 'se_magnet',       group: 'Site prep', name: 'Magnetic sweep',              unit: 'DAY',  price: 30 }
];

// ─── SIDING DISPOSAL CATALOG ─────────────────────────────────────
const SIDING_DISPOSAL = [
  { id: 'sd_dumpster_15', group: 'Containers', name: 'Dumpster — 15 yd',            unit: 'EA',  price: 375,  linked: 'siding_area', calc: () => 1 },
  { id: 'sd_dumpster_20', group: 'Containers', name: 'Dumpster — 20 yd',            unit: 'EA',  price: 425 },
  { id: 'sd_tonnage',     group: 'Tipping',    name: 'Tonnage overage',             unit: 'TON', price: 85 },
  { id: 'sd_haul_trip',   group: 'Hauling',    name: 'Hauling (per trip)',          unit: 'EA',  price: 145 }
];

// ─── Catalogs by envelope/section ──────────────────────────────
const CATALOGS = {
  roofing: { materials: ROOFING_MATERIALS, labor: ROOFING_LABOR, equipment: ROOFING_EQUIPMENT, disposal: ROOFING_DISPOSAL },
  siding:  { materials: SIDING_MATERIALS,  labor: SIDING_LABOR,  equipment: SIDING_EQUIPMENT,  disposal: SIDING_DISPOSAL  }
};

// ─── Seed measurements (mock Hover report for current appt) ────
// Numbers loosely follow the Hudsonville Hover sample so the demo feels real.
const SEED_MEASUREMENTS = {
  roofing: {
    area: 34.9, area_steep: 30.1, area_flat: 4.8, pitch: '8/12',
    eaves: 248, rakes: 155, ridge: 120, hip: 80, valley: 100,
    step_flashing: 77, apron_flashing: 58, drip_edge: 403,
    pipe_boots: 4, box_vents: 5, bath_vents: 2, skylights: 0, chimneys: 1,
    stories: 2, waste_pct: 12
  },
  siding: {
    siding_area: 23, openings_area: 529, trim_area: 171,
    windows: 14, doors: 3, garage_doors: 1,
    inside_corners: 57, outside_corners: 128,
    eaves_fascia: 248, rakes_fascia: 155, level_frieze: 237, sloped_frieze: 144,
    soffit_area: 691, gable_vents: 0, shutters_sets: 0, exterior_lights: 4,
    waste_pct: 10
  },
  gutters: { gutter_lf: 249, downspouts: 5, downspout_lf: 70, guards_lf: 0 },
  windoors: { windows: 14, doors: 3, sliders: 1 },
  attic:    { attic_area: 1820, insulation_r: 30, insulation_depth: 9, soffit_vents: 12, ridge_vent_lf: 48, bath_fans_vented: 2 }
};

// Initial line items per envelope — only auto-linked items with non-zero
// calculated qty are pre-included so the rep sees a populated estimate
// immediately, but the list isn't bloated with every catalog item.
// Build the initial line-item list for an envelope. We populate the FULL
// catalog (every material and labor line) so the rep sees the complete
// envelope take-off — linked items pre-fill qty from measurements, unlinked
// items start at 0 and the rep adjusts as needed. The rep can still remove
// any line they don't want.
function deriveInitialLineItems(envelopeId, measurements) {
  if (!CATALOGS[envelopeId]) return { materials: [], labor: [], equipment: [], disposal: [] };
  const out = { materials: [], labor: [], equipment: [], disposal: [] };
  for (const sec of ['materials', 'labor', 'equipment', 'disposal']) {
    const cat = CATALOGS[envelopeId][sec] || [];
    for (const it of cat) {
      const q = autoQtyFor(it, measurements);
      out[sec].push({ id: it.id, qty: q != null ? q : 0 });
    }
  }
  return out;
}

// Measurements start EMPTY. Aerial values live on `aerial` so the rep can
// reference them, apply all at once, or apply per-field. On partial-scope
// jobs (e.g. partial roof) the aerial totals stay informational only.
const SEED_ENVELOPE = {
  roofing: {
    source: 'hover', sourceId: 'HV-7024146', linkedAt: 'Today · 8:42 AM',
    aerial: SEED_MEASUREMENTS.roofing,
    measurements: {},
    lineItems: deriveInitialLineItems('roofing', SEED_MEASUREMENTS.roofing)
  },
  siding: {
    source: 'hover', sourceId: 'HV-7024146', linkedAt: 'Today · 8:42 AM',
    aerial: SEED_MEASUREMENTS.siding,
    measurements: {},
    lineItems: deriveInitialLineItems('siding', SEED_MEASUREMENTS.siding)
  },
  gutters: {
    source: 'hover', sourceId: 'HV-7024146', linkedAt: 'Today · 8:42 AM',
    aerial: SEED_MEASUREMENTS.gutters,
    measurements: {}
  },
  windoors: {
    source: 'hover', sourceId: 'HV-7024146', linkedAt: 'Today · 8:42 AM',
    aerial: SEED_MEASUREMENTS.windoors,
    measurements: {}
  },
  attic: {
    source: 'manual', sourceId: null, linkedAt: null,
    aerial: SEED_MEASUREMENTS.attic,
    measurements: {}
  }
};

// ─── Pricing helpers ─────────────────────────────────────────
// Given a catalog entry + envelope measurements, return the auto qty (or null if not linked).
function autoQtyFor(item, measurements) {
  if (!item.calc) return null;
  try { return item.calc(measurements || {}); } catch (e) { return null; }
}

// Find catalog entry by id within an envelope's catalogs (materials/labor/equipment/disposal).
function findCatalog(envelopeId, section, id) {
  const cat = CATALOGS[envelopeId];
  if (!cat) return null;
  if (cat[section]) return cat[section].find((x) => x.id === id) || null;
  return null;
}

function fmtMoney(n) {
  if (n == null || isNaN(n)) return '$0';
  const v = Math.round(n);
  return '$' + v.toLocaleString();
}
function fmtMoneyExact(n) {
  if (n == null || isNaN(n)) return '$0.00';
  return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

Object.assign(window, {
  REPORT_SOURCES, ENVELOPE_FACETS, MEASUREMENT_SCHEMA, CATALOGS,
  ROOFING_MATERIALS, ROOFING_LABOR, SIDING_MATERIALS, SIDING_LABOR,
  SEED_ENVELOPE, SEED_MEASUREMENTS, deriveInitialLineItems,
  autoQtyFor, findCatalog, fmtMoney, fmtMoneyExact
});
