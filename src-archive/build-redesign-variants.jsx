/* global React, BR, EnvelopePicker, SubStepStrip, MeasurementRow, MeasurementGroupNew, AerialBanner */
/* Variants of the proposed Build screen showing key states. */

// ─── Continue review modal ─────────────────────────────────────
// Triggered by tapping Continue while any rows are still open.
// Lists every unlocked row + its current value with inline steppers so the
// rep can adjust before locking. 50/50 button split.
function ContinueReviewVariant() {
  const { FrameChrome, FAB, LockGlyph } = BR;
  const open = [
  { group: 'Edge', label: 'Ridge', value: '120', unit: 'ft', source: 'from aerial' },
  { group: 'Edge', label: 'Hip', value: '80', unit: 'ft', source: 'from aerial' },
  { group: 'Penetrations', label: 'Pipe boots', value: '4', unit: 'ea', source: 'from aerial' }];

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · 4421 Bluffwood Ln" recTime="23:58" />
      <EnvelopePicker
        active="roofing"
        statuses={{
          roofing: 'progress', roofing_pct: 75,
          siding: 'open',
          gutters: 'excluded',
          windoors: 'open'
        }} />
      <SubStepStrip active="measure" completed={[]} />
      <AerialBanner remainingCount={3} />

      <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, opacity: 0.32 }}>
        <MeasurementGroupNew
          title="Area"
          completePct="4 / 4"
          rows={[
          { label: 'Roof area (total)', value: '34.9', unit: 'sq', state: 'locked' },
          { label: 'Predominant pitch', value: '8/12', unit: '', state: 'locked' }]
          } />
      </div>

      {/* Sheet backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.42)', zIndex: 5 }} />

      {/* Modal */}
      <div style={{
        position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
        width: '100%', maxWidth: 720, background: 'var(--surface)',
        borderRadius: '20px 20px 0 0', zIndex: 10, padding: '14px 0 20px',
        boxShadow: '0 -16px 40px rgba(20,15,5,0.18)'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--border-strong)', borderRadius: 999, margin: '0 auto 14px' }} />
        <div style={{ padding: '0 22px 14px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            3 rows still open
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
            Lock them with their current values and continue, or cancel to edit individually.
          </div>
        </div>
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {open.map((r) =>
          <div key={r.label} style={{
            padding: '12px 14px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)', color: 'var(--text-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LockGlyph open={true} size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.08, fontWeight: 700 }}>{r.group} · {r.source}</div>
              </div>
              {/* Inline editable value — same stepper pattern as the main rows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 2, flexShrink: 0 }}>
                <button style={{ width: 28, height: 28, border: 'none', background: 'transparent', fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}>−</button>
                <span style={{ minWidth: 60, textAlign: 'center', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>
                  {r.value} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{r.unit}</span>
                </span>
                <button style={{ width: 28, height: 28, border: 'none', background: 'transparent', fontSize: 16, color: 'var(--text-3)', cursor: 'pointer' }}>+</button>
              </div>
            </div>
          )}
        </div>
        {/* 50/50 button split */}
        <div style={{ padding: '4px 22px 0', display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, padding: '14px 0', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontSize: 14, fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer'
          }}>Cancel</button>
          <button style={{
            flex: 1, padding: '14px 0', borderRadius: 10,
            background: 'var(--brand)', border: 'none',
            fontSize: 14, fontWeight: 700, color: 'var(--brand-fg)', cursor: 'pointer'
          }}>Lock all & continue</button>
        </div>
      </div>
    </div>);

}

// ─── Multi-structure variant ──────────────────────────────────
// Header chip with structure switcher, copy-from-previous banner on first
// load of the second structure.
function MultiStructureVariant() {
  const { FrameChrome, ContinueBar, FAB } = BR;

  // Custom header chrome — overrides the title with a tappable chip.
  const Header = () =>
  <div style={{ background: 'var(--bg)' }}>
      <div style={{
      height: 36, padding: '0 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      fontSize: 11, color: 'var(--text-3)'
    }}>
        <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>9:41 Tue Apr 28</span>
        <span>Wi-Fi · 100%</span>
      </div>
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text-3)', fontSize: 22 }}>←</span>
          {/* Structure chip — the dropdown notch lines up under this. */}
          <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderRadius: 10,
          background: 'var(--brand-soft)', border: '1.5px solid var(--brand)',
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
          color: 'var(--brand-soft-fg)'
        }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>3</span>
            Pool House
            <span style={{ fontSize: 10, color: 'var(--brand-soft-fg)', fontWeight: 600, opacity: 0.7 }}>3 of 3</span>
            <span style={{ color: 'var(--brand-soft-fg)', fontSize: 12 }}>▾</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontSize: 11, fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--danger)' }} />
          REC · 1:14:32
        </div>
      </div>
      <div style={{ padding: '8px 16px 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: 'var(--text-4)', letterSpacing: 0.1 }}>
          <span style={{ color: 'var(--text-4)' }}>CONNECT</span>
          <span>—</span>
          <span style={{ padding: '2px 10px', borderRadius: 999, background: 'var(--brand)', color: 'var(--brand-fg)' }}>SOLVE</span>
          <span>—</span>
          <span>COMMIT</span>
        </div>
      </div>
      <div style={{ padding: '6px 16px 12px', display: 'flex', gap: 8 }}>
        {[
      { id: 'inspect', label: 'Inspect' },
      { id: 'build', label: 'Build' },
      { id: 'slides', label: 'Slides' },
      { id: 'proposal', label: 'Proposal' }].
      map((s) => {
        const active = s.id === 'build';
        return (
          <div key={s.id} style={{
            flex: 1, padding: '10px 0', textAlign: 'center', borderRadius: 999,
            background: active ? 'var(--brand)' : 'var(--surface)',
            border: active ? 'none' : '1px solid var(--border)',
            color: active ? 'var(--brand-fg)' : 'var(--text-2)',
            fontSize: 13, fontWeight: 600
          }}>{s.label}</div>);

      })}
      </div>
    </div>;


  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Structures dropdown — anchored to the chip with a notch.
          Three structures: Main House ✓, Detached Garage ✓, Pool House (active). */}
      <div style={{
        position: 'absolute', top: 120, left: 48,
        width: 320,
        zIndex: 4, pointerEvents: 'none'
      }}>
        {/* notch pointing up to the chip */}
        <div style={{
          position: 'absolute', top: -6, left: 36,
          width: 12, height: 12,
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)',
          borderRight: 'none', borderBottom: 'none',
          transform: 'rotate(45deg)',
          zIndex: 1
        }} />
        <div style={{
          position: 'relative',
          background: 'var(--surface)',
          border: '1px solid var(--border-strong)', borderRadius: 12,
          boxShadow: '0 12px 32px rgba(20,15,5,0.18)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '10px 14px 8px', fontSize: 10, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.12, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Structures · 3</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
            { name: 'Main House', pct: 100, active: false, idx: 1 },
            { name: 'Detached Garage', pct: 100, active: false, idx: 2 },
            { name: 'Pool House', pct: 18, active: true, idx: 3 }].
            map((s) =>
            <div key={s.name} style={{
              padding: '10px 14px',
              background: s.active ? 'var(--brand-soft)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 10,
              borderTop: '1px solid var(--border)'
            }}>
                <span style={{ width: 22, height: 22, borderRadius: 5, background: s.active ? 'var(--brand)' : 'var(--surface-3)', color: s.active ? 'var(--brand-fg)' : 'var(--text-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{s.idx}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.name} <span style={{ color: 'var(--text-4)', fontWeight: 500, fontSize: 11, marginLeft: 2 }}>✎</span></div>
                  <div style={{ fontSize: 10, color: s.pct === 100 ? 'var(--success)' : 'var(--text-3)', marginTop: 1, fontWeight: 600 }}>{s.pct === 100 ? '✓ Complete' : `Build · ${s.pct}%`}</div>
                </div>
              </div>
            )}
            <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', fontWeight: 600, fontStyle: 'italic', background: 'var(--surface-2)' }}>
              To add another structure, return to Inspect →
            </div>
          </div>
        </div>
      </div>

      <EnvelopePicker
        active="roofing"
        statuses={{ roofing: 'progress', roofing_pct: 18, siding: 'open', gutters: 'open', windoors: 'excluded' }} />

      <SubStepStrip active="measure" completed={[]} />

      {/* Copy-from-previous banner — with structure picker since 2+ are
          complete. Copies EVERYTHING: measurements, materials, labor,
          equipment, disposal, G/B/B, locks. */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          background: 'var(--brand-soft)', border: '1.5px solid var(--brand)', borderRadius: 12,
          padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'var(--brand)',
              color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0
            }}>↗</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-soft-fg)', letterSpacing: '-0.01em' }}>Copy everything from a finished structure?</div>
              <div style={{ fontSize: 11, color: 'var(--brand-soft-fg)', opacity: 0.85, marginTop: 2, lineHeight: 1.4 }}>Measurements, materials, labor, equipment, disposal, G/B/B selections, and locks. Unlock anything to adjust.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 48 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.1, color: 'var(--brand-soft-fg)', textTransform: 'uppercase', opacity: 0.7 }}>Copy from</span>
            <div style={{
              flex: 1, display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 8,
              background: 'var(--surface)', border: '1px solid var(--border-strong)',
              fontSize: 12, fontWeight: 700, color: 'var(--text)', cursor: 'pointer'
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--surface-3)', color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>1</span>
              Main House
              <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, marginLeft: 'auto' }}>✓ Complete</span>
              <span style={{ color: 'var(--text-3)', fontSize: 12 }}>▾</span>
            </div>
            <button style={{
              padding: '8px 16px', borderRadius: 8, background: 'var(--brand)', color: 'var(--brand-fg)',
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>Copy</button>
            <button style={{
              padding: '8px 12px', borderRadius: 8, background: 'transparent', color: 'var(--brand-soft-fg)',
              border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}>Dismiss</button>
          </div>
        </div>
      </div>

      <AerialBanner remainingCount={6} />

      <div style={{ padding: '4px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflow: 'hidden' }}>
        <MeasurementGroupNew title="Area" completePct="0 / 4" rows={[
        { label: 'Roof area (total)', unit: 'sq', state: 'open', aerial: '6.4 sq' },
        { label: 'Predominant pitch', unit: '', state: 'open', aerial: '4/12' }]
        } />
      </div>

      <FAB bottom={84} />
      <ContinueBar label="Continue to Slides" enabled={false} sub="Main House ✓ · Detached Garage ✓ · Pool House 18%" />
    </div>);

}

// Materials group helper — used by ProposedBuildMaterials so the
// manufacturer line, Accessories, and Trim sections all read with the
// same row chrome.
function MaterialsGroup({ title, locked, rows }) {
  const { LockGlyph } = BR;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{locked}</div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {rows.map((r, i) => {
          const lockedRow = r.state === 'locked';
          return (
            <div key={r.name} style={{
              padding: '12px 14px',
              borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--border)',
              background: lockedRow ? 'var(--success-bg)' : 'transparent',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{r.sub}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: lockedRow ? 'transparent' : 'var(--surface-2)', border: lockedRow ? 'none' : '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
                {!lockedRow && <button style={{ width: 24, height: 24, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-3)', cursor: 'pointer' }}>−</button>}
                <span style={{ minWidth: 60, textAlign: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>{r.qty} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{r.unit}</span></span>
                {!lockedRow && <button style={{ width: 24, height: 24, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-3)', cursor: 'pointer' }}>+</button>}
              </div>
              <button style={{
                width: 32, height: 32, borderRadius: 8,
                background: lockedRow ? 'var(--success)' : 'transparent',
                color: lockedRow ? '#fff' : 'var(--text-4)',
                border: lockedRow ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <LockGlyph open={!lockedRow} size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Materials with G/B/B picker — to show step transition ────
function ProposedBuildMaterials() {
  const { FrameChrome, ContinueBar, FAB, TierDot, LockGlyph } = BR;
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · 4421 Bluffwood Ln" recTime="31:08" />

      <EnvelopePicker
        active="roofing"
        statuses={{ roofing: 'progress', roofing_pct: 62, siding: 'open', gutters: 'excluded', windoors: 'open' }} />

      <SubStepStrip active="materials" completed={['measure']} />

      {/* G/B/B picker — sits above material rows on Materials sub-step. */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 8 }}>Package · Roofing</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
          { tier: 'good', label: 'Good', color: 'var(--text-3)', mfr: 'CertainTeed', line: 'Landmark Arch.', picked: false },
          { tier: 'better', label: 'Better', color: 'var(--brand)', mfr: 'CertainTeed', line: 'Landmark PRO', picked: true },
          { tier: 'best', label: 'Best', color: 'var(--success)', mfr: 'CertainTeed', line: 'Presidential Shake', picked: false }].
          map((t) =>
          <div key={t.tier} style={{
            padding: 10, borderRadius: 12,
            background: t.picked ? 'var(--brand-soft)' : 'var(--surface)',
            border: t.picked ? `1.5px solid ${t.color}` : '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: 6
          }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TierDot tier={t.tier} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: t.color, textTransform: 'uppercase' }}>{t.label}</span>
                {t.picked && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>✓ Picked</span>}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase', marginTop: 2 }}>{t.mfr}</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.line}</div>
            </div>
          )}
        </div>
      </div>

      {/* Material rows — auto-filled from measurements × package. Open by
              default (rep must lock each). Three groups: the manufacturer
              line, then always-visible Accessories and Trim sections. */}
      <div style={{ padding: '4px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflow: 'hidden' }}>
        <MaterialsGroup
          title="From Landmark PRO"
          locked="2 / 5 locked"
          rows={[
            { name: 'Landmark PRO shingles', sub: '34.9 sq × 1.12 waste', qty: '39', unit: 'sq', state: 'locked' },
            { name: 'Hip & ridge cap', sub: '200 ft (ridge + hip)', qty: '7', unit: 'bundles', state: 'locked' },
            { name: 'Synthetic underlayment', sub: 'auto from area', qty: '11', unit: 'rolls', state: 'open' },
            { name: 'Ice & water shield', sub: 'valleys + eaves', qty: '6', unit: 'rolls', state: 'open' },
            { name: 'Starter strip', sub: '248 ft eaves', qty: '5', unit: 'bundles', state: 'open' }
          ]} />
        <MaterialsGroup
          title="Accessories"
          locked="0 / 4 locked"
          rows={[
            { name: 'Roofing nails (1¼")', sub: 'auto from sq count', qty: '7', unit: 'boxes', state: 'open' },
            { name: 'Pipe boot flashing', sub: '4 pipe penetrations', qty: '4', unit: 'ea', state: 'open' },
            { name: 'Plumbing collar', sub: 'lead, 3"', qty: '4', unit: 'ea', state: 'open' },
            { name: 'Roofing sealant', sub: 'tubes, butyl', qty: '6', unit: 'tubes', state: 'open' }
          ]} />
        <MaterialsGroup
          title="Trim & Finish"
          locked="0 / 3 locked"
          rows={[
            { name: 'Drip edge (aluminum)', sub: '403 ft perimeter', qty: '41', unit: 'sticks', state: 'open' },
            { name: 'Step flashing', sub: '77 ft step', qty: '12', unit: 'pcs', state: 'open' },
            { name: 'Ridge vent', sub: '120 ft ridge', qty: '12', unit: 'sticks', state: 'open' }
          ]} />
      </div>

      <FAB bottom={84} />
      <ContinueBar label="Next Step" enabled={false} sub="10 rows still need a lock or dismiss" />
    </div>);

}

window.ContinueReviewVariant = ContinueReviewVariant;
window.MultiStructureVariant = MultiStructureVariant;
window.ProposedBuildMaterials = ProposedBuildMaterials;
window.MaterialsGroup = MaterialsGroup;