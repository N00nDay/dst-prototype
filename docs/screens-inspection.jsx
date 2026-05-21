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

// Reasons a rep dismisses a package tier instead of associating a product.
// Surfaces in the dismiss-reason sheet on the package pillar; the picked
// reason is stored on env.packageDismissals[tier] so downstream (Proposal
// / Present) can show why the tier was skipped.
const PACKAGE_DISMISS_REASONS = [
  { id: 'spec_customer',     label: "Spec'd by customer",   blurb: "Homeowner already picked a specific product." },
  { id: 'insurance_match',   label: 'Insurance match',      blurb: 'Matching existing material per the claim.' },
  { id: 'out_of_budget',     label: 'Out of budget',        blurb: "Tier price doesn't fit this customer." },
  { id: 'customer_declined', label: 'Customer declined',    blurb: 'Offered, but homeowner said no.' },
  { id: 'not_offered',       label: 'Not offered',          blurb: "We don't carry this tier for this scope." }
];

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
  // Phase 2.3 B-6: Continue-review modal. Tapping Continue with open rows
  // surfaces a sheet listing them all so the rep can lock or adjust in
  // one place before advancing.
  const [showContinueReview, setShowContinueReview] = useState(false);
  // Scroll the section content back to top on every section / facet
  // switch so the rep doesn't land mid-page after navigating.
  const scrollAreaRef = window.React.useRef(null);
  useEffect(() => {
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 0;
  }, [activeSection, activeFacet, activeStructureId]);

  // If active structure's scopes shrink and they no longer include the
  // active facet, snap to the first available scope.
  useEffect(() => {
    if (allowedFacets.length === 0) return;
    if (!allowedFacets.find((f) => f.id === activeFacet)) {
      setActiveFacet(allowedFacets[0].id);
    }
  }, [activeStructure.id, allowedFacets.map((f) => f.id).join('|')]);

  // If the active facet doesn't offer the current section (e.g. gutters has
  // no Materials), snap to the first section it does offer. The virtual
  // 'other' section is allowed whenever the facet offers equipment OR
  // disposal — both get rendered inside the Other panel.
  useEffect(() => {
    const facet2 = ENVELOPE_FACETS.find((f) => f.id === activeFacet);
    const rawSecs = (facet2?.sections || ['measurements']).filter((s) => s !== 'photos');
    const hasOther = rawSecs.includes('equipment') || rawSecs.includes('disposal');
    const stepperIds = ['measurements', 'materials', 'labor'].filter((s) => rawSecs.includes(s));
    if (hasOther) stepperIds.push('other');
    if (!stepperIds.includes(activeSection)) setActiveSection(stepperIds[0] || 'measurements');
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
    // Editing a locked row implicitly unlocks it so the new value is
    // visible as "open" again — the rep didn't ask to keep their old
    // commitment when they changed the number.
    const locks = env.measurementLocks || {};
    const nextLocks = { ...locks };
    if (nextLocks[key] === 'locked') delete nextLocks[key];
    updateEnvelope({ measurements: nextMeasurements, pendingMeas: nextPending, lineItems: recomputeLineItems(nextMeasurements), measurementLocks: nextLocks });
  };

  // ─── Per-measurement lock / dismiss state (Phase 2.3 B-4) ────
  // measurementLocks: { [key]: 'locked' | 'dismissed' } per envelope.
  // Absence of a key === 'open'. Locked rows render in soft green;
  // dismissed rows strike through and offer Undo. Continue gate uses
  // the open count to flag rows that still need attention. (B-6.)
  const setMeasurementLock = (key, state) => {
    const locks = env.measurementLocks || {};
    const next = { ...locks };
    if (state == null) delete next[key];else
    next[key] = state;
    updateEnvelope({ measurementLocks: next });
  };
  const measurementLocks = env.measurementLocks || {};

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
      <div ref={scrollAreaRef} className="scroll-area" data-screen-label="Inspection" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {/* Sticky nav stack — scope tiles + section stepper travel with the
            rep as they scroll. The structure switcher chip lives in the
            AppContextBar header (rendered globally from app.jsx). */}
        <div style={{ position: 'sticky', top: 0, zIndex: 6, background: 'var(--bg)', boxShadow: '0 1px 0 var(--border)' }}>
          <EnvelopePicker
            activeFacet={activeFacet}
            setActiveFacet={setActiveFacet}
            structureScopes={activeStructure.scopes}
            envelope={envelope}
            onSetScopes={(next) => onSetStructureScopes && onSetStructureScopes(activeStructure.id, next)} />
          {!noScopes &&
          <SectionTabs sections={sections} activeSection={activeSection} onSelect={setActiveSection} facet={facet} env={env} items={items} />}
          {/* Copy-from-previous banner — phase 2.3 B-8. Shown when the
              active structure is fresh and at least one other structure
              already has substantial work. One tap deep-clones the source
              envelope into the active structure. */}
          {!noScopes &&
          <CopyFromPreviousBanner
            structures={structures || []}
            activeStructure={activeStructure}
            envelope={envelope}
            onCopyFrom={(srcId) => {
              const src = (structures || []).find((s) => s.id === srcId);
              if (!src) return;
              const cloned = JSON.parse(JSON.stringify(src.envelope || {}));
              // Locks carry over from source (deep clone already preserves
              // measurementLocks + lineItems[*].state). Belt-and-suspenders:
              // also auto-lock every row in the destination that has a
              // value but no explicit state — the rep is copying a
              // committed take-off, so the destination starts fully
              // locked. Dismissed rows stay dismissed; existing locks
              // are left alone.
              Object.keys(cloned).forEach((fid) => {
                const e = cloned[fid] || {};
                const schema = MEASUREMENT_SCHEMA[fid] || [];
                const meas = e.measurements || {};
                const locks = { ...(e.measurementLocks || {}) };
                schema.forEach((f) => {
                  if (locks[f.key]) return;
                  const v = meas[f.key];
                  if (v != null && v !== '' && v !== 0) locks[f.key] = 'locked';
                });
                e.measurementLocks = locks;
                if (e.lineItems) {
                  Object.keys(e.lineItems).forEach((sec) => {
                    e.lineItems[sec] = (e.lineItems[sec] || []).map((li) => {
                      if (li.state) return li;
                      const hasData = li.qty != null && Number(li.qty) > 0;
                      return hasData ? { ...li, state: 'locked' } : li;
                    });
                  });
                }
                cloned[fid] = e;
              });
              setEnvelope(cloned);
            }} />}
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
            {/* Phase 2.3 B-9: G/B/B package picker now lives ON the Materials
                sub-step instead of always at the top of the screen. The
                picker is contextual to picking materials, so collocating
                it with material rows makes the relationship explicit. */}
            {PACKAGE_FACETS.has(activeFacet) && activeSection === 'materials' &&
          <PackageSelector
            facetId={activeFacet}
            packageProducts={env.packageProducts || {}}
            packageDismissals={env.packageDismissals || {}}
            onChange={(tier, productId) => updateEnvelope({ packageProducts: { ...(env.packageProducts || {}), [tier]: productId } })}
            onChangeDismissal={(tier, reasonId) => updateEnvelope({ packageDismissals: { ...(env.packageDismissals || {}), [tier]: reasonId } })} />}
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
              onApplyOne={applyOneAerial}
              locks={measurementLocks}
              onSetLock={setMeasurementLock} />
            </div>}

            {['materials', 'labor'].map((sec) => {
            if (sec !== activeSection) return null;
            if (!sections.includes(sec) || !facet?.hasPricing) return null;
            // Materials line items are gated by package completion on
            // facets that have G/B/B tiers — the rep should commit to
            // each tier (associate a product, or dismiss with reason)
            // before they start picking individual materials.
            if (sec === 'materials' && PACKAGE_FACETS.has(activeFacet)) {
              const products = env.packageProducts || {};
              const dismissals = env.packageDismissals || {};
              const incomplete = TIER_KEYS.filter((k) => !products[k] && !dismissals[k]);
              if (incomplete.length > 0) {
                return (
                  <div key={sec} style={{ padding: '4px 14px 14px' }}>
                    <div style={{
                      padding: '14px 16px', borderRadius: 10,
                      border: '1px dashed var(--border-strong)', background: 'var(--surface-2)',
                      fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45, textAlign: 'center'
                    }}>
                      Complete all three packages above ({incomplete.map((k) => TIER_LABELS[k]).join(', ')} still open) before picking materials. Associate a product or dismiss the tier with a reason.
                    </div>
                  </div>);
              }
            }
            return (
              <div key={sec}>
                  <LineItemsPane envelopeId={activeFacet} section={sec} env={env} updateEnvelope={updateEnvelope} packageProducts={env.packageProducts || {}} />
                </div>);
          })}
            {/* Virtual "Other" section: render Equipment then Disposal as
                two grouped subsections. Underlying section ids stay intact
                so catalogs and price rollups don't need to change. */}
            {activeSection === 'other' && facet?.hasPricing && (() => {
              const hasEq = sections.includes('equipment');
              const hasDi = sections.includes('disposal');
              return (
                <>
                  {hasEq &&
                  <div>
                      <div style={{ padding: '14px 16px 0', fontSize: 11, fontWeight: 800, letterSpacing: 0.1, textTransform: 'uppercase', color: 'var(--text-3)' }}>Equipment</div>
                      <LineItemsPane envelopeId={activeFacet} section="equipment" env={env} updateEnvelope={updateEnvelope} packageProducts={env.packageProducts || {}} />
                    </div>}
                  {hasDi &&
                  <div>
                      <div style={{ padding: '14px 16px 0', fontSize: 11, fontWeight: 800, letterSpacing: 0.1, textTransform: 'uppercase', color: 'var(--text-3)' }}>Disposal</div>
                      <LineItemsPane envelopeId={activeFacet} section="disposal" env={env} updateEnvelope={updateEnvelope} packageProducts={env.packageProducts || {}} />
                    </div>}
                </>);
            })()}
          </div>}
      </div>

      {/* Totals dock removed — Craig (May '26 v4): per-structure / project
                  totals here over-inflate expenses when packages are still being
                  scoped. The number means nothing at the inspection stage; trust
                  the Proposal tab to surface dollars. */}

      {/* Dictate FAB — outside the scroll-area so it floats above content. */}
      {!noScopes && <DictateFab onDictate={() => onDictate(activeFacet)} bottomOffset={32} />}

      {/* Continue cascade — advances to next structure on Build, or to
          Slides on the last structure. Phase 2.3 B-6: open measurements
          across this structure are surfaced as a count in the sub-line,
          AND tapping Continue with open rows opens a review modal that
          lets the rep lock-all-and-continue in one step (or adjust
          individual rows before locking). */}
      {continueCascade && onContinue && (() => {
        // Build the open-rows list for the CURRENT section, across every
        // included scope on the active structure. Measure surveys the
        // measurement schema; Materials/Labor survey lineItems for that
        // section; Other surveys equipment + disposal lineItems combined.
        const sectionForSurvey = activeSection;
        const sectionsToSurvey = sectionForSurvey === 'other' ? ['equipment', 'disposal'] : [sectionForSurvey];
        const openRows = [];
        (activeStructure.scopes || []).forEach((fid) => {
          const e = (envelope || {})[fid] || {};
          const facetMeta = ENVELOPE_FACETS.find((f) => f.id === fid);
          const facetLabel = facetMeta?.label || fid;
          if (sectionForSurvey === 'measurements') {
            const schema = MEASUREMENT_SCHEMA[fid] || [];
            const locks = e.measurementLocks || {};
            const meas = e.measurements || {};
            schema.forEach((f) => {
              const v = meas[f.key];
              const lockState = locks[f.key] || 'open';
              if (lockState === 'open') {
                openRows.push({
                  kind: 'measurement',
                  facetId: fid, facetLabel,
                  fieldKey: f.key, fieldLabel: f.label, unit: f.unit, value: v,
                  step: f.step || 1, isText: !!f.isText
                });
              }
            });
          } else {
            sectionsToSurvey.forEach((sec) => {
              const items = e.lineItems?.[sec] || [];
              const catalog = (CATALOGS[fid] && CATALOGS[fid][sec]) || [];
              items.forEach((li, idx) => {
                const lockState = li.state || 'open';
                if (lockState !== 'open') return;
                const ce = li.custom ? null : catalog.find((c) => c.id === li.id);
                const name = li.custom?.name || ce?.name || '(unnamed)';
                const unit = li.custom?.unit || ce?.unit || '';
                openRows.push({
                  kind: 'lineItem',
                  facetId: fid, facetLabel,
                  section: sec, itemIdx: idx,
                  fieldLabel: name, unit, value: li.qty ?? 0,
                  step: 1, isText: false
                });
              });
            });
          }
        });
        const openRowCount = openRows.length;
        const sectionRowNoun = sectionForSurvey === 'measurements' ? 'measurement' : 'row';
        const extraSub = openRowCount > 0 ?
          ` · ${openRowCount} ${sectionRowNoun}${openRowCount === 1 ? '' : 's'} still open` :
          '';
        // Adjust a single row's value (used inside the review modal). Routes
        // by row kind: measurement edits the measurement map (and recomputes
        // any auto-linked line items downstream via setMeasurement upstream),
        // line item edits the qty in place.
        const setRow = (row, value) => {
          if (row.kind === 'measurement') {
            const e = (envelope || {})[row.facetId] || {};
            const nextMeas = { ...(e.measurements || {}), [row.fieldKey]: value };
            setEnvelope((s) => ({
              ...s,
              [row.facetId]: { ...(s?.[row.facetId] || {}), measurements: nextMeas }
            }));
            return;
          }
          // line item
          setEnvelope((s) => {
            const e = s?.[row.facetId] || {};
            const items = (e.lineItems?.[row.section] || []).map((li, i) => i === row.itemIdx ? { ...li, qty: value } : li);
            return { ...s, [row.facetId]: { ...e, lineItems: { ...(e.lineItems || {}), [row.section]: items } } };
          });
        };
        // Section-by-section cascade. Continue first walks Measure →
        // Materials → Labor → Other within the active scope; only after
        // Other does it delegate to the structure-level cascade (next
        // structure or Slides). The lock-all-and-continue modal still
        // gates the Measure → next transition while any open measurement
        // rows remain.
        const facetSecs = (facet?.sections || ['measurements']).filter((s) => s !== 'photos');
        const hasOther = facetSecs.includes('equipment') || facetSecs.includes('disposal');
        const stepperIds = ['measurements', 'materials', 'labor'].filter((s) => facetSecs.includes(s));
        if (hasOther) stepperIds.push('other');
        const curIdx = stepperIds.indexOf(activeSection);
        const isLastSection = curIdx === -1 || curIdx >= stepperIds.length - 1;
        const nextSectionLabel = { measurements: 'Measure', materials: 'Materials', labor: 'Labor', other: 'Other' };
        const continueLabel = isLastSection ? continueCascade.label : `Continue to ${nextSectionLabel[stepperIds[curIdx + 1]] || 'next'}`;
        const continueSub = isLastSection ? ((continueCascade.sub || '') + extraSub) : '';
        // Helpers to detect "scope complete" — every section's open-row
        // count is zero. Used to decide whether Continue jumps to the
        // next scope on this structure or to the structure cascade.
        const sectionsForFacet = (f) => {
          const secs = (f?.sections || ['measurements']).filter((s) => s !== 'photos');
          const hasO = secs.includes('equipment') || secs.includes('disposal');
          const ids = ['measurements', 'materials', 'labor'].filter((s) => secs.includes(s));
          if (hasO) ids.push('other');
          return ids;
        };
        const openCountFor = (facetId, section) => {
          const e = (envelope || {})[facetId] || {};
          if (section === 'measurements') {
            const schema = MEASUREMENT_SCHEMA[facetId] || [];
            const locks = e.measurementLocks || {};
            return schema.filter((f) => (locks[f.key] || 'open') === 'open').length;
          }
          const secs = section === 'other' ? ['equipment', 'disposal'] : [section];
          let n = 0;
          secs.forEach((sec) => {
            (e.lineItems?.[sec] || []).forEach((li) => {
              if ((li.state || 'open') === 'open') n += 1;
            });
          });
          return n;
        };
        const isScopeComplete = (facetId) => {
          const f = ENVELOPE_FACETS.find((x) => x.id === facetId);
          if (!f) return true;
          return sectionsForFacet(f).every((sec) => openCountFor(facetId, sec) === 0);
        };
        const nextIncompleteFacet = () => {
          if (!allowedFacets.length) return null;
          const startIdx = allowedFacets.findIndex((f) => f.id === activeFacet);
          for (let i = 1; i <= allowedFacets.length; i++) {
            const cand = allowedFacets[(startIdx + i) % allowedFacets.length];
            if (cand.id === activeFacet) continue;
            if (!isScopeComplete(cand.id)) return cand;
          }
          return null;
        };

        // Continue gate fires on EVERY section now — any open
        // (unlocked + undismissed) rows in the active section open the
        // review drawer before we advance. Traversal order:
        //   section → next section in this scope
        //   last section + scope incomplete elsewhere → next scope on this structure
        //   all scopes complete → structure cascade (next building or Slides)
        const advance = () => {
          if (!isLastSection) {
            setActiveSection(stepperIds[curIdx + 1]);
            return;
          }
          const nf = nextIncompleteFacet();
          if (nf) {
            setActiveFacet(nf.id);
            setActiveSection('measurements');
            return;
          }
          onContinue();
        };
        const onContinueClick = () => {
          if (openRowCount > 0) {
            setShowContinueReview(true);
            return;
          }
          advance();
        };
        // Lock everything currently open, then advance.
        const lockAllAndAdvance = () => {
          setEnvelope((s) => {
            const next = { ...s };
            openRows.forEach((row) => {
              const e = next[row.facetId] || {};
              if (row.kind === 'measurement') {
                const locks = { ...(e.measurementLocks || {}), [row.fieldKey]: 'locked' };
                next[row.facetId] = { ...e, measurementLocks: locks };
              } else {
                const items = (e.lineItems?.[row.section] || []).map((li, i) => i === row.itemIdx ? { ...li, state: 'locked' } : li);
                next[row.facetId] = { ...e, lineItems: { ...(e.lineItems || {}), [row.section]: items } };
              }
            });
            return next;
          });
          setShowContinueReview(false);
          advance();
        };
        return (
          <>
            <window.ContinueBar
              tablet={true}
              label={continueLabel}
              sub={continueSub}
              enabled={true}
              onContinue={onContinueClick} />
            {showContinueReview &&
              <ContinueReviewSheet
                openRows={openRows}
                onAdjust={setRow}
                onCancel={() => setShowContinueReview(false)}
                onLockAll={lockAllAndAdvance} />}
          </>);
      })()}
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
// Mirror of SCOPE_OPTIONS in screens-scope.jsx — keeps the Build scope
// tiles in lock-step with what reps can pick on the Scope screen.
const PICKER_ENVELOPES = [
  { id: 'repairs',    label: 'Repairs' },
  { id: 'roofing',    label: 'Roofing' },
  { id: 'siding',     label: 'Siding' },
  { id: 'solar',      label: 'Solar' },
  { id: 'windoors',   label: 'Windows & Doors' },
  { id: 'other',      label: 'Other' },
  { id: 'trim',       label: 'Trim Work' },
  { id: 'insulation', label: 'Insulation' }
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
  // Active (included) scopes sort to the left; excluded ones follow.
  // Within each bucket the canonical PICKER_ENVELOPES order is kept.
  const orderedScopes = useMemo(() => {
    const included = PICKER_ENVELOPES.filter((e) => (structureScopes || []).includes(e.id));
    const excluded = PICKER_ENVELOPES.filter((e) => !(structureScopes || []).includes(e.id));
    return [...included, ...excluded];
  }, [(structureScopes || []).join('|')]);
  return (
    <div style={{ background: 'var(--bg)', padding: '8px 14px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>Scopes</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${orderedScopes.length}, 1fr)`, gap: 8 }}>
        {orderedScopes.map((e) => {
          const status = envelopeStatusFor(e.id, structureScopes, envelope);
          const isExcluded = status.kind === 'excluded';
          const isDone = status.kind === 'done';
          const isActive = !isExcluded && e.id === activeFacet;
          const pct = status.kind === 'progress' ? status.pct : null;
          const ScopeIconCmp = window.ScopeIcon?.[e.id];
          const handleCardClick = () => {
            if (isExcluded) return;
            setActiveFacet(e.id);
          };
          const toggleScope = (ev) => {
            ev.stopPropagation();
            if (!onSetScopes) return;
            if (isExcluded) onSetScopes([...structureScopes, e.id]);else
            onSetScopes(structureScopes.filter((x) => x !== e.id));
          };
          return (
            <div
              key={e.id}
              role={isExcluded ? undefined : 'button'}
              tabIndex={isExcluded ? -1 : 0}
              onClick={handleCardClick}
              onKeyDown={(ev) => { if (!isExcluded && (ev.key === 'Enter' || ev.key === ' ')) handleCardClick(); }}
              style={{
                position: 'relative',
                padding: '10px 6px 8px',
                borderRadius: 10,
                background: isExcluded ? 'transparent' : (isActive ? 'var(--brand-soft)' : 'var(--surface)'),
                border: isExcluded ?
                  '1px dashed var(--border-strong)' :
                  (isActive ? '1.5px solid var(--brand)' : '1px solid var(--border)'),
                opacity: isExcluded ? 0.55 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: isExcluded ? 'default' : 'pointer', textAlign: 'center', userSelect: 'none'
              }}>
              {/* Top-right toggle — explicit add/remove affordance */}
              <button
                type="button"
                aria-label={isExcluded ? `Include ${e.label}` : `Exclude ${e.label}`}
                onClick={toggleScope}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 18, height: 18, borderRadius: 999,
                  background: isExcluded ? 'var(--brand)' : 'var(--surface-2)',
                  color: isExcluded ? 'var(--brand-fg)' : 'var(--text-3)',
                  border: isExcluded ? 'none' : '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, fontWeight: 700, lineHeight: 1, userSelect: 'none', padding: 0
                }}>
                {isExcluded ? '+' : '×'}
              </button>
              {/* Done badge — top-left so it doesn't collide with the toggle */}
              {isDone &&
              <span style={{
                position: 'absolute', top: 4, left: 4,
                width: 14, height: 14, borderRadius: 999,
                background: 'var(--success)', color: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700
              }}>✓</span>}
              {pct != null &&
              <span style={{
                position: 'absolute', top: 4, left: 4,
                padding: '1px 5px', borderRadius: 999,
                background: 'var(--surface-2)', color: 'var(--brand-soft-fg)',
                fontSize: 9, fontWeight: 700
              }}>{pct}%</span>}
              <div style={{
                color: isActive ? 'var(--brand)' : (isDone ? 'var(--success)' : 'var(--text-2)'),
                opacity: isExcluded ? 0.5 : 1,
                marginTop: 2
              }}>
                {ScopeIconCmp ? <ScopeIconCmp size={26} /> : null}
              </div>
              <div style={{
                fontSize: 10.5, fontWeight: 700,
                color: isActive ? 'var(--brand-soft-fg)' : (isDone ? 'var(--success)' : 'var(--text-2)'),
                lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%'
              }}>
                {e.label}
              </div>
            </div>);
        })}
      </div>
    </div>);
}

// ─────────────────────────────────────────────────────────
// CopyFromPreviousBanner — Phase 2.3 B-8 redesign port.
// On a multi-structure job, when the active structure has barely any
// envelope state and at least one other structure has been substantially
// filled out, surface a one-tap "copy everything" affordance so the rep
// doesn't have to re-enter every measurement on the second building.
// The copy is a deep clone (measurements + material/labor line items
// + packageProducts), so subsequent edits on the destination don't
// ripple back to the source.
// ─────────────────────────────────────────────────────────
function envelopeRichness(envObj) {
  // Heuristic "completeness" score — counts non-empty measurement values
  // and line items across all envelopes inside this structure.
  let score = 0;
  if (!envObj) return score;
  Object.values(envObj).forEach((env) => {
    if (!env || typeof env !== 'object') return;
    const m = env.measurements || {};
    score += Object.values(m).filter((v) => v != null && v !== '' && v !== 0).length;
    ['materials', 'labor', 'equipment', 'disposal'].forEach((sec) => {
      score += (env.lineItems?.[sec] || []).length;
    });
  });
  return score;
}

function CopyFromPreviousBanner({ structures, activeStructure, envelope, onCopyFrom }) {
  const [dismissed, setDismissed] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeRichness = envelopeRichness(envelope);
  const candidates = (structures || []).filter((s) => s.id !== activeStructure.id && envelopeRichness(s.envelope) >= 3);
  // Only show when the active structure is essentially blank AND another
  // structure has measurable progress.
  if (dismissed || activeRichness >= 2 || candidates.length === 0) return null;
  return (
    <div style={{ background: 'var(--bg)', padding: '4px 14px 8px' }}>
      <div style={{
        background: 'var(--brand-soft)', border: '1.5px solid var(--brand)', borderRadius: 12,
        padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--brand)',
            color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, flexShrink: 0
          }}>↗</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-soft-fg)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              Copy everything from another structure?
            </div>
            <div style={{ fontSize: 10, color: 'var(--brand-soft-fg)', opacity: 0.85, marginTop: 3, lineHeight: 1.4 }}>
              Measurements, materials, labor, packages — anything already filled in. You can edit any field after.
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            style={{
              background: 'transparent', border: 0, color: 'var(--brand-soft-fg)',
              fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 2, flexShrink: 0
            }}>×</button>
        </div>
        {!pickerOpen ?
          <button
            onClick={() => candidates.length === 1 ? onCopyFrom(candidates[0].id) : setPickerOpen(true)}
            style={{
              alignSelf: 'flex-start',
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--brand)', color: 'var(--brand-fg)',
              border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}>
            {candidates.length === 1 ? `Copy from ${candidates[0].name}` : `Choose source · ${candidates.length} available`}
          </button> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {candidates.map((s) =>
            <button
              key={s.id}
              onClick={() => { onCopyFrom(s.id); setPickerOpen(false); setDismissed(true); }}
              style={{
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border-strong)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: 'var(--surface-3)', color: 'var(--text-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 800, flexShrink: 0
                }}>{s.name.slice(0, 1).toUpperCase()}</span>
                <span style={{ flex: 1, minWidth: 0 }}>{s.name}</span>
                <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>
                  {envelopeRichness(s.envelope)} entries
                </span>
              </button>
            )}
            <button
              onClick={() => setPickerOpen(false)}
              style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'transparent', color: 'var(--brand-soft-fg)',
                border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer'
              }}>Cancel</button>
          </div>}
      </div>
    </div>);
}

// ─────────────────────────────────────────────────────────
// ContinueReviewSheet — Phase 2.3 B-6 redesign port.
// Bottom-sheet modal shown when the rep taps Continue with open
// measurement rows. Lists every open row with inline +/- steppers so
// the rep can adjust before locking. Two actions: Cancel returns to
// the screen without locking anything; "Lock all & continue" locks
// every listed row and advances to the next step.
// ─────────────────────────────────────────────────────────
function ContinueReviewSheet({ openRows, onAdjust, onCancel, onLockAll }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onCancel} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 18px 12px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {openRows.length} row{openRows.length === 1 ? '' : 's'} still open
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
            Lock them with their current values to continue, or adjust the numbers below first. Cancel returns without locking.
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {openRows.map((r, i) => {
            const rowKey = r.kind === 'lineItem' ?
              `${r.facetId}.${r.section}.${r.itemIdx}` :
              `${r.facetId}.${r.fieldKey}`;
            return (
              <div key={rowKey} style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 6, background: 'var(--surface-3)',
                  color: 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>🔓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.fieldLabel}</div>
                  <div style={{
                    fontSize: 9, color: 'var(--text-3)', marginTop: 1,
                    textTransform: 'uppercase', letterSpacing: 0.08, fontWeight: 700
                  }}>{r.facetLabel}{r.kind === 'lineItem' && r.section ? ` · ${r.section}` : ''}</div>
                </div>
                {!r.isText &&
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 2,
                  flexShrink: 0
                }}>
                  <button
                    type="button"
                    onClick={() => onAdjust(r, Math.max(0, (Number(r.value) || 0) - r.step))}
                    style={{ width: 28, height: 28, border: 'none', background: 'transparent', fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}
                    aria-label="decrease">−</button>
                  <span style={{
                    minWidth: 56, textAlign: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em'
                  }}>
                    {r.value} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{r.unit}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdjust(r, (Number(r.value) || 0) + r.step)}
                    style={{ width: 28, height: 28, border: 'none', background: 'transparent', fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}
                    aria-label="increase">+</button>
                </div>}
                {r.isText &&
                <span style={{
                  minWidth: 56, textAlign: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text)'
                }}>{r.value}</span>}
              </div>);
          })}
        </div>
        <div style={{ padding: '10px 18px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-block"
            style={{ flex: 1 }}
            onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ flex: 1 }}
            onClick={onLockAll}>
            Lock all & continue
          </button>
        </div>
      </div>
    </>);
}

// ─────────────────────────────────────────────────────────
// Package selector — Good / Better / Best pillars
// Three side-by-side pillar buttons (one per tier). Each starts empty.
// Tapping a pillar opens a bottom drawer listing the products available
// for that tier — pick one and the pillar fills in with the chosen
// Manufacturer · Product · Name. Matches the Proposal Builder's pattern
// (screens-build.jsx → TierPillar + ProductPickerDrawer).
// ─────────────────────────────────────────────────────────
function PackageSelector({ facetId, packageProducts, packageDismissals, onChange, onChangeDismissal }) {
  const tiers = PACKAGE_TIERS[facetId];
  const [drawerTier, setDrawerTier] = useState(null);
  const [dismissTier, setDismissTier] = useState(null);

  if (!tiers) {
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
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {TIER_KEYS.map((key) => {
          const selectedId = packageProducts?.[key] || null;
          const product = findPackageProduct(facetId, selectedId);
          const dismissal = packageDismissals?.[key] || null;
          return (
            <PackagePillar
              key={key}
              tierKey={key}
              tier={tiers[key]}
              product={product}
              dismissal={dismissal}
              onOpen={() => setDrawerTier(key)}
              onDismiss={() => setDismissTier(key)}
              onUndoDismiss={() => onChangeDismissal && onChangeDismissal(key, null)} />);
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

      {dismissTier &&
      <PackageDismissReasonSheet
        tierKey={dismissTier}
        onPick={(reasonId) => {
          onChangeDismissal && onChangeDismissal(dismissTier, reasonId);
          // Clear any associated product so the tier reads as dismissed.
          if (packageProducts?.[dismissTier]) onChange(dismissTier, null);
          setDismissTier(null);
        }}
        onClose={() => setDismissTier(null)} />}
    </div>);

}

// Sheet for picking why a package tier is being skipped. Mirrors the
// other bottom-sheet patterns in the prototype.
function PackageDismissReasonSheet({ tierKey, onPick, onClose }) {
  const accent = TIER_ACCENTS[tierKey];
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '70%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: '#fff', textTransform: 'uppercase', background: accent, padding: '2px 8px', borderRadius: 4 }}>{TIER_LABELS[tierKey]}</span>
          </div>
          <h3 style={{ margin: '6px 0 4px' }}>Why are you skipping this tier?</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            Pick a reason so the proposal can show why the tier wasn't offered.
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PACKAGE_DISMISS_REASONS.map((r) =>
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className="card"
            style={{
              textAlign: 'left', padding: 12, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 10,
              background: 'var(--surface)',
              display: 'flex', flexDirection: 'column', gap: 2
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{r.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4 }}>{r.blurb}</span>
            </button>
          )}
        </div>
      </div>
    </>);
}

// One pillar — empty CTA when no product picked, filled card when picked,
// dimmed dismissed state when the rep marks the tier skipped with a reason.
function PackagePillar({ tierKey, tier, product, dismissal, onOpen, onDismiss, onUndoDismiss }) {
  const accent = TIER_ACCENTS[tierKey];
  const hasProduct = !!product;
  const isDismissed = !!dismissal;
  const reason = isDismissed ? PACKAGE_DISMISS_REASONS.find((r) => r.id === dismissal) : null;
  return (
    <div style={{
      border: `1px solid ${(hasProduct || isDismissed) ? accent : 'var(--border)'}`,
      borderRadius: 12,
      background: 'var(--surface)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      opacity: isDismissed ? 0.6 : 1,
      transition: 'opacity 160ms ease, border-color 160ms ease'
    }}>
      {/* Colored header band — solid accent background with white label. */}
      <div style={{
        background: accent, color: '#fff',
        padding: '6px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 6
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.12, textTransform: 'uppercase' }}>
          {TIER_LABELS[tierKey]}
        </span>
        {!isDismissed &&
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${TIER_LABELS[tierKey]} package`}
          title={`Dismiss ${TIER_LABELS[tierKey]} — pick a reason`}
          style={{
            width: 20, height: 20, borderRadius: 4, padding: 0,
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 0,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
          <Icon.x style={{ width: 12, height: 12 }} />
        </button>}
      </div>
      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isDismissed ?
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8,
          background: 'var(--surface-2)', border: '1px solid var(--border)'
        }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>Dismissed</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                {reason ? reason.label : 'Skipped'}
              </span>
            </div>
            <button
              type="button"
              onClick={onUndoDismiss}
              aria-label="Undo dismiss"
              title="Restore this package"
              style={{
                width: 28, height: 28, borderRadius: 6, padding: 0,
                background: 'transparent', color: 'var(--brand)',
                border: '1px solid var(--brand)',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
              }}>↺</button>
          </div> :
        hasProduct ?
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
      </div>
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
                    floating in dead space below it (Craig, May '26 v4).
                    Phase 2.3 B-3: split the message into applied / remaining
                    counts so the rep sees at a glance how much of the aerial
                    is still untouched. */}
        {showApplyAll &&
        <div style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--text-3)' }}>
              {(() => {
                const appliedCount = aerialFields.filter((f) => {
                  const v = measurements?.[f.key];
                  return v != null && String(v) === String(aerial[f.key]);
                }).length;
                const remaining = aerialFields.length - appliedCount;
                if (allAerialApplied) {
                  return <><strong style={{ color: 'var(--success)', fontWeight: 700 }}>All {aerialFields.length}</strong> measurement{aerialFields.length === 1 ? '' : 's'} pulled from this aerial.</>;
                }
                return <><strong style={{ color: 'var(--brand)', fontWeight: 700 }}>{remaining} of {aerialFields.length}</strong> remaining{appliedCount > 0 ? ` · ${appliedCount} applied` : ''}.</>;
              })()}
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
function MeasurementsPane({ facetId, measurements, setMeasurement, aerial, pendingMeas, onApplyPending, onDismissPending, onApplyOne, locks, onSetLock }) {
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
            lockState={locks?.[f.key] || 'open'}
            onSetLock={(state) => onSetLock && onSetLock(f.key, state)}
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

function MeasurementRow({ field, value, aerialValue, pendingValue, onChange, onApply, onApplyPending, onDismissPending, lockState = 'open', onSetLock, last }) {
  const empty = value == null || value === '';
  const aerialAvailable = aerialValue != null && aerialValue !== '' && aerialValue !== 0;
  const matchesAerial = aerialAvailable && String(value) === String(aerialValue);
  const pendingAvailable = pendingValue != null && pendingValue !== '' && String(pendingValue) !== String(value);
  // Phase 2.3 B-5: visual lock state. Locked rows render in soft green;
  // dismissed rows strike through the label and dim the input. Open
  // rows render the existing chrome. Steppers and the input stay
  // editable in all states — editing implicitly unlocks (handled in
  // setMeasurement upstream).
  const isLocked = lockState === 'locked';
  const isDismissed = lockState === 'dismissed';
  return (
    <div style={{
      padding: '12px 14px',
      borderBottom: last ? 0 : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: isLocked ? 'var(--success-bg)' : (isDismissed ? 'var(--surface-2)' : 'transparent'),
      opacity: isDismissed ? 0.55 : 1
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
          color: isLocked ? 'var(--success)' : (isDismissed ? 'var(--text-3)' : 'inherit')
        }}>{field.label}</div>
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
          disabled={isLocked}
          style={{ width: 28, height: 32, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--text-2)', padding: 0, opacity: isLocked ? 0.4 : 1 }}
          aria-label="decrease">−</button>}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: field.isText ? 80 : 90, height: 32, border: '1px solid var(--border)', borderRadius: 6, background: isLocked ? 'var(--surface-2)' : 'var(--surface)', padding: '0 8px', opacity: isLocked ? 0.7 : 1 }}>
          <input
            type={field.isText ? 'text' : 'number'}
            value={empty ? '' : value}
            step={field.step || 1}
            placeholder="—"
            readOnly={isLocked}
            disabled={isLocked}
            onChange={(e) => {
              const raw = e.target.value;
              if (field.isText) onChange(raw);else
              onChange(raw === '' ? null : parseFloat(raw));
            }}
            style={{ flex: 1, minWidth: 0, height: '100%', border: 0, outline: 'none', fontSize: 13, fontWeight: 700, textAlign: 'right', background: 'transparent', fontVariantNumeric: 'tabular-nums', color: empty ? 'var(--text-3)' : 'var(--text)', cursor: isLocked ? 'not-allowed' : 'text' }} />
          {field.unit && <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 4, flexShrink: 0 }}>{field.unit}</span>}
        </div>
        {!field.isText &&
        <button
          type="button"
          onClick={() => onChange((Number(value) || 0) + (field.step || 1))}
          disabled={isLocked}
          style={{ width: 28, height: 32, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 600, color: 'var(--text-2)', padding: 0, opacity: isLocked ? 0.4 : 1 }}
          aria-label="increase">+</button>}
        {/* Row affordances — always two slots, contextual content:
            - Open      → [X dismiss] + [lock] (lock only when row has value)
            - Locked    → [unlock]                (single slot)
            - Dismissed → [undo]                  (single slot)
            Dismissing is only available when unlocked, per Craig's rule. */}
        {onSetLock && !field.isText && isLocked &&
        <button
          type="button"
          onClick={() => onSetLock(null)}
          aria-label="Unlock row"
          title="Unlock — re-open this row"
          style={{
            width: 32, height: 32, borderRadius: 6, padding: 0, flexShrink: 0,
            background: 'var(--success)', color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>🔒</button>}
        {onSetLock && !field.isText && isDismissed &&
        <button
          type="button"
          onClick={() => onSetLock(null)}
          aria-label="Undo dismiss"
          title="Undo — restore this row"
          style={{
            width: 32, height: 32, borderRadius: 6, padding: 0, flexShrink: 0,
            background: 'transparent', color: 'var(--brand)',
            border: '1px solid var(--brand)',
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>↺</button>}
        {onSetLock && !field.isText && !isLocked && !isDismissed &&
        <>
          <button
            type="button"
            onClick={() => onSetLock('dismissed')}
            aria-label="Dismiss row (mark not applicable)"
            title="Dismiss — mark this row not applicable"
            style={{
              width: 32, height: 32, borderRadius: 6, padding: 0, flexShrink: 0,
              background: 'transparent', color: 'var(--text-3)',
              border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>
            <Icon.x />
          </button>
          {!empty &&
          <button
            type="button"
            onClick={() => onSetLock('locked')}
            aria-label="Lock row"
            title="Lock — commit this row"
            style={{
              width: 32, height: 32, borderRadius: 6, padding: 0, flexShrink: 0,
              background: 'transparent', color: 'var(--text-3)',
              border: '1px solid var(--border)',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
            }}>🔓</button>}
        </>}
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
    // Phase 2.3 B-7: editing a quantity implicitly unlocks the row,
    // matching the measurements-row unlock-on-edit behavior.
    const n = lineItems.map((li, i) => {
      if (i !== idx) return li;
      const next = { ...li, qty };
      if (next.state === 'locked') delete next.state;
      return next;
    });
    setLineItems(n);
  };
  const setLock = (idx, state) => {
    const n = lineItems.map((li, i) => {
      if (i !== idx) return li;
      const next = { ...li };
      if (state == null) delete next.state;else
      next.state = state;
      return next;
    });
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
          onQty={updateQty} onSetLock={setLock} onTap={(idx) => setDetailOpen(idx)} onRemove={remove}
          onRemoveGroup={() => removeGroup({ subsection: 'steep' })} />
          <LineGroup
          title="Roofing — Flat / Low slope"
          tint="oklch(0.95 0.04 75)"
          rows={grouped.partitions.flat}
          envelopeId={envelopeId} section={section}
          colors={colors} setColor={setColor} setGroupColor={setGroupColor}
          onQty={updateQty} onSetLock={setLock} onTap={(idx) => setDetailOpen(idx)} onRemove={remove}
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
      <LineGroup key={group} title={group} rows={rows} envelopeId={envelopeId} section={section} colors={colors} setColor={setColor} setGroupColor={setGroupColor} onQty={updateQty} onSetLock={setLock} onTap={(idx) => setDetailOpen(idx)} onRemove={remove} onRemoveGroup={() => removeGroup({ group })} />
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
function LineGroup({ title, rows, envelopeId, section, colors, setColor, setGroupColor, onQty, onSetLock, onTap, onRemove, onRemoveGroup, tint, emptyHint }) {
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
          onSetLock={onSetLock}
          onTap={onTap}
          onRemove={onRemove}
          last={i === rows.length - 1} />
        )}
      </div>
    </div>);

}

function LineRow({ r, envelopeId, section, colors, setColor, onQty, onSetLock, onTap, onRemove, last }) {
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
  // Phase 2.3 B-7: per-row lock state matches the measurement-row pattern.
  const isLocked = li.state === 'locked';
  const isDismissed = li.state === 'dismissed';

  return (
    <div style={{
      padding: '10px 12px',
      borderBottom: last ? 0 : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: isLocked ? 'var(--success-bg)' : (isDismissed ? 'var(--surface-2)' : 'var(--surface)'),
      opacity: isDismissed ? 0.55 : 1
    }}>
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
          disabled={isLocked}
          style={{ width: 26, height: 28, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', padding: 0, opacity: isLocked ? 0.4 : 1 }}>−</button>
        <input
          type="number"
          value={li.qty == null ? '' : li.qty}
          readOnly={isLocked}
          disabled={isLocked}
          onChange={(e) => onQty(idx, e.target.value === '' ? 0 : parseFloat(e.target.value))}
          style={{ width: 48, height: 28, border: '1px solid var(--border)', borderRadius: 6, background: isLocked ? 'var(--surface-2)' : 'var(--surface)', textAlign: 'center', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', outline: 'none', cursor: isLocked ? 'not-allowed' : 'text', opacity: isLocked ? 0.7 : 1 }} />
        <button
          type="button"
          onClick={() => onQty(idx, qty + 1)}
          disabled={isLocked}
          style={{ width: 26, height: 28, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 6, cursor: isLocked ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--text-2)', padding: 0, opacity: isLocked ? 0.4 : 1 }}>+</button>
      </div>
      <div style={{ width: 64, textAlign: 'right', fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em', flexShrink: 0, fontVariantNumeric: 'tabular-nums', textDecoration: isDismissed ? 'line-through' : 'none' }}>{fmtMoney(total)}</div>
      {/* Same affordance pattern as measurement rows:
          - open      → [X dismiss] + [lock]
          - locked    → [unlock]
          - dismissed → [undo] */}
      {onSetLock && isLocked &&
      <button
        type="button"
        onClick={(e) => {e.stopPropagation();onSetLock(idx, null);}}
        aria-label="Unlock row"
        title="Unlock — re-open this row"
        style={{
          width: 28, height: 28, borderRadius: 6, padding: 0, flexShrink: 0,
          background: 'var(--success)', color: '#fff', border: 'none',
          cursor: 'pointer', fontSize: 11, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>🔒</button>}
      {onSetLock && isDismissed &&
      <button
        type="button"
        onClick={(e) => {e.stopPropagation();onSetLock(idx, null);}}
        aria-label="Undo dismiss"
        title="Undo — restore this row"
        style={{
          width: 28, height: 28, borderRadius: 6, padding: 0, flexShrink: 0,
          background: 'transparent', color: 'var(--brand)',
          border: '1px solid var(--brand)',
          cursor: 'pointer', fontSize: 13, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>↺</button>}
      {onSetLock && !isLocked && !isDismissed &&
      <>
        <button
          type="button"
          onClick={(e) => {e.stopPropagation();onSetLock(idx, 'dismissed');}}
          aria-label="Dismiss row (mark not applicable)"
          title="Dismiss — mark this row not applicable"
          style={{
            width: 28, height: 28, borderRadius: 6, padding: 0, flexShrink: 0,
            background: 'transparent', color: 'var(--text-3)',
            border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
          <Icon.x />
        </button>
        <button
          type="button"
          onClick={(e) => {e.stopPropagation();onSetLock(idx, 'locked');}}
          aria-label="Lock row"
          title="Lock — commit this row"
          style={{
            width: 28, height: 28, borderRadius: 6, padding: 0, flexShrink: 0,
            background: 'transparent', color: 'var(--text-3)',
            border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 11, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>🔓</button>
      </>}
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
//
// Phase 2.3 B-2: visually upgraded to a numbered SubStepStrip (numbered
// circles connected by a line) instead of pill tabs. Reads as progress
// through the build sub-steps, even though the rep can hop around freely.
// ─────────────────────────────────────────────────────────
function SectionTabs({ sections, activeSection, onSelect, facet, env, items }) {
  if (!facet) return null;
  // Equipment + Disposal collapse into a single "Other" step that renders
  // both as grouped subsections inside the same panel. The underlying
  // section ids (equipment/disposal) remain intact in catalogs and state.
  const hasEquipment = sections.includes('equipment');
  const hasDisposal = sections.includes('disposal');
  const visibleIds = [];
  if (sections.includes('measurements')) visibleIds.push('measurements');
  if (sections.includes('materials')) visibleIds.push('materials');
  if (sections.includes('labor')) visibleIds.push('labor');
  if (hasEquipment || hasDisposal) visibleIds.push('other');
  const labels = { measurements: 'Measure', materials: 'Materials', labor: 'Labor', other: 'Other' };
  return (
    <div style={{ padding: '0 14px 6px' }}>
      <SubStepStrip
        items={visibleIds.map((sec) => ({ id: sec, label: labels[sec] }))}
        active={activeSection}
        onSelect={onSelect} />
    </div>);

}

// ─────────────────────────────────────────────────────────
// SubStepStrip — numbered circles connected by a horizontal line,
// labels underneath. Visually signals "you're step N of M" while still
// allowing free navigation. Replaces UnifiedTabStrip on the Build screen
// for the section row. (Phase 2.3 B-2 redesign port.)
// ─────────────────────────────────────────────────────────
function SubStepStrip({ items, active, onSelect }) {
  if (!items || items.length === 0) return null;
  const activeIdx = Math.max(0, items.findIndex((it) => it.id === active));
  // Each step button gets an equal slice of width (flex: 1). With the
  // circle horizontally centered inside its button, the first circle's
  // center sits at half-a-slice from the container's left, the last at
  // half-a-slice from the right. Express the baseline and progress fill
  // as percentages of the container so they line up regardless of width.
  const halfSlicePct = 100 / (items.length * 2);
  const progressPct = items.length > 1 ? (activeIdx / items.length) * 100 : 0;
  return (
    <div style={{ padding: '4px 0 2px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Connecting baseline — from first-circle center to last-circle center. */}
        <div style={{
          position: 'absolute', top: 13, left: `${halfSlicePct}%`, right: `${halfSlicePct}%`, height: 2,
          background: 'var(--border)', zIndex: 0
        }} />
        {/* Brand progress fill — same start, ending at the active circle center. */}
        {items.length > 1 && activeIdx > 0 &&
        <div style={{
          position: 'absolute', top: 13, left: `${halfSlicePct}%`, height: 2,
          background: 'var(--brand)', zIndex: 0,
          width: `${progressPct}%`
        }} />}
        {items.map((it, i) => {
          const isActive = it.id === active;
          const isPast = i < activeIdx;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(it.id)}
              style={{
                position: 'relative', zIndex: 1,
                background: 'transparent', border: 0, cursor: 'pointer', padding: '2px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                flex: '1 1 0', minWidth: 0
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: isActive ? 'var(--brand)' : (isPast ? 'var(--brand)' : 'var(--surface)'),
                color: (isActive || isPast) ? 'var(--brand-fg)' : 'var(--text-3)',
                border: isActive ? '2px solid var(--brand)' : (isPast ? 'none' : '2px solid var(--border-strong)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, lineHeight: 1,
                boxShadow: isActive ? '0 0 0 4px var(--brand-soft)' : 'none',
                boxSizing: 'border-box', flexShrink: 0
              }}>
                {isPast ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: 10, fontWeight: isActive ? 700 : 600,
                color: isActive ? 'var(--text)' : 'var(--text-3)',
                textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.005em',
                maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{it.label}</div>
            </button>);
        })}
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

Object.assign(window, { InspectionScreen, PACKAGE_DISMISS_REASONS });