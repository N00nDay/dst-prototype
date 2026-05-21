/* global React, BR */
/* Presentation — All-in summary slide (multi-structure).

   IMPORTANT: tier-picking always happens on the per-structure pricing slides
   (the existing single-structure slide layout, one per structure). This
   slide is the SUMMARY screen the customer sees at the end of the deck
   when the rep has the All-in toggle on. It rolls every per-structure pick
   up into a single bundled view.

   The matching By-structure summary slide is the per-structure breakdown
   table that lives next to it in the deck.

   Format matches the existing customer-pricing slide style:
   - Hero strip
   - One numbered section per scope showing the bundled total + a
     per-structure breakdown ("Main: Better $X, Garage: Good $Y")
   - Add-ons card (per-structure now, since add-ons are per-structure)
   - Monthly summary card with the one big number

   No tier cards on this slide — tier picks already happened upstream. */

function $$ (n) { return '$' + n.toLocaleString('en-US'); }
function $monthly2(total) {
  const r = 0.0799 / 12, n = 120;
  if (!total) return 0;
  return Math.round(total * r / (1 - Math.pow(1 + r, -n)));
}

const PICK_TIER_COLOR = {
  good: 'oklch(0.62 0.04 80)',
  better: 'var(--brand)',
  best: 'oklch(0.55 0.13 50)'
};
const PICK_TIER_LABEL = { good: 'Good', better: 'Better', best: 'Best' };

// Hero pill (matches HeroPill in the existing CustomerPricing).
function HeroPillRX({ label, icon = '·' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 10px', borderRadius: 999,
      background: 'rgba(0,0,0,0.06)', color: 'var(--text-2)',
      fontSize: 11, fontWeight: 600, letterSpacing: '-0.005em'
    }}>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{icon}</span>{label}
    </span>
  );
}

// One scope summary row — shows the bundled total at top, then a quiet
// per-structure breakdown showing the tier picked on each.
function ScopeSummaryRX({ index, label, total, perStructure }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 22px',
      display: 'flex', flexDirection: 'column', gap: 14
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 8,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.12, textTransform: 'uppercase',
          color: 'var(--brand)'
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 999,
            background: 'var(--brand-soft)', color: 'var(--brand)',
            fontSize: 10, fontWeight: 800, lineHeight: 1
          }}>{index}</span>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.025em', color: 'var(--text)' }}>
            {$$(total)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
            {$$($monthly2(total))}/mo
          </span>
        </div>
      </div>

      {/* Per-structure breakdown — three small chips showing the picked tier
          per structure. Rep can talk through naturally. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {perStructure.map((p) => {
          const accent = PICK_TIER_COLOR[p.tier];
          const label = PICK_TIER_LABEL[p.tier];
          return (
            <div key={p.name} style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999, background: accent, flexShrink: 0
              }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 0.06, textTransform: 'uppercase', minWidth: 56 }}>
                {label}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{p.product}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', flexShrink: 0 }}>
                {$$(p.subtotal)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add-ons summary card — per-structure now. Shows what the customer has
// agreed to add (the toggled-on ones) along with which structure they're on.
function AddonSummaryRX({ items }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>Add-ons included</div>
        <div style={{ fontSize: 10, color: 'var(--text-4)' }}>Per structure · shared mobilization</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((a) => (
          <div key={a.label + a.structure} style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'var(--success-bg)', border: '1px solid var(--success)',
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--success)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{a.structure}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--success)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              +{$$(a.price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Big monthly summary card — same shape as the existing customer slide.
function MonthlySummaryRX({ scopes, addons }) {
  const scopesTotal = scopes.reduce((s, p) => s + p.total, 0);
  const addonsTotal = addons.reduce((s, a) => s + a.price, 0);
  const grand = scopesTotal + addonsTotal;
  const mo = $monthly2(grand);
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '24px 28px',
      display: 'flex', flexDirection: 'row', gap: 28, alignItems: 'center',
      boxShadow: '0 1px 2px rgba(20,15,5,0.04), 0 4px 12px rgba(20,15,5,0.04)'
    }}>
      <div style={{ flex: 1.2, paddingRight: 24, borderRight: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase', color: 'var(--text-3)' }}>Your monthly investment · 120 mo</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, letterSpacing: '-0.035em', color: 'var(--brand)', lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
          {$$(mo)}<span style={{ fontSize: 18, color: 'var(--text-3)', fontWeight: 600, marginLeft: 4 }}>/mo</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
          Total project: <strong style={{ color: 'var(--text)' }}>{$$(grand)}</strong>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {scopes.map((s) => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', gap: 12 }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{s.label}</strong> — bundled
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, flexShrink: 0 }}>{$$(s.total)}</span>
          </div>
        ))}
        {addons.map((a) => (
          <div key={a.label + a.structure} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>+ {a.label} · {a.structure}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{$$(a.price)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>Project total</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: 'var(--text)' }}>{$$(grand)}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 6, lineHeight: 1.45 }}>
          Est. monthly assumes 7.99% APR over 120 mo. Subject to credit approval.
        </div>
      </div>
    </div>
  );
}

// ─── The all-in summary slide ──────────────────────────────────
function PresentAllIn() {
  const { FrameChrome } = BR;

  // Customer picked these tiers structure-by-structure. Outbuilding gets a
  // cheaper shingle than the main house (Craig's example case).
  const roofingPerStructure = [
    { name: 'Main', tier: 'better', product: 'CertainTeed Landmark PRO', subtotal: 24800 },
    { name: 'Detached Garage', tier: 'good', product: 'CertainTeed Landmark Architectural', subtotal: 6400 },
    { name: 'Pool House', tier: 'best', product: 'CertainTeed Presidential Shake', subtotal: 6800 }
  ];
  const sidingPerStructure = [
    { name: 'Main', tier: 'better', product: 'LP SmartSide ExpertFinish', subtotal: 25200 },
    { name: 'Detached Garage', tier: 'good', product: 'LP SmartSide Lap', subtotal: 4200 }
  ];
  const addons = [
    { label: 'Seamless Gutters', structure: 'Main', price: 2570 },
    { label: 'Chimney Reflash', structure: 'Main', price: 985 }
  ];

  const roofingTotal = roofingPerStructure.reduce((s, p) => s + p.subtotal, 0);
  const sidingTotal = sidingPerStructure.reduce((s, p) => s + p.subtotal, 0);

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · Presenting" recTime="58:14" activeStep="proposal" />

      <div style={{ flex: 1, padding: '14px 28px 28px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Hero strip */}
        <div style={{
          background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
          borderRadius: 14, padding: '22px 28px'
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', opacity: 0.8 }}>
            Your project — all in
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.15, color: 'var(--text)' }}>
            One number. Three buildings.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.45 }}>
            Here's how the picks you made for each building come together.
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
            <HeroPillRX icon="◎" label="4421 Bluffwood Ln" />
            <HeroPillRX icon="◉" label="Cole Jankowicz" />
            <HeroPillRX icon="◓" label="Quote valid 30 days" />
            <HeroPillRX icon="▤" label="3 structures bundled" />
          </div>
        </div>

        {/* Per-scope summary rows */}
        <ScopeSummaryRX
          index={1}
          label="Roofing"
          total={roofingTotal}
          perStructure={roofingPerStructure} />
        <ScopeSummaryRX
          index={2}
          label="Siding"
          total={sidingTotal}
          perStructure={sidingPerStructure} />

        <AddonSummaryRX items={addons} />

        <MonthlySummaryRX
          scopes={[
            { label: 'Roofing', total: roofingTotal },
            { label: 'Siding', total: sidingTotal }
          ]}
          addons={addons} />
      </div>
    </div>
  );
}

window.PresentAllIn = PresentAllIn;
