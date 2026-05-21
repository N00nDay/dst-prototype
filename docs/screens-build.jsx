/* global React, Icon, TIERS, LINE_ITEMS, CUSTOMER, BRANDS, fmt, fmt0, tierTotal */
/* Proposal Builder — replaces Quote (DST-PRICE) */

const { useState, useEffect, useMemo, useRef } = window;

// ─── Tier metadata ───────────────────────────────────────────
// Hard-coded per Craig: G/B/B is always shown to homeowner — never a selector.
// Rep configures all three pillars; customer chooses on the presentation.
const TIER_IDS = ['good', 'better', 'best'];
const TIER_ACCENT = { good: 'var(--text-2)', better: 'var(--brand)', best: 'var(--success)' };
const TIER_LABEL = { good: 'Good', better: 'Better', best: 'Best' };

// ─── Proposal-level scope catalog ────────────────────────────
// Each scope×tier offers a list of product packages (Manufacturer · Product · Name).
// Rep "associates" a product to each pillar — no numbers shown until selected.
// `allWarranties` is the full warranty menu for the scope; each product lists
// the subset it actually qualifies for. Drawer shows the full menu with the
// unsupported ones disabled (per Craig: "warranties not available should be disabled").
const SCOPE_CATALOG = [
{
  id: 'roofing', label: 'Roofing',
  blurb: 'Tear-off, underlayment, flashings, install.',
  allWarranties: [
  '30-yr mfr · 5-yr workmanship',
  '30-yr mfr · 10-yr workmanship',
  '50-yr mfr · 10-yr workmanship',
  'Platinum 50-yr · 25-yr workmanship',
  'Lifetime mfr · 10-yr workmanship',
  'Lifetime mfr · Lifetime workmanship',
  'Lifetime mfr · Lifetime workmanship · Transferable',
  'Platinum Protection · Lifetime'],

  tiers: {
    good: {
      products: [
      { id: 'r-ct-lm-g', mfr: 'CertainTeed', line: 'Landmark', name: 'Architectural', subtotal: 17850, summary: 'Landmark architectural · synthetic underlayment · standard flashings', warranties: ['30-yr mfr · 5-yr workmanship', '30-yr mfr · 10-yr workmanship'] },
      { id: 'r-gaf-tz-g', mfr: 'GAF', line: 'Timberline', name: 'HDZ', subtotal: 18200, summary: 'Timberline HDZ · synthetic underlayment · standard flashings', warranties: ['30-yr mfr · 5-yr workmanship', '30-yr mfr · 10-yr workmanship'] },
      { id: 'r-oc-td-g', mfr: 'Owens Corning', line: 'TruDef', name: 'Duration', subtotal: 18600, summary: 'TruDef Duration · synthetic underlayment · standard flashings', warranties: ['30-yr mfr · 5-yr workmanship', '30-yr mfr · 10-yr workmanship'] },
      { id: 'r-atl-pin-g', mfr: 'Atlas', line: 'Pinnacle', name: 'Pristine', subtotal: 18450, summary: 'Pinnacle Pristine · synthetic underlayment · standard flashings', warranties: ['30-yr mfr · 5-yr workmanship', '30-yr mfr · 10-yr workmanship'] }]

    },
    better: {
      products: [
      { id: 'r-ct-lmp-b', mfr: 'CertainTeed', line: 'Landmark', name: 'PRO', subtotal: 24800, summary: 'Landmark PRO · valley I&W · aluminum step flashing', warranties: ['50-yr mfr · 10-yr workmanship', 'Platinum 50-yr · 25-yr workmanship'] },
      { id: 'r-gaf-uhdz-b', mfr: 'GAF', line: 'Timberline', name: 'UHDZ', subtotal: 25500, summary: 'Timberline UHDZ · valley I&W · aluminum step flashing', warranties: ['50-yr mfr · 10-yr workmanship', 'Lifetime mfr · 10-yr workmanship'] },
      { id: 'r-oc-dd-b', mfr: 'Owens Corning', line: 'Duration', name: 'Designer (Class 4)', subtotal: 26400, summary: 'Duration Designer (Class 4 IR) · valley I&W · aluminum step', warranties: ['Lifetime mfr · 10-yr workmanship', '50-yr mfr · 10-yr workmanship'] },
      { id: 'r-ct-ng-b', mfr: 'CertainTeed', line: 'Northgate', name: 'Class 4 IR', subtotal: 27200, summary: 'Northgate (Class 4 IR) · valley I&W · aluminum step', warranties: ['Lifetime mfr · 10-yr workmanship', 'Platinum 50-yr · 25-yr workmanship'] },
      { id: 'r-atl-imp-b', mfr: 'Atlas', line: 'StormMaster', name: 'IR (Impact)', subtotal: 25900, summary: 'StormMaster IR (Class 4 impact) · valley I&W · aluminum step', warranties: ['Lifetime mfr · 10-yr workmanship', '50-yr mfr · 10-yr workmanship'] }]

    },
    best: {
      products: [
      { id: 'r-ct-ps-x', mfr: 'CertainTeed', line: 'Presidential', name: 'Shake', subtotal: 31900, summary: 'Presidential Shake · full I&W · copper flashing', warranties: ['Lifetime mfr · Lifetime workmanship', 'Lifetime mfr · Lifetime workmanship · Transferable', 'Platinum Protection · Lifetime'] },
      { id: 'r-gaf-sl-x', mfr: 'GAF', line: 'Slateline', name: 'Designer', subtotal: 32800, summary: 'Slateline designer · full I&W · copper flashing', warranties: ['Lifetime mfr · Lifetime workmanship', 'Lifetime mfr · Lifetime workmanship · Transferable'] },
      { id: 'r-oc-bk-x', mfr: 'Owens Corning', line: 'Berkshire', name: 'Collection', subtotal: 34200, summary: 'Berkshire Collection · full I&W · copper flashing', warranties: ['Lifetime mfr · Lifetime workmanship · Transferable', 'Platinum Protection · Lifetime'] },
      { id: 'r-atl-sm-x', mfr: 'Atlas', line: 'StormMaster', name: 'Shake', subtotal: 33100, summary: 'StormMaster Shake · full I&W · copper flashing', warranties: ['Lifetime mfr · Lifetime workmanship', 'Lifetime mfr · Lifetime workmanship · Transferable'] }]

    }
  }
},
{
  id: 'siding', label: 'Siding',
  blurb: 'Tear-off, wrap, install, paint.',
  allWarranties: ['15-yr finish', '25-yr finish', '30-yr finish', '30-yr finish + transferable', 'Lifetime substrate + 30-yr finish'],
  tiers: {
    good: {
      products: [
      { id: 's-lp-ss-g', mfr: 'LP', line: 'SmartSide', name: 'Lap Siding', subtotal: 18200, summary: 'LP SmartSide lap · standard primer-coat finish · 5/4 trim', warranties: ['15-yr finish'] },
      { id: 's-jh-sc-g', mfr: 'James Hardie', line: 'HardiePlank', name: 'Select Cedarmill', subtotal: 19400, summary: 'HardiePlank Select Cedarmill · ColorPlus standard · 5/4 trim', warranties: ['15-yr finish', '25-yr finish'] }]

    },
    better: {
      products: [
      { id: 's-lp-ef-b', mfr: 'LP', line: 'SmartSide', name: 'ExpertFinish', subtotal: 25200, summary: 'LP ExpertFinish · 16 baked colors · upgraded trim', warranties: ['25-yr finish', '30-yr finish'] },
      { id: 's-jh-cp-b', mfr: 'James Hardie', line: 'HardiePlank', name: 'ColorPlus + Shingle', subtotal: 26800, summary: 'HardiePlank ColorPlus + HardieShingle accents · upgraded trim', warranties: ['25-yr finish', '30-yr finish'] }]

    },
    best: {
      products: [
      { id: 's-lp-dk-x', mfr: 'LP', line: 'Diamond Kote', name: 'Premium', subtotal: 33400, summary: 'Diamond Kote premium finish · custom trim · color match', warranties: ['30-yr finish + transferable', 'Lifetime substrate + 30-yr finish'] },
      { id: 's-jh-art-x', mfr: 'James Hardie', line: 'Artisan', name: 'Series', subtotal: 35200, summary: 'HardiePlank Artisan profile · custom trim · color match', warranties: ['30-yr finish + transferable', 'Lifetime substrate + 30-yr finish'] }]

    }
  }
},
{
  id: 'gutters', label: 'Gutters',
  blurb: 'Seamless aluminum runs, downspouts, splash blocks.',
  allWarranties: ['5-yr workmanship', '10-yr workmanship + lifetime guards', '15-yr workmanship + lifetime guards', 'Lifetime workmanship'],
  tiers: {
    good: {
      products: [
      { id: 'g-5k-g', mfr: 'IHS', line: 'K-Style', name: '5" Aluminum', subtotal: 2180, summary: '5" K-style · 5 downspouts · standard hangers', warranties: ['5-yr workmanship'] },
      { id: 'g-6k-g', mfr: 'IHS', line: 'K-Style', name: '6" Aluminum', subtotal: 2570, summary: '6" K-style · 5 downspouts · standard hangers', warranties: ['5-yr workmanship'] }]

    },
    better: {
      products: [
      { id: 'g-6k-lg-b', mfr: 'LeafGuard', line: 'MicroMesh', name: '6" K-Style + Guards', subtotal: 4020, summary: '6" K-style + micro-mesh guards full perimeter', warranties: ['10-yr workmanship + lifetime guards'] },
      { id: 'g-6k-lf-b', mfr: 'LeafFilter', line: 'Stainless', name: '6" K-Style + Guards', subtotal: 4280, summary: '6" K-style + LeafFilter stainless guards', warranties: ['15-yr workmanship + lifetime guards'] }]

    },
    best: {
      products: [
      { id: 'g-hr-cu-x', mfr: 'IHS', line: 'Half-Round', name: 'Copper', subtotal: 5680, summary: 'Half-round copper w/ guards', warranties: ['Lifetime workmanship'] },
      { id: 'g-hr-ht-x', mfr: 'IHS', line: 'Half-Round', name: 'Copper + Heat', subtotal: 6200, summary: 'Half-round copper w/ guards · heated valley sections', warranties: ['Lifetime workmanship'] }]

    }
  }
},
{
  id: 'windoors', label: 'Windows & Doors',
  blurb: 'Replacement, trim, caulk, full flashing.',
  allWarranties: ['10-yr glass · 5-yr install', '20-yr glass · 10-yr install', 'Lifetime glass · 15-yr install', 'Lifetime glass · Lifetime install'],
  tiers: {
    good: {
      products: [
      { id: 'w-vyl-g', mfr: 'IHS', line: 'Vinyl', name: 'Standard (4 windows)', subtotal: 12400, summary: '4 vinyl windows · standard install · existing trim', warranties: ['10-yr glass · 5-yr install'] }]

    },
    better: {
      products: [
      { id: 'w-and-fx-b', mfr: 'Andersen', line: 'Fibrex', name: '4 Windows · LowE-3', subtotal: 18800, summary: '4 Fibrex windows · new wraps · LowE-3 glass', warranties: ['20-yr glass · 10-yr install'] },
      { id: 'w-pel-ls-b', mfr: 'Pella', line: 'Lifestyle Series', name: '5 Windows', subtotal: 19400, summary: 'Pella Lifestyle 5 windows · new wraps · LowE glass', warranties: ['20-yr glass · 10-yr install'] }]

    },
    best: {
      products: [
      { id: 'w-and-400-x', mfr: 'Andersen', line: '400 Series', name: '8 Windows + Door', subtotal: 27800, summary: 'Andersen 400 8 windows + entry door · custom trim', warranties: ['Lifetime glass · 15-yr install', 'Lifetime glass · Lifetime install'] },
      { id: 'w-mar-wc-x', mfr: 'Marvin', line: 'Elevate', name: '8 Wood-Clad + Door', subtotal: 28600, summary: 'Marvin wood-clad 8 windows + entry door · custom trim', warranties: ['Lifetime glass · 15-yr install', 'Lifetime glass · Lifetime install'] }]

    }
  }
}];


// Commission rate (% of gross profit) — mocked. Production reads from rep plan.
const COMMISSION_RATE = 0.10;
const COST_RATIO = 0.65;

// Add-ons surfaced in the proposal (must mirror PRESENT_ADDONS in pitchdeck —
// Craig (May '26): align add-ons here with the ones shown at end of presentation).
// Care Plan removed per Craig until cross-IHS rollout decision.
const PROPOSAL_ADDONS = [
{ id: 'gutters', label: 'Seamless Gutters', desc: 'New 6" seamless aluminum, color-matched to your home.', price: 2570 },
{ id: 'guards', label: 'Gutter Guards', desc: 'Micro-mesh leaf protection. No more ladders twice a year.', price: 1450 },
{ id: 'skylight', label: 'Skylight', desc: 'Velux fixed deck-mount with full flashing kit.', price: 1875 },
{ id: 'chimney', label: 'Chimney Reflash', desc: 'New step + counter flashing. Stops the #1 leak source.', price: 985 }];


// Lookup helpers
const findProduct = (scope, tierId, productId) => {
  if (!productId) return null;
  return scope.tiers[tierId]?.products?.find((p) => p.id === productId) || null;
};

// Default proposal shape for a freshly added structure. (Used by the
// per-structure pricing model — Phase 2.4 M-1..M-3.)
const DEFAULT_PROPOSAL = {
  includedScopes: { roofing: true, siding: true, gutters: false, windoors: false },
  scopeProducts: {},
  scopeDiscount: {},
  scopeWarranty: {}
};

function ProposalBuilderScreen({ tablet, brand, rep, selected, setSelected, structures, activeStructureId, setActiveStructureId, onBack, onPresent }) {
  // Pricing presentation mode. All-in = one project total view; By-structure
  // = per-structure tabs. The underlying state is now per-structure (M-1..M-3
  // landed); modes just affect which structures the UI surfaces.
  const [pricingMode, setPricingMode] = useState((structures || []).length > 1 ? 'by' : 'allin');

  // ─── Per-structure proposal state ───────────────────────────
  // Each structure carries its own includedScopes / scopeProducts /
  // scopeDiscount / scopeWarranty. The active structure's proposal is what
  // the scope cards render and edit. Aggregate rollups walk every
  // structure to produce grand totals + per-structure breakdowns for the
  // structure tabs and downstream Present surface. Add-ons remain global
  // for now — splitting them per structure is a follow-up (PR-3 timeline).
  const [proposals, setProposals] = useState(() => {
    const seed = {};
    (structures || []).forEach((s) => { seed[s.id] = { ...DEFAULT_PROPOSAL }; });
    return seed;
  });
  // Lazy-init proposals for any structure that was added after first mount.
  useEffect(() => {
    const missing = (structures || []).filter((s) => !proposals[s.id]);
    if (missing.length) {
      setProposals((p) => {
        const next = { ...p };
        missing.forEach((s) => { next[s.id] = { ...DEFAULT_PROPOSAL }; });
        return next;
      });
    }
  }, [(structures || []).map((s) => s.id).join('|')]);

  // Active structure's proposal — what the UI reads/writes.
  const activeProposal = proposals[activeStructureId] || DEFAULT_PROPOSAL;
  const includedScopes = activeProposal.includedScopes;
  const scopeProducts = activeProposal.scopeProducts;
  const scopeDiscount = activeProposal.scopeDiscount;
  const scopeWarranty = activeProposal.scopeWarranty;

  const [includedAddons, setIncludedAddons] = useState({});

  // Drawer state — single-instance, parameterized.
  const [productDrawer, setProductDrawer] = useState(null); // { scopeId, tierId }
  const [warrantyDrawer, setWarrantyDrawer] = useState(null); // { scopeId, tierId }

  // Writer that targets the active structure's proposal.
  const updateActiveProposal = (patch) => {
    setProposals((p) => ({
      ...p,
      [activeStructureId]: { ...(p[activeStructureId] || DEFAULT_PROPOSAL), ...patch }
    }));
  };
  const setIncludedScopes = (updater) => {
    const next = typeof updater === 'function' ? updater(includedScopes) : updater;
    updateActiveProposal({ includedScopes: next });
  };

  // Rollup for a single (scope, tier) pillar from a specific proposal.
  // Returns { productId: null } when no product is picked yet.
  const pillarRollupFor = (proposal, scope, tierId) => {
    const productId = proposal.scopeProducts[scope.id]?.[tierId];
    const product = findProduct(scope, tierId, productId);
    if (!product) return { productId: null };
    const subtotal = product.subtotal;
    const cost = Math.round(subtotal * COST_RATIO);
    const discount = proposal.scopeDiscount[scope.id]?.[tierId] || 0;
    const total = Math.max(cost, subtotal - discount);
    const gp = total - cost;
    const warranty = proposal.scopeWarranty[scope.id]?.[tierId] ?? product.warranties[0];
    return { productId, product, subtotal, cost, discount, total, gp, warranty };
  };

  // Rollup for the active structure — used by the scope card pillars.
  const pillarRollup = (scope, tierId) => pillarRollupFor(activeProposal, scope, tierId);

  const setProduct = (scopeId, tierId, productId) => {
    setProposals((p) => {
      const prev = p[activeStructureId] || DEFAULT_PROPOSAL;
      const nextProducts = { ...prev.scopeProducts, [scopeId]: { ...prev.scopeProducts[scopeId], [tierId]: productId } };
      // Reset warranty & discount for that pillar so they re-derive from the new product.
      const nextWarranty = { ...prev.scopeWarranty, [scopeId]: { ...prev.scopeWarranty[scopeId] } };
      delete nextWarranty[scopeId][tierId];
      const nextDiscount = { ...prev.scopeDiscount, [scopeId]: { ...prev.scopeDiscount[scopeId] } };
      delete nextDiscount[scopeId][tierId];
      return { ...p, [activeStructureId]: { ...prev, scopeProducts: nextProducts, scopeWarranty: nextWarranty, scopeDiscount: nextDiscount } };
    });
  };

  const setDiscount = (scopeId, tierId, v) => {
    setProposals((p) => {
      const prev = p[activeStructureId] || DEFAULT_PROPOSAL;
      return { ...p, [activeStructureId]: { ...prev, scopeDiscount: { ...prev.scopeDiscount, [scopeId]: { ...prev.scopeDiscount[scopeId], [tierId]: v } } } };
    });
  };

  const setWarranty = (scopeId, tierId, w) => {
    setProposals((p) => {
      const prev = p[activeStructureId] || DEFAULT_PROPOSAL;
      return { ...p, [activeStructureId]: { ...prev, scopeWarranty: { ...prev.scopeWarranty, [scopeId]: { ...prev.scopeWarranty[scopeId], [tierId]: w } } } };
    });
  };

  // ─── Per-structure rollups + grand aggregate ─────────────────
  // Each entry: { structureId, name, low, high, gpLow, gpHigh, scopeRollups }
  // where scopeRollups[scopeId] = { low, high, gpLow, gpHigh } per scope
  // (used by Present's per-scope summary cards).
  const perStructure = useMemo(() => {
    return (structures || []).map((s) => {
      const proposal = proposals[s.id] || DEFAULT_PROPOSAL;
      let low = 0, high = 0, gpLow = 0, gpHigh = 0;
      const scopeRollups = {};
      SCOPE_CATALOG.forEach((sc) => {
        if (!proposal.includedScopes[sc.id]) return;
        const pillarTotals = [];
        const pillarGPs = [];
        TIER_IDS.forEach((t) => {
          const r = pillarRollupFor(proposal, sc, t);
          if (r.productId) {
            pillarTotals.push(r.total);
            pillarGPs.push(r.gp);
          }
        });
        if (pillarTotals.length) {
          const sLow = Math.min(...pillarTotals);
          const sHigh = Math.max(...pillarTotals);
          const sGpLow = Math.min(...pillarGPs);
          const sGpHigh = Math.max(...pillarGPs);
          low += sLow; high += sHigh; gpLow += sGpLow; gpHigh += sGpHigh;
          scopeRollups[sc.id] = { low: sLow, high: sHigh, gpLow: sGpLow, gpHigh: sGpHigh };
        }
      });
      return { structureId: s.id, name: s.name, low, high, gpLow, gpHigh, scopeRollups };
    });
  }, [proposals, (structures || []).map((s) => s.id + ':' + s.name).join('|')]);

  // Grand rollup: sum of per-structure totals, then global add-ons.
  const grand = useMemo(() => {
    let low = 0, high = 0, gpLow = 0, gpHigh = 0;
    perStructure.forEach((ps) => {
      low += ps.low; high += ps.high; gpLow += ps.gpLow; gpHigh += ps.gpHigh;
    });
    // Add-ons: selected ones go in both low and high; un-selected only inflate high.
    PROPOSAL_ADDONS.forEach((a) => {
      const aCost = Math.round(a.price * COST_RATIO);
      const aGp = a.price - aCost;
      if (includedAddons[a.id]) {
        low += a.price; high += a.price;
        gpLow += aGp; gpHigh += aGp;
      } else {
        high += a.price;
        gpHigh += aGp;
      }
    });
    const commLow = Math.round(gpLow * COMMISSION_RATE);
    const commHigh = Math.round(gpHigh * COMMISSION_RATE);
    return { low, high, gpLow, gpHigh, commLow, commHigh };
  }, [perStructure, includedAddons]);

  const enabledScopeCount = Object.values(includedScopes).filter(Boolean).length;
  // Ready to present when every included scope on EVERY structure has at
  // least one tier with a product associated.
  const allReady = (structures || []).every((s) => {
    const p = proposals[s.id] || DEFAULT_PROPOSAL;
    return SCOPE_CATALOG.every((sc) => {
      if (!p.includedScopes[sc.id]) return true;
      return TIER_IDS.some((t) => p.scopeProducts[sc.id]?.[t]);
    });
  });
  const totalEnabledScopes = (structures || []).reduce((n, s) => {
    const p = proposals[s.id] || DEFAULT_PROPOSAL;
    return n + Object.values(p.includedScopes).filter(Boolean).length;
  }, 0);
  const canPresent = totalEnabledScopes > 0 && allReady;

  // Drawer scope helpers
  const drawerScope = productDrawer ? SCOPE_CATALOG.find((s) => s.id === productDrawer.scopeId) : null;
  const warrantyScope = warrantyDrawer ? SCOPE_CATALOG.find((s) => s.id === warrantyDrawer.scopeId) : null;
  const warrantyProduct = warrantyScope && findProduct(warrantyScope, warrantyDrawer.tierId, scopeProducts[warrantyDrawer.scopeId]?.[warrantyDrawer.tierId]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {/* Compact hero */}
        <div style={{ padding: tablet ? '18px 28px 4px' : '14px 16px 4px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 26 : 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Build the proposal
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
            Products and tiers carry over from Build. Adjust margins, add-ons, and how the customer sees pricing.
          </div>
        </div>

        {/* Pricing toggle — All-in vs By-structure. Layout choice only; tier
            picks always happen per structure on the presentation slides. */}
        <PricingModeToggle
          tablet={tablet}
          mode={pricingMode}
          onChange={setPricingMode}
          structures={structures || []} />

        {/* Structure tabs — only render when 2+ structures + By-structure
            mode. Horizontally scrolling snap-grid so condo complexes fit. */}
        {pricingMode === 'by' && (structures || []).length > 1 && (
          <StructureTabs
            tablet={tablet}
            structures={structures}
            activeStructureId={activeStructureId}
            onSelect={setActiveStructureId}
            perStructure={perStructure} />
        )}

        {/* Project overview — all structures stacked. Phase 2.4 P-4.
            Renders only when 2+ structures exist; complements (doesn't
            replace) the per-structure scope cards below by showing the
            bundle at a glance. */}
        {(structures || []).length > 1 && (
          <ProjectOverviewCard
            tablet={tablet}
            structures={structures}
            perStructure={perStructure}
            activeStructureId={activeStructureId}
            onSelectStructure={setActiveStructureId}
            grand={grand} />
        )}

        {/* SCOPES */}
        <div style={{ padding: tablet ? '14px 28px 0' : '12px 16px 0' }}>
          <SectionLabel
            label="Scopes of work"
            sub={`${enabledScopeCount} of ${SCOPE_CATALOG.length} included`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SCOPE_CATALOG.map((scope) => {
              const included = !!includedScopes[scope.id];
              const pillars = TIER_IDS.map((t) => ({ tierId: t, rollup: pillarRollup(scope, t) }));
              const anyPicked = pillars.some((p) => p.rollup.productId);
              return (
                <ScopeCard
                  key={scope.id}
                  scope={scope}
                  included={included}
                  anyPicked={anyPicked}
                  onToggle={() => setIncludedScopes((s) => ({ ...s, [scope.id]: !included }))}
                  pillars={pillars}
                  onOpenProductDrawer={(tierId) => setProductDrawer({ scopeId: scope.id, tierId })}
                  onOpenWarrantyDrawer={(tierId) => setWarrantyDrawer({ scopeId: scope.id, tierId })}
                  setDiscount={(tierId, v) => setDiscount(scope.id, tierId, v)}
                  tablet={tablet} />);
            })}
          </div>
        </div>

        {/* ADD-ONS */}
        <div style={{ padding: tablet ? '18px 28px 0' : '16px 16px 0' }}>
          <SectionLabel
            label="Add-ons to display"
            sub={`${Object.values(includedAddons).filter(Boolean).length} of ${PROPOSAL_ADDONS.length} on the menu`} />
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {PROPOSAL_ADDONS.map((a, i) => {
              const on = !!includedAddons[a.id];
              return (
                <div key={a.id}
                onClick={() => setIncludedAddons((s) => ({ ...s, [a.id]: !on }))}
                style={{
                  padding: tablet ? '12px 18px' : '11px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  background: on ? 'var(--success-bg)' : 'transparent',
                  transition: 'background 120ms ease'
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: on ? 'var(--success)' : 'transparent',
                    border: `1.5px solid ${on ? 'var(--success)' : 'var(--border-strong)'}`,
                    color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'background 120ms, border-color 120ms'
                  }}>
                    {on && <Icon.check style={{ width: 13, height: 13 }} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, lineHeight: 1.4 }}>{a.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: on ? 'var(--success)' : 'var(--text-2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    +{fmt(a.price)}
                  </div>
                </div>);
            })}
          </div>
        </div>

        {/* Bottom spacer so floating bar doesn't cover content */}
        <div style={{ height: tablet ? 30 : 24 }} />
      </div>

      {/* FLOATING TOTAL BAR — always visible above the scroll. */}
      <ProposalBottomBar
        tablet={tablet}
        grand={grand}
        canPresent={canPresent}
        onPresent={onPresent} />

      {/* Drawers */}
      {productDrawer && drawerScope &&
      <ProductPickerDrawer
        scope={drawerScope}
        tierId={productDrawer.tierId}
        selectedProductId={scopeProducts[productDrawer.scopeId]?.[productDrawer.tierId] || null}
        onPick={(pid) => {setProduct(productDrawer.scopeId, productDrawer.tierId, pid);setProductDrawer(null);}}
        onClear={() => {setProduct(productDrawer.scopeId, productDrawer.tierId, null);setProductDrawer(null);}}
        onClose={() => setProductDrawer(null)} />}


      {warrantyDrawer && warrantyScope &&
      <WarrantyPickerDrawer
        scope={warrantyScope}
        tierId={warrantyDrawer.tierId}
        product={warrantyProduct}
        selected={scopeWarranty[warrantyDrawer.scopeId]?.[warrantyDrawer.tierId] ?? warrantyProduct?.warranties?.[0]}
        onPick={(w) => {setWarranty(warrantyDrawer.scopeId, warrantyDrawer.tierId, w);setWarrantyDrawer(null);}}
        onClose={() => setWarrantyDrawer(null)} />}

    </div>);
}

// ─── Floating bottom bar ──────────────────────────────────────
// Shows ranges (low → high) since the homeowner hasn't picked a tier yet.
// Per Craig: "Because this is building the proposal we should show ranges
// for these numbers low to high."
// Phase 2.4 P-2: project total range is the primary number; GP and
// commission relegated to a tighter secondary line so the bottom bar
// reads as "this is what the homeowner will see" with the rep's
// numbers as supporting context.
function ProposalBottomBar({ tablet, grand, canPresent, onPresent }) {
  const totalShowsRange = grand.low !== grand.high && (grand.low || grand.high);
  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -10px 24px rgba(0,0,0,0.08)',
      padding: tablet ? '12px 28px' : '10px 14px env(safe-area-inset-bottom, 10px)',
      display: 'flex', alignItems: 'center', gap: tablet ? 18 : 12
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.1, flex: '0 1 auto' }}>
        <span style={{ fontSize: tablet ? 10 : 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Project total range
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: tablet ? (totalShowsRange ? 22 : 26) : (totalShowsRange ? 17 : 20),
          fontWeight: 700, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
          color: 'var(--text)', marginTop: 3, whiteSpace: 'nowrap'
        }}>
          {totalShowsRange ?
            <>{fmt(grand.low)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 4px' }}>–</span>{fmt(grand.high)}</> :
            fmt(grand.high || 0)}
        </span>
        <span style={{
          fontSize: tablet ? 10 : 9,
          color: 'var(--text-3)', fontWeight: 600,
          marginTop: 3, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'
        }}>
          <span style={{ color: 'var(--success)', fontWeight: 700 }}>GP {fmt(grand.gpLow)}–{fmt(grand.gpHigh)}</span>
          <span style={{ color: 'var(--text-4)', margin: '0 6px' }}>·</span>
          <span style={{ color: 'var(--brand)', fontWeight: 700 }}>Comm {fmt(grand.commLow)}–{fmt(grand.commHigh)}</span>
        </span>
      </div>
      <button
        className="btn btn-primary"
        onClick={onPresent}
        disabled={!canPresent}
        style={{
          marginLeft: 'auto',
          flexShrink: 0,
          height: tablet ? 48 : 42,
          padding: tablet ? '0 22px' : '0 16px',
          fontSize: tablet ? 15 : 13, fontWeight: 700
        }}>
        Present <Icon.arrow />
      </button>
    </div>);
}

function BarRangeStat({ label, low, high, color, tablet }) {
  const showRange = low !== high && (low || high);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.1 }}>
      <span style={{ fontSize: tablet ? 9 : 8, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.08, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: tablet ? showRange ? 15 : 18 : showRange ? 12 : 15,
        fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
        color: color || 'var(--text)', marginTop: 2, whiteSpace: 'nowrap'
      }}>
        {showRange ?
        <>{fmt(low)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt(high)}</> :
        fmt(high || 0)}
      </span>
    </div>);
}

function BarSep() {
  return <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '2px 0' }} />;
}

// ─── Project overview card (multi-structure) ──────────────────
// Phase 2.4 P-4 redesign port. Stacks every structure's price range +
// per-scope breakdown so the rep can see the whole bundle without
// jumping between tabs. Tap a row to make that structure active.
function ProjectOverviewCard({ tablet, structures, perStructure, activeStructureId, onSelectStructure, grand }) {
  if (!structures || structures.length < 2) return null;
  const psById = (perStructure || []).reduce((m, ps) => { m[ps.structureId] = ps; return m; }, {});
  const anyPicked = (perStructure || []).some((ps) => ps.high > 0);
  return (
    <div style={{ padding: tablet ? '6px 28px 4px' : '4px 16px 2px' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, overflow: 'hidden'
      }}>
        <div style={{
          padding: '12px 14px 8px',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10,
          borderBottom: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.12, textTransform: 'uppercase' }}>
            Project overview · {structures.length} structures
          </span>
          {anyPicked &&
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em', color: 'var(--text)', whiteSpace: 'nowrap'
            }}>
              {grand.low === grand.high ?
                fmt(grand.high || 0) :
                <>{fmt(grand.low)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt(grand.high)}</>}
            </span>}
        </div>
        {structures.map((s, i) => {
          const ps = psById[s.id];
          const isActive = s.id === activeStructureId;
          const sLow = ps?.low || 0;
          const sHigh = ps?.high || 0;
          const scopes = Object.keys(ps?.scopeRollups || {});
          const scopeLabels = scopes.map((id) => SCOPE_CATALOG.find((sc) => sc.id === id)?.label || id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStructure(s.id)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 14px',
                background: isActive ? 'var(--brand-soft)' : 'transparent',
                border: 0,
                borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer'
              }}>
              <span style={{
                width: 22, height: 22, borderRadius: 5,
                background: isActive ? 'var(--brand)' : 'var(--surface-3)',
                color: isActive ? 'var(--brand-fg)' : 'var(--text-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, flexShrink: 0
              }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--brand-soft-fg)' : 'var(--text)', letterSpacing: '-0.01em' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontWeight: 600 }}>
                  {scopeLabels.length === 0 ? 'No picks yet' : scopeLabels.join(' · ')}
                </div>
              </div>
              {sHigh > 0 ?
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em', color: 'var(--text)', whiteSpace: 'nowrap', flexShrink: 0
                }}>
                  {sLow === sHigh ?
                    fmt(sHigh) :
                    <>{fmt(sLow)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt(sHigh)}</>}
                </span> :
                <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, fontStyle: 'italic', flexShrink: 0 }}>
                  pending
                </span>}
            </button>);
        })}
      </div>
    </div>);
}

function SectionLabel({ label, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{label}</span>
      {sub && <span style={{ fontSize: 10, color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>{sub}</span>}
    </div>);
}

// ─── Scope card ──────────────────────────────────────────────
// Header toggle + three tier pillars (Good · Better · Best) side by side.
function ScopeCard({ scope, included, anyPicked, onToggle, pillars, onOpenProductDrawer, onOpenWarrantyDrawer, setDiscount, tablet }) {
  // Sum of configured pillars' totals — shown on the header as a range.
  const configured = pillars.filter((p) => p.rollup.productId);
  const totals = configured.map((p) => p.rollup.total);
  const lo = totals.length ? Math.min(...totals) : 0;
  const hi = totals.length ? Math.max(...totals) : 0;

  return (
    <div className="card" style={{
      padding: 0,
      opacity: included ? 1 : 0.62,
      border: included ? '1px solid var(--border)' : '1px dashed var(--border-strong)',
      transition: 'opacity 160ms ease, border-color 160ms ease'
    }} data-comment-anchor={scope.id === 'roofing' ? '240212482e-div-192-7-roof' : undefined}>
      {/* Header — toggle row */}
      <div
        onClick={onToggle}
        style={{
          padding: tablet ? '14px 18px' : '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
          borderBottom: included ? '1px solid var(--border)' : 'none'
        }}>
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: included ? 'var(--brand)' : 'transparent',
          border: `1.5px solid ${included ? 'var(--brand)' : 'var(--border-strong)'}`,
          color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'background 120ms, border-color 120ms'
        }}>
          {included && <Icon.check style={{ width: 13, height: 13 }} />}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 18 : 16, fontWeight: 700, letterSpacing: '-0.02em' }}>{scope.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{scope.blurb}</div>
        </div>
        {included && anyPicked &&
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>{lo === hi ? 'Total' : 'Range'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 20 : 16, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              {lo === hi ? fmt(hi) : <>{fmt(lo)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt(hi)}</>}
            </div>
          </div>}
        {included && !anyPicked &&
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase',
          color: 'var(--warn)', background: 'var(--warn-bg)',
          padding: '4px 8px', borderRadius: 999, flexShrink: 0,
          whiteSpace: 'nowrap'
        }}>Associate a product</span>}
      </div>

      {/* Body — three pillars */}
      {included &&
      <div style={{
        padding: tablet ? '14px 18px 16px' : '12px 14px 14px',
        display: 'grid',
        gridTemplateColumns: tablet ? 'repeat(3, 1fr)' : '1fr',
        gap: tablet ? 10 : 10
      }} data-comment-anchor={scope.id === 'roofing' ? '240212482e-pillars-row' : undefined}>
          {pillars.map(({ tierId, rollup }) =>
        <TierPillar
          key={tierId}
          scope={scope}
          tierId={tierId}
          rollup={rollup}
          onOpenProductDrawer={() => onOpenProductDrawer(tierId)}
          onOpenWarrantyDrawer={() => onOpenWarrantyDrawer(tierId)}
          setDiscount={(v) => setDiscount(tierId, v)}
          tablet={tablet}
          isFirstPillar={scope.id === 'roofing' && tierId === 'good'} />)}

        </div>}
    </div>);
}

// ─── Tier Pillar — one of three side-by-side per scope ───────
// Header (tier badge) → product slot → either "associate" CTA or full breakdown
function TierPillar({ scope, tierId, rollup, onOpenProductDrawer, onOpenWarrantyDrawer, setDiscount, tablet, isFirstPillar }) {
  const accent = TIER_ACCENT[tierId];
  const hasProduct = !!rollup.productId;
  // First pillar of roofing carries the path-based comment anchor Craig pinned.
  const wrapAnchor = isFirstPillar ? '240212482e-pillar-good-roof' : undefined;

  return (
    <div
      style={{
        border: `1px solid ${hasProduct ? accent : 'var(--border)'}`,
        boxShadow: hasProduct ? `inset 0 0 0 1px ${accent}` : 'none',
        borderRadius: 12,
        background: hasProduct ? 'var(--surface)' : 'var(--surface-2)',
        padding: tablet ? 12 : 12,
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 160ms ease, box-shadow 160ms ease'
      }} data-comment-anchor={wrapAnchor}>
      {/* Tier badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>
          {TIER_LABEL[tierId]}
        </span>
      </div>

      {/* Product slot — the card itself is the affordance (Craig: drop the
          separate "Change" text, make the product look clickable). */}
      {hasProduct ?
      <button
        onClick={onOpenProductDrawer}
        className="product-slot"
        style={{
          textAlign: 'left',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'border-color 120ms ease, background 120ms ease'
        }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{rollup.product.mfr}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              {rollup.product.line} · {rollup.product.name}
            </span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button> :

      <button
        onClick={onOpenProductDrawer}
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


      {/* Breakdown — only if product picked. No numbers until then. */}
      {hasProduct &&
      <PillarBreakdown
        rollup={rollup}
        product={rollup.product}
        warranty={rollup.warranty}
        onOpenWarrantyDrawer={onOpenWarrantyDrawer}
        setDiscount={setDiscount}
        accent={accent} />}
    </div>);
}

// ─── Per-pillar breakdown: summary + cost/charge/GP + slider + warranty ───
function PillarBreakdown({ rollup, product, warranty, onOpenWarrantyDrawer, setDiscount, accent }) {
  const { subtotal, cost, total, gp, discount } = rollup;
  const gpPct = total > 0 ? gp / total : 0;
  const baseMarginPct = 1 - COST_RATIO; // 0.35

  const atFloor = discount >= subtotal - cost - 1;
  const onGpChange = (newGp) => {
    const newCharge = cost / (1 - newGp);
    const newDiscount = Math.max(0, Math.round(subtotal - newCharge));
    setDiscount(newDiscount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Summary line */}
      <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.45 }}>{product.summary}</div>

      {/* Two-column money grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <MiniCell label="Cost" value={fmt(cost)} />
        <MiniCell label="Charge" value={fmt(total)} accent />
        <MiniCell label="Gross Profit" value={fmt(gp)} sub={(gpPct * 100).toFixed(1) + '%'} />
        <MiniCell label="Discount" value={fmt(discount)} sub={discount ? 'applied' : 'none'} />
      </div>

      {/* GP slider */}
      <div onClick={(e) => e.stopPropagation()} style={{ paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.04, textTransform: 'uppercase' }}>Adjust GP %</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: atFloor ? 'var(--danger)' : accent, fontVariantNumeric: 'tabular-nums' }}>
            {(gpPct * 100).toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={baseMarginPct * 1000}
          step={1}
          value={Math.round(gpPct * 1000)}
          onChange={(e) => onGpChange(parseInt(e.target.value, 10) / 1000)}
          style={{ width: '100%', accentColor: accent }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-4)', fontWeight: 600 }}>
          <span>0%</span>
          <span>{(baseMarginPct * 100).toFixed(0)}% list</span>
        </div>
        {/* Always-present status row — reserved height so warnings don't shift layout. */}
        <PillarSliderStatus atFloor={atFloor} discount={discount} subtotal={subtotal} />
      </div>

      {/* Warranty selector — opens drawer on click. */}
      <button
        onClick={onOpenWarrantyDrawer}
        data-comment-anchor={accent === 'var(--brand)' ? 'f1c0c99baf-div-572-13' : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
          textAlign: 'left'
        }}>
        <Icon.shield style={{ width: 11, height: 11, color: 'var(--text-3)', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Warranty</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: warranty === 'none' ? 'var(--text-4)' : 'var(--text)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {warranty === 'none' ? 'None' : warranty}
          </div>
        </div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
    </div>);
}

// ─── Always-rendered status line under the GP slider ─────────
// Reserves a fixed footprint so the appearance of a warning doesn't
// reflow the pillar (Craig: "I don't like how this causes UI shift").
function PillarSliderStatus({ atFloor, discount, subtotal }) {
  const overCap = !atFloor && discount > subtotal * 0.10;
  let tone = 'neutral';
  let label = 'Within rep cap';
  if (atFloor) {tone = 'danger';label = 'At cost · GP can\u2019t go negative';}
  else if (overCap) {tone = 'warn';label = 'Approval needed · exceeds 10% cap';}

  const toneStyles = {
    neutral: { bg: 'transparent', color: 'var(--text-4)', dot: 'var(--text-4)' },
    warn: { bg: 'var(--warn-bg)', color: 'var(--warn)', dot: 'var(--warn)' },
    danger: { bg: 'var(--danger-bg)', color: 'var(--danger)', dot: 'var(--danger)' }
  }[tone];

  return (
    <div style={{
      marginTop: 6, padding: '5px 8px',
      background: toneStyles.bg,
      color: toneStyles.color,
      borderRadius: 6,
      fontSize: 9.5, lineHeight: 1.3, fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: 6,
      minHeight: 22, boxSizing: 'border-box',
      transition: 'background 160ms ease, color 160ms ease'
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: toneStyles.dot, flexShrink: 0,
        transition: 'background 160ms ease'
      }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>);
}

function MiniCell({ label, value, sub, accent }) {
  return (
    <div style={{ padding: '6px 8px', background: accent ? 'var(--brand-soft)' : 'var(--surface-2)', borderRadius: 6 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: accent ? 'var(--brand-soft-fg)' : 'var(--text-3)', letterSpacing: 0.05, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1, color: accent ? 'var(--brand-soft-fg)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: accent ? 'var(--brand-soft-fg)' : 'var(--text-4)', marginTop: 0, opacity: 0.85 }}>{sub}</div>}
    </div>);
}

// ─── Product picker drawer (bottom sheet) ─────────────────────
// Filters PACKAGE catalog to the scope×tier. Each row shows
// Manufacturer · Product line · Name + price.
function ProductPickerDrawer({ scope, tierId, selectedProductId, onPick, onClear, onClose }) {
  const products = scope.tiers[tierId]?.products || [];
  const accent = TIER_ACCENT[tierId];
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>{TIER_LABEL[tierId]}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {scope.label}</span>
          </div>
          <h3 style={{ margin: '2px 0 4px' }}>Associate a product</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            Pick the manufacturer · product · name to anchor this {TIER_LABEL[tierId]} package.
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {products.map((p) => {
            const active = selectedProductId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPick(p.id)}
                className="card"
                style={{
                  padding: 12, textAlign: 'left', cursor: 'pointer', display: 'block',
                  border: active ? `1.5px solid ${accent}` : '1px solid var(--border)',
                  background: active ? 'var(--surface-2)' : 'var(--surface)',
                  boxShadow: active ? `inset 0 0 0 1px ${accent}` : 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)',
                    color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: 0.04
                  }}>
                    {p.mfr.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{p.mfr}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginTop: 2 }}>{p.line} · {p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.4 }}>{p.summary}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                      {fmt(p.subtotal)}
                    </div>
                    {active && <span className="pill brand" style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>Current</span>}
                  </div>
                </div>
              </button>);
          })}
          {selectedProductId &&
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

// ─── Warranty picker drawer (bottom sheet) ────────────────────
// Shows ALL warranties for the scope. The currently-associated product
// supports a subset; unsupported ones render disabled.
// "None" is always available per Craig.
function WarrantyPickerDrawer({ scope, tierId, product, selected, onPick, onClose }) {
  const accent = TIER_ACCENT[tierId];
  const available = new Set(product?.warranties || []);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>{TIER_LABEL[tierId]}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {scope.label}</span>
          </div>
          <h3 style={{ margin: '2px 0 4px' }}>Choose warranty coverage</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            {product ?
            <>Coverage available to <strong style={{ color: 'var(--text)' }}>{product.mfr} {product.line}</strong>. Greyed-out tiers aren't supported by this product.</> :
            <>Pick a warranty tier for this package.</>}
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* None row */}
          <WarrantyRow label="None" sub="Skip warranty for this package" selected={selected === 'none'} onPick={() => onPick('none')} accent={accent} />
          {(scope.allWarranties || []).map((w) => {
            const supported = available.has(w);
            return (
              <WarrantyRow
                key={w}
                label={w}
                sub={supported ? null : 'Not available with the selected product'}
                disabled={!supported}
                selected={selected === w}
                onPick={() => supported && onPick(w)}
                accent={accent} />);
          })}
        </div>
      </div>
    </>);
}

function WarrantyRow({ label, sub, disabled, selected, onPick, accent }) {
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className="card"
      style={{
        padding: '10px 12px', textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: selected ? `1.5px solid ${accent}` : '1px solid var(--border)',
        background: selected ? 'var(--surface-2)' : 'var(--surface)',
        boxShadow: selected ? `inset 0 0 0 1px ${accent}` : 'none',
        opacity: disabled ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
      <span style={{
        width: 18, height: 18, borderRadius: 999,
        border: `1.5px solid ${selected ? accent : 'var(--border-strong)'}`,
        background: selected ? accent : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {selected && <span style={{ width: 6, height: 6, borderRadius: 999, background: '#fff' }} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {disabled &&
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-4)', flexShrink: 0 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>}
    </button>);
}

// ─── Pricing mode toggle ──────────────────────────────────────
// Top-of-page segmented control: All-in vs By-structure. Layout choice
// only — tier picks always happen per structure on presentation slides.
// Single-structure jobs render the toggle in a quiet state (just the
// All-in label).
function PricingModeToggle({ tablet, mode, onChange, structures }) {
  const hasMulti = (structures || []).length > 1;
  if (!hasMulti) {
    return (
      <div style={{ padding: tablet ? '4px 28px 6px' : '4px 16px 6px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--text-3)', textTransform: 'uppercase' }}>One project total</div>
      </div>);

  }
  return (
    <div style={{ padding: tablet ? '8px 28px 12px' : '6px 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--text-3)', textTransform: 'uppercase' }}>How to present</div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>Carries to slides</div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 4
      }}>
        {[
        { id: 'allin', label: 'All-in', sub: 'One project total' },
        { id: 'by', label: 'By structure', sub: 'Per-building totals' }].
        map((opt) => {
          const active = opt.id === mode;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                padding: '10px 14px', borderRadius: 8, textAlign: 'center',
                background: active ? 'var(--surface)' : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(20,15,5,0.08), 0 0 0 1px var(--border)' : 'none',
                border: 'none', cursor: 'pointer'
              }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--text)' : 'var(--text-3)', letterSpacing: '-0.01em' }}>{opt.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{opt.sub}</div>
            </button>);

        })}
      </div>
    </div>);

}

// ─── Structure tabs (By-structure mode) ───────────────────────
// Horizontal snap-grid so condo complexes can scroll cleanly past 3-4 tabs.
// Phase 2.4 P-3: each tab now shows its real per-structure price range
// from the perStructure rollup (built in M-1..M-3). Falls back to an
// envelope count when no products have been picked yet for that
// structure.
function StructureTabs({ tablet, structures, activeStructureId, onSelect, perStructure }) {
  const psById = (perStructure || []).reduce((m, ps) => { m[ps.structureId] = ps; return m; }, {});
  return (
    <div style={{ padding: tablet ? '0 28px 12px' : '0 16px 10px' }}>
      <div style={{
        display: 'flex', gap: 8,
        overflowX: 'auto', overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        paddingBottom: 6,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin'
      }}>
        {structures.map((s, i) => {
          const isActive = s.id === activeStructureId;
          const scopeCount = (s.scopes || []).length;
          const ps = psById[s.id];
          const sLow = ps?.low || 0;
          const sHigh = ps?.high || 0;
          const showRange = sHigh > 0;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                flex: '0 0 220px',
                scrollSnapAlign: 'start',
                padding: '12px 14px', borderRadius: 10,
                background: isActive ? 'var(--surface)' : 'transparent',
                border: isActive ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 4,
                textAlign: 'left'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: isActive ? 'var(--brand)' : 'var(--surface-3)',
                  color: isActive ? 'var(--brand-fg)' : 'var(--text-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800
                }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--text)' : 'var(--text-2)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
              </div>
              {showRange ?
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                  color: isActive ? 'var(--text)' : 'var(--text-3)',
                  fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap'
                }}>
                  {sLow === sHigh ?
                    fmt(sHigh) :
                    <>{fmt(sLow)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt(sHigh)}</>}
                </span> :
                <span style={{
                  fontSize: 11, color: 'var(--text-3)', fontWeight: 600
                }}>
                  {scopeCount} envelope{scopeCount === 1 ? '' : 's'} · no picks yet
                </span>}
            </button>);

        })}
      </div>
    </div>);

}

Object.assign(window, { ProposalBuilderScreen });