/* global React, Icon, ENVELOPE_FACETS, MEASUREMENT_SCHEMA, CATALOGS, REPORT_SOURCES,
   autoQtyFor, findCatalog, fmtMoney, fmtMoneyExact, INSPECTION_CATEGORIES */

/* IHS Selling Way — Inspection screen
   ───────────────────────────────────────────────────────────────
   Envelope tabs (Roofing · Siding · Gutters · Windows & Doors)
   Inside each envelope:
     Roofing / Siding: Measurements · Materials · Labor · Photos
     Gutters / Windoors: Measurements · Photos
   Roofing Labor splits into "Steep" + "Flat" sub-sections.
   Auto-calc: when a measurement changes, every catalog item that lists
   it as `linked` recomputes via its `calc()` formula. Manual qty
   edits on a single row don't ripple anywhere.
   Custom line items can be added in any envelope/section. */

const { useState, useMemo, useEffect } = window;

// ─────────────────────────────────────────────────────────
// Good / Better / Best packages.
// Mirrors the package-selector pattern on the Proposal/Builder page
// (screens-build.jsx): three pillars per envelope (Good · Better · Best),
// each starts EMPTY. Tapping a pillar opens a bottom drawer listing the
// products available for that tier — pick one and the pillar fills in with
// the chosen Manufacturer · Product · Name. Items in the materials catalog
// are NOT filtered by these selections; the package picker only records
// which product is associated with each tier so the data flows into the
// Proposal page downstream.
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// Good / Better / Best product packages — source-of-truth lives on the
// Proposal Builder (screens-build.jsx → SCOPE_CATALOG). The inspection
// drawer shows the SAME products with the SAME mfr · line · name labels
// (Craig, May '26): only difference is the right-hand price is shown as
// $X.XX / SQ instead of the proposal's full charge total.
//
// `packageProducts` on each envelope tracks the chosen product id per tier
// (e.g. { good: 'r-ct-lm-g' }) — same ids used downstream by the Proposal
// page so a selection here pre-fills the matching pillar there.
// ─────────────────────────────────────────────────────────
const PACKAGE_TIERS = {
  roofing: {
    good: {
      label: 'Good', hint: 'Architectural · 30-yr class',
      products: [
      { id: 'r-ct-lm-g', mfr: 'CertainTeed', line: 'Landmark', name: 'Architectural', pricePerSq: 110, unit: 'SQ' },
      { id: 'r-gaf-tz-g', mfr: 'GAF', line: 'Timberline', name: 'HDZ', pricePerSq: 115, unit: 'SQ' },
      { id: 'r-oc-td-g', mfr: 'Owens Corning', line: 'TruDef', name: 'Duration', pricePerSq: 112, unit: 'SQ' },
      { id: 'r-atl-pin-g', mfr: 'Atlas', line: 'Pinnacle', name: 'Pristine', pricePerSq: 112, unit: 'SQ' }]
    },
    better: {
      label: 'Better', hint: 'Class 4 · upgraded flashings',
      products: [
      { id: 'r-ct-lmp-b', mfr: 'CertainTeed', line: 'Landmark', name: 'PRO', pricePerSq: 119, unit: 'SQ' },
      { id: 'r-gaf-uhdz-b', mfr: 'GAF', line: 'Timberline', name: 'UHDZ', pricePerSq: 135, unit: 'SQ' },
      { id: 'r-oc-dd-b', mfr: 'Owens Corning', line: 'Duration', name: 'Designer (Class 4)', pricePerSq: 158, unit: 'SQ' },
      { id: 'r-ct-ng-b', mfr: 'CertainTeed', line: 'Northgate', name: 'Class 4 IR', pricePerSq: 150, unit: 'SQ' },
      { id: 'r-atl-imp-b', mfr: 'Atlas', line: 'StormMaster', name: 'IR (Impact)', pricePerSq: 128, unit: 'SQ' }]
    },
    best: {
      label: 'Best', hint: 'Designer · lifetime warranties',
      products: [
      { id: 'r-ct-ps-x', mfr: 'CertainTeed', line: 'Presidential', name: 'Shake', pricePerSq: 245, unit: 'SQ' },
      { id: 'r-gaf-sl-x', mfr: 'GAF', line: 'Slateline', name: 'Designer', pricePerSq: 215, unit: 'SQ' },
      { id: 'r-oc-bk-x', mfr: 'Owens Corning', line: 'Berkshire', name: 'Collection', pricePerSq: 230, unit: 'SQ' },
      { id: 'r-atl-sm-x', mfr: 'Atlas', line: 'StormMaster', name: 'Shake', pricePerSq: 165, unit: 'SQ' }]
    }
  },
  siding: {
    good: {
      label: 'Good', hint: 'Engineered lap',
      products: [
      { id: 's-lp-ss-g', mfr: 'LP', line: 'SmartSide', name: 'Lap Siding', pricePerSq: 130, unit: 'SQ' },
      { id: 's-jh-sc-g', mfr: 'James Hardie', line: 'HardiePlank', name: 'Select Cedarmill', pricePerSq: 165, unit: 'SQ' }]
    },
    better: {
      label: 'Better', hint: 'Pre-finished · upgraded trim',
      products: [
      { id: 's-lp-ef-b', mfr: 'LP', line: 'SmartSide', name: 'ExpertFinish', pricePerSq: 180, unit: 'SQ' },
      { id: 's-jh-cp-b', mfr: 'James Hardie', line: 'HardiePlank', name: 'ColorPlus + Shingle', pricePerSq: 195, unit: 'SQ' }]
    },
    best: {
      label: 'Best', hint: 'Premium finish · custom trim',
      products: [
      { id: 's-lp-dk-x', mfr: 'LP', line: 'Diamond Kote', name: 'Premium', pricePerSq: 240, unit: 'SQ' },
      { id: 's-jh-art-x', mfr: 'James Hardie', line: 'Artisan', name: 'Series', pricePerSq: 280, unit: 'SQ' }]
    }
  }
  // Windows & Doors has no priced catalog yet — selector renders as a
  // passive placeholder.
};

// Flat lookup: product id → product (across all facets/tiers).
function findPackageProduct(facetId, productId) {
  const tiers = PACKAGE_TIERS[facetId];
  if (!tiers || !productId) return null;
  for (const tk of TIER_KEYS) {
    const p = (tiers[tk]?.products || []).find((x) => x.id === productId);
    if (p) return p;
  }
  return null;
}

const TIER_KEYS = ['good', 'better', 'best'];
const TIER_LABELS = { good: 'Good', better: 'Better', best: 'Best' };
const TIER_ACCENTS = { good: 'var(--text-2)', better: 'var(--brand)', best: 'var(--success)' };

// Manufacturers offered as Good/Better/Best packages for a facet — derived
// from PACKAGE_TIERS. Used by the Materials pane to hide manufacturer-specific
// sections (e.g. CertainTeed, GAF, Atlas, Royal Vinyl) until the rep selects
// a product from that manufacturer in the pillar drawer. Non-manufacturer
// groups (Underlayment, Accessories, Trim, etc.) are always visible.
function packageManufacturers(facetId) {
  const tiers = PACKAGE_TIERS[facetId];
  if (!tiers) return new Set();
  const out = new Set();
  for (const tk of TIER_KEYS) {
    for (const p of tiers[tk]?.products || []) {
      if (p.mfr) out.add(p.mfr);
    }
  }
  return out;
}

// Facets that support package selection (Roofing, Siding, & Windows per
// Craig). Windows & Doors has no priced catalog yet, so the selector renders
// as a passive placeholder there.
const PACKAGE_FACETS = new Set(['roofing', 'siding', 'windoors']);

// ─────────────────────────────────────────────────────────
// Top-level component
// ─────────────────────────────────────────────────────────
function InspectionScreen({
  items, setItems, // photo/dictation findings (legacy)
  envelope, setEnvelope, // rich inspection state for the active structure
  structures, activeStructureId, setActiveStructureId,
  onAddStructure, onDuplicateStructure, onRenameStructure, onRemoveStructure, onSetStructureScopes,
  onDictate, onBack,
  continueCascade, onContinue
}) {
  const activeStructure = structures?.find((s) => s.id === activeStructureId) || structures?.[0] || { scopes: ['roofing', 'siding', 'gutters', 'windoors'] };
  const allowedFacets = useMemo(
    () => ENVELOPE_FACETS.filter((f) => activeStructure.scopes.includes(f.id)),
    [activeStructure.scopes.join('|')]
  );

  const [activeFacet, setActiveFacet] = useState(allowedFacets[0]?.id || 'roofing');
  // Section tabs — Craig (May '26 v2): drop the collapsible-accordion model.
  // Long scrolling is the enemy of users; sections are true mutually-exclusive
  // tabs (Measurements · Materials · Labor · Equipment · Disposal) and only
  // the active section's body is rendered.
  const [activeSection, setActiveSection] = useState('measurements');

  // If active structure's scopes shrink and they no longer include the
  // active facet, snap to the first available scope.
  useEffect(() => {
    if (allowedFacets.length === 0) return;
    if (!allowedFacets.find((f) => f.id === activeFacet)) {
      setActiveFacet(allowedFacets[0].id);
    }
  }, [activeStructure.id, allowedFacets.map((f) => f.id).join('|')]);

  // If the active facet doesn't offer the current section (e.g. gutters has
  // no Materials), snap to the first section it does offer.
  useEffect(() => {
    const facet2 = ENVELOPE_FACETS.find((f) => f.id === activeFacet);
    const secs = (facet2?.sections || ['measurements']).filter((s) => s !== 'photos');
    if (!secs.includes(activeSection)) setActiveSection(secs[0] || 'measurements');
  }, [activeFacet]);

  const facet = ENVELOPE_FACETS.find((f) => f.id === activeFacet);
  const env = envelope[activeFacet] || {};
  const measurements = env.measurements || {};
  const aerial = env.aerial || {};

  // helpers ────────────────────────────────────────────────
  const updateEnvelope = (patch) => {
    setEnvelope((s) => ({ ...s, [activeFacet]: { ...(s?.[activeFacet] || {}), ...patch } }));
  };

  // Recompute any linked line-item qty against a new measurements object.
  const recomputeLineItems = (nextMeasurements) => {
    const lineItems = env.lineItems || { materials: [], labor: [], equipment: [], disposal: [] };
    if (!facet?.hasPricing) return lineItems;
    const cat = CATALOGS[activeFacet];
    const next = { ...lineItems };
    ['materials', 'labor', 'equipment', 'disposal'].forEach((sec) => {
      next[sec] = (lineItems[sec] || []).map((li) => {
        if (li.custom) return li; // skip customs
        const ce = (cat[sec] || []).find((c) => c.id === li.id);
        if (ce && ce.linked && ce.calc) {
          return { ...li, qty: autoQtyFor(ce, nextMeasurements) };
        }
        return li;
      });
    });
    return next;
  };

  const setMeasurement = (key, value) => {
    const nextMeasurements = { ...measurements, [key]: value };
    // Applying a pending dictation clears it from the pending pile.
    const pending = env.pendingMeas || {};
    const nextPending = { ...pending };
    if (Object.prototype.hasOwnProperty.call(nextPending, key) && String(nextPending[key]) === String(value)) {
      delete nextPending[key];
    }
    updateEnvelope({ measurements: nextMeasurements, pendingMeas: nextPending, lineItems: recomputeLineItems(nextMeasurements) });
  };

  const applyOnePending = (key) => {
    const pending = env.pendingMeas || {};
    if (pending[key] == null) return;
    setMeasurement(key, pending[key]);
  };

  const dismissPending = (key) => {
    const pending = env.pendingMeas || {};
    const next = { ...pending };
    delete next[key];
    updateEnvelope({ pendingMeas: next });
  };

  const applyAllAerial = () => {
    const next = { ...measurements };
    Object.entries(aerial).forEach(([k, v]) => {
      if (v != null && v !== '') next[k] = v;
    });
    updateEnvelope({ measurements: next, lineItems: recomputeLineItems(next) });
  };

  const clearAllMeasurements = () => {
    updateEnvelope({ measurements: {}, lineItems: recomputeLineItems({}) });
  };

  const applyOneAerial = (key) => {
    if (aerial[key] == null) return;
    setMeasurement(key, aerial[key]);
  };

  // Render ────────────────────────────────────────────────
  const sections = facet?.sections || ['measurements', 'photos'];
  const noScopes = allowedFacets.length === 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="scroll-area" data-screen-label="Inspection" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {/* Sticky nav stack — structure switcher + envelope tabs + section
                    section accordion-toggles travel with the rep as they scroll. */}
        <div style={{ position: 'sticky', top: 0, zIndex: 6, background: 'var(--bg)', boxShadow: '0 1px 0 var(--border)' }}>
          <StructureSwitcher
            structures={structures || []}
            activeStructureId={activeStructureId}
            setActiveStructureId={setActiveStructureId}
            onAdd={onAddStructure}
            onDuplicate={onDuplicateStructure}
            onRename={onRenameStructure}
            onRemove={onRemoveStructure}
            onSetScopes={onSetStructureScopes} />
          <EnvelopePicker
            activeFacet={activeFacet}
            setActiveFacet={setActiveFacet}
            structureScopes={activeStructure.scopes}
            envelope={envelope}
            onSetScopes={(next) => onSetStructureScopes && onSetStructureScopes(activeStructure.id, next)} />
          {!noScopes &&
          <SectionTabs sections={sections} activeSection={activeSection} onSelect={setActiveSection} facet={facet} env={env} items={items} />}
        </div>

        {/* Content — only the active section's body. (Craig, May '26 v2.) */}
        {noScopes ?
        <div style={{ padding: '24px 16px' }}>
            <div className="card" style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-3)', borderStyle: 'dashed' }}>
              Nothing to build for <strong style={{ color: 'var(--text-2)' }}>{activeStructure.name}</strong> yet —
              add at least one scope of work (Roofing / Siding / Gutters / Windows & Doors) via the structure's <strong>Scopes</strong> menu.
            </div>
          </div> :
        <div style={{ padding: '8px 0 24px' }}>
            {/* Package selector — Good / Better / Best (May '26 v6).
                Three pillar buttons that mirror the Proposal Builder's
                product-association pattern: each starts empty, tap opens a
                bottom drawer listing the products available for that tier.
                Not sticky — scrolls with the envelope body. */}
            {PACKAGE_FACETS.has(activeFacet) &&
          <PackageSelector
            facetId={activeFacet}
            packageProducts={env.packageProducts || {}}
            onChange={(tier, productId) => updateEnvelope({ packageProducts: { ...(env.packageProducts || {}), [tier]: productId } })} />}
            {activeSection === 'measurements' && sections.includes('measurements') &&
          <div>
              <SourceBanner
              facet={facet}
              env={env}
              measurements={measurements}
              aerial={aerial}
              onChange={(patch) => updateEnvelope(patch)}
              onApplyAll={applyAllAerial} />
              <MeasurementsPane
              facetId={activeFacet}
              measurements={measurements}
              setMeasurement={setMeasurement}
              aerial={aerial}
              pendingMeas={env.pendingMeas || {}}
              onApplyPending={applyOnePending}
              onDismissPending={dismissPending}
              onApplyOne={applyOneAerial} />
            </div>}

            {['materials', 'labor', 'equipment', 'disposal'].map((sec) => {
            if (sec !== activeSection) return null;
            if (!sections.includes(sec) || !facet?.hasPricing) return null;
            return (
              <div key={sec}>
                  <LineItemsPane envelopeId={activeFacet} section={sec} env={env} updateEnvelope={updateEnvelope} packageProducts={env.packageProducts || {}} />
                </div>);
          })}
          </div>}
      </div>

      {/* Totals dock removed — Craig (May '26 v4): per-structure / project
                  totals here over-inflate expenses when packages are still being
                  scoped. The number means nothing at the inspection stage; trust
                  the Proposal tab to surface dollars. */}

      {/* Dictate FAB — outside the scroll-area so it floats above content. */}
      {!noScopes && <DictateFab onDictate={() => onDictate(activeFacet)} bottomOffset={32} />}

      {/* Continue cascade — advances to next structure on Build, or to
          Slides on the last structure. */}
      {continueCascade && onContinue && (
        <window.ContinueBar
          tablet={true}
          label={continueCascade.label}
          sub={continueCascade.sub}
          enabled={true}
          onContinue={onContinue} />
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────
// Envelope tabs (top)
// ─────────────────────────────────────────────────────────
function EnvelopeTabs({ activeFacet, setActiveFacet, envelope, items, allowedFacets }) {
  const facets = allowedFacets || ENVELOPE_FACETS;
  if (facets.length === 0) {
    return (
      <div style={{ background: 'var(--bg)', padding: '10px 14px 12px' }}>
        <div style={{
          padding: '10px 12px', borderRadius: 8,
          border: '1px dashed var(--border-strong)', background: 'var(--surface-2)',
          fontSize: 11, color: 'var(--text-3)', textAlign: 'center'
        }}>
          No scopes selected for this structure. Use <strong style={{ color: 'var(--text-2)' }}>⋮ → Scopes</strong> on the structure chip to add some.
        </div>
      </div>);

  }
  return (
    <div style={{ background: 'var(--bg)', padding: '6px 14px 4px' }}>
      <UnifiedTabStrip
        items={facets.map((f) => ({ id: f.id, label: f.label }))}
        active={activeFacet}
        onSelect={setActiveFacet} />
    </div>);

}

// ─────────────────────────────────────────────────────────
// EnvelopePicker — 4-tile grid replacing the horizontal strip.
// Each tile carries a status badge (Done ✓ / X% / Open / Excluded) and
// an in-place include/exclude toggle so the rep doesn't have to bounce
// to the structure scopes sheet to flip an envelope on or off.
// (Craig, May '26 — Phase 2.3 B-1 + B-10 redesign port.)
// ─────────────────────────────────────────────────────────
const PICKER_ENVELOPES = [
  { id: 'roofing',  label: 'Roofing' },
  { id: 'siding',   label: 'Siding' },
  { id: 'gutters',  label: 'Gutters' },
  { id: 'windoors', label: 'Windows & Doors' }
];

// Returns { kind: 'excluded'|'done'|'progress'|'open', pct?: number }
function envelopeStatusFor(facetId, structureScopes, envelopeState) {
  if (!structureScopes.includes(facetId)) return { kind: 'excluded' };
  const schema = window.MEASUREMENT_SCHEMA?.[facetId] || [];
  const m = envelopeState?.[facetId]?.measurements || {};
  const total = schema.length;
  const filled = schema.reduce((n, field) => {
    const v = m[field.key];
    return n + (v != null && v !== '' && v !== 0 ? 1 : 0);
  }, 0);
  if (total === 0) return filled > 0 ? { kind: 'done' } : { kind: 'open' };
  if (filled === 0) return { kind: 'open' };
  if (filled >= total) return { kind: 'done' };
  return { kind: 'progress', pct: Math.round((filled / total) * 100) };
}

function EnvelopePicker({ activeFacet, setActiveFacet, structureScopes, envelope, onSetScopes }) {
  return (
    <div style={{ background: 'var(--bg)', padding: '10px 14px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>Envelopes</div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>Tap × to exclude · + to include</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {PICKER_ENVELOPES.map((e) => {
          const status = envelopeStatusFor(e.id, structureScopes, envelope);
          const isExcluded = status.kind === 'excluded';
          const isDone = status.kind === 'done';
          const isActive = !isExcluded && e.id === activeFacet;
          const pct = status.kind === 'progress' ? status.pct : null;
          const handleClick = () => {
            if (isExcluded) {
              if (onSetScopes) onSetScopes([...structureScopes, e.id]);
            } else {
              setActiveFacet(e.id);
            }
          };
          const toggleScope = (ev) => {
            ev.stopPropagation();
            if (!onSetScopes) return;
            if (isExcluded) onSetScopes([...structureScopes, e.id]);else
            onSetScopes(structureScopes.filter((x) => x !== e.id));
          };
          return (
            <button
              key={e.id}
              type="button"
              onClick={handleClick}
              style={{
                position: 'relative',
                padding: '18px 8px 14px',
                borderRadius: 12,
                background: isExcluded ? 'transparent' : (isActive ? 'var(--brand-soft)' : 'var(--surface)'),
                border: isExcluded ?
                  '1px dashed var(--border-strong)' :
                  (isActive ? '1.5px solid var(--brand)' : '1px solid var(--border)'),
                opacity: isExcluded ? 0.55 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', textAlign: 'center'
              }}>
              {/* Top-left toggle */}
              <span
                role="button"
                tabIndex={0}
                aria-label={isExcluded ? `Include ${e.label}` : `Exclude ${e.label}`}
                onClick={toggleScope}
                onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') toggleScope(ev); }}
                style={{
                  position: 'absolute', top: 6, left: 6,
                  width: 22, height: 22, borderRadius: 999,
                  background: isExcluded ? 'var(--brand)' : 'var(--surface-2)',
                  color: isExcluded ? 'var(--brand-fg)' : 'var(--text-3)',
                  border: isExcluded ? 'none' : '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 14, fontWeight: 700, lineHeight: 1, userSelect: 'none'
                }}>
                {isExcluded ? '+' : '×'}
              </span>
              {/* Done badge */}
              {isDone &&
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 18, height: 18, borderRadius: 999,
                background: 'var(--success)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700
              }}>✓</span>}
              {/* Progress pct */}
              {pct != null &&
              <span style={{
                position: 'absolute', top: 8, right: 8,
                padding: '1px 6px', borderRadius: 999,
                background: 'var(--surface-2)', color: 'var(--brand-soft-fg)',
                fontSize: 9, fontWeight: 700
              }}>{pct}%</span>}
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: isActive ? 'var(--brand-soft-fg)' : (isDone ? 'var(--success)' : 'var(--text-2)'),
                lineHeight: 1.2, marginTop: 8
              }}>
                {e.label}
              </div>
              {isExcluded &&
              <span style={{
                fontSize: 9, fontWeight: 600, color: 'var(--text-4)',
                marginTop: 2
              }}>excluded</span>}
            </button>);
        })}
      </div>
    </div>);
}

// ─────────────────────────────────────────────────────────
// Package selector — Good / Better / Best pillars
// Three side-by-side pillar buttons (one per tier). Each starts empty.
// Tapping a pillar opens a bottom drawer listing the products available
// for that tier — pick one and the pillar fills in with the chosen
// Manufacturer · Product · Name. Matches the Proposal Builder's pattern
// (screens-build.jsx → TierPillar + ProductPickerDrawer).
// ─────────────────────────────────────────────────────────
function PackageSelector({ facetId, packageProducts, onChange }) {
  const tiers = PACKAGE_TIERS[facetId];
  const [drawerTier, setDrawerTier] = useState(null);

  if (!tiers) {
    // Facet supports packages conceptually but has no priced catalog yet
    // (e.g. Windows & Doors). Show a passive placeholder.
    return (
      <div style={{ padding: '0 14px 12px' }}>
        <div style={{
          padding: '10px 12px', borderRadius: 8,
          border: '1px dashed var(--border-strong)', background: 'var(--surface-2)',
          fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.1, textTransform: 'uppercase', color: 'var(--text-3)' }}>Package</span>
          <span style={{ flex: 1, minWidth: 0 }}>Good / Better / Best packages will live here once Windows & Doors gets a priced catalog.</span>
        </div>
      </div>);

  }

  return (
    <div style={{ padding: '0 14px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>
          Package
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>

        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {TIER_KEYS.map((key) => {
          const selectedId = packageProducts?.[key] || null;
          const product = findPackageProduct(facetId, selectedId);
          return (
            <PackagePillar
              key={key}
              tierKey={key}
              tier={tiers[key]}
              product={product}
              onOpen={() => setDrawerTier(key)} />);
        })}
      </div>

      {drawerTier && tiers[drawerTier] &&
      <PackageProductDrawer
        facetId={facetId}
        tierKey={drawerTier}
        tier={tiers[drawerTier]}
        selectedId={packageProducts?.[drawerTier] || null}
        onPick={(id) => {onChange(drawerTier, id);setDrawerTier(null);}}
        onClear={() => {onChange(drawerTier, null);setDrawerTier(null);}}
        onClose={() => setDrawerTier(null)} />}
    </div>);

}

// One pillar — empty CTA when no product picked, filled card when picked.
function PackagePillar({ tierKey, tier, product, onOpen }) {
  const accent = TIER_ACCENTS[tierKey];
  const hasProduct = !!product;
  return (
    <div style={{
      border: `1px solid ${hasProduct ? accent : 'var(--border)'}`,
      boxShadow: hasProduct ? `inset 0 0 0 1px ${accent}` : 'none',
      borderRadius: 12,
      background: hasProduct ? 'var(--surface)' : 'var(--surface-2)',
      padding: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'border-color 160ms ease, box-shadow 160ms ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>
          {TIER_LABELS[tierKey]}
        </span>
      </div>
      {hasProduct ?
      <button
        type="button"
        onClick={onOpen}
        style={{
          textAlign: 'left',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'inherit'
        }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.mfr}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              {product.line} · {product.name}
            </span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button> :

      <button
        type="button"
        onClick={onOpen}
        style={{
          background: 'var(--surface)',
          border: `1.5px dashed ${accent}`,
          color: accent,
          borderRadius: 8,
          padding: '14px 10px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em'
        }}>
          <Icon.plus style={{ width: 14, height: 14 }} />
          Associate Product
        </button>}
    </div>);

}

// Bottom drawer that lists every product available for one tier.
// Mirrors the Proposal Builder's ProductPickerDrawer styling — square mfr
// avatar, two-line product label, price-per-unit on the right (instead of
// the proposal's charge total). Each row is a card; selection is shown via
// the active border + "Current" pill rather than a radio dot.
function PackageProductDrawer({ facetId, tierKey, tier, selectedId, onPick, onClear, onClose }) {
  const accent = TIER_ACCENTS[tierKey];
  const products = tier.products || [];
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>{TIER_LABELS[tierKey]}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {tier.hint}</span>
          </div>
          <h3 style={{ margin: '2px 0 4px' }}>Associate a product</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            Pick the manufacturer · product · name to anchor this {TIER_LABELS[tierKey]} package.
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.length === 0 &&
          <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            No products defined for this tier yet.
          </div>}
          {products.map((p) => {
            const active = p.id === selectedId;
            const initials = (p.mfr || '').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '–';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p.id)}
                className="card"
                style={{
                  padding: 12, textAlign: 'left', cursor: 'pointer', display: 'block',
                  border: active ? `1.5px solid ${accent}` : '1px solid var(--border)',
                  background: active ? 'var(--surface-2)' : 'var(--surface)',
                  boxShadow: active ? `inset 0 0 0 1px ${accent}` : 'none',
                  color: 'inherit'
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)',
                    color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: 0.04
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{p.mfr}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginTop: 2 }}>{p.line} · {p.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtMoneyExact(p.pricePerSq)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                      per {(p.unit || 'sq').toLowerCase()}
                    </div>
                    {active && <span className="pill brand" style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>Current</span>}
                  </div>
                </div>
              </button>);
          })}
          {selectedId &&
          <button
            onClick={onClear}
            style={{
              marginTop: 4, padding: '10px 12px',
              background: 'none', border: '1px dashed var(--border-strong)',
              borderRadius: 8, color: 'var(--text-3)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer'
            }}>
              Remove product from this pillar
            </button>}
        </div>
      </div>
    </>);

}

// ─────────────────────────────────────────────────────────
// Aerial-report source banner
// ─────────────────────────────────────────────────────────
function SourceBanner({ facet, env, measurements, aerial, onChange, onApplyAll }) {
  const [showPicker, setShowPicker] = useState(false);
  if (!facet) return null;
  const src = REPORT_SOURCES[env.source] || REPORT_SOURCES.manual;
  const sources = Object.values(REPORT_SOURCES).filter((s) => s.scope.includes(facet.id));

  // “Apply all measurements” lives inside the aerial card itself (Craig,
  // May '26 v4) — used to sit on a separate row above the schema, leaving a
  // gap of dead space below the card.
  const schema = MEASUREMENT_SCHEMA[facet.id] || [];
  const aerialFields = schema.filter((f) => {
    const v = aerial?.[f.key];
    return v != null && v !== '' && v !== 0;
  });
  const hasAerial = aerialFields.length > 0;
  const allAerialApplied = hasAerial && aerialFields.every((f) => {
    const v = measurements?.[f.key];
    return v != null && String(v) === String(aerial[f.key]);
  });

  const showApplyAll = hasAerial && onApplyAll;

  return (
    <div style={{ padding: '0 14px 6px' }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: src.color, fontSize: 10, fontWeight: 800, letterSpacing: '-0.02em'
          }}>
            {src.short.split(' ').map((w) => w[0]).join('').slice(0, 3)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: 0.06, color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Aerial report · {facet.label}
              {env.source !== 'manual' && <span className="pill success" style={{ fontSize: 9, padding: '1px 6px' }}>Linked</span>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 1 }}>
              {src.label} {env.sourceId ? <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>· {env.sourceId}</span> : null}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
              {env.linkedAt ? `Synced ${env.linkedAt}` : 'Manual entry only — no aerial linked'}
            </div>
          </div>
          <button className="btn btn-sm" onClick={() => setShowPicker(true)} style={{ flexShrink: 0 }}>
            Swap
          </button>
        </div>

        {/* Aerial actions — live inside the card so the action buttons aren't
                    floating in dead space below it (Craig, May '26 v4). */}
        {showApplyAll &&
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-3)' }}>
              {allAerialApplied ?
            <>All {aerialFields.length} measurement{aerialFields.length === 1 ? '' : 's'} pulled from this aerial.</> :
            <>{aerialFields.length} measurement{aerialFields.length === 1 ? '' : 's'} available from this aerial.</>}
            </div>
            <button
            className="btn btn-sm btn-primary"
            onClick={onApplyAll}
            disabled={allAerialApplied}
            style={{ fontSize: 11, flexShrink: 0 }}>
              {allAerialApplied ? 'All applied' : 'Apply all'}
            </button>
          </div>}
      </div>

      {showPicker &&
      <>
          <div className="sheet-backdrop" onClick={() => setShowPicker(false)} />
          <div className="sheet">
            <div className="grabber" />
            <div style={{ padding: '0 16px' }}>
              <h3 style={{ margin: '0 0 4px' }}>Linked aerial report</h3>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
                Pulls measurements into this scope. You can override any field by hand after linking.
              </div>
            </div>
            <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sources.map((s) => {
              const active = s.id === env.source;
              return (
                <button
                  key={s.id}
                  onClick={() => {onChange({ source: s.id, sourceId: s.id === 'manual' ? null : `${s.short.replace(/\s/g, '').toUpperCase()}-${Math.floor(Math.random() * 9000000 + 1000000)}`, linkedAt: s.id === 'manual' ? null : 'Today · just now' });setShowPicker(false);}}
                  className="card"
                  style={{
                    padding: 12, textAlign: 'left', cursor: 'pointer',
                    border: active ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                    background: active ? 'var(--brand-soft)' : 'var(--surface)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-3)', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>
                        {s.short.split(' ').map((w) => w[0]).join('').slice(0, 3)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Scope: {s.scope.map((c) => ENVELOPE_FACETS.find((f) => f.id === c)?.label).join(' · ')}</div>
                      </div>
                      {active && <span className="pill brand" style={{ fontSize: 10 }}>Current</span>}
                    </div>
                  </button>);

            })}
            </div>
            <div style={{ padding: '4px 16px 16px' }}>
              <button className="btn btn-block" onClick={() => setShowPicker(false)}>Cancel</button>
            </div>
          </div>
        </>}
    </div>);

}

// ─────────────────────────────────────────────────────────
// (Legacy SectionTabs removed — replaced by the SectionTabs below that
//  drives true mutually-exclusive section tabs in the Build screen.)
// ─────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────
// Measurements pane
// ─────────────────────────────────────────────────────────
function MeasurementsPane({ facetId, measurements, setMeasurement, aerial, pendingMeas, onApplyPending, onDismissPending, onApplyOne }) {
  const schema = MEASUREMENT_SCHEMA[facetId] || [];
  // Group by `group`
  const grouped = useMemo(() => {
    const g = {};
    for (const f of schema) {
      g[f.group] = g[f.group] || [];
      g[f.group].push(f);
    }
    return g;
  }, [schema]);

  return (
    <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Object.entries(grouped).map(([group, fields]) =>
      <div key={group}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>{group}</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {fields.map((f, idx) =>
          <MeasurementRow
            key={f.key}
            field={f}
            value={measurements[f.key]}
            aerialValue={aerial?.[f.key]}
            pendingValue={pendingMeas?.[f.key]}
            onChange={(v) => setMeasurement(f.key, v)}
            onApply={() => onApplyOne(f.key)}
            onApplyPending={() => onApplyPending(f.key)}
            onDismissPending={() => onDismissPending(f.key)}
            last={idx === fields.length - 1} />
          )}
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', padding: '4px 16px', lineHeight: 1.5 }}>
        Changing a measurement auto-updates linked Material and Labor quantities. Changing a quantity directly doesn't affect anything else.
      </div>
    </div>);

}

function MeasurementRow({ field, value, aerialValue, pendingValue, onChange, onApply, onApplyPending, onDismissPending, last }) {
  const empty = value == null || value === '';
  const aerialAvailable = aerialValue != null && aerialValue !== '' && aerialValue !== 0;
  const matchesAerial = aerialAvailable && String(value) === String(aerialValue);
  const pendingAvailable = pendingValue != null && pendingValue !== '' && String(pendingValue) !== String(value);
  return (
    <div style={{ padding: '12px 14px', borderBottom: last ? 0 : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{field.label}</div>
        {field.hint && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{field.hint}</div>}
        {pendingAvailable &&
        <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <button
            type="button"
            onClick={onApplyPending}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 999,
              background: 'oklch(0.95 0.05 75)', color: 'oklch(0.42 0.12 75)',
              border: '1px solid oklch(0.85 0.08 75)', cursor: 'pointer',
              fontSize: 10, fontWeight: 700, letterSpacing: '-0.005em',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <Icon.mic style={{ width: 11, height: 11 }} /> Dictation: {pendingValue}{field.unit ? ` ${field.unit.toUpperCase()}` : ''}
            </button>
            <button
            type="button"
            onClick={onDismissPending}
            aria-label="Dismiss dictation"
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 6px', borderRadius: 999,
              background: 'transparent', color: 'var(--text-3)',
              border: '1px solid var(--border)', cursor: 'pointer',
              fontSize: 10
            }}>
              <Icon.x />
            </button>
          </div>}
        {aerialAvailable && !matchesAerial && !pendingAvailable &&
        <button
          type="button"
          onClick={onApply}
          style={{
            marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 999,
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            border: '1px solid var(--border)', cursor: 'pointer',
            fontSize: 10, fontWeight: 700, letterSpacing: '-0.005em',
            fontVariantNumeric: 'tabular-nums'
          }}>
            Apply aerial · {aerialValue}{field.unit ? ` ${field.unit}` : ''}
          </button>}
        {aerialAvailable && matchesAerial &&
        <div style={{
          marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 999,
          background: 'var(--surface-3)', color: 'var(--text-3)',
          fontSize: 10, fontWeight: 700, letterSpacing: '-0.005em'
        }}>
            <Icon.check /> From aerial
          </div>}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {!field.isText &&
        <button
          type="button"
          onClick={() => onChange(Math.max(0, (Number(value) || 0) - (field.step || 1)))}
          style={{ width: 28, height: 32, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--text-2)', padding: 0 }}
          aria-label="decrease">−</button>}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: field.isText ? 80 : 90, height: 32, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', padding: '0 8px' }}>
          <input
            type={field.isText ? 'text' : 'number'}
            value={empty ? '' : value}
            step={field.step || 1}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value;
              if (field.isText) onChange(raw);else
              onChange(raw === '' ? null : parseFloat(raw));
            }}
            style={{ flex: 1, minWidth: 0, height: '100%', border: 0, outline: 'none', fontSize: 13, fontWeight: 700, textAlign: 'right', background: 'transparent', fontVariantNumeric: 'tabular-nums', color: empty ? 'var(--text-3)' : 'var(--text)' }} />
          {field.unit && <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 4, flexShrink: 0 }}>{field.unit}</span>}
        </div>
        {!field.isText &&
        <button
          type="button"
          onClick={() => onChange((Number(value) || 0) + (field.step || 1))}
          style={{ width: 28, height: 32, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--text-2)', padding: 0 }}
          aria-label="increase">+</button>}
        {/* Per-row clear button removed — Craig (May '26 v4): users should not
                    be able to remove measurements once they're entered. Edit the
                    value in place instead. */}
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────
// Color selection — section-level + per-item (Craig, May '26)
// ─────────────────────────────────────────────────────────
// Curated palette covers the colors reps see on shingles, drip edge, trim
// coil, siding panels, etc. Custom color picker (native) is available as a
// fallback for anything off the standard chart.
const COLOR_PALETTE = [
{ name: 'Charcoal', hex: '#2b2a2a' },
{ name: 'Slate Black', hex: '#1e2024' },
{ name: 'Pewter Gray', hex: '#6f6f6e' },
{ name: 'Estate Gray', hex: '#4a4843' },
{ name: 'Weathered Wood', hex: '#5b4f3c' },
{ name: 'Driftwood', hex: '#a08b6b' },
{ name: 'Mission Brown', hex: '#3b2c20' },
{ name: 'Bronze', hex: '#6b4f31' },
{ name: 'Hunter Green', hex: '#2e4a35' },
{ name: 'Patriot Red', hex: '#7e2e2e' },
{ name: 'Almond', hex: '#cfb89a' },
{ name: 'White', hex: '#f4f1ea' }];


// Pattern of catalog names / groups that represent colored goods.
// Labor / Equipment / Disposal line items aren't colored — they're activities
// or rentals, not products with a color spec.
const COLORABLE_PATTERN = /shingle|hdz|landmark|northgate|atlas|pinnacle|impact|storm|royal|estate|crest|residential|board ?& ?batten|foundry|shake|drip|coil|cap|seal|boot|trim|flash|fascia|soffit|j-?channel|corner|mount|column|beam|skylight|gutter|panel|siding|ascend|fanfold|finish|frieze|fascia|sheath/i;

function isColorable(section, ce, custom) {
  if (section !== 'materials') return false;
  if (custom) return false;
  if (!ce) return false;
  return COLORABLE_PATTERN.test(ce.name) || COLORABLE_PATTERN.test(ce.group || '');
}

function ColorSwatchButton({ color, size = 20, onClick, ariaLabel, hint }) {
  const isLight = color && /^#?(f|e|d)/i.test((color || '').replace('#', '').slice(0, 1));
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || 'Pick color'}
      title={hint || color || 'Pick color'}
      style={{
        width: size, height: size, borderRadius: 999, padding: 0,
        background: color || 'transparent',
        border: color ? `1.5px solid ${isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.4)'}` : '1.5px dashed var(--border-strong)',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: color ? isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)' : 'var(--text-3)',
        fontSize: Math.max(9, size - 12), lineHeight: 1, flexShrink: 0
      }}>
      {!color && '+'}
    </button>);

}

function ColorPopover({ color, onChange, onClose, label, anchorRight }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'transparent' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: 26, [anchorRight ? 'right' : 'left']: 0,
          zIndex: 61, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 12, width: 232,
          boxShadow: '0 16px 36px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)'
        }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>
          {label || 'Pick a color'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {COLOR_PALETTE.map((p) => {
            const active = color && color.toLowerCase() === p.hex.toLowerCase();
            return (
              <button
                key={p.hex}
                type="button"
                onClick={() => {onChange(p.hex);onClose();}}
                title={p.name}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: 999, padding: 0,
                  background: p.hex,
                  border: active ? '2px solid var(--brand)' : '1px solid rgba(0,0,0,0.18)',
                  cursor: 'pointer', position: 'relative'
                }}>
                {active &&
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>✓</span>}
              </button>);

          })}
        </div>
        {/* Craig (May '26 v5): "Custom" color removed — homeowners pick from the
                    manufacturer's standard chart, not arbitrary hex codes. Clear stays. */}
        {color &&
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => {onChange(null);onClose();}}
            style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', background: 'transparent', border: 0, cursor: 'pointer' }}>
            Clear color
          </button>
        </div>}
      </div>
    </>);

}

function ColorBadge({ color, onChange, label, anchorRight = true, size = 20 }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }} onClick={(e) => e.stopPropagation()}>
      <ColorSwatchButton
        color={color}
        size={size}
        onClick={(e) => {e.stopPropagation();setOpen((o) => !o);}}
        ariaLabel={label || 'Pick color'}
        hint={color || label} />
      {open &&
      <ColorPopover
        color={color}
        onChange={onChange}
        onClose={() => setOpen(false)}
        label={label}
        anchorRight={anchorRight} />}
    </span>);

}

// ─────────────────────────────────────────────────────────
// Line items pane (Materials / Labor / Equipment / Disposal)
// ─────────────────────────────────────────────────────────
function lineTotal(envelopeId, section, li) {
  if (li.custom) return (Number(li.qty) || 0) * (Number(li.custom.price) || 0);
  const ce = findCatalog(envelopeId, section, li.id);
  if (!ce) return 0;
  return (Number(li.qty) || 0) * (Number(ce.price) || 0);
}

function LineItemsPane({ envelopeId, section, env, updateEnvelope, packageProducts }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null); // index in lineItems

  const lineItems = env.lineItems?.[section] || [];
  const measurements = env.measurements || {};
  const catalog = CATALOGS[envelopeId] && CATALOGS[envelopeId][section] || [];

  const setLineItems = (next) => {
    updateEnvelope({ lineItems: { ...(env.lineItems || {}), [section]: next } });
  };
  // Remove an entire manufacturer/group section in one tap (Craig, May '26 —
  // "Manufacture sections should be able to be removed wholesale instead of
  // someone having to remove each line item individually"). For partitioned
  // roofing labor, accept a `subsection` instead and match by ce.section.
  const removeGroup = ({ group, subsection } = {}) => {
    const next = lineItems.filter((li) => {
      const ce = li.custom ? null : catalog.find((c) => c.id === li.id);
      if (subsection) {
        const sub = ce?.section || (li.custom ? 'main' : 'main');
        return sub !== subsection;
      }
      const g = li.custom ? 'Custom' : ce?.group || 'Misc';
      return g !== group;
    });
    setLineItems(next);
  };
  const updateQty = (idx, qty) => {
    const n = lineItems.map((li, i) => i === idx ? { ...li, qty } : li);
    setLineItems(n);
  };
  const remove = (idx) => setLineItems(lineItems.filter((_, i) => i !== idx));
  const addCatalogItem = (catalogId) => {
    const ce = catalog.find((c) => c.id === catalogId);
    if (!ce) return;
    if (lineItems.find((li) => li.id === catalogId)) return;
    const q = autoQtyFor(ce, measurements);
    setLineItems([...lineItems, { id: catalogId, qty: q != null ? q : 0 }]);
  };
  const addCustom = (custom) => setLineItems([...lineItems, { custom, qty: 1 }]);

  // ── Colors (Craig, May '26) ────────────────────────────
  // Materials line items in colored groups (shingles, drip edge, trim coil,
  // siding panels, etc.) get a per-item color swatch. Each group header
  // exposes a "section color" picker that cascades to every colorable item
  // in that group.
  const colors = env.lineItemColors || {};
  const setColor = (id, color) => {
    if (!id) return;
    const next = { ...colors };
    if (color == null) delete next[id];else next[id] = color;
    updateEnvelope({ lineItemColors: next });
  };
  const setGroupColor = (rows, color) => {
    const next = { ...colors };
    rows.forEach((r) => {
      if (r.li.custom) return;
      if (!isColorable(section, r.ce)) return;
      if (color == null) delete next[r.li.id];else next[r.li.id] = color;
    });
    updateEnvelope({ lineItemColors: next });
  };

  // Group line items by their catalog group (or 'Custom') and for roofing labor by section (steep/flat).
  // Package selection drives section visibility in materials (Craig, May '26):
  // manufacturer-named groups (CertainTeed, GAF, Atlas, Royal Vinyl, …) stay
  // hidden until the rep picks a product from that mfr in the Good/Better/Best
  // pillars. The underlying lineItems are NEVER mutated by this — switching
  // the package selection just toggles which groups render.
  const grouped = useMemo(() => {
    const sortable = lineItems.map((li, idx) => {
      const ce = li.custom ? null : catalog.find((c) => c.id === li.id);
      const g = li.custom ? 'Custom' : ce?.group || 'Misc';
      const subsec = ce?.section || (li.custom ? 'main' : 'main');
      return { li, idx, ce, group: g, section: subsec, name: li.custom?.name || ce?.name || '' };
    });
    // For roofing labor, primary partition is steep/flat
    const out = {};
    if (envelopeId === 'roofing' && section === 'labor') {
      out.steep = [];
      out.flat = [];
      for (const r of sortable) {
        if (r.section === 'flat') out.flat.push(r);else
        out.steep.push(r);
      }
      return { partitioned: true, partitions: out };
    }
    // Else group by group
    for (const r of sortable) {
      out[r.group] = out[r.group] || [];
      out[r.group].push(r);
    }
    return { partitioned: false, partitions: out };
  }, [lineItems, envelopeId, section, catalog]);

  // Manufacturer visibility (materials only). `hiddenMfrs` is the full set
  // of mfr groups offered as packages for this facet; `activeMfrs` is the
  // subset the rep has activated by picking a product in one of the pillars.
  const hiddenMfrs = useMemo(() => packageManufacturers(envelopeId), [envelopeId]);
  const activeMfrs = useMemo(() => {
    const out = new Set();
    for (const tk of TIER_KEYS) {
      const pid = packageProducts?.[tk];
      if (!pid) continue;
      const p = findPackageProduct(envelopeId, pid);
      if (p?.mfr) out.add(p.mfr);
    }
    return out;
  }, [envelopeId, packageProducts]);
  // Has a (potential) manufacturer section been hidden by package gating?
  const hasGatedMfrs = section === 'materials' &&
  Object.keys(grouped.partitions).some((g) => hiddenMfrs.has(g) && !activeMfrs.has(g));

  const subtotal = lineItems.reduce((s, li) => s + lineTotal(envelopeId, section, li), 0);

  return (
    <div style={{ padding: '4px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Render partitioned (roofing labor) or grouped */}
      {grouped.partitioned ?
      <>
          <LineGroup
          title="Roofing — Steep slope"
          tint="var(--brand-soft)"
          rows={grouped.partitions.steep}
          envelopeId={envelopeId} section={section}
          colors={colors} setColor={setColor} setGroupColor={setGroupColor}
          onQty={updateQty} onTap={(idx) => setDetailOpen(idx)} onRemove={remove}
          onRemoveGroup={() => removeGroup({ subsection: 'steep' })} />
          <LineGroup
          title="Roofing — Flat / Low slope"
          tint="oklch(0.95 0.04 75)"
          rows={grouped.partitions.flat}
          envelopeId={envelopeId} section={section}
          colors={colors} setColor={setColor} setGroupColor={setGroupColor}
          onQty={updateQty} onTap={(idx) => setDetailOpen(idx)} onRemove={remove}
          onRemoveGroup={() => removeGroup({ subsection: 'flat' })}
          emptyHint="Add Flintlastic, ISO board, etc. when low-slope roofing is present." />
        </> :

      Object.entries(grouped.partitions).
      filter(([group]) => {
        // Manufacturer sections (CertainTeed, GAF, Atlas, Royal Vinyl, etc.)
        // are hidden until the rep picks a product from that manufacturer in
        // the Good/Better/Best pillars (Craig, May '26 v6). Non-manufacturer
        // groups always show.
        if (section !== 'materials') return true;
        if (!hiddenMfrs.has(group)) return true;
        return activeMfrs.has(group);
      }).
      map(([group, rows]) =>
      <LineGroup key={group} title={group} rows={rows} envelopeId={envelopeId} section={section} colors={colors} setColor={setColor} setGroupColor={setGroupColor} onQty={updateQty} onTap={(idx) => setDetailOpen(idx)} onRemove={remove} onRemoveGroup={() => removeGroup({ group })} />
      )
      }

      {/* Empty state */}
      {lineItems.length === 0 &&
      <div className="card" style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)', borderStyle: 'dashed' }}>
          No {section} yet. Add one from the catalog or create a custom line.
        </div>}

      {/* Package-gated hint — shown when manufacturer sections exist for this
           facet but no pillar has a product selected yet. (Craig, May '26.) */}
      {section === 'materials' && hasGatedMfrs && activeMfrs.size === 0 && lineItems.length > 0 &&
      <div className="card" style={{ padding: 16, fontSize: 12, color: 'var(--text-3)', borderStyle: 'dashed', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.plus style={{ width: 14, height: 14, color: 'var(--text-3)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
            Pick a Good · Better · Best product above to reveal that manufacturer's materials.
          </div>
        </div>}

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => setPickerOpen(true)}>
          <Icon.plus /> Add from catalog
        </button>
        <button className="btn" onClick={() => setCustomOpen(true)}>
          Custom line
        </button>
      </div>

      {/* Craig (May '26 v5): per-section subtotal block removed — the number
                  meant nothing at the inspection stage; trust the Proposal tab. */}

      {/* Catalog picker */}
      {pickerOpen &&
      <CatalogPicker
        envelopeId={envelopeId}
        section={section}
        existing={lineItems.filter((li) => !li.custom).map((li) => li.id)}
        measurements={measurements}
        onAdd={(id) => addCatalogItem(id)}
        onClose={() => setPickerOpen(false)} />}

      {/* Custom line */}
      {customOpen &&
      <CustomLineSheet
        onAdd={(c) => {addCustom(c);setCustomOpen(false);}}
        onClose={() => setCustomOpen(false)} />}

      {/* Detail sheet */}
      {detailOpen != null &&
      <LineDetailSheet
        envelopeId={envelopeId}
        section={section}
        li={lineItems[detailOpen]}
        color={lineItems[detailOpen]?.id ? colors?.[lineItems[detailOpen].id] || null : null}
        setColor={setColor}
        onQty={(q) => updateQty(detailOpen, q)}
        onRemove={() => {remove(detailOpen);setDetailOpen(null);}}
        onClose={() => setDetailOpen(null)} />}
    </div>);

}

// Compact group of line item rows (used in Materials / Labor / Equipment / Disposal pane)
function LineGroup({ title, rows, envelopeId, section, colors, setColor, setGroupColor, onQty, onTap, onRemove, onRemoveGroup, tint, emptyHint }) {
  // A "section color" picker shows in the group header when this group has
  // colorable items (shingles / drip edge / etc. in Materials).
  const colorableRows = (rows || []).filter((r) => isColorable(section, r.ce, r.li.custom));
  const groupHasColors = colorableRows.length > 0;
  // If every colorable row shares the same color, show that as the group color.
  const groupColor = useMemo(() => {
    if (!groupHasColors) return null;
    const c0 = colors?.[colorableRows[0].li.id];
    if (!c0) return null;
    return colorableRows.every((r) => (colors?.[r.li.id] || '').toLowerCase() === c0.toLowerCase()) ? c0 : null;
  }, [colorableRows, colors, groupHasColors]);
  const [groupColorOpen, setGroupColorOpen] = useState(false);
  // Confirm step for "Remove section" — first click arms, second confirms.
  // Avoids destroying a manufacturer section by accident. Auto-disarms after 4s.
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => {
    if (!confirmRemove) return;
    const t = setTimeout(() => setConfirmRemove(false), 4000);
    return () => clearTimeout(t);
  }, [confirmRemove]);

  if (!rows || rows.length === 0) {
    if (!emptyHint) return null;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>{title}</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div className="card" style={{ padding: 14, fontSize: 11, color: 'var(--text-3)', borderStyle: 'dashed' }}>{emptyHint}</div>
      </div>);

  }
  const groupTotal = rows.reduce((s, r) => s + lineTotal(envelopeId, section, r.li), 0);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>{title}</div>
        {/* Section-color chip — labeled so it's obvious what's being set
                    (Craig, May '26: "It is not clear what is being selected here"). */}
        {groupHasColors && setGroupColor &&
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
            type="button"
            onClick={(e) => {e.stopPropagation();setGroupColorOpen((o) => !o);}}
            title={groupColor ? `Section color: ${groupColor} · applies to all colored items in ${title}` : `Set one color for every colored item in ${title}`}
            aria-label={`Section color for ${title}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 22, padding: '0 8px 0 5px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
              fontSize: 10, fontWeight: 700, color: 'var(--text-2)', letterSpacing: 0.02
            }}>
              <span style={{
              display: 'inline-block', width: 12, height: 12, borderRadius: 999,
              background: groupColor || 'transparent',
              border: groupColor ? `1px solid rgba(0,0,0,0.18)` : `1.5px dashed var(--border-strong)`,
              flexShrink: 0
            }} />
              {groupColor ? 'Section color' : 'Set section color'}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {groupColorOpen &&
          <ColorPopover
            color={groupColor}
            onChange={(c) => setGroupColor(colorableRows, c)}
            onClose={() => setGroupColorOpen(false)}
            label={`Apply to all ${colorableRows.length} colored item${colorableRows.length === 1 ? '' : 's'}`}
            anchorRight={false} />}
          </span>}
        <div style={{ flex: 1, height: 1, background: 'var(--border)', minWidth: 8 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(groupTotal)}</div>
        {/* Remove-section button — Craig (May '26 v5): icon-only, sits to the
                    RIGHT of the group total. Two-tap (arm → confirm) to avoid
                    wiping a section by accident. */}
        {onRemoveGroup &&
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!confirmRemove) {setConfirmRemove(true);return;}
            setConfirmRemove(false);
            onRemoveGroup();
          }}
          title={confirmRemove ? `Tap again to remove all ${rows.length} line${rows.length === 1 ? '' : 's'} in ${title}` : `Remove all ${rows.length} line${rows.length === 1 ? '' : 's'} in ${title}`}
          aria-label={`Remove ${title} section`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: confirmRemove ? 'auto' : 22, height: 22,
            padding: confirmRemove ? '0 8px' : 0,
            borderRadius: 999,
            border: `1px solid ${confirmRemove ? 'var(--danger)' : 'transparent'}`,
            background: confirmRemove ? 'var(--danger-bg)' : 'transparent',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.02,
            transition: 'background 120ms ease, border-color 120ms ease, width 120ms ease'
          }}>
          <Icon.trash style={{ width: 12, height: 12 }} />
          {confirmRemove && <span style={{ marginLeft: 4 }}>Tap again</span>}
        </button>}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: tint || 'var(--surface)' }}>
        {rows.map((r, i) =>
        <LineRow
          key={r.idx}
          r={r}
          envelopeId={envelopeId}
          section={section}
          colors={colors}
          setColor={setColor}
          onQty={onQty}
          onTap={onTap}
          onRemove={onRemove}
          last={i === rows.length - 1} />
        )}
      </div>
    </div>);

}

function LineRow({ r, envelopeId, section, colors, setColor, onQty, onTap, onRemove, last }) {
  const { li, idx, ce } = r;
  const name = li.custom?.name || ce?.name || '';
  const unit = li.custom?.unit || ce?.unit || '';
  const price = li.custom?.price ?? ce?.price ?? 0;
  const qty = Number(li.qty) || 0;
  const total = qty * price;
  const linkedKey = ce?.linked;
  const linkedLabel = linkedKey ? MEASUREMENT_SCHEMA[envelopeId]?.find((f) => f.key === linkedKey)?.label || linkedKey : null;
  const colorable = isColorable(section, ce, !!li.custom);
  const itemColor = colorable && li.id ? colors?.[li.id] || null : null;

  return (
    <div style={{ padding: '10px 12px', borderBottom: last ? 0 : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onTap(idx)}
        onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();onTap(idx);}}}
        style={{ flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{name}</span>
          {colorable && setColor &&
          <ColorBadge
            color={itemColor}
            size={18}
            label={`Color for ${name}`}
            onChange={(c) => setColor(li.id, c)} />}
          {li.custom && <span className="pill" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>Custom</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoneyExact(price)} / {unit}</span>
          {linkedKey && <span style={{ color: 'var(--brand-soft-fg)', fontWeight: 600 }}>· Auto from {linkedLabel}</span>}
        </div>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => onQty(idx, Math.max(0, qty - 1))}
          style={{ width: 26, height: 28, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', padding: 0 }}>−</button>
        <input
          type="number"
          value={li.qty == null ? '' : li.qty}
          onChange={(e) => onQty(idx, e.target.value === '' ? 0 : parseFloat(e.target.value))}
          style={{ width: 48, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', textAlign: 'center', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', outline: 'none' }} />
        <button
          type="button"
          onClick={() => onQty(idx, qty + 1)}
          style={{ width: 26, height: 28, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', padding: 0 }}>+</button>
      </div>
      <div style={{ width: 64, textAlign: 'right', fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(total)}</div>
      {onRemove &&
      <button
        type="button"
        onClick={(e) => {e.stopPropagation();onRemove(idx);}}
        aria-label="Remove line"
        title="Remove"
        style={{ width: 28, height: 28, border: 0, background: 'transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--danger)', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon.trash style={{ width: 16, height: 16 }} />
        </button>}
    </div>);

}

// ─────────────────────────────────────────────────────────
// Catalog picker sheet
// ─────────────────────────────────────────────────────────
function CatalogPicker({ envelopeId, section, existing, measurements, onAdd, onClose }) {
  const [q, setQ] = useState('');
  const all = CATALOGS[envelopeId] && CATALOGS[envelopeId][section] || [];

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return all.filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.group.toLowerCase().includes(needle));
  }, [q, all]);

  const byGroup = useMemo(() => {
    const g = {};
    for (const c of filtered) {g[c.group] = g[c.group] || [];g[c.group].push(c);}
    return g;
  }, [filtered]);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 4px' }}>Add {section === 'materials' ? 'material' : section === 'labor' ? 'labor' : section === 'equipment' ? 'equipment' : 'disposal'}</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>Pick from the catalog. Auto-linked items pre-fill quantity from your measurements.</div>
          <input
            type="text"
            value={q}
            placeholder="Search…"
            onChange={(e) => setQ(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 14, background: 'var(--surface)', outline: 'none' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px' }}>
          {Object.keys(byGroup).length === 0 &&
          <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>No matches.</div>}
          {Object.entries(byGroup).map(([group, list]) =>
          <div key={group} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>{group}</div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {list.map((c, i) => {
                const inList = existing.includes(c.id);
                const linkedLabel = c.linked ? MEASUREMENT_SCHEMA[envelopeId]?.find((f) => f.key === c.linked)?.label || c.linked : null;
                const autoQ = autoQtyFor(c, measurements);
                return (
                  <div key={c.id} style={{ padding: '10px 12px', borderBottom: i === list.length - 1 ? 0 : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                          {fmtMoneyExact(c.price)} / {c.unit}
                          {linkedLabel && <> · <span style={{ color: 'var(--brand-soft-fg)' }}>Auto from {linkedLabel}{autoQ ? ` (${autoQ})` : ''}</span></>}
                        </div>
                      </div>
                      <button
                      className={inList ? 'btn btn-sm' : 'btn btn-sm btn-primary'}
                      onClick={() => !inList && onAdd(c.id)}
                      disabled={inList}>
                        {inList ? 'Added' : <><Icon.plus /> Add</>}
                      </button>
                    </div>);

              })}
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '8px 16px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-block" onClick={onClose}>Done</button>
        </div>
      </div>
    </>);

}

// ─────────────────────────────────────────────────────────
// Custom-line sheet
// ─────────────────────────────────────────────────────────
function CustomLineSheet({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('EA');
  const [price, setPrice] = useState('');
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grabber" />
        <div style={{ padding: '0 16px' }}>
          <h3 style={{ margin: '0 0 4px' }}>Custom line</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>One-off item not in the catalog. Won't be saved back to the catalog.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Labeled label="Name">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Steep-pitch ladder safety" style={inputStyle} />
            </Labeled>
            <div style={{ display: 'flex', gap: 10 }}>
              <Labeled label="Unit" flex={1}>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle}>
                  {['EA', 'SQ', 'FT', 'SF', 'BNDL', 'ROLL', 'PC', 'BOX', 'HR', 'LOT'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </Labeled>
              <Labeled label="Unit price" flex={1}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-3)' }}>$</span>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" style={{ ...inputStyle, paddingLeft: 22 }} />
                </div>
              </Labeled>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-lg" style={{ flex: 2 }} disabled={!name || !price} onClick={() => onAdd({ name, unit, price: parseFloat(price) || 0, group: 'Custom' })}>Add line</button>
        </div>
      </div>
    </>);

}

const inputStyle = {
  width: '100%', height: 40, border: '1px solid var(--border)', borderRadius: 8,
  padding: '0 12px', fontSize: 14, fontWeight: 500, background: 'var(--surface)',
  outline: 'none', fontFamily: 'inherit', color: 'var(--text)'
};

function Labeled({ label, children, flex }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: flex || 'unset' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.05, textTransform: 'uppercase' }}>{label}</span>
      {children}
    </label>);

}

// ─────────────────────────────────────────────────────────
// Line detail sheet (tap a row)
// ─────────────────────────────────────────────────────────
function LineDetailSheet({ envelopeId, section, li, color, setColor, onQty, onRemove, onClose }) {
  const ce = li.custom ? null : findCatalog(envelopeId, section, li.id);
  const name = li.custom?.name || ce?.name || '';
  const unit = li.custom?.unit || ce?.unit || '';
  const price = li.custom?.price ?? ce?.price ?? 0;
  const qty = Number(li.qty) || 0;
  const total = qty * price;
  const linkedLabel = ce?.linked ? MEASUREMENT_SCHEMA[envelopeId]?.find((f) => f.key === ce.linked)?.label || ce.linked : null;
  const colorable = isColorable(section, ce, !!li.custom);
  const swatchName = color ? COLOR_PALETTE.find((p) => p.hex.toLowerCase() === color.toLowerCase())?.name : null;

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grabber" />
        <div style={{ padding: '0 16px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.08, textTransform: 'uppercase' }}>{li.custom ? 'Custom' : ce?.group} · {section}</div>
          <h3 style={{ margin: '4px 0 4px', fontSize: 18 }}>{name}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14, fontVariantNumeric: 'tabular-nums' }}>
            {fmtMoneyExact(price)} per {unit}
            {linkedLabel && <span style={{ color: 'var(--brand-soft-fg)' }}> · auto-linked to {linkedLabel}</span>}
          </div>
          <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Quantity</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => onQty(Math.max(0, qty - 1))}
                style={{ width: 38, height: 38, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700, color: 'var(--text)', padding: 0 }}>−</button>
              <input
                type="number"
                value={li.qty == null ? '' : li.qty}
                onChange={(e) => onQty(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                style={{ width: 86, height: 38, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', textAlign: 'center', fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums', outline: 'none' }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 26 }}>{unit}</span>
              <button
                type="button"
                onClick={() => onQty(qty + 1)}
                style={{ width: 38, height: 38, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700, color: 'var(--text)', padding: 0 }}>+</button>
            </div>
          </div>
          {colorable && setColor &&
          <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Color</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                {color ? swatchName || color : 'Pick a color from the homeowner\u2019s selection'}
              </div>
            </div>
            <ColorBadge color={color} size={28} label={`Color for ${name}`} onChange={(c) => setColor(li.id, c)} />
          </div>}
          <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Line total</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{qty} × {fmtMoneyExact(price)}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(total)}</div>
          </div>
        </div>
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-lg" style={{ flex: 1, minWidth: 0, color: 'var(--danger)' }} onClick={onRemove}>Remove</button>
          <button className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: 0 }} onClick={onClose}>Done</button>
        </div>
      </div>
    </>);

}

// ─────────────────────────────────────────────────────────
// Photos pane (legacy findings strip + empty state)
// ─────────────────────────────────────────────────────────
function PhotosPane({ facetId, items }) {
  const facetItems = items.filter((it) => it.facetId === facetId);
  if (facetItems.length === 0) {
    return (
      <div style={{ padding: '14px 14px 0' }}>
        <div className="card" style={{ padding: 22, textAlign: 'center', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', borderStyle: 'dashed', lineHeight: 1.6 }}>
          No photos or dictations yet for this scope.<br />
          Use the buttons below to capture a photo or dictate a finding.
        </div>
      </div>);

  }
  return (
    <div style={{ padding: '4px 14px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {facetItems.map((it, idx) =>
      <div key={idx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {it.source === 'mic' ?
        <div style={{
          height: 110, background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 11, fontWeight: 700, borderBottom: '1px dashed var(--border-strong)'
        }}>
              <Icon.mic />
              <span>Dictated</span>
            </div> :
        <div className="placeholder-photo" style={{ height: 110, borderRadius: 0, border: 0 }}>{facetId.slice(0, 4)}-{idx + 1}.jpg</div>
        }
          <div style={{ padding: '8px 10px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{it.label}</div>
            {it.caption && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{it.caption}</div>}
          </div>
        </div>
      )}
    </div>);

}

// ─────────────────────────────────────────────────────────
// Floating Dictate FAB — Build tab keeps voice capture for reps who
// prefer to talk through measurements/quantities. Photo capture lives
// exclusively on the Inspect tab.
// ─────────────────────────────────────────────────────────
function DictateFab({ onDictate, bottomOffset = 44 }) {
  return (
    <div style={{ position: 'absolute', bottom: bottomOffset, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
      <button
        onClick={onDictate}
        aria-label="Dictate measurement or quantity"
        title="Dictate"
        style={{
          pointerEvents: 'auto', width: 56, height: 56, padding: 0, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)', border: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}>
        <Icon.mic style={{ width: 22, height: 22 }} />
      </button>
    </div>);

}

// ─────────────────────────────────────────────────────────
// Multi-structure switcher — promotes "Structure" to a first-class concept
// above envelopes. (Craig, May '26: guest house, barn, condo-association
// buildings, etc. — sometimes priced together, sometimes split. The Build
// page becomes per-structure with the structure as the outermost selector.)
// ─────────────────────────────────────────────────────────
function StructureSwitcher({ structures, activeStructureId, setActiveStructureId, onAdd, onDuplicate, onRename, onRemove, onSetScopes }) {
  const [menuFor, setMenuFor] = useState(null); // structure id whose ⋮ menu is open
  const [renaming, setRenaming] = useState(null); // { id, value } — modal rename sheet
  // Inline rename — Craig (May '26): the user needs to be able to rename a
  // structure chip directly. Tap the name on the active chip (or the pencil
  // affordance) and the name becomes an inline input.
  const [inlineRename, setInlineRename] = useState(null); // { id, value }
  const [scopesFor, setScopesFor] = useState(null); // structure id for scopes sheet
  const active = structures.find((s) => s.id === activeStructureId) || structures[0];
  const commitInline = () => {
    if (!inlineRename) return;
    const next = inlineRename.value.trim();
    if (next && onRename) onRename(inlineRename.id, next);
    setInlineRename(null);
  };

  // Only show the dock at all once there's reason to think the rep cares —
  // i.e. always on, but keep the single-structure case visually quiet so the
  // existing flow doesn't feel suddenly heavy.
  return (
    <div style={{ background: 'var(--bg)', padding: '6px 14px 4px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>
          Structure
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-4)', fontWeight: 600 }}>· {structures.length}</span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => onAdd && onAdd()}
          title="Add structure"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 22, padding: '0 8px',
            borderRadius: 999, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-2)',
            fontSize: 10, fontWeight: 700, cursor: 'pointer'
          }}>
          <Icon.plus style={{ width: 11, height: 11 }} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 4, paddingBottom: 2, scrollbarWidth: 'none' }}>
        {structures.map((s) => {
          const isActive = s.id === activeStructureId;
          const scopeCount = s.scopes.length;
          const isInlineRenaming = inlineRename?.id === s.id;
          return (
            <div key={s.id} style={{ position: 'relative', flexShrink: 0 }}>
              {isInlineRenaming ?
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 32, padding: '0 4px 0 10px',
                borderRadius: 999,
                background: 'var(--surface)',
                border: '1px solid var(--brand)',
                boxShadow: '0 0 0 3px var(--brand-soft)',
                whiteSpace: 'nowrap'
              }}>
                <Icon.building style={{ width: 12, height: 12, color: 'var(--brand)' }} />
                <input
                  autoFocus
                  type="text"
                  value={inlineRename.value}
                  onChange={(e) => setInlineRename((r) => ({ ...r, value: e.target.value }))}
                  onBlur={commitInline}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {e.preventDefault();e.currentTarget.blur();} else
                    if (e.key === 'Escape') {e.preventDefault();setInlineRename(null);}
                  }}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{
                    border: 0, outline: 0, background: 'transparent',
                    fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                    color: 'var(--text)', minWidth: 80,
                    width: `${Math.max(8, inlineRename.value.length + 1)}ch`,
                    padding: 0
                  }} />
                <button
                  type="button"
                  aria-label="Save name"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={commitInline}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: 999, border: 0,
                    background: 'var(--brand)', color: 'var(--brand-fg)',
                    cursor: 'pointer'
                  }}>
                  <Icon.check style={{ width: 12, height: 12 }} />
                </button>
              </div> :
              <button
                type="button"
                onClick={() => setActiveStructureId(s.id)}
                onDoubleClick={(e) => {e.preventDefault();e.stopPropagation();setActiveStructureId(s.id);setInlineRename({ id: s.id, value: s.name });}}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 32, padding: isActive ? '0 4px 0 10px' : '0 10px',
                  borderRadius: 999,
                  background: isActive ? 'var(--brand-soft)' : 'var(--surface)',
                  color: isActive ? 'var(--brand-soft-fg)' : 'var(--text-2)',
                  border: `1px solid ${isActive ? 'var(--brand)' : 'var(--border)'}`,
                  fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', cursor: 'pointer'
                }}>
                <Icon.building style={{ width: 12, height: 12, opacity: isActive ? 1 : 0.7 }} />
                {isActive ?
                <span
                  role="button"
                  tabIndex={0}
                  title="Tap to rename"
                  onClick={(e) => {e.stopPropagation();setInlineRename({ id: s.id, value: s.name });}}
                  onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();e.stopPropagation();setInlineRename({ id: s.id, value: s.name });}}}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'text', padding: '0 2px', borderRadius: 4 }}>
                  {s.name}
                  <Icon.pen style={{ width: 10, height: 10, opacity: 0.5 }} />
                </span> :
                s.name}
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  padding: '1px 5px', borderRadius: 999,
                  background: isActive ? 'var(--brand)' : 'var(--surface-3)',
                  color: isActive ? 'var(--brand-fg)' : 'var(--text-3)',
                  letterSpacing: 0.04
                }}>{scopeCount}</span>
                {isActive &&
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {e.stopPropagation();setMenuFor((m) => m === s.id ? null : s.id);}}
                  onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();e.stopPropagation();setMenuFor((m) => m === s.id ? null : s.id);}}}
                  aria-label="Structure actions"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: 999,
                    background: 'rgba(0,0,0,0.04)', color: 'var(--text-2)',
                    marginLeft: 2, cursor: 'pointer'
                  }}>
                  <Icon.more />
                </span>}
              </button>}
              {menuFor === s.id &&
              <>
                <div onClick={() => setMenuFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
                <div style={{
                  position: 'absolute', top: 36, left: 0, zIndex: 61,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, minWidth: 200,
                  boxShadow: '0 16px 36px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <StructureMenuItem
                    icon={<Icon.pen />}
                    label="Rename"
                    onClick={() => {setMenuFor(null);setRenaming({ id: s.id, value: s.name });}} />
                  <StructureMenuItem
                    icon={<Icon.grid />}
                    label="Scopes"
                    sub={`${scopeCount} of ${ENVELOPE_FACETS.length} scopes`}
                    onClick={() => {setMenuFor(null);setScopesFor(s.id);}} />
                  <StructureMenuItem
                    icon={<Icon.copy />}
                    label="Duplicate"
                    sub="Carries measurements & line items"
                    onClick={() => {setMenuFor(null);onDuplicate && onDuplicate(s.id);}} />
                  <StructureMenuItem
                    icon={<Icon.trash />}
                    label="Remove"
                    danger
                    disabled={structures.length <= 1}
                    sub={structures.length <= 1 ? 'Need at least one structure' : null}
                    onClick={() => {if (structures.length <= 1) return;setMenuFor(null);onRemove && onRemove(s.id);}} />
                </div>
              </>}
            </div>);
        })}
      </div>

      {/* Rename sheet */}
      {renaming &&
      <>
          <div className="sheet-backdrop" onClick={() => setRenaming(null)} />
          <div className="sheet">
            <div className="grabber" />
            <div style={{ padding: '0 16px' }}>
              <h3 style={{ margin: '0 0 4px' }}>Rename structure</h3>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12 }}>Used in the proposal, presentation, and reports.</div>
              <input
              autoFocus
              type="text"
              value={renaming.value}
              onChange={(e) => setRenaming((r) => ({ ...r, value: e.target.value }))}
              onKeyDown={(e) => {if (e.key === 'Enter') {onRename && onRename(renaming.id, renaming.value);setRenaming(null);}}}
              placeholder="e.g. Guest House, Barn, Unit 3B"
              style={{ width: '100%', height: 44, border: '1px solid var(--border)', borderRadius: 8, padding: '0 14px', fontSize: 15, fontWeight: 600, background: 'var(--surface)', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ padding: '14px 16px 16px', display: 'flex', gap: 8 }}>
              <button className="btn btn-block" style={{ flex: 1 }} onClick={() => setRenaming(null)}>Cancel</button>
              <button className="btn btn-primary btn-lg btn-block" style={{ flex: 2 }} onClick={() => {onRename && onRename(renaming.id, renaming.value);setRenaming(null);}}>Save</button>
            </div>
          </div>
        </>}

      {/* Scopes sheet */}
      {scopesFor &&
      <StructureScopesSheet
        structure={structures.find((s) => s.id === scopesFor)}
        onChange={(scopes) => onSetScopes && onSetScopes(scopesFor, scopes)}
        onClose={() => setScopesFor(null)} />}
    </div>);

}

function StructureMenuItem({ icon, label, sub, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '12px 14px',
        background: 'transparent', border: 0,
        borderBottom: '1px solid var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'left'
      }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: danger ? 'var(--danger-bg)' : 'var(--surface-2)',
        color: danger ? 'var(--danger)' : 'var(--text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--text)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{sub}</span>}
      </span>
    </button>);

}

function StructureScopesSheet({ structure, onChange, onClose }) {
  const [selected, setSelected] = useState(new Set(structure?.scopes || []));
  if (!structure) return null;
  const toggle = (id) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id);else next.add(id);
    return next;
  });
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grabber" />
        <div style={{ padding: '0 16px' }}>
          <h3 style={{ margin: '0 0 4px' }}>Scopes for {structure.name}</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>
            Pick which scopes of work apply. (A barn might only need roofing; a condo might skip windows.) Unselected scopes are hidden from the tabs but their data is preserved.
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {ENVELOPE_FACETS.map((f, i) => {
              const on = selected.has(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  style={{
                    padding: '12px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    background: on ? 'var(--brand-soft)' : 'transparent',
                    transition: 'background 120ms ease'
                  }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: on ? 'var(--brand)' : 'transparent',
                    border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`,
                    color: 'var(--brand-fg)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {on && <Icon.check style={{ width: 13, height: 13 }} />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{f.label}</span>
                </div>);
            })}
          </div>
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-block" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg btn-block" style={{ flex: 2 }}
            onClick={() => {onChange([...selected]);onClose();}}>
            Save scopes
          </button>
        </div>
      </div>
    </>);

}

// ─────────────────────────────────────────────────────────
// Unified tab strip — shared between EnvelopeTabs (Roofing · Siding · …)
// and SectionTabs (Measurements · Materials · …). Full-width segmented
// control: each tab gets an equal share so the rep can scan the row at a
// glance and tap without aiming. (Per teammate feedback, May '26.)
// ─────────────────────────────────────────────────────────
function UnifiedTabStrip({ items, active, onSelect }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      role="tablist"
      style={{
        display: 'flex', gap: 4, padding: 4,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        width: '100%', boxSizing: 'border-box'
      }}>
      {items.map((it) => {
        const isActive = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(it.id)}
            style={{
              flex: '1 1 0', minWidth: 0,
              padding: '6px 2px',
              minHeight: 36,
              borderRadius: 7,
              border: 0,
              background: isActive ? 'var(--brand)' : 'transparent',
              color: isActive ? 'var(--brand-fg)' : 'var(--text-2)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              transition: 'background 120ms ease, color 120ms ease',
              letterSpacing: '-0.01em',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
            }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              lineHeight: 1.15,
              textAlign: 'center',
              textWrap: 'balance',
              hyphens: 'none',
              overflowWrap: 'anywhere',
              wordBreak: 'normal'
            }}>{it.label}</span>
            {it.sub != null && it.sub !== '' &&
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-3)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap'
            }}>{it.sub}</span>}
          </button>);
      })}
    </div>);

}

// ─────────────────────────────────────────────────────────
// Section tabs — true mutually-exclusive tabs (Measurements · Materials ·
// Labor · Equipment · Disposal). Replaces the collapsible-accordion model
// per Craig (May '26 v2): "Long scrolling is the enemy of users."
// ─────────────────────────────────────────────────────────
function SectionTabs({ sections, activeSection, onSelect, facet, env, items }) {
  if (!facet) return null;
  const labels = { measurements: 'Measurements', materials: 'Materials', labor: 'Labor', equipment: 'Equipment', disposal: 'Disposal', photos: 'Photos' };
  const subtotalFor = (section) => {
    if (!facet.hasPricing) return null;
    if (!['materials', 'labor', 'equipment', 'disposal'].includes(section)) return null;
    const li = env.lineItems?.[section] || [];
    return li.reduce((sum, it) => sum + lineTotal(facet.id, section, it), 0);
  };
  const photoCount = items.filter((it) => it.facetId === facet.id).length;
  const visible = sections.filter((s) => s !== 'photos');
  return (
    <div style={{ padding: '0 14px 6px' }}>
      <div>
        <UnifiedTabStrip
          items={visible.map((sec) => ({ id: sec, label: labels[sec] }))}
          active={activeSection}
          onSelect={onSelect} />
      </div>
    </div>);

}

// ─────────────────────────────────────────────────────────
// Accordion section — collapsible block with header + body
// ─────────────────────────────────────────────────────────
function AccordionSection({ id, label, sub, accent, expanded, onToggle, children }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }} data-section-id={id}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          background: expanded ? 'var(--surface)' : 'transparent',
          border: 0, cursor: 'pointer', textAlign: 'left',
          transition: 'background 120ms ease'
        }}>
        <span style={{ display: 'inline-block', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms ease', lineHeight: 0, color: 'var(--text-3)' }}>
          <Icon.chev />
        </span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{label}</span>
          {sub && <span style={{ fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{sub}</span>}
        </span>
        {accent &&
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {accent}
        </span>}
      </button>
      {expanded &&
      <div style={{ padding: '4px 0 14px' }}>
        {children}
      </div>}
    </div>);

}

// Summary string for the Measurements accordion header.
function measurementSummary(env) {
  const m = env.measurements || {};
  const filled = Object.values(m).filter((v) => v != null && v !== '' && v !== 0).length;
  const pending = Object.keys(env.pendingMeas || {}).length;
  if (filled === 0 && pending === 0) return 'Not started';
  const bits = [];
  if (filled) bits.push(`${filled} value${filled === 1 ? '' : 's'} set`);
  if (pending) bits.push(`${pending} pending dictation${pending === 1 ? '' : 's'}`);
  return bits.join(' · ');
}

// ─────────────────────────────────────────────────────────
// Totals dock — per-structure subtotal + project total. Always visible at the
// bottom of the Build page so the rep sees the impact of every edit without
// jumping to the Proposal tab. (Craig, May '26 — idea 4.)
// ─────────────────────────────────────────────────────────
function structureSubtotal(s) {
  let total = 0;
  for (const facetId of s.scopes) {
    const env = s.envelope?.[facetId] || {};
    for (const sec of ['materials', 'labor', 'equipment', 'disposal']) {
      const lis = env.lineItems?.[sec] || [];
      total += lis.reduce((sum, li) => sum + lineTotal(facetId, sec, li), 0);
    }
  }
  return total;
}

function BuildTotalsDock({ structures, activeStructureId, activeFacet, activeSection, envelope }) {
  const active = structures.find((s) => s.id === activeStructureId) || structures[0];
  const activeTotal = structureSubtotal(active);
  const perStructure = structures.map((s) => ({ s, total: structureSubtotal(s) }));
  const projectTotal = perStructure.reduce((sum, x) => sum + x.total, 0);
  const isMulti = structures.length > 1;
  const [expanded, setExpanded] = useState(false);

  // Active section subtotal — Craig (May '26 v3): drop the dollar amounts from
  // each section tab and surface the active section's subtotal in the dock.
  const sectionLabels = { materials: 'Materials', labor: 'Labor', equipment: 'Equipment', disposal: 'Disposal' };
  const facetMeta = ENVELOPE_FACETS.find((f) => f.id === activeFacet);
  const showSectionStat = activeSection && sectionLabels[activeSection] && facetMeta?.hasPricing;
  const sectionSubtotal = showSectionStat ?
  (envelope?.[activeFacet]?.lineItems?.[activeSection] || []).reduce((s, li) => s + lineTotal(activeFacet, activeSection, li), 0) : 0;

  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -8px 20px rgba(0,0,0,0.06)',
      zIndex: 4
    }}>
      {isMulti && expanded &&
      <div style={{ padding: '10px 14px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
          Per structure
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8 }}>
          {perStructure.map(({ s, total }) =>
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{
              fontWeight: s.id === active.id ? 700 : 500,
              color: s.id === active.id ? 'var(--text)' : 'var(--text-2)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0
            }}>
              <Icon.building style={{ width: 11, height: 11, marginRight: 4, color: 'var(--text-3)' }} />{s.name}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--text)', flexShrink: 0 }}>{fmtMoney(total)}</span>
          </div>)}
        </div>
      </div>}
      <div style={{
        paddingTop: 8,
        paddingRight: 'calc(16px + env(safe-area-inset-right, 0px))',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'calc(16px + env(safe-area-inset-left, 0px))',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        {showSectionStat &&
        <>
          <DockStat label={sectionLabels[activeSection]} value={sectionSubtotal} brand />
          <DockSep />
        </>}
        <DockStat label={isMulti ? active.name : 'Structure'} value={activeTotal} brand={!showSectionStat && !isMulti} />
        {isMulti &&
        <>
          <DockSep />
          <DockStat label="Project" value={projectTotal} brand={!showSectionStat} />
        </>}
        <div style={{ flex: 1 }} />
        {isMulti &&
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Collapse breakdown' : 'Expand breakdown'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 28, padding: '0 8px',
            borderRadius: 999, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-2)',
            fontSize: 10, fontWeight: 700, cursor: 'pointer'
          }}>
          {expanded ? 'Hide' : 'Breakdown'} ({structures.length})
          <span style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 160ms', lineHeight: 0 }}><Icon.chev /></span>
        </button>}
      </div>
    </div>);

}

function DockStat({ label, value, brand }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <span style={{
        fontSize: 8, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)',
        textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
        color: brand ? 'var(--brand)' : 'var(--text)',
        fontVariantNumeric: 'tabular-nums', marginTop: 1, whiteSpace: 'nowrap'
      }}>{fmtMoney(value)}</span>
    </div>);

}

function DockSep() {
  return <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '2px 0' }} />;
}

Object.assign(window, { InspectionScreen });