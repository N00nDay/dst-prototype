/* global React */
/* Build redesign — artboards for side-by-side comparison.
   Renders today's Build screen vs. the proposed redesign at tablet width. */

const { useState } = window;

// ─── Shared atoms ────────────────────────────────────────────
// Frame chrome: status bar + app header + step pills row. Used by every
// artboard so each one reads as a real tablet screen.
function FrameChrome({ title, recTime = '23:42', activeStep = 'build', structureChip }) {
  const steps = [
    { id: 'structures', label: 'Scope' },
    { id: 'inspect', label: 'Inspect' },
    { id: 'build', label: 'Build' },
    { id: 'slides', label: 'Slides' },
    { id: 'proposal', label: 'Proposal' }
  ];
  return (
    <div style={{ background: 'var(--bg)' }}>
      {/* status bar */}
      <div style={{
        height: 36, padding: '0 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        fontSize: 11, color: 'var(--text-3)'
      }}>
        <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>9:41 Tue Apr 28</span>
        <span>Wi-Fi · 100%</span>
      </div>
      {/* app header */}
      <div style={{
        padding: '12px 16px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text-3)', fontSize: 22 }}>←</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {title}
          </span>
          {structureChip && (
            <div style={{
              marginLeft: 4,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 8,
              background: 'var(--brand-soft)', border: '1.5px solid var(--brand)',
              fontSize: 12, fontWeight: 700, color: 'var(--brand-soft-fg)', letterSpacing: '-0.01em'
            }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{structureChip.idx}</span>
              {structureChip.name}
              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>{structureChip.position}</span>
              <span style={{ fontSize: 11 }}>▾</span>
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--danger)', fontSize: 11, fontWeight: 600
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--danger)' }} />
          REC · {recTime}
        </div>
      </div>
      {/* phase chip strip (CONNECT — SOLVE — COMMIT) */}
      <div style={{ padding: '8px 16px 6px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: 'var(--text-4)', letterSpacing: 0.1 }}>
          <span style={{ color: 'var(--text-4)' }}>CONNECT</span>
          <span>—</span>
          <span style={{
            padding: '2px 10px', borderRadius: 999,
            background: 'var(--brand)', color: 'var(--brand-fg)'
          }}>SOLVE</span>
          <span>—</span>
          <span>COMMIT</span>
        </div>
      </div>
      {/* step pills — five now (Structures · Inspect · Build · Slides · Proposal) */}
      <div style={{ padding: '6px 16px 12px', display: 'flex', gap: 6 }}>
        {steps.map((s) => {
          const active = s.id === activeStep;
          return (
            <div key={s.id} style={{
              flex: 1, padding: '10px 0', textAlign: 'center',
              borderRadius: 999,
              background: active ? 'var(--brand)' : 'var(--surface)',
              border: active ? 'none' : '1px solid var(--border)',
              color: active ? 'var(--brand-fg)' : 'var(--text-2)',
              fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em'
            }}>
              {s.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bottom Continue bar — same on both designs but label changes.
function ContinueBar({ label, enabled = true, sub }) {
  return (
    <div style={{
      borderTop: '1px solid var(--border)', background: 'var(--surface)',
      padding: '12px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</div>
      <button style={{
        padding: '12px 22px', borderRadius: 10,
        background: enabled ? 'var(--brand)' : 'var(--surface-3)',
        color: enabled ? 'var(--brand-fg)' : 'var(--text-4)',
        border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
        cursor: enabled ? 'pointer' : 'not-allowed',
        display: 'inline-flex', alignItems: 'center', gap: 8
      }}>
        {label} →
      </button>
    </div>
  );
}

// Dictate FAB — pinned bottom-center. Matches the existing DictateFab in
// screens-inspection.jsx: brand-color background + Icon.mic SVG.
function FAB({ bottom = 80 }) {
  return (
    <div style={{
      position: 'absolute', left: '50%', bottom,
      transform: 'translateX(-50%)',
      width: 56, height: 56, borderRadius: 999,
      background: 'var(--brand)', color: 'var(--brand-fg)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="13" rx="3" />
        <path d="M5 11a7 7 0 0014 0M12 18v3" />
      </svg>
    </div>
  );
}

// ─── Envelope iconography (proposed) ──────────────────────────
// Hand-drawn-ish line icons for the house-diagram envelope picker.
function EnvIcon({ id, size = 40 }) {
  const stroke = 'currentColor';
  const sw = 1.8;
  if (id === 'roofing') return (
    <svg width={size} height={size} viewBox="0 0 48 40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 26 L24 8 L44 26" />
      <path d="M11 26 L24 16 L37 26" opacity="0.55" />
      <path d="M18 26 L24 21 L30 26" opacity="0.35" />
      <line x1="4" y1="26" x2="44" y2="26" />
    </svg>
  );
  if (id === 'siding') return (
    <svg width={size} height={size} viewBox="0 0 48 40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="34" height="26" rx="1.5" />
      <line x1="7" y1="14" x2="41" y2="14" opacity="0.7" />
      <line x1="7" y1="21" x2="41" y2="21" opacity="0.7" />
      <line x1="7" y1="28" x2="41" y2="28" opacity="0.7" />
    </svg>
  );
  if (id === 'gutters') return (
    <svg width={size} height={size} viewBox="0 0 48 40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16 L24 6 L42 16" opacity="0.5" />
      <path d="M6 18 L42 18 L42 25 L6 25 Z" />
      <line x1="6" y1="22" x2="42" y2="22" opacity="0.45" />
      <rect x="30" y="25" width="6" height="11" rx="0.5" />
    </svg>
  );
  if (id === 'windoors') return (
    <svg width={size} height={size} viewBox="0 0 48 40" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="11" y="6" width="26" height="28" rx="1.5" />
      <line x1="24" y1="6" x2="24" y2="34" />
      <line x1="11" y1="20" x2="37" y2="20" />
    </svg>
  );
  return null;
}

// Small lock glyph for row affordances.
function LockGlyph({ open = false, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      {open
        ? <path d="M8 11V7a4 4 0 0 1 7.5-2" />
        : <path d="M8 11V7a4 4 0 0 1 8 0v4" />}
    </svg>
  );
}

// Tier accent dot (Good=grey, Better=brand, Best=success).
function TierDot({ tier }) {
  const c = tier === 'good' ? 'var(--text-3)'
          : tier === 'better' ? 'var(--brand)'
          : 'var(--success)';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: c }} />;
}

window.BR = { FrameChrome, ContinueBar, FAB, EnvIcon, LockGlyph, TierDot };
