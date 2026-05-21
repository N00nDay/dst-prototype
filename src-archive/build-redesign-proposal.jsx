/* global React, BR */
/* Proposal page — redesigned. Spec recap:
   - G/B/B selections + envelope selections carry over from Build (no
     "Associate Product" CTAs here).
   - Pricing toggle: All-in vs By-structure. Layout choice only — underlying
     data identical.
   - By-structure shows per-structure tabs + grand total.
   - Add-ons strip near the bottom.

   Artboards:
   1. All-in view — single project total
   2. By-structure overview — tabs with summary cards per structure
   3. By-structure detail — one structure expanded */

const PROP_TIER_COLOR = { good: 'var(--text-3)', better: 'var(--brand)', best: 'var(--success)' };
const PROP_TIER_LABEL = { good: 'Good', better: 'Better', best: 'Best' };

function fmt$(n) {return '$' + n.toLocaleString('en-US');}

// ─── Toggle ────────────────────────────────────────────────────
// All-in vs By-structure. Two big segments at the top of the page.
function PricingToggle({ mode }) {
  return (
    <div style={{ padding: '4px 16px 14px' }}>
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
            <div key={opt.id} style={{
              padding: '12px 14px', borderRadius: 8, textAlign: 'center',
              background: active ? 'var(--surface)' : 'transparent',
              boxShadow: active ? '0 1px 3px rgba(20,15,5,0.08), 0 0 0 1px var(--border)' : 'none',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: active ? 'var(--text)' : 'var(--text-3)', letterSpacing: '-0.01em' }}>{opt.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{opt.sub}</div>
            </div>);

        })}
      </div>
    </div>);

}

// ─── Scope card ────────────────────────────────────────────────
// Header → three tier pillars (Good · Better · Best). Pillar visual matches
// the existing TierPillar in screens-build.jsx exactly: tier border accent,
// inset 1px box-shadow, product slot button (mfr stacked over line · name +
// chevron), summary line, 2×2 money grid (Cost / Charge / GP / Discount),
// GP slider with status row, warranty selector chip at bottom.
function ScopeCard({ scope, blurb, tiers, expanded }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{scope}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{blurb}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>Range</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {fmt$(tiers[0].total)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt$(tiers[2].total)}
          </div>
        </div>
      </div>
      <div style={{
        padding: '14px 16px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10
      }}>
        {tiers.map((t) =>
        <ProposalTierPillar key={t.tier} t={t} />
        )}
      </div>
    </div>);

}

// ─── Tier pillar — matches screens-build.jsx TierPillar visual exactly ──
// Always has a product (selections carried from Build, so no "Associate
// Product" empty state on Proposal).
function ProposalTierPillar({ t }) {
  const accent = PROP_TIER_COLOR[t.tier];
  const gpPct = t.total > 0 ? (t.total - t.cost) / t.total : 0;
  return (
    <div style={{
      border: `1px solid ${accent}`,
      boxShadow: `inset 0 0 0 1px ${accent}`,
      borderRadius: 12,
      background: 'var(--surface)',
      padding: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 160ms ease, box-shadow 160ms ease'
    }}>
      {/* Tier badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: accent, textTransform: 'uppercase' }}>{PROP_TIER_LABEL[t.tier]}</span>
      </div>

      {/* Product slot — outlined button. Same as Build's TierPillar. */}
      <button style={{
        textAlign: 'left',
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 8,
        padding: '8px 10px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{t.mfr}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>{t.line}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Summary line */}
      {t.summary && <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.45 }}>{t.summary}</div>}

      {/* 2×2 money grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <MiniCellP label="Cost" value={fmt$(t.cost)} />
        <MiniCellP label="Charge" value={fmt$(t.total)} accent />
        <MiniCellP label="Gross Profit" value={fmt$(t.total - t.cost)} sub={(gpPct * 100).toFixed(1) + '%'} />
        <MiniCellP label="Discount" value={fmt$(t.discount || 0)} sub={t.discount ? 'applied' : 'none'} />
      </div>

      {/* GP slider with status row */}
      <div style={{ paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.04, textTransform: 'uppercase' }}>Adjust GP %</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{(gpPct * 100).toFixed(1)}%</span>
        </div>
        <input
          type="range"
          min={0} max={350} step={1}
          defaultValue={Math.round(gpPct * 1000)}
          style={{ width: '100%', accentColor: accent }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-4)', fontWeight: 600 }}>
          <span>0%</span>
          <span>35% list</span>
        </div>
        <div style={{
          marginTop: 6, padding: '5px 8px',
          background: 'transparent', color: 'var(--text-4)',
          borderRadius: 6,
          fontSize: 9.5, lineHeight: 1.3, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6, minHeight: 22
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--text-4)', flexShrink: 0 }} />
          <span>Within rep cap</span>
        </div>
      </div>

      {/* Warranty chip — same as Build's PillarBreakdown */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        padding: '6px 8px', borderRadius: 6, cursor: 'pointer', textAlign: 'left'
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" /></svg>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Warranty</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.warranty}</div>
        </div>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
    </div>);

}

function MiniCellP({ label, value, sub, accent }) {
  return (
    <div style={{ padding: '6px 8px', background: accent ? 'var(--brand-soft)' : 'var(--surface-2)', borderRadius: 6 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: accent ? 'var(--brand-soft-fg)' : 'var(--text-3)', letterSpacing: 0.05, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 1, color: accent ? 'var(--brand-soft-fg)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: accent ? 'var(--brand-soft-fg)' : 'var(--text-4)', marginTop: 0, opacity: 0.85 }}>{sub}</div>}
    </div>);

}

// ─── Add-ons list ─────────────────────────────────────────────
// Vertical list, one row per add-on — matches existing Proposal Builder
// (screens-build.jsx PROPOSAL_ADDONS): single card, rows separated by
// borders, checkbox + label/desc + price.
function AddonsStrip() {
  const addons = [
    { id: 'g', label: 'Seamless Gutters', desc: 'New 6" seamless aluminum, color-matched to your home.', price: 2570, on: true },
    { id: 'gg', label: 'Gutter Guards', desc: 'Micro-mesh leaf protection. No more ladders twice a year.', price: 1450, on: false },
    { id: 'sk', label: 'Skylight', desc: 'Velux fixed deck-mount with full flashing kit.', price: 1875, on: false },
    { id: 'ch', label: 'Chimney Reflash', desc: 'New step + counter flashing. Stops the #1 leak source.', price: 985, on: true }
  ];
  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>Add-ons to display</div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>2 of 4 on the menu</div>
      </div>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, overflow: 'hidden'
      }}>
        {addons.map((a, i) => (
          <div key={a.id} style={{
            padding: '12px 18px',
            borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: a.on ? 'var(--success-bg)' : 'transparent'
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: a.on ? 'var(--success)' : 'transparent',
              border: `1.5px solid ${a.on ? 'var(--success)' : 'var(--border-strong)'}`,
              color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {a.on && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              )}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, lineHeight: 1.4 }}>{a.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: a.on ? 'var(--success)' : 'var(--text-2)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              +{fmt$(a.price)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Proposal bottom bar ───────────────────────────────────────
function ProposalBar({ low, high, label = 'Present', sub }) {
  return (
    <div style={{
      borderTop: '1px solid var(--border)', background: 'var(--surface)',
      padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      boxShadow: '0 -10px 24px rgba(20,15,5,0.06)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>{sub || 'Project total range'}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 2 }}>
          {fmt$(low)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 4px' }}>–</span>{fmt$(high)}
        </span>
      </div>
      <button style={{
        padding: '14px 22px', borderRadius: 10,
        background: 'var(--brand)', color: 'var(--brand-fg)',
        border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
      }}>
        {label} →
      </button>
    </div>);

}

// ─── All-in view ───────────────────────────────────────────────
// Single project. Scopes listed with G/B/B carried from Build.
function ProposalAllIn() {
  const { FrameChrome } = BR;
  const roofingTiers = [
  { tier: 'good', mfr: 'CertainTeed', line: 'Landmark · Architectural', total: 18200, cost: 11830, discount: 0, warranty: '30-yr mfr · 5-yr workmanship', summary: 'Architectural shingle · synthetic underlayment · standard flashings' },
  { tier: 'better', mfr: 'CertainTeed', line: 'Landmark · PRO', total: 24800, cost: 16120, discount: 0, warranty: '50-yr mfr · 10-yr workmanship', summary: 'Class 4 impact · valley I&W · aluminum step flashing' },
  { tier: 'best', mfr: 'CertainTeed', line: 'Presidential · Shake', total: 31900, cost: 20735, discount: 0, warranty: 'Lifetime mfr · Lifetime workmanship', summary: 'Designer profile · full I&W · copper flashing' }];

  const sidingTiers = [
  { tier: 'good', mfr: 'LP', line: 'SmartSide · Lap Siding', total: 18200, cost: 11830, discount: 0, warranty: '15-yr finish', summary: 'Engineered lap · standard primer-coat finish · 5/4 trim' },
  { tier: 'better', mfr: 'LP', line: 'SmartSide · ExpertFinish', total: 25200, cost: 16380, discount: 800, warranty: '25-yr finish', summary: '16 baked colors · upgraded trim package' },
  { tier: 'best', mfr: 'James Hardie', line: 'Artisan · Series', total: 35200, cost: 22880, discount: 0, warranty: 'Lifetime substrate + 30-yr finish', summary: 'Premium fiber-cement profile · custom trim · color match' }];

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · Proposal" recTime="46:08" activeStep="proposal" />

      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Proposal
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
          Products and tiers came from Build. Adjust margins and add-ons, then present to the homeowner.
        </div>
      </div>

      <PricingToggle mode="allin" />

      <div style={{ padding: '0 16px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ScopeCard
          scope="Roofing"
          blurb="Tear-off, underlayment, flashings, install"
          tiers={roofingTiers}
          expanded="better" />
        <ScopeCard
          scope="Siding"
          blurb="Tear-off, wrap, install, paint"
          tiers={sidingTiers} />
      </div>

      <AddonsStrip />
      <ProposalBar low={48200} high={73900} sub="Project total range" />
    </div>);

}

// ─── Structure tabs ───────────────────────────────────────────
// Horizontally scrolling snap grid so condo complexes (10–20 units) can
// page through cleanly. Each tab is a fixed 240px wide; row overflows past
// ~4 and snap-x snap-mandatory makes swipes land on a tab edge.
function StructureTabs({ active, structures }) {
  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{
        display: 'flex', gap: 8,
        overflowX: 'auto', overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        paddingBottom: 6,
        WebkitOverflowScrolling: 'touch'
      }}>
        {structures.map((s) => {
          const isActive = s.id === active;
          return (
            <div key={s.id} style={{
              flex: '0 0 240px',
              scrollSnapAlign: 'start',
              padding: '12px 14px', borderRadius: 10,
              background: isActive ? 'var(--surface)' : 'transparent',
              border: isActive ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 4
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: isActive ? 'var(--brand)' : 'var(--surface-3)',
                  color: isActive ? 'var(--brand-fg)' : 'var(--text-2)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800
                }}>{s.idx}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? 'var(--text)' : 'var(--text-2)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                color: isActive ? 'var(--text)' : 'var(--text-3)',
                fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                whiteSpace: 'nowrap'
              }}>
                {fmt$(s.lo)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt$(s.hi)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── By-structure detail view (one structure open) ─────────────
function ProposalByStructure() {
  const { FrameChrome } = BR;
  // Five-structure example so the snap-grid behavior on the tabs row reads
  // clearly (condo complexes typically run 4–12 buildings).
  const structures = [
  { id: 'main', idx: 1, name: 'Main', lo: 42400, hi: 67200 },
  { id: 'garage', idx: 2, name: 'Detached Garage', lo: 8800, hi: 14600 },
  { id: 'pool', idx: 3, name: 'Pool House', lo: 6200, hi: 9800 },
  { id: 'shed', idx: 4, name: 'Shed', lo: 1800, hi: 2900 },
  { id: 'studio', idx: 5, name: 'Studio', lo: 14400, hi: 22300 }];

  const mainRoofing = [
  { tier: 'good', mfr: 'CertainTeed', line: 'Landmark · Architectural', total: 18200, cost: 11830, discount: 0, warranty: '30-yr mfr · 5-yr workmanship', summary: 'Architectural shingle · synthetic underlayment · standard flashings' },
  { tier: 'better', mfr: 'CertainTeed', line: 'Landmark · PRO', total: 24800, cost: 16120, discount: 0, warranty: '50-yr mfr · 10-yr workmanship', summary: 'Class 4 impact · valley I&W · aluminum step flashing' },
  { tier: 'best', mfr: 'CertainTeed', line: 'Presidential · Shake', total: 31900, cost: 20735, discount: 0, warranty: 'Lifetime mfr · Lifetime workmanship', summary: 'Designer profile · full I&W · copper flashing' }];

  const mainSiding = [
  { tier: 'good', mfr: 'LP', line: 'SmartSide · Lap Siding', total: 18200, cost: 11830, discount: 0, warranty: '15-yr finish', summary: 'Engineered lap · standard primer-coat finish · 5/4 trim' },
  { tier: 'better', mfr: 'LP', line: 'SmartSide · ExpertFinish', total: 25200, cost: 16380, discount: 800, warranty: '25-yr finish', summary: '16 baked colors · upgraded trim package' },
  { tier: 'best', mfr: 'James Hardie', line: 'Artisan · Series', total: 35200, cost: 22880, discount: 0, warranty: 'Lifetime substrate + 30-yr finish', summary: 'Premium fiber-cement profile · custom trim · color match' }];


  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · Proposal" recTime="46:08" activeStep="proposal" />

      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Proposal
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
          Each structure becomes its own pricing slide. Customer picks a tier per building.
        </div>
      </div>

      <PricingToggle mode="by" />

      <StructureTabs active="main" structures={structures} />

      <div style={{ padding: '0 16px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ScopeCard
          scope="Roofing"
          blurb="Main · tear-off, underlayment, flashings, install"
          tiers={mainRoofing}
          expanded="better" />
        <ScopeCard
          scope="Siding"
          blurb="Main · tear-off, wrap, install, paint"
          tiers={mainSiding} />
      </div>

      <AddonsStrip />
      <ProposalBar low={57400} high={91600} sub="Grand total · all structures" />
    </div>);

}

// ─── By-structure overview (collapsed cards, no tab open) ──────
// Useful when there are 3+ structures and the rep wants a single page that
// shows all of them at once before drilling in.
function ProposalByStructureOverview() {
  const { FrameChrome } = BR;
  const structures = [
  {
    id: 'main', idx: 1, name: 'Main', lo: 42400, hi: 67200,
    scopes: [
    { label: 'Roofing', tier: 'better', line: 'CertainTeed Landmark PRO', total: 24800 },
    { label: 'Siding', tier: 'better', line: 'LP ExpertFinish', total: 25200 },
    { label: 'Gutters', tier: 'good', line: 'IHS 6" K-Style', total: 2570 }]

  },
  {
    id: 'garage', idx: 2, name: 'Detached Garage', lo: 8800, hi: 14600,
    scopes: [
    { label: 'Roofing', tier: 'good', line: 'CertainTeed Landmark Arch.', total: 6400 },
    { label: 'Siding', tier: 'good', line: 'LP SmartSide Lap', total: 4200 }]

  },
  {
    id: 'pool', idx: 3, name: 'Pool House', lo: 6200, hi: 9800,
    scopes: [
    { label: 'Roofing', tier: 'best', line: 'CertainTeed Presidential', total: 6800 },
    { label: 'Windows', tier: 'better', line: 'Andersen Fibrex (3)', total: 2200 }]

  }];


  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · Proposal" recTime="46:08" activeStep="proposal" />

      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Proposal
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
          3 structures. Each becomes its own pricing slide. Tap a card to adjust margins.
        </div>
      </div>

      <PricingToggle mode="by" />

      <div style={{ padding: '0 16px 14px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {structures.map((s) =>
        <div key={s.id} style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '14px 16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{s.idx}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.06 }}>{s.scopes.length} scopes</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>Range</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt$(s.lo)}<span style={{ color: 'var(--text-4)', fontWeight: 600, margin: '0 2px' }}>–</span>{fmt$(s.hi)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.scopes.map((sc) => {
              const accent = PROP_TIER_COLOR[sc.tier];
              return (
                <div key={sc.label} style={{
                  padding: '8px 10px', borderRadius: 8,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 0.06, textTransform: 'uppercase', width: 56 }}>{PROP_TIER_LABEL[sc.tier]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{sc.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{sc.line}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmt$(sc.total)}</span>
                  </div>);

            })}
            </div>
            <button style={{
            marginTop: 10, width: '100%', padding: '8px 12px', borderRadius: 8,
            background: 'transparent', color: 'var(--brand)',
            border: '1px dashed var(--brand)', fontSize: 11, fontWeight: 700,
            cursor: 'pointer'
          }}>Open {s.name} →</button>
          </div>
        )}
      </div>

      <ProposalBar low={57400} high={91600} sub="Grand total · all structures" />
    </div>);

}

window.ProposalAllIn = ProposalAllIn;
window.ProposalByStructure = ProposalByStructure;
window.ProposalByStructureOverview = ProposalByStructureOverview;