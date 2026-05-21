/* global React, BR */
/* Proposed Build screen — Roofing > Measure, mid-flow.
   Shows: house-diagram envelope picker with completion states,
   sub-step progress strip (Measure → Materials → Labor → Other),
   aerial banner, and a mix of row states (open / locked / dismissed). */

const { useState: useStateP } = window;

// ─── House-diagram envelope picker ────────────────────────────
// Each tile has a small include/exclude toggle in its top-left corner so the
// rep can flip envelopes on or off without leaving Build. Excluded tiles
// keep their slot in the row (faded + dashed) so the rep can always include
// them back. Replaces the separate "Edit envelopes" link entirely.
function EnvelopePicker({ active, statuses }) {
  const { EnvIcon } = BR;
  const envs = [
    { id: 'roofing', label: 'Roofing' },
    { id: 'siding', label: 'Siding' },
    { id: 'gutters', label: 'Gutters' },
    { id: 'windoors', label: 'Windows & Doors' }
  ];
  return (
    <div style={{ padding: '0 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.1, textTransform: 'uppercase' }}>Envelopes</div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>Tap × to exclude · + to include</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {envs.map((e) => {
          const status = statuses[e.id] || 'open';
          const isActive = e.id === active;
          const isDone = status === 'done';
          const isExcluded = status === 'excluded';
          const pct = status === 'progress' ? statuses[`${e.id}_pct`] : null;
          return (
            <div key={e.id} style={{
              position: 'relative',
              padding: '14px 10px 12px',
              borderRadius: 12,
              background: isExcluded ? 'transparent' : (isActive ? 'var(--brand-soft)' : 'var(--surface)'),
              border: isExcluded
                ? '1px dashed var(--border-strong)'
                : (isActive ? '1.5px solid var(--brand)' : '1px solid var(--border)'),
              opacity: isExcluded ? 0.55 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
            }}>
              {/* Top-left toggle — flips include/exclude. */}
              <button
                aria-label={isExcluded ? `Include ${e.label}` : `Exclude ${e.label}`}
                style={{
                  position: 'absolute', top: 6, left: 6,
                  width: 22, height: 22, borderRadius: 999,
                  background: isExcluded ? 'var(--brand)' : 'var(--surface-2)',
                  color: isExcluded ? 'var(--brand-fg)' : 'var(--text-3)',
                  border: isExcluded ? 'none' : '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', padding: 0
                }}>
                {isExcluded ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                )}
              </button>

              {/* Done badge top-right */}
              {isDone && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 18, height: 18, borderRadius: 999,
                  background: 'var(--success)', color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700
                }}>✓</span>
              )}
              {/* In-progress pct ring badge */}
              {pct != null && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  padding: '1px 6px', borderRadius: 999,
                  background: 'var(--surface-2)', color: 'var(--brand-soft-fg)',
                  fontSize: 9, fontWeight: 700
                }}>{pct}%</span>
              )}
              <div style={{
                color: isActive ? 'var(--brand)' : (isDone ? 'var(--success)' : 'var(--text-2)'),
                opacity: isExcluded ? 0.7 : 1,
                marginTop: 4
              }}>
                <EnvIcon id={e.id} size={40} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--brand-soft-fg)' : 'var(--text-2)', textAlign: 'center', lineHeight: 1.2 }}>
                {e.label}
              </div>
              {isExcluded && (
                <span style={{
                  position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                  padding: '1px 8px', borderRadius: 999,
                  background: 'var(--surface-2)', color: 'var(--text-4)',
                  fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap'
                }}>excluded</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-step progress strip ──────────────────────────────────
// Numbered circles + connecting line, distinct from page-level pill tabs.
function SubStepStrip({ active, completed }) {
  const steps = [
    { id: 'measure', label: 'Measure' },
    { id: 'materials', label: 'Materials' },
    { id: 'labor', label: 'Labor' },
    { id: 'other', label: 'Other' }
  ];
  const idx = steps.findIndex((s) => s.id === active);
  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* connecting line */}
        <div style={{
          position: 'absolute', top: 13, left: 13, right: 13, height: 2,
          background: 'var(--border)', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', top: 13, left: 13, height: 2,
          background: 'var(--brand)', zIndex: 0,
          width: `calc(${(idx / (steps.length - 1)) * 100}% - ${(idx / (steps.length - 1)) * 26}px)`
        }} />
        {steps.map((s, i) => {
          const isActive = s.id === active;
          const isComplete = completed.includes(s.id);
          const isPast = i < idx;
          return (
            <div key={s.id} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 999,
                background: isActive ? 'var(--brand)' : (isComplete || isPast ? 'var(--brand)' : 'var(--surface)'),
                color: (isActive || isComplete || isPast) ? 'var(--brand-fg)' : 'var(--text-3)',
                border: isActive ? '2px solid var(--brand)' : (isComplete || isPast ? 'none' : '2px solid var(--border-strong)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                boxShadow: isActive ? '0 0 0 4px var(--brand-soft)' : 'none'
              }}>
                {isComplete || isPast ? '✓' : (i + 1)}
              </div>
              <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--text)' : 'var(--text-3)' }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Row primitive ────────────────────────────────────────────
// Three visual states map to the lock model.
function MeasurementRow({ label, hint, value, unit, state = 'open', aerial, last }) {
  const { LockGlyph } = BR;
  const isLocked = state === 'locked';
  const isDismissed = state === 'dismissed';
  return (
    <div style={{
      padding: '12px 14px',
      borderBottom: last ? 'none' : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 10,
      background: isLocked ? 'var(--success-bg)' : (isDismissed ? 'var(--surface-2)' : 'transparent')
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: isDismissed ? 'var(--text-4)' : 'var(--text)',
          textDecoration: isDismissed ? 'line-through' : 'none'
        }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{hint}</div>}
        {state === 'open' && aerial && (
          <button style={{
            marginTop: 5, padding: '3px 8px', borderRadius: 999,
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            border: '1px solid var(--border)', fontSize: 10, fontWeight: 700, cursor: 'pointer'
          }}>Apply aerial · {aerial}</button>
        )}
        {isDismissed && (
          <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3, fontWeight: 600 }}>Dismissed</div>
        )}
      </div>

      {/* Value display */}
      {state === 'open' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
          <button style={{ width: 26, height: 26, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-3)', cursor: 'pointer' }}>−</button>
          <span style={{ minWidth: 50, textAlign: 'center', fontSize: 13, color: value ? 'var(--text)' : 'var(--text-4)', fontFamily: 'var(--font-display)', fontVariantNumeric: 'tabular-nums' }}>
            {value || `— ${unit}`}
          </span>
          <button style={{ width: 26, height: 26, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-3)', cursor: 'pointer' }}>+</button>
        </div>
      ) : (
        <div style={{ minWidth: 80, textAlign: 'right' }}>
          <span style={{
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
            color: isDismissed ? 'var(--text-4)' : 'var(--text)',
            fontVariantNumeric: 'tabular-nums',
            textDecoration: isDismissed ? 'line-through' : 'none'
          }}>{value} <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{unit}</span></span>
        </div>
      )}

      {/* Lock affordance */}
      {!isDismissed && (
        <button style={{
          width: 32, height: 32, borderRadius: 8,
          background: isLocked ? 'var(--success)' : 'transparent',
          color: isLocked ? '#fff' : 'var(--text-4)',
          border: isLocked ? 'none' : '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <LockGlyph open={!isLocked} size={14} />
        </button>
      )}
      {isDismissed && (
        <button style={{
          padding: '4px 10px', borderRadius: 8,
          background: 'transparent', color: 'var(--text-3)',
          border: '1px solid var(--border)',
          fontSize: 10, fontWeight: 700, cursor: 'pointer'
        }}>Undo</button>
      )}
    </div>
  );
}

function MeasurementGroupNew({ title, rows, completePct }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        {completePct != null && (
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{completePct}</div>
        )}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {rows.map((r, i) => <MeasurementRow key={r.label} {...r} last={i === rows.length - 1} />)}
      </div>
    </div>
  );
}

// ─── Aerial banner (compact, lives top of Measure) ────────────
function AerialBanner({ remainingCount }) {
  return (
    <div style={{ padding: '0 16px 10px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--brand)' }}>H</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Hover · HV-7024146 <span style={{ padding: '1px 6px', borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success)', fontSize: 9, marginLeft: 4 }}>Linked</span></div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{remainingCount} aerial measurements still to apply · Synced 8:42 AM</div>
        </div>
        <button style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--brand)', color: 'var(--brand-fg)', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Apply all</button>
      </div>
    </div>
  );
}

// ─── The full Proposed > Measure artboard ─────────────────────
function ProposedBuildMeasure() {
  const { FrameChrome, FAB, ContinueBar } = BR;
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · 4421 Bluffwood Ln" recTime="23:42" />

      <EnvelopePicker
        active="roofing"
        statuses={{
          roofing: 'progress', roofing_pct: 38,
          siding: 'open',
          gutters: 'excluded',
          windoors: 'open'
        }} />

      <SubStepStrip active="measure" completed={[]} />

      <AerialBanner remainingCount={11} />

      <div style={{ padding: '4px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflow: 'hidden' }}>
        <MeasurementGroupNew
          title="Area"
          completePct="4 / 4"
          rows={[
            { label: 'Roof area (total)', value: '34.9', unit: 'sq', state: 'locked' },
            { label: 'Steep slope area', hint: 'Pitches ≥ 4/12', value: '30.1', unit: 'sq', state: 'locked' },
            { label: 'Low slope area', hint: 'Pitches ≤ 3/12', value: '4.8', unit: 'sq', state: 'locked' },
            { label: 'Predominant pitch', value: '8/12', unit: '', state: 'locked' }
          ]} />
        <MeasurementGroupNew
          title="Edge"
          completePct="2 / 5"
          rows={[
            { label: 'Eaves', value: '248', unit: 'ft', state: 'locked' },
            { label: 'Rakes', value: '155', unit: 'ft', state: 'locked' },
            { label: 'Ridge', unit: 'ft', state: 'open', aerial: '120 ft' },
            { label: 'Hip', unit: 'ft', state: 'open', aerial: '80 ft' },
            { label: 'Valley', value: '0', unit: 'ft', state: 'dismissed' }
          ]} />
        <MeasurementGroupNew
          title="Penetrations"
          completePct="0 / 5"
          rows={[
            { label: 'Pipe boots', unit: 'ea', state: 'open', aerial: '4 ea' },
            { label: 'Skylights', value: '0', unit: 'ea', state: 'dismissed' }
          ]} />
      </div>

      <FAB bottom={84} />
      <ContinueBar label="Next Step" enabled={false} sub="3 rows still need a lock or dismiss" />
    </div>
  );
}

window.ProposedBuildMeasure = ProposedBuildMeasure;
window.EnvelopePicker = EnvelopePicker;
window.SubStepStrip = SubStepStrip;
window.MeasurementRow = MeasurementRow;
window.MeasurementGroupNew = MeasurementGroupNew;
window.AerialBanner = AerialBanner;
