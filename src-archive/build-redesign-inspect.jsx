/* global React, BR */
/* Structures + Inspect — two distinct steps now.

   STRUCTURES (new step, before Inspect)
   ─────────────────────────────────────
   The rep sets up every structure they'll inspect today. Names + envelope
   pills per structure. Adding a structure appends a row inline. Continue
   advances to Inspect.

   INSPECT (now per-structure, like Build)
   ───────────────────────────────────────
   Opens on the first structure. Header carries a `Main · 1 of 2 ▾`
   structure chip — same pattern Build uses for multi-structure jobs. Photos
   and findings on the page belong to *that* structure only. Continue
   cascades:
     - More structures to inspect → "Continue to Inspect · Detached Garage"
     - Last structure → "Continue to Build"

   Artboards:
   1. Structures step (setup the buildings)
   2. Inspect · Main (1 of 2) — mid-inspection of the first structure
   3. Inspect · Detached Garage (2 of 2) — second structure, fresh start
   4. Dismiss-reason sheet */

const ALL_ENVELOPES = ['Roofing', 'Siding', 'Gutters', 'Windows & Doors'];

// ─── Envelope pill (selectable chip) ──────────────────────────
function EnvelopePill({ label, selected }) {
  return (
    <button style={{
      padding: '6px 12px', borderRadius: 999,
      background: selected ? 'var(--brand)' : 'transparent',
      color: selected ? 'var(--brand-fg)' : 'var(--text-2)',
      border: selected ? '1.5px solid var(--brand)' : '1.5px solid var(--border-strong)',
      fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
      cursor: 'pointer'
    }}>
      {selected && <span style={{ marginRight: 4, fontSize: 11 }}>✓</span>}
      {label}
    </button>
  );
}

// One structure row. When `typing`, the name renders with brand-color
// underline + blinking cursor to indicate inline editing on a fresh row.
// Trash icon on the right opens the delete-confirm modal. Name is
// contenteditable in production (here rendered as static text).
function StructureRow({ s, typing }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      background: typing ? 'var(--brand-soft)' : 'var(--surface-2)',
      border: typing ? '1.5px solid var(--brand)' : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 14
    }}>
      <span style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{s.idx}</span>
      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        {typing ? (
          <>
            <span style={{
              fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
              borderBottom: '1.5px solid var(--brand)', paddingBottom: 1
            }}>{s.name}</span>
            <span style={{ width: 2, height: 20, background: 'var(--brand)', display: 'inline-block', animation: 'blink 1s steps(2,start) infinite' }} />
          </>
        ) : (
          <>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.name}</span>
            <span style={{ color: 'var(--text-4)', fontWeight: 500, fontSize: 12 }}>✎</span>
          </>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {ALL_ENVELOPES.map((env) => (
          <EnvelopePill key={env} label={env} selected={s.envelopes.includes(env)} />
        ))}
      </div>
      {/* Trash — opens delete-confirm modal. */}
      <button aria-label={`Delete ${s.name}`} style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'transparent', color: 'var(--text-4)',
        border: '1px solid var(--border)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
    </div>
  );
}

// ─── STRUCTURES step page ─────────────────────────────────────
// Full-page setup. Lives between the appointment landing and Inspect. Reps
// can't progress to Inspect until every structure has at least one envelope
// (rule: empty structure = no scope to inspect).
function StructuresStep() {
  const { FrameChrome, ContinueBar } = BR;
  const structures = [
    { idx: 1, name: 'Main', envelopes: ['Roofing', 'Siding', 'Gutters', 'Windows & Doors'] },
    { idx: 2, name: 'Detached Garage', envelopes: ['Roofing', 'Siding'] }
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · 4421 Bluffwood Ln" recTime="0:42" activeStep="structures" />

      <div style={{ padding: '14px 28px 6px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>
          What are we working on today?
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.5, maxWidth: 560 }}>
          Name each building you'll inspect and check the envelopes that apply. Inspect, Build, and Proposal all run one structure at a time from here.
        </div>
      </div>

      <div style={{ padding: '14px 28px 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>Structures</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{structures.length} on this job</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {structures.map((s) => <StructureRow key={s.idx} s={s} />)}
        </div>
        <button style={{
          padding: '14px 16px', borderRadius: 10,
          background: 'transparent', color: 'var(--brand)',
          border: '1.5px dashed var(--brand)', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', marginTop: 2
        }}>
          + Add Additional Structure
        </button>

        {/* Tip card — explains why structures matter */}
        <div style={{
          marginTop: 8, padding: '12px 16px', borderRadius: 12,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, flexShrink: 0
          }}>i</span>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Each structure gets its own inspection, build, and pricing slide. You can come back here to add more later — but inspection won't run on structures that aren't here yet.
          </div>
        </div>
      </div>

      <ContinueBar
        label="Continue to Inspect"
        enabled={true}
        sub="2 structures · 6 envelopes" />
    </div>
  );
}

// ─── Delete structure confirm modal ───────────────────────────
// Danger styling. Single tap on the trash icon opens this; permanent action.
function StructuresDeleteModal() {
  const { FrameChrome, ContinueBar } = BR;
  const structures = [
    { idx: 1, name: 'Main', envelopes: ['Roofing', 'Siding', 'Gutters', 'Windows & Doors'] },
    { idx: 2, name: 'Detached Garage', envelopes: ['Roofing', 'Siding'] }
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome title="Whittaker · 4421 Bluffwood Ln" recTime="2:18" activeStep="structures" />

      <div style={{ padding: '14px 28px 6px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>
          What are we working on today?
        </div>
      </div>
      <div style={{ padding: '14px 28px 0', flex: 1, opacity: 0.32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {structures.map((s) => <StructureRow key={s.idx} s={s} />)}
      </div>

      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.42)', zIndex: 5 }} />

      {/* Modal */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: '94%', maxWidth: 560,
        background: 'var(--surface)',
        borderRadius: 14,
        zIndex: 10, padding: 24,
        boxShadow: '0 24px 60px rgba(20,15,5,0.32)',
        border: '1px solid var(--danger)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'var(--danger-bg)', color: 'var(--danger)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Delete Detached Garage?
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 18 }}>
          This will permanently remove the structure along with all its photos, findings, measurements, materials, labor, and pricing.
          <strong style={{ display: 'block', marginTop: 8, color: 'var(--danger)' }}>This cannot be undone.</strong>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, padding: '14px 0', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontSize: 14, fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer'
          }}>Cancel</button>
          <button style={{
            flex: 1, padding: '14px 0', borderRadius: 10,
            background: 'var(--danger)', color: '#fff',
            border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>Delete structure</button>
        </div>
      </div>

      <ContinueBar label="Continue to Inspect" enabled={true} sub="2 structures · 6 envelopes" />
    </div>
  );
}

// ─── Photo capture grid (per structure) ───────────────────────
function PhotoGrid({ count, minimum }) {
  const tiles = [];
  for (let i = 0; i < count; i++) {
    tiles.push(
      <div key={i} style={{
        aspectRatio: '4 / 3', borderRadius: 8,
        background: `linear-gradient(135deg, oklch(0.85 0.02 ${80 + i * 30}), oklch(0.7 0.04 ${80 + i * 30}))`,
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        {i === 0 && <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 14 }}>★</span>}
      </div>
    );
  }
  tiles.push(
    <div key="add" style={{
      aspectRatio: '4 / 3', borderRadius: 8,
      background: 'transparent',
      border: '1.5px dashed var(--brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--brand)',
      fontSize: 11, fontWeight: 700, flexDirection: 'column', gap: 2
    }}>
      <span style={{ fontSize: 20 }}>+</span>
      Capture
    </div>
  );
  return (
    <div style={{ padding: '0 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>Photos</div>
        <div style={{ fontSize: 11, color: count > minimum ? 'var(--success)' : 'var(--text-3)', fontWeight: 600 }}>
          {count} of {minimum}+ minimum {count > minimum && '✓'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {tiles}
      </div>
    </div>
  );
}

// ─── Finding card (matches EnvelopeCard + dismiss button) ─────
const COND_STYLES = {
  good: { label: 'Good', tone: 'oklch(0.7 0.13 175)' },
  fair: { label: 'Fair', tone: 'oklch(0.78 0.14 75)' },
  poor: { label: 'Poor', tone: 'oklch(0.7 0.16 40)' }
};

function FindingCardRX({ envelope, state, condition, note, reason, photos }) {
  const isDismissed = state === 'dismissed';
  const cond = condition ? COND_STYLES[condition] : null;

  return (
    <div style={{
      background: 'var(--surface)',
      border: isDismissed ? '1px dashed var(--border-strong)' : '1px solid var(--border)',
      borderRadius: 10,
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 12,
      opacity: isDismissed ? 0.6 : 1,
      boxShadow: '0 1px 2px rgba(20,15,5,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', textDecoration: isDismissed ? 'line-through' : 'none' }}>{envelope}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            {isDismissed ? `Dismissed · ${reason}` : `${photos} photo${photos === 1 ? '' : 's'} attached`}
          </div>
        </div>
        {cond && !isDismissed && (
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: cond.tone, color: '#fff',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase'
          }}>{cond.label}</span>
        )}
        {!isDismissed && (
          <button style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'transparent', color: 'var(--text-3)',
            border: '1px solid var(--border)',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase',
            cursor: 'pointer'
          }}>Dismiss</button>
        )}
        {isDismissed && (
          <button style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'transparent', color: 'var(--brand)',
            border: '1px solid var(--brand)',
            fontSize: 10, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase',
            cursor: 'pointer'
          }}>Undo</button>
        )}
      </div>

      {!isDismissed && (
        <>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 6 }}>Condition</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Object.entries(COND_STYLES).map(([id, c]) => {
                const active = id === condition;
                return (
                  <button key={id} style={{
                    flex: '1 1 0', minWidth: 60,
                    padding: '8px 6px', borderRadius: 8,
                    border: active ? `1.5px solid ${c.tone}` : '1px solid var(--border)',
                    background: active ? c.tone : 'var(--surface)',
                    color: active ? '#fff' : 'var(--text-2)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer'
                  }}>{c.label}</button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
            {note ? (
              <div style={{
                padding: 10, borderRadius: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                minHeight: 60, fontSize: 12, color: 'var(--text)',
                lineHeight: 1.5
              }}>{note}</div>
            ) : (
              <button style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
                border: '1.5px dashed var(--brand)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, background: 'var(--brand)',
                  color: 'var(--brand-fg)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                </span>
                Dictate findings for this section
              </button>
            )}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 6 }}>Photos in presentation</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
              {Array.from({ length: photos }).map((_, i) => (
                <div key={i} style={{
                  position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1 / 1',
                  background: `linear-gradient(135deg, oklch(0.85 0.02 ${80 + i * 30}), oklch(0.7 0.04 ${80 + i * 30}))`
                }} />
              ))}
              <button style={{
                position: 'relative', aspectRatio: '1 / 1', padding: 0,
                borderRadius: 4, border: '1px dashed var(--border-strong)',
                background: 'var(--surface-2)', color: 'var(--text-3)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                <span style={{ fontSize: 7, fontWeight: 700, lineHeight: 1, textAlign: 'center' }}>Add<br />photos</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── INSPECT page (per structure) ──────────────────────────────
// One structure at a time. Header gets a brand-colored structure chip so
// the rep always knows whose photos/findings they're on. Continue button
// cascades to the next structure, or to Build on the last.
//
// Dictation action lives inline at the bottom of the findings list (not a
// floating FAB) — per-list action belongs with the list, not overlapping it.
function InspectPerStructure({
  structureChip, recTime, intro,
  photoCount, photoMin,
  findings,
  resolvedText,
  continueLabel,
  continueSub
}) {
  const { FrameChrome, ContinueBar, FAB } = BR;
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome
        title="Whittaker · Inspect"
        recTime={recTime}
        activeStep="inspect"
        structureChip={structureChip} />

      <div style={{ padding: '8px 16px 12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {intro.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
          {intro.body}
        </div>
      </div>

      <PhotoGrid count={photoCount} minimum={photoMin} />

      <div style={{ padding: '0 16px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>
            Findings · {structureChip.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{resolvedText}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {findings.map((f) => (
            <FindingCardRX key={f.envelope} {...f} />
          ))}
        </div>
      </div>

      <FAB bottom={84} />
      <ContinueBar label={continueLabel} enabled={false} sub={continueSub} />
    </div>
  );
}

// ── Specific compositions for each artboard ────────────────────
function InspectMain() {
  return (
    <InspectPerStructure
      structureChip={{ idx: 1, name: 'Main', position: '1 of 2' }}
      recTime="14:38"
      intro={{
        title: "Inspecting Main",
        body: "Photograph the home, log findings for each envelope. When this structure is complete, advance to Detached Garage."
      }}
      photoCount={4} photoMin={2}
      resolvedText="2 of 4 resolved · 1 dismissed"
      findings={[
        { envelope: 'Roofing', state: 'resolved', condition: 'poor', photos: 3, note: '11 hail hits per test square on north slope. Documented with chalk + photo. Shingles are bruised but holding.' },
        { envelope: 'Siding', state: 'open', condition: null, photos: 1, note: '' },
        { envelope: 'Gutters', state: 'dismissed', reason: 'Not applicable', photos: 0 },
        { envelope: 'Windows & Doors', state: 'open', condition: null, photos: 0, note: '' },
        { envelope: 'Attic', state: 'resolved', condition: 'fair', photos: 1, note: 'Intake-to-exhaust ratio 38/100 — under-vented. Insulation OK. Decking solid.' }
      ]}
      continueLabel="Continue to Inspect · Detached Garage"
      continueSub="2 findings still open on Main" />
  );
}

function InspectGarage() {
  return (
    <InspectPerStructure
      structureChip={{ idx: 2, name: 'Detached Garage', position: '2 of 2' }}
      recTime="28:12"
      intro={{
        title: "Inspecting Detached Garage",
        body: "Second structure — photos and findings are tracked separately. Only the envelopes on this structure show below."
      }}
      photoCount={0} photoMin={2}
      resolvedText="0 of 2 resolved"
      findings={[
        { envelope: 'Roofing', state: 'open', condition: null, photos: 0, note: '' },
        { envelope: 'Siding', state: 'open', condition: null, photos: 0, note: '' }
      ]}
      continueLabel="Continue to Build"
      continueSub="0 of 2 findings resolved on Detached Garage" />
  );
}

// ─── Dismiss-reason sheet ─────────────────────────────────────
function InspectDismissReasonSheet() {
  const { FrameChrome } = BR;
  const REASONS = [
    { id: 'na', label: 'Not applicable', sub: 'Doesn\'t apply to this structure', picked: true },
    { id: 'declined', label: 'Customer declined', sub: 'Homeowner asked us not to inspect this' },
    { id: 'oos', label: 'Out of scope', sub: 'Not part of what we sell' },
    { id: 'already', label: 'Already addressed', sub: 'Recently replaced or repaired' },
    { id: 'other', label: 'Other', sub: 'Type a reason' }
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <FrameChrome
        title="Whittaker · Inspect"
        recTime="16:02"
        activeStep="inspect"
        structureChip={{ idx: 1, name: 'Main', position: '1 of 2' }} />
      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Inspecting Main</div>
      </div>
      <div style={{ padding: '0 16px', flex: 1, opacity: 0.32 }}>
        <FindingCardRX envelope="Gutters" state="open" condition={null} note="" photos={0} />
      </div>

      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,5,0.42)', zIndex: 5 }} />
      <div style={{
        position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
        width: '100%', maxWidth: 720, background: 'var(--surface)',
        borderRadius: '20px 20px 0 0', zIndex: 10, padding: '14px 0 20px',
        boxShadow: '0 -16px 40px rgba(20,15,5,0.18)'
      }}>
        <div style={{ width: 40, height: 4, background: 'var(--border-strong)', borderRadius: 999, margin: '0 auto 14px' }} />
        <div style={{ padding: '0 22px 14px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Why dismiss Gutters findings?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
            Required to keep the report complete. The homeowner won't see this — it's for the office.
          </div>
        </div>
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {REASONS.map((r) => (
            <div key={r.id} style={{
              padding: '12px 14px', borderRadius: 10,
              background: r.picked ? 'var(--brand-soft)' : 'var(--surface-2)',
              border: r.picked ? '1.5px solid var(--brand)' : '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer'
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: 999,
                border: `1.5px solid ${r.picked ? 'var(--brand)' : 'var(--border-strong)'}`,
                background: r.picked ? 'var(--brand)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {r.picked && <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{r.sub}</div>
              </div>
            </div>
          ))}
        </div>
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
          }}>Dismiss findings</button>
        </div>
      </div>
    </div>
  );
}

window.StructuresStep = StructuresStep;
window.StructuresDeleteModal = StructuresDeleteModal;
window.InspectMain = InspectMain;
window.InspectGarage = InspectGarage;
window.InspectDismissReasonSheet = InspectDismissReasonSheet;
