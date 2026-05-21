/* global React */
// Shared icons + mock data for IHS Selling Way

const Icon = {
  home: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>,
  cal: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>,
  user: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>,
  cog: (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.55 1.7 1.7 0 00-1.87.34l-.06.06A2 2 0 113.18 16.9l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.55-1.1 1.7 1.7 0 00-.34-1.87l-.06-.06A2 2 0 117.1 3.18l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.55V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.55 1H22a2 2 0 110 4h-.1a1.7 1.7 0 00-1.55 1z" /></svg>,
  cam: (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 17a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2v9z" /><circle cx="12" cy="13" r="4" /></svg>,
  mic: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>,
  check: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 6L9 17l-5-5" /></svg>,
  x: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6L6 18M6 6l12 12" /></svg>,
  arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  back: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>,
  plus: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14" /></svg>,
  pin: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-7.6 8-13a8 8 0 10-16 0c0 5.4 8 13 8 13z" /><circle cx="12" cy="9" r="3" /></svg>,
  clock: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  trend: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>,
  alert: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="10" /></svg>,
  pen: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>,
  keyboard: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" /></svg>,
  swap: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4" /></svg>,
  eraser: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 20H7L3 16a2 2 0 010-2.83L13.17 3a2 2 0 012.83 0L21 8a2 2 0 010 2.83L11 21" /><path d="M14 7l3 3" /></svg>,
  grip: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><circle cx="9" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>,
  mail: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></svg>,
  flash: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>,
  search: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>,
  list: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>,
  grid: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  shield: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  undo: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7v6h6" /><path d="M3 13a9 9 0 109-6" /></svg>,
  trash: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  building: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" /></svg>,
  copy: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>,
  more: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></svg>,
  chev: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9" /></svg>,
  phone: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.79a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.29-1.29a2 2 0 012.11-.45c.89.35 1.83.59 2.79.72A2 2 0 0122 16.92z" /></svg>,
  sms: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
  handshake: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 13l5-5 3 3 7-7 3 3-7 7 3 3-5 5-9-9z" /></svg>,
  directions: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12,2 22,22 12,17 2,22" /></svg>,
  star: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  sparkles: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M5 12H1M23 12h-4M5.6 5.6L8.4 8.4M15.6 15.6l2.8 2.8M5.6 18.4L8.4 15.6M15.6 8.4l2.8-2.8" /></svg>
};

// ─── Brands ───────────────────────────────────
const BRANDS = {
  skywalker: {
    id: 'skywalker',
    name: 'Skywalker Roofing',
    short: 'Skywalker',
    initials: 'SW',
    tagline: 'Heart, mind, attitude of service.',
    license: 'NC-GC 73344',
    phone: '(336) 627-5596',
    region: 'North Carolina · Virginia'
  },
  valentine: {
    id: 'valentine',
    name: 'Valentine Roofing',
    short: 'Valentine',
    initials: 'VR',
    tagline: 'The Valentine Experience.',
    license: 'WA-VALENR*852KH',
    phone: '(206) 766-3464',
    region: 'Puget Sound · Seattle'
  }
};

// ─── Mock appointments (rich data set) ────────
const APPOINTMENTS = [
{ id: 'A-1041', customer: 'Marcus & Renée Whittaker', address: '4421 Bluffwood Ln, Cedar Park, TX 78613', when: 'Today · 10:30 AM', date: '2026-04-28T10:30', trade: 'Roofing', status: 'next', leadSource: 'Storm — Apr 12 hail', notes: '2-story, 28 sq, hail damage suspected. Insurance: State Farm.', est: '$32–48k' },
{ id: 'A-1042', customer: 'Yolanda Pierce', address: '812 Honey Locust Dr, Round Rock, TX 78664', when: 'Today · 2:00 PM', date: '2026-04-28T14:00', trade: 'Roofing', status: 'upcoming', leadSource: 'Door knock', notes: 'Single-story ranch, 19 sq. Aged 3-tab.', est: '$18–26k' },
{ id: 'A-1043', customer: 'Devon & Allie Park', address: '177 Old Mesquite Tr, Leander, TX 78641', when: 'Tomorrow · 9:00 AM', date: '2026-04-29T09:00', trade: 'Roofing', status: 'upcoming', leadSource: 'Referral — Whittaker', notes: 'Walk for inspection. Decking concerns from neighbor.', est: '$24–36k' },
{ id: 'A-1044', customer: 'Sandra Kowalczyk', address: '6610 Greystone Ct, Pflugerville, TX 78660', when: 'Tomorrow · 1:30 PM', date: '2026-04-29T13:30', trade: 'Gutters', status: 'upcoming', leadSource: 'Web form', notes: 'Add 6" K-style. ~180 lf.', est: '$3.2–4.8k' },
{ id: 'A-1044b', customer: 'Priya Ramaswamy', address: '533 Wildflower Run, Cedar Park, TX 78613', when: 'Tomorrow · 4:00 PM', date: '2026-04-29T16:00', trade: 'Roofing', status: 'upcoming', leadSource: 'Door knock', notes: 'Storm follow-up. Two layers, wants tear-off quote.', est: '$26–34k' },
{ id: 'A-1045', customer: 'Ben Trujillo', address: '2245 Comanche Pl, Austin, TX 78745', when: 'Thu · 11:00 AM', date: '2026-04-30T11:00', trade: 'Roofing', status: 'upcoming', leadSource: 'Storm — Apr 12 hail', notes: 'Detached garage included. ~24 sq total.', est: '$22–34k' },
{ id: 'A-1046', customer: 'Aiyana Cross', address: '88 Westoak Cir, Buda, TX 78610', when: 'Thu · 3:15 PM', date: '2026-04-30T15:15', trade: 'Siding', status: 'upcoming', leadSource: 'Referral', notes: 'Rear elevation only. James Hardie quote.', est: '$11–15k' },
{ id: 'A-1047', customer: 'The Hadid Trust', address: '901 Lariat Loop, Lakeway, TX 78734', when: 'Fri · 9:30 AM', date: '2026-05-01T09:30', trade: 'Roofing', status: 'upcoming', leadSource: 'Property mgmt', notes: 'Tile re-lay, multi-elevation.', est: '$58–72k' },
{ id: 'A-1048', customer: 'Reggie & Mae Quinn', address: '14 Cottonbloom Way, Hutto, TX 78634', when: 'Fri · 2:00 PM', date: '2026-05-01T14:00', trade: 'Roofing', status: 'upcoming', leadSource: 'Storm — Apr 12 hail', notes: 'Adjuster met yesterday. Have ITEL report.', est: '$28–40k' }];


// ─── Inspection categories ────────────────────
const INSPECTION_CATEGORIES = [
{ id: 'roof_system', label: 'Roof System', sub: 'Field, ridges, hips, valleys', required: 4, icon: 'building' },
{ id: 'penetrations', label: 'Penetrations', sub: 'Vents, stacks, skylights', required: 2, icon: 'building' },
{ id: 'flashing', label: 'Flashing', sub: 'Step, counter, drip edge', required: 2, icon: 'building' },
{ id: 'gutters', label: 'Gutters & Downspouts', sub: 'Capacity & condition', required: 1, icon: 'building' },
{ id: 'ventilation', label: 'Ventilation', sub: 'Intake & exhaust balance', required: 1, icon: 'building' },
{ id: 'fascia', label: 'Fascia & Soffit', sub: 'Trim & underside', required: 1, icon: 'building' },
{ id: 'attic', label: 'Attic / Decking', sub: 'Interior view, decking integrity', required: 2, icon: 'building' }];


// ─── Sample inspection items already captured (for demo of in-progress state)
// Empty on load so the prototype mimics a real appointment kickoff.
// (Craig, May '26.)
const SEED_INSPECTION_ITEMS = [];


// ─── Quote tiers ──────────────────────────────
const TIERS = [
{
  id: 'good',
  name: 'Standard',
  label: 'Good',
  summary: 'Owens Corning TruDef Duration · 30-yr architectural · 5-yr workmanship',
  warranty: '30-year manufacturer · 5-year workmanship',
  materials: 'OC TruDef Duration shingles · Synthetic underlayment · Lead boots',
  inclusions: [
  'Tear-off existing single layer',
  'Synthetic underlayment full deck',
  'OC TruDef Duration architectural shingles',
  'Replace plumbing boots & pipe flashings',
  'Re-set step flashing where reusable',
  '5-year workmanship warranty'],

  exclusions: ['Decking replacement beyond 2 sheets', 'Skylight replacement', 'Gutter work'],
  addonsAvailable: ['Decking — additional sheets', 'Ridge vent upgrade', 'Ice & water shield — full']
},
{
  id: 'better',
  name: 'Premium',
  label: 'Better',
  summary: 'OC Duration Designer · Class 4 impact-resistant · 10-yr workmanship',
  warranty: '50-year manufacturer · 10-year workmanship',
  materials: 'OC Duration Designer · Synthetic underlay + valley I&W · Aluminum step flashing',
  inclusions: [
  'Everything in Standard',
  'Owens Corning Duration Designer (Class 4 IR)',
  'Ice & water shield in valleys + eaves',
  'Aluminum step + counter flashing replacement',
  'Ridge vent system (continuous)',
  '10-year workmanship warranty'],

  exclusions: ['Decking replacement beyond 4 sheets', 'Skylight glass/lens replacement'],
  addonsAvailable: ['Skylight replacement', 'Solar attic fans', 'Decking — additional sheets'],
  recommended: true
},
{
  id: 'best',
  name: 'Signature',
  label: 'Best',
  summary: 'OC Berkshire Collection · Lifetime workmanship · Full I&W deck',
  warranty: 'Lifetime manufacturer · Lifetime transferable workmanship',
  materials: 'OC Berkshire Collection (luxury) · Full deck I&W · Copper flashings',
  inclusions: [
  'Everything in Premium',
  'Owens Corning Berkshire Collection',
  'Ice & water shield — entire deck',
  'Copper step + counter flashing',
  'Designer ridge cap',
  'Lifetime transferable workmanship',
  'Annual courtesy inspection (3 years)'],

  exclusions: [],
  addonsAvailable: ['Skylight replacement', 'Solar attic fans', 'Snow guards']
}];


// ─── Line items (used in quote line-by-line view)
const LINE_ITEMS = [
{ code: 'TEAR-1L', label: 'Tear-off — single layer', qty: 28, unit: 'sq', good: 95, better: 95, best: 95 },
{ code: 'UNDLY-S', label: 'Synthetic underlayment', qty: 28, unit: 'sq', good: 32, better: 32, best: 32 },
{ code: 'IW-VAL', label: 'Ice & water shield — valleys', qty: 6, unit: 'roll', good: 0, better: 92, best: 92 },
{ code: 'IW-FULL', label: 'Ice & water shield — full deck', qty: 28, unit: 'sq', good: 0, better: 0, best: 78 },
{ code: 'SHGL-30', label: 'TruDef Duration architectural', qty: 28, unit: 'sq', good: 285, better: 0, best: 0 },
{ code: 'SHGL-IR', label: 'Duration Designer (Class 4)', qty: 28, unit: 'sq', good: 0, better: 365, best: 0 },
{ code: 'SHGL-LX', label: 'Berkshire Collection', qty: 28, unit: 'sq', good: 0, better: 0, best: 545 },
{ code: 'BOOT-PB', label: 'Plumbing boots — lead', qty: 4, unit: 'ea', good: 65, better: 65, best: 65 },
{ code: 'FLSH-AL', label: 'Aluminum step flashing', qty: 1, unit: 'job', good: 0, better: 480, best: 0 },
{ code: 'FLSH-CU', label: 'Copper step flashing', qty: 1, unit: 'job', good: 0, better: 0, best: 1280 },
{ code: 'VENT-RG', label: 'Continuous ridge vent', qty: 1, unit: 'job', good: 0, better: 380, best: 460 },
{ code: 'WMSP-5', label: '5-yr workmanship warranty', qty: 1, unit: 'job', good: 0, better: 0, best: 0 },
{ code: 'WMSP-10', label: '10-yr workmanship warranty', qty: 1, unit: 'job', good: 0, better: 0, best: 0 },
{ code: 'WMSP-LF', label: 'Lifetime workmanship warranty', qty: 1, unit: 'job', good: 0, better: 0, best: 0 }];


// ─── Sample customer (Whittaker — the live appointment)
const CUSTOMER = {
  name: 'Marcus & Renée Whittaker',
  email: 'marcus.whittaker@example.com',
  phone: '(512) 555-2284',
  address: '4421 Bluffwood Ln, Cedar Park, TX 78613',
  insurance: 'State Farm — Claim #SF-78813-26'
};

// ─── Authenticated rep (sourced from IDP per Integration Contract IDP-01) ────
// In prod this comes from the SSO session. Tweakable in mock for testing.
const REPS = {
  cole: {
    id: 'rep-cole-j',
    name: 'Cole Jankowicz',
    short: 'Cole',
    initials: 'CJ',
    email: 'cole.j@infinityhomeservices.com',
    brand: 'skywalker', // primary brand assignment from IDP
    role: 'general', // 'general' | 'senior'
    deviceId: 'IHS-P-441',
    deviceTablet: 'IHS-T-228'
  },
  rita: {
    id: 'rep-rita-v',
    name: 'Rita Valenzuela',
    short: 'Rita',
    initials: 'RV',
    email: 'rita.v@infinityhomeservices.com',
    brand: 'valentine',
    role: 'senior',
    deviceId: 'IHS-P-512',
    deviceTablet: 'IHS-T-309'
  }
};

// ─── Sync state (offline-first per NFR Spec OFF-01) ────
// Mock states the rep can be in — Tweaks can flip.
const SYNC_STATES = {
  synced: { mode: 'synced', label: 'Synced', detail: 'just now', queued: 0 },
  recent: { mode: 'synced', label: 'Synced', detail: '12s ago', queued: 0 },
  offline: { mode: 'offline', label: 'Offline', detail: '4 changes queued', queued: 4 },
  syncing: { mode: 'syncing', label: 'Syncing', detail: '2 of 6', queued: 6 }
};

// ─── Needs-assessment AI suggestions (DST-NA-01..-08) ─────────
// Areas of guidance (Craig — May '26): conversational topic tiles, not rigid
// questions. Prefilled from CRM intake call; rep adds scratchpad notes
// during the conversation (type or handwriting).
const NEEDS_TOPICS = [
  { id: 'budget',      label: 'Budget',          hint: 'Range · how they think about cost',
    prefill: 'Marcus said on the intake call they\'d "trust us to recommend what makes sense." No number shared.' },
  { id: 'timeline',    label: 'Timeline',        hint: 'How soon, and why',
    prefill: 'Wants this done in ~30 days — before next storm season. Adjuster\'s report expected by end of week.' },
  { id: 'deciders',    label: 'Decision makers', hint: 'Who else weighs in',
    prefill: 'Marcus (homeowner, present today) and Renée (spouse, handles finances — joining on FaceTime ~30 min in).' },
  { id: 'insurance',   label: 'Insurance',       hint: 'Carrier · claim · adjuster',
    prefill: 'State Farm. Claim #SF-78813-26. Adjuster scheduled but hasn\'t been on site yet.' },
  { id: 'concerns',    label: 'Concerns',        hint: 'What worries them',
    prefill: 'Hail damage on the north slope from the April storm. Worried about coverage gaps and a recurrence.' },
  { id: 'constraints', label: 'Around the home', hint: 'Access · pets · noise',
    prefill: 'Dog in back yard — gate access only. Renée works from home Tuesdays — minimize noise.' },
  { id: 'source',      label: 'How they found us', hint: 'Lead source · what stood out',
    prefill: 'Storm canvass after Apr 12 hail. Neighbor at 4419 referred them.' },
  { id: 'rep_notes',   label: 'Rep notes',       hint: 'Just for you — not shown to the homeowner',
    prefill: '', repOnly: true }
];

const NEEDS_SEED = {
  primaryConcern: { value: 'Multiple hail-storm events; concerned about insurance coverage on north slope.', confidence: 0.91, source: '"…that hail back in April was the worst we\'ve seen. Insurance hasn\'t come back yet."', status: 'suggested' },
  projectType: { value: ['Roofing'], confidence: 0.97, source: '"Just the roof for now."', status: 'suggested' },
  decisionMakers: { value: [{ name: 'Marcus Whittaker', role: 'Homeowner — present' }, { name: 'Renée Whittaker', role: 'Spouse — handles financing' }], confidence: 0.88, source: '"My wife handles all the finances, I\'ll need her to sign off."', status: 'suggested' },
  timeline: { value: '30 days', confidence: 0.84, source: '"Sooner the better — before the next storm season."', status: 'suggested' },
  budgetSignal: { value: 'asked us to recommend', confidence: 0.79, source: '"We trust you to tell us what makes sense."', status: 'suggested' },
  insurance: { value: { involved: true, carrier: 'State Farm', claim: 'SF-78813-26' }, confidence: 0.95, source: 'Insurance card photographed at intake.', status: 'suggested' },
  constraints: { value: 'Dog in back yard; access through side gate only. Wife works from home — minimize indoor noise on workdays.', confidence: 0.81, source: '"Just don\'t scare the dog, and Tuesdays are bad."', status: 'suggested' },
  repNotes: { value: '', confidence: 1, source: '', status: 'confirmed' }
};

// ─── Findings (DST-FE-01..-06) — plain-language, education-overlay ready ────
const FINDINGS_SEED = [
{
  id: 'f1',
  cat: 'roof_system',
  headline: 'Hail bruising on the north field',
  body: 'We counted 11 hits per test square on the north slope — well above what the manufacturer warranty assumes. These bruises don\'t leak today, but they shorten the shingle\'s life by 5–8 years.',
  severity: 'action',
  education: 'A test square is a 10×10 ft section of roof. Insurers commonly require 8+ hits per square to approve a claim. We document with chalk + photo.',
  discussed: false,
  photos: [
    { id: 'f1-1', label: 'Chalked test square · north slope', file: 'hail-testsquare-north.jpg' },
    { id: 'f1-2', label: 'Close-up bruise · granule loss', file: 'hail-bruise-closeup.jpg' },
    { id: 'f1-3', label: 'Wide shot · impact pattern', file: 'hail-wide-north.jpg' },
    { id: 'f1-4', label: 'Ridge cap impact', file: 'hail-ridgecap.jpg' }
  ]
},
{
  id: 'f2',
  cat: 'penetrations',
  headline: 'Plumbing boot is cracked',
  body: 'The rubber gasket around your master-bath vent stack is split. Water is finding its way along the pipe — you may already see a brown ring in the ceiling below.',
  severity: 'action',
  education: 'Plumbing boots are the #1 source of slow roof leaks. Lead replacements last 25+ years; rubber boots fail in 8–12.',
  discussed: false,
  photos: [
    { id: 'f2-1', label: 'Cracked rubber gasket · master bath stack', file: 'boot-crack-master.jpg' },
    { id: 'f2-2', label: 'Boot from above · daylight visible', file: 'boot-above.jpg' },
    { id: 'f2-3', label: 'Ceiling stain below · active wicking', file: 'boot-ceiling-stain.jpg' }
  ]
},
{
  id: 'f3',
  cat: 'flashing',
  headline: 'Step flashing weeping at the chimney',
  body: 'The flashing where your chimney meets the roof is still attached, but the seal behind it is failing. Water is wicking down the bricks during driving rain.',
  severity: 'notable',
  education: 'Step flashing is woven into the shingle courses. Replacing it requires lifting shingles — it\'s done at the same time as a re-roof.',
  discussed: false,
  photos: [
    { id: 'f3-1', label: 'Chimney base · west face', file: 'flashing-west-face.jpg' },
    { id: 'f3-2', label: 'Step flashing peeling away', file: 'flashing-peel.jpg' },
    { id: 'f3-3', label: 'Brick staining · driving-rain wash', file: 'flashing-brickstain.jpg' }
  ]
},
{
  id: 'f4',
  cat: 'ventilation',
  headline: 'Attic is under-vented',
  body: 'Your intake-to-exhaust ratio is 38/100 — code calls for 50/50. Heat is trapped in the attic and aging your shingles from below.',
  severity: 'notable',
  education: 'Roofs lose 30% of their lifespan when attics overheat. A continuous ridge vent + balanced soffit intake fixes this for life.',
  discussed: false,
  photos: [
    { id: 'f4-1', label: 'Attic interior · thermal reading', file: 'attic-thermal.jpg' },
    { id: 'f4-2', label: 'Ridge cap exterior · no continuous vent', file: 'attic-ridge.jpg' },
    { id: 'f4-3', label: 'Soffit detail · painted-shut intake', file: 'attic-soffit.jpg' }
  ]
},
{
  id: 'f5',
  cat: 'fascia',
  headline: 'Soffit panel cracked — daylight visible',
  body: 'A panel under the rear eave is split. We could see daylight from inside the attic. Pest entry risk and water intrusion at the wall plate.',
  severity: 'routine',
  education: 'Soffits are the underside of your eaves. Aluminum or fiber-cement replacements integrate with the roof and gutter scope.',
  discussed: false,
  photos: [
    { id: 'f5-1', label: 'Rear eave · cracked panel', file: 'soffit-crack.jpg' },
    { id: 'f5-2', label: 'From inside attic · daylight visible', file: 'soffit-daylight.jpg' }
  ]
}];


// ─── Core Six pitch deck slides (DST-PD-01..-22) ────────────────
const PITCH_SLIDES = [
{
  id: 'company',
  label: 'Company',
  title: 'Built for one neighborhood at a time.',
  body: 'Skywalker Roofing has served North Carolina and Virginia since 1989. Family-owned, fully licensed, GAF Master Elite — the top 2% of roofers in the country.',
  bullets: ['NC General Contractor · 73344', '34 years in business', 'GAF Master Elite Certified', 'Better Business Bureau A+'],
  accent: 'Origin · License · Coverage'
},
{
  id: 'approach',
  label: 'Approach',
  title: 'Heart, mind, attitude of service.',
  body: 'We don\'t sell roofs. We diagnose a home, explain what we found in plain language, and let you choose what fits your family. No pressure, no anchored prices.',
  bullets: ['Inspect every system, not just shingles', 'Explain findings before pricing', 'Three honest options, never a hard close', 'You decide on your timeline'],
  accent: 'The IHS Selling Way'
},
{
  id: 'process',
  label: 'Process',
  title: 'Five steps from approval to warranty.',
  body: 'After you say yes, here\'s exactly what happens — and when.',
  timeline: [
  { step: '1', label: 'Approval', detail: 'You sign, we collect a deposit.' },
  { step: '2', label: 'Materials ordered', detail: 'Direct from Owens Corning. 5–10 days.' },
  { step: '3', label: 'Crew scheduled', detail: 'Production calls 48h ahead.' },
  { step: '4', label: 'Install', detail: '1–2 days for most homes.' },
  { step: '5', label: 'Final walk', detail: 'Together, before invoice.' }],

  accent: 'Approval → Install → Warranty'
},
{
  id: 'products',
  label: 'Products',
  title: 'The materials we stand behind.',
  body: 'We install one shingle line — Owens Corning. Three product tiers (Standard, Premium, Signature) so you choose the right balance of cost and coverage.',
  bullets: ['Owens Corning Platinum Preferred', 'Class 4 impact-resistant options', 'Lifetime manufacturer coverage available', 'Synthetic underlayment standard on every roof'],
  accent: 'Owens Corning · Class 4 · Lifetime'
},
{
  id: 'warranty',
  label: 'Warranty',
  title: 'Coverage you can hand to your kids.',
  body: 'Manufacturer warranty (50 years to lifetime). Workmanship warranty (5 to lifetime). Transferable to the next owner — boosts resale.',
  bullets: ['Manufacturer: 50yr–lifetime', 'Workmanship: 5yr–lifetime', 'Transferable on sale', 'Annual courtesy inspection (Signature tier)'],
  accent: 'Manufacturer · Workmanship · Transferable'
},
{
  id: 'careplan',
  label: 'Care Plan',
  title: 'After install, we don\'t disappear.',
  body: 'Optional Care Plan: annual inspection, gutter clear, small fixes covered, 24-hour storm response. Most clients add this. Some pass.',
  bullets: ['Annual inspection + report', 'Gutter clear (spring/fall)', 'Storm response within 24h', 'Loyalty discount on future trades'],
  accent: 'Optional · Brand-configurable'
}];


const PITCH_SKIP_REASONS = [
'Customer not interested in this topic',
'Out of time',
'Customer specifically said they don\'t care about this',
'Already covered earlier in conversation',
'Other'];


// ─── Follow-ups on dashboard (DST-FU) — stubbed for round 2 wiring ──
const FOLLOWUPS = [
{ id: 'fu1', customer: 'The Petersons', email: 'r.peterson@example.com', phone: '(512) 555-9911', address: '2901 Lakeshore Dr, Cedar Park, TX', originalDate: 'Apr 21', originalApptId: 'A-OLD-1', reason: 'Wants to think about it', dueDate: 'May 1', overdue: false, trade: 'Roofing', est: '$28–34k', priorTier: 'Premium · $31,200', objections: ['Price felt high vs. neighbor\'s quote', 'Wants to wait until after vacation'], notes: 'Lefty took notes; wife liked Signature trim. Re-pitch with care plan as anchor.' },
{ id: 'fu2', customer: 'Jose Alarcón', email: 'jalarcon@example.com', phone: '(512) 555-7762', address: '8124 Quail Hollow, Round Rock, TX', originalDate: 'Apr 18', originalApptId: 'A-OLD-2', reason: 'Waiting on insurance adjuster', dueDate: 'Apr 27', overdue: true, trade: 'Roofing', est: '$32–42k', priorTier: 'Premium · $38,600', objections: ['Adjuster visit hasn\'t happened', 'Needs ITEL report before commit'], notes: 'Carrier: USAA. Adjuster appt rescheduled to Apr 26. Push for next-day re-engage.' },
{ id: 'fu3', customer: 'The Sullivans', email: 'k.sullivan@example.com', phone: '(512) 555-3308', address: '418 Whisper Oaks, Pflugerville, TX', originalDate: 'Apr 14', originalApptId: 'A-OLD-3', reason: 'Discussing with spouse', dueDate: 'May 3', overdue: false, trade: 'Roofing + Gutters', est: '$26–34k', priorTier: 'Standard · $24,800', objections: ['Spouse wasn\'t home for pitch', 'Concerned about bundled gutter scope'], notes: 'Schedule re-presentation when spouse is home. Offer split-scope option.' }];


const FOLLOWUP_REASONS = [
'Customer thinking it over',
'Spouse needs to weigh in',
'Waiting on insurance adjuster',
'Financing reconsidering',
'Price objection',
'Out of season / not urgent',
'Other'];


// ─── Customer master list (DST-PREP-04) — synthesized for J ───
const CUSTOMERS = [
{
  id: 'cust-whittaker',
  name: 'Marcus & Renée Whittaker',
  address: '4421 Bluffwood Ln, Cedar Park, TX 78613',
  email: 'marcus.whittaker@example.com',
  phone: '(512) 555-2284',
  status: 'active', // active | signed | past | followup | insurance
  flags: ['Insurance pending'],
  lastInteraction: { date: 'Today', type: 'Active appointment' },
  deals: [
  { id: 'd1', date: 'Today', type: 'Inspection', trade: 'Roofing', status: 'in-progress', amount: null },
  { id: 'd2', date: 'Apr 12', type: 'Storm canvass', trade: 'Roofing', status: 'lead', amount: null }]

},
{
  id: 'cust-ortega',
  name: 'Marisol Ortega',
  address: '912 Granite Pass, Leander, TX 78641',
  email: 'm.ortega@example.com',
  phone: '(512) 555-7144',
  status: 'signed',
  flags: ['Production scheduled'],
  lastInteraction: { date: 'Apr 27', type: 'Signed · Premium' },
  deals: [
  { id: 'd1', date: 'Apr 27', type: 'Signed', trade: 'Roof replacement · Premium', status: 'signed', amount: 28950 },
  { id: 'd2', date: 'Apr 19', type: 'Inspection', trade: 'Roofing', status: 'completed', amount: null }]

},
{
  id: 'cust-park',
  name: 'Daniel Park',
  address: '255 Cottonwood Ridge, Austin, TX 78735',
  email: 'd.park@example.com',
  phone: '(512) 555-3892',
  status: 'past',
  flags: [],
  lastInteraction: { date: 'Apr 24', type: 'Installed · Signature' },
  deals: [
  { id: 'd1', date: 'Apr 24', type: 'Installed', trade: 'Roof + gutters · Signature', status: 'installed', amount: 36420 },
  { id: 'd2', date: '2024-09-04', type: 'Repair', trade: 'Plumbing boot · Standard', status: 'installed', amount: 1850 }]

},
{
  id: 'cust-petersons',
  name: 'The Petersons',
  address: '2901 Lakeshore Dr, Cedar Park, TX',
  email: 'r.peterson@example.com',
  phone: '(512) 555-9911',
  status: 'followup',
  flags: ['Follow-up due May 1'],
  lastInteraction: { date: 'Apr 21', type: 'Quoted · Premium' },
  deals: [
  { id: 'd1', date: 'Apr 21', type: 'Estimate', trade: 'Roofing · Premium', status: 'open', amount: 31200 }]

},
{
  id: 'cust-alarcon',
  name: 'Jose Alarcón',
  address: '8124 Quail Hollow, Round Rock, TX',
  email: 'jalarcon@example.com',
  phone: '(512) 555-7762',
  status: 'insurance',
  flags: ['Insurance pending — USAA', 'Adjuster Apr 26'],
  lastInteraction: { date: 'Apr 18', type: 'Quoted · Premium' },
  deals: [
  { id: 'd1', date: 'Apr 18', type: 'Estimate', trade: 'Roofing · Premium', status: 'open', amount: 38600 }]

},
{
  id: 'cust-sullivans',
  name: 'The Sullivans',
  address: '418 Whisper Oaks, Pflugerville, TX',
  email: 'k.sullivan@example.com',
  phone: '(512) 555-3308',
  status: 'followup',
  flags: ['Follow-up due May 3'],
  lastInteraction: { date: 'Apr 14', type: 'Quoted · Standard' },
  deals: [
  { id: 'd1', date: 'Apr 14', type: 'Estimate', trade: 'Roof + Gutters · Standard', status: 'open', amount: 24800 }]

},
{
  id: 'cust-hartleys',
  name: 'The Hartleys',
  address: '660 Mesa Verde Way, Buda, TX',
  email: 'hartleys@example.com',
  phone: '(512) 555-1180',
  status: 'past',
  flags: [],
  lastInteraction: { date: 'Apr 12', type: 'Installed · Standard' },
  deals: [
  { id: 'd1', date: 'Apr 12', type: 'Installed', trade: 'Roof replacement · Standard', status: 'installed', amount: 18750 }]

},
{
  id: 'cust-choi',
  name: 'Lena Choi',
  address: '1414 Madrone Bend, Austin, TX',
  email: 'lena.c@example.com',
  phone: '(512) 555-0024',
  status: 'past',
  flags: [],
  lastInteraction: { date: 'Apr 17', type: 'Installed · Signature' },
  deals: [
  { id: 'd1', date: 'Apr 17', type: 'Installed', trade: 'Roof + skylights · Signature', status: 'installed', amount: 41200 }]

}];


// ─── Financing provider (DST-FIN) ────────────────────
const FINANCING_PROVIDER = {
  name: 'Greensky', // Provider TBD per Decision Log PRT-02 — modeled as Greensky-shaped
  display: 'IHS Financing · Powered by Greensky',
  rateFloor: 0.0799,
  rateCeiling: 0.1499,
  terms: [24, 36, 60, 84, 120] // months
};

// Decision states the provider can return.
const FINANCING_DECISIONS = {
  approved: { tone: 'success', label: 'Pre-approved', detail: 'You\'re approved for the full amount on the terms you selected.' },
  counter: { tone: 'warn', label: 'Counter-offer', detail: 'We can approve a reduced amount with the same terms.' },
  declined: { tone: 'danger', label: 'Declined', detail: 'We weren\'t able to approve this application. Other payment options remain available.' },
  pending: { tone: 'info', label: 'Under review', detail: 'A reviewer needs another minute or two. We\'ll let you know when it resolves.' }
};

// ─── Production handoff package (DST-PH-01..-04) ────────
const HANDOFF_ITEMS = [
{ id: 'contract', icon: 'pen', label: 'Signed contract', detail: 'PDF · sha256:8fc12a…' },
{ id: 'scope', icon: 'list', label: 'Scope confirmation', detail: 'Tier · materials · exclusions' },
{ id: 'colors', icon: 'check', label: 'Color confirmations', detail: 'Shingle · trim · gutter' },
{ id: 'walkthrough', icon: 'cam', label: 'Walk-through video', detail: null }, // detail filled in at runtime
{ id: 'photos', icon: 'cam', label: 'Inspection photos', detail: null },
{ id: 'measurements', icon: 'grid', label: 'Measurements', detail: 'EagleView export · 28 sq' },
{ id: 'notes', icon: 'pen', label: 'CSR + appointment notes', detail: 'Synced from CRM' },
{ id: 'profile', icon: 'user', label: 'Customer profile', detail: 'Concerns · goals · constraints' },
{ id: 'flags', icon: 'alert', label: 'Risk flags', detail: null }];


// ─── Welcome package contents (DST-WP-01..-07) ──────────
const WELCOME_CONTENTS = [
{ icon: 'mail', label: 'Project introduction packet', detail: 'PDF · 6 pages' },
{ icon: 'list', label: 'Next-steps timeline', detail: 'Materials → install → final walk' },
{ icon: 'user', label: 'Production team contact', detail: 'Project Manager: Tina Hsu' },
{ icon: 'shield', label: 'Warranty registration', detail: 'Auto-filed with Owens Corning' },
{ icon: 'flash', label: 'Financing reminder', detail: 'Pre-approved · 84mo · 7.99%' },
{ icon: 'building', label: 'Referral program intro', detail: '$500 per signed referral' }];


// ─── Metrics (Dashboard)
const METRICS = {
  closeRate: 0.62,
  closeRateDelta: +0.04,
  ytd: 1284600,
  ytdDelta: +0.18,
  mtd: 142800,
  mtdDelta: -0.06,
  commissionsToday: 1284,
  commissionsMTD: 18420,
  commissionsYTD: 142680,
  commissionsCount: 14,
  grossProfitMTD: 52480,
  grossProfitDelta: +0.09,
  grossProfitMargin: 0.367,
  appointmentsThisWeek: 8,
  signedThisWeek: 3
};

const COMMISSIONS = [
{ id: 'c1', date: 'Apr 27', customer: 'Marisol Ortega', job: 'Roof replacement · Better tier', sold: 28950, rate: 0.06, status: 'paid', payDate: 'May 5' },
{ id: 'c2', date: 'Apr 24', customer: 'Daniel Park', job: 'Roof + gutters · Best tier', sold: 36420, rate: 0.06, status: 'paid', payDate: 'May 5' },
{ id: 'c3', date: 'Apr 22', customer: 'The Whitfields', job: 'Roof replacement · Better tier', sold: 24300, rate: 0.06, status: 'paid', payDate: 'May 5' },
{ id: 'c4', date: 'Apr 19', customer: 'Aaron Briggs', job: 'Roof repair · Good tier', sold: 9850, rate: 0.05, status: 'paid', payDate: 'Apr 28' },
{ id: 'c5', date: 'Apr 17', customer: 'Lena Choi', job: 'Roof + skylights · Best tier', sold: 41200, rate: 0.06, status: 'paid', payDate: 'Apr 28' },
{ id: 'c6', date: 'Apr 15', customer: 'Reggie Sandoval', job: 'Roof replacement · Better tier', sold: 22600, rate: 0.06, status: 'paid', payDate: 'Apr 28' },
{ id: 'c7', date: 'Apr 12', customer: 'The Hartleys', job: 'Roof replacement · Good tier', sold: 18750, rate: 0.05, status: 'paid', payDate: 'Apr 21' },
{ id: 'c8', date: 'Apr 10', customer: 'Pria Anand', job: 'Roof + gutters · Better tier', sold: 27300, rate: 0.06, status: 'paid', payDate: 'Apr 21' },
{ id: 'c9', date: 'Apr 28', customer: 'Tomás Reyes', job: 'Roof replacement · Better tier', sold: 26100, rate: 0.06, status: 'pending', payDate: 'May 12' },
{ id: 'c10', date: 'Apr 26', customer: 'Jenna Ko', job: 'Roof + ventilation · Best tier', sold: 33980, rate: 0.06, status: 'pending', payDate: 'May 12' }];


Object.assign(window, {
  Icon, BRANDS, APPOINTMENTS, INSPECTION_CATEGORIES, SEED_INSPECTION_ITEMS,
  TIERS, LINE_ITEMS, CUSTOMER, METRICS, COMMISSIONS, NEEDS_TOPICS,
  REPS, SYNC_STATES, NEEDS_SEED, FINDINGS_SEED, PITCH_SLIDES, PITCH_SKIP_REASONS,
  FOLLOWUPS, FOLLOWUP_REASONS, CUSTOMERS, FINANCING_PROVIDER, FINANCING_DECISIONS,
  HANDOFF_ITEMS, WELCOME_CONTENTS
});