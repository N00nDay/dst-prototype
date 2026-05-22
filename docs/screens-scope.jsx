/* global React, Icon, ENVELOPE_FACETS */
/* Scope step (DST-SCOPE)
   ──────────────────────────────────────────────────────────────
   First step in SOLVE. Rep names every structure they'll work on
   today and picks the scopes of work that apply to each. Inspect,
   Build, Slides, and Proposal all run per-structure downstream —
   Scope sets that list once.

   Structures are locked after Scope in the sense that adding a
   new one requires returning here (existing structures preserve
   their progress on Inspect/Build/etc).

   Per-row behavior:
   - Name is contenteditable (rep retypes inline to rename)
   - Scope pills are tap-to-include/exclude (none selected by default)
   - Trash icon → danger confirm modal (cannot be undone) */

const { useState: useScopeState } = window;

// Curated list of scopes of work. (Craig, May '26 — these account for
// roughly half of the known scopes today; more get added as they roll
// out company-wide.)
// Alphabetical by label.
const SCOPE_OPTIONS = [
{ id: 'gutters', label: 'Gutters' },
{ id: 'insulation', label: 'Insulation' },
{ id: 'other', label: 'Other' },
{ id: 'repairs', label: 'Repairs' },
{ id: 'roofing', label: 'Roofing' },
{ id: 'siding', label: 'Siding' },
{ id: 'solar', label: 'Solar' },
{ id: 'trim', label: 'Trim Work' },
{ id: 'windoors', label: 'Windows & Doors' }];


function ScopeScreen({
  tablet, structures,
  onAddStructure, onRenameStructure, onRemoveStructure, onSetStructureScopes,
  onBack, onContinue
}) {
  const [pendingDelete, setPendingDelete] = useScopeState(null); // { id, name }

  const allReady = structures.every((s) => (s.scopes?.length || 0) > 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="scroll-area" data-screen-label="Scope" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {/* Hero — tinted card with brand icon, structure count chip, and
            intro copy. Pulls the screen's anchor into the first viewport
            so the page doesn't open on a flat title. */}
        <div style={{ padding: tablet ? '16px 28px 6px' : '14px 16px 6px' }}>
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'linear-gradient(135deg, var(--brand-soft) 0%, var(--surface) 75%)',
            padding: tablet ? '18px 22px' : '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 14
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: 'var(--brand)', color: 'var(--brand-fg)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 22px rgba(20,15,5,0.14)'
            }}>
              <Icon.home style={{ width: 22, height: 22 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.1, color: 'var(--brand)', textTransform: 'uppercase' }}>SOLVE · Scope</div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 999,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: 10, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '-0.005em'
                }}>
                  {structures.length} structure{structures.length === 1 ? '' : 's'} on this job
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 26 : 21, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.15 }}>
                What are we working on today?
              </div>
              <div style={{ fontSize: tablet ? 13 : 12, color: 'var(--text-3)', marginTop: 6, maxWidth: 560, lineHeight: 1.5 }}>
                Name each building you'll inspect and tap the scopes of work that apply.
              </div>
            </div>
          </div>
        </div>

        {/* Structures list */}
        <div style={{ padding: tablet ? '14px 28px 0' : '12px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>Structures</div>
          </div>

          <div className="stagger-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {structures.map((s, i) =>
            <StructureRow
              key={s.id}
              structure={s}
              index={i + 1}
              onRename={(name) => onRenameStructure(s.id, name)}
              onToggleScope={(scopeId) => {
                const scopes = s.scopes || [];
                const next = scopes.includes(scopeId) ? scopes.filter((x) => x !== scopeId) : [...scopes, scopeId];
                onSetStructureScopes(s.id, next);
              }}
              onRequestDelete={() => setPendingDelete({ id: s.id, name: s.name })}
              canDelete={structures.length > 1}
              tablet={tablet} />
            )}
          </div>

          {/* Add another */}
          <button
            onClick={() => onAddStructure()}
            style={{
              marginTop: 10, width: '100%', padding: '12px 14px', borderRadius: 10,
              background: 'transparent', color: 'var(--brand)',
              border: '1.5px dashed var(--brand)', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
            <Icon.plus style={{ width: 14, height: 14 }} />
            Add Additional Structure
          </button>

        </div>

        {/* Spacer so the Continue bar doesn't cover content */}
        <div style={{ height: 90 }} />
      </div>

      {/* Continue bar */}
      <ContinueBar
        tablet={tablet}
        label="Continue to Inspect"
        sub={allReady ? '' : 'Pick at least one scope of work — you can adjust later.'}
        enabled={allReady}
        onContinue={onContinue} />

      {pendingDelete && structures.length > 1 &&
      <DeleteStructureModal
        name={pendingDelete.name}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {onRemoveStructure(pendingDelete.id);setPendingDelete(null);}} />}

    </div>);

}

// ─── Structure row ────────────────────────────────────────────
// Name renders as a contentEditable span so the rep retypes in place.
// Scope pills wrap onto a new line below the name (Craig, May '26 —
// the row layout has to scale to many scopes, so pills get their own
// row and are sized a touch smaller).
// Soft palette used to tint the index badge + the left accent strip on
// each structure row. Cycles by index so multi-structure jobs read as a
// visual progression instead of a flat repeating list.
const STRUCTURE_TONES = [
  'var(--brand)',
  'oklch(0.65 0.16 195)',
  'oklch(0.72 0.16 145)',
  'oklch(0.7 0.17 30)',
  'oklch(0.68 0.16 280)'
];

function StructureRow({ structure, index = 1, onRename, onToggleScope, onRequestDelete, canDelete, tablet }) {
  const tone = STRUCTURE_TONES[(index - 1) % STRUCTURE_TONES.length];
  const [draft, setDraft] = useScopeState(structure.name);
  const ref = window.React.useRef(null);

  // Sync draft when external rename happens.
  window.React.useEffect(() => {setDraft(structure.name);}, [structure.name, structure.id]);

  const commit = () => {
    const next = draft.trim();
    if (!next) {setDraft(structure.name);return;}
    if (next !== structure.name) onRename(next);
  };

  const selectedCount = (structure.scopes || []).length;

  return (
    <div style={{
      padding: tablet ? '14px 16px' : '12px 14px', borderRadius: 12,
      background: 'var(--surface)', border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      {/* Row 1 — index badge, name, count, trash */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: tone, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, flexShrink: 0
        }}>{index}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
          <span
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setDraft(e.currentTarget.textContent)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {e.preventDefault();e.currentTarget.blur();}
              if (e.key === 'Escape') {e.preventDefault();e.currentTarget.textContent = structure.name;e.currentTarget.blur();}
            }}
            style={{
              fontSize: tablet ? 15 : 14, fontWeight: 700, letterSpacing: '-0.01em',
              outline: 'none', padding: '2px 4px', marginLeft: -4,
              borderRadius: 4,
              minWidth: 80,
              cursor: 'text'
            }}>
            {structure.name}
          </span>
          <Icon.pen style={{ width: 12, height: 12, color: 'var(--text-4)' }} />
        </div>

        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '3px 8px', borderRadius: 999,
          background: selectedCount > 0 ? 'var(--brand-soft)' : 'var(--surface-2)',
          color: selectedCount > 0 ? 'var(--brand-soft-fg)' : 'var(--text-3)',
          letterSpacing: 0.04, fontVariantNumeric: 'tabular-nums'
        }}>
          {selectedCount} {selectedCount === 1 ? 'scope' : 'scopes'}
        </span>

        <button
          onClick={onRequestDelete}
          disabled={!canDelete}
          aria-label={`Delete ${structure.name}`}
          title={canDelete ? `Delete ${structure.name}` : 'Need at least one structure'}
          style={{
            width: 32, height: 32, borderRadius: 8, padding: 0,
            background: 'transparent', color: 'var(--text-4)',
            border: '1px solid var(--border)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: canDelete ? 'pointer' : 'not-allowed',
            opacity: canDelete ? 1 : 0.35,
            flexShrink: 0
          }}>
          <Icon.trash style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Row 2 — scope pills on their own line, wrapping as needed */}
      <div style={{
        display: 'flex', gap: 5, flexWrap: 'wrap'
      }}>
        {SCOPE_OPTIONS.map((scope) => {
          const selected = (structure.scopes || []).includes(scope.id);
          return (
            <button
              key={scope.id}
              onClick={() => onToggleScope(scope.id)}
              style={{
                padding: tablet ? '4px 9px' : '4px 8px', borderRadius: 999,
                background: selected ? 'var(--success-bg)' : 'transparent',
                color: selected ? 'var(--success)' : 'var(--text-2)',
                border: `1.5px solid ${selected ? 'var(--success)' : 'var(--border-strong)'}`,
                fontSize: tablet ? 11 : 10.5, fontWeight: 700, letterSpacing: '-0.01em',
                cursor: 'pointer', lineHeight: 1.3,
                display: 'inline-flex', alignItems: 'center'
              }}>
              {scope.label}
            </button>);

        })}
      </div>
    </div>);

}

// ─── Delete confirm modal (danger) ────────────────────────────
function DeleteStructureModal({ name, onCancel, onConfirm }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onCancel} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: '94%', maxWidth: 460, background: 'var(--surface)',
        borderRadius: 14, padding: 22, zIndex: 50,
        boxShadow: '0 24px 60px rgba(20,15,5,0.32)',
        border: '1px solid var(--danger)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'var(--danger-bg)', color: 'var(--danger)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Icon.trash style={{ width: 18, height: 18 }} />
          </span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Delete {name}?
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 18 }}>
          This permanently removes the structure along with all its photos, findings, measurements, materials, labor, and pricing.
          <strong style={{ display: 'block', marginTop: 6, color: 'var(--danger)' }}>This cannot be undone.</strong>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px 0', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            fontSize: 13, fontWeight: 700, color: 'var(--text-2)', cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px 0', borderRadius: 10,
            background: 'var(--danger)', color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>Delete structure</button>
        </div>
      </div>
    </>);

}

// ─── Continue bar (shared chrome pattern) ─────────────────────
// Sticky footer with sub-line + a labeled Continue button. Used at the end
// of every SOLVE step.
function ContinueBar({ tablet, label, sub, enabled, onContinue, onBack, backLabel }) {
  // Unlock pulse (Pass 3, D2): when `enabled` flips false→true, briefly add
  // an `unlocked` class to trigger the CSS keyframe celebration.
  const prevEnabled = React.useRef(enabled);
  const [pulseKey, setPulseKey] = React.useState(0);
  React.useEffect(() => {
    if (!prevEnabled.current && enabled) setPulseKey((k) => k + 1);
    prevEnabled.current = enabled;
  }, [enabled]);
  return (
    <div style={{
      flexShrink: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -10px 24px rgba(0,0,0,0.06)',
      padding: tablet ? '12px 28px' : '10px 14px env(safe-area-inset-bottom, 10px)',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
        {onBack && backLabel ?
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: tablet ? 44 : 40,
              padding: tablet ? '0 18px' : '0 14px',
              borderRadius: 8,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-2)', fontSize: tablet ? 14 : 13, fontWeight: 700, letterSpacing: '-0.01em',
              cursor: 'pointer'
            }}>
            <Icon.back style={{ width: 14, height: 14 }} />
            {backLabel}
          </button> :
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '-0.005em' }}>{sub}</span>
        }
      </div>
      <button
        key={pulseKey}
        onClick={onContinue}
        disabled={!enabled}
        className={'btn btn-primary' + (enabled && pulseKey > 0 ? ' unlocked' : '')}
        style={{
          height: tablet ? 44 : 40,
          padding: tablet ? '0 18px' : '0 14px',
          fontSize: tablet ? 14 : 13, fontWeight: 700, letterSpacing: '-0.01em',
          opacity: enabled ? 1 : 0.45,
          cursor: enabled ? 'pointer' : 'not-allowed'
        }}>
        {label} <Icon.arrow />
      </button>
    </div>);

}

Object.assign(window, { ScopeScreen, ContinueBar });
