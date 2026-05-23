/* global React, Icon, BRANDS, APPOINTMENTS, INSPECTION_CATEGORIES, SEED_INSPECTION_ITEMS, TIERS, LINE_ITEMS, CUSTOMER, METRICS, REPS, FOLLOWUPS, FOLLOWUP_REASONS, CUSTOMERS, COMMISSIONS */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─────── Helpers ───────
const fmt = (n) => '$' + Math.round(n).toLocaleString();
const fmt0 = (n) => Math.round(n).toLocaleString();
const pct = (n, digits = 0) => (n * 100).toFixed(digits) + '%';
const fmtTime = (s) => {
  const m = Math.floor(s / 60),sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

// Tier total computed from line items (matches printed totals roughly)
const tierTotal = (tier) => LINE_ITEMS.reduce((acc, li) => acc + li.qty * (li[tier] || 0), 0);

// ─────── Toast hook ───────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, kind = 'ai') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return { toasts, push };
}

// ─────── OS Status Bar (carrier/time/signal/wifi/battery) ───────
function OSStatusBar({ device = 'phone', theme = 'light' }) {
  // Use a stable mock time; not real clock
  const time = '9:41';
  const c = 'var(--text)';
  if (device === 'tablet') {
    return (
      <div className="os-status tablet">
        <div className="os-status-left">
          <span style={{ fontWeight: 600 }}>{time}</span>
          <span style={{ opacity: 0.55, marginLeft: 10 }}>Tue Apr 28</span>
        </div>
        <div className="os-status-right">
          <span style={{ opacity: 0.55, fontSize: 11 }}>Wi-Fi</span>
          <SignalBars c={c} />
          <BatteryGlyph c={c} pct={86} />
        </div>
      </div>);

  }
  return (
    <div className="os-status">
      <div className="os-status-left"><span>{time}</span></div>
      <div className="os-status-notch" />
      <div className="os-status-right">
        <SignalBars c={c} />
        <svg width="14" height="11" viewBox="0 0 14 11" aria-hidden="true">
          <path d="M7 2.2c2 0 3.9.8 5.3 2.1l1-1A8.5 8.5 0 007 .9 8.5 8.5 0 00.7 3.3l1 1A7.4 7.4 0 017 2.2z" fill={c} />
          <path d="M7 5.5c1.2 0 2.3.5 3.1 1.3l1-1A6 6 0 007 4 6 6 0 002.9 5.8l1 1A4.4 4.4 0 017 5.5z" fill={c} />
          <circle cx="7" cy="9" r="1.2" fill={c} />
        </svg>
        <BatteryGlyph c={c} pct={86} />
      </div>
    </div>);

}

function SignalBars({ c = 'currentColor' }) {
  return (
    <svg width="17" height="11" viewBox="0 0 17 11" aria-hidden="true">
      <rect x="0" y="7" width="3" height="4" rx="0.6" fill={c} />
      <rect x="4.5" y="5" width="3" height="6" rx="0.6" fill={c} />
      <rect x="9" y="2.5" width="3" height="8.5" rx="0.6" fill={c} />
      <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={c} fillOpacity="0.45" />
    </svg>);

}
function BatteryGlyph({ c = 'currentColor', pct = 80 }) {
  return (
    <svg width="26" height="12" viewBox="0 0 26 12" aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="11" rx="2.6" fill="none" stroke={c} strokeOpacity="0.5" />
      <rect x="2" y="2" width={Math.round(19 * (pct / 100))} height="8" rx="1.4" fill={c} />
      <rect x="23.5" y="3.5" width="1.8" height="5" rx="0.9" fill={c} fillOpacity="0.5" />
    </svg>);

}

// Top-of-page stepper for SOLVE phase. Tap rules:
//   - any past step (i < active): tappable, goes back
//   - the active step: current location, inert
//   - a future step that the rep has already reached (i <= farthestIdx):
//     tappable so they can jump forward without using Continue
//   - any future step they haven't reached yet: muted and inert
// Visual is intentionally light — no pill backgrounds, thin connectors,
// small numbered dots. Matches the in-Build SubStepStrip family.
function PhaseTabBar({ tabs, activeId, farthestIdx = 0, onSelect }) {
  // Chevron tracker for the SOLVE phase stepper (Scope / Inspect / Build /
  // Slides / Proposal). Gating: a rep can tap backward freely; tapping
  // forward is only allowed for steps already visited (i <= farthestIdx).
  // Unreached steps render as `upcoming` and are disabled.
  const activeIdx = Math.max(0, tabs.findIndex((t) => t.id === activeId));
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 4,
      background: 'var(--surface)',
      padding: '8px 12px 10px',
      // Soft drop-shadow under the whole static header stack (AppContextBar
      // sits above this with shared bg, so the shadow falls below both).
      boxShadow: '0 6px 14px rgba(20,15,5,0.06), 0 1px 0 var(--border)'
    }}>
      <div className="chev-tracker" role="tablist">
        {tabs.map((t, i) => {
          const isActive = i === activeIdx;
          const isPast = i < activeIdx;
          const isCompletedAhead = i > activeIdx && i <= farthestIdx;
          const canTap = isPast || isCompletedAhead;
          const cls = ['ctile'];
          if (isActive) cls.push('active');else
          if (isPast || isCompletedAhead) cls.push('done');else
          cls.push('upcoming');
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'step' : undefined}
              className={cls.join(' ')}
              onClick={canTap ? () => onSelect(t.id) : undefined}
              disabled={!canTap && !isActive}>
              <span className="ctxt">
                {(isPast || isCompletedAhead) && <span aria-hidden="true">✓</span>}
                {t.label}
              </span>
            </button>);

        })}
      </div>
    </div>);

}

// ─────── Brand chip + recording row ───────
function AppContextBar({
  title,
  recording,
  recordingPaused = false,
  recordingTime,
  sync = null,
  action = null,
  leading = null,
  phaseInfo = null,
  structureSwitcher = null,
  lastSavedAt = null,
  onSaveExit = null,
  onPauseRec = null,
  onResumeRec = null,
  onEndRec = null
}) {
  // Sync pill removed per Craig — redundant signal at top of every screen.
  const syncPill = null;

  const [showRecSheet, setShowRecSheet] = React.useState(false);
  const [showSavedPopover, setShowSavedPopover] = React.useState(false);

  // Variant C: slim REC — dot + time only, no "REC" label. Tappable when
  // recording so the rep can pause/resume/end mid-appointment. Paused state
  // mutes the dot + timer color so it reads at a glance.
  const recColor = recordingPaused ? 'var(--text-3)' : 'var(--danger)';
  const recPill = recording &&
  <button
    type="button"
    onClick={() => setShowRecSheet(true)}
    aria-label={recordingPaused ? 'Recording paused — tap for controls' : 'Recording — tap for controls'}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      color: recColor, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 11,
      background: 'transparent', border: 'none', padding: '4px 6px', cursor: 'pointer'
    }}>
      <span className={recordingPaused ? '' : 'rec-dot'} style={recordingPaused ? {
        width: 8, height: 8, borderRadius: 999, border: `1.5px solid ${recColor}`
      } : undefined} />
      <span>{fmtTime(recordingTime)}{recordingPaused ? ' · paused' : ''}</span>
    </button>;

  // Saved pill — ambient "everything is captured" reassurance. Only shows
  // inside an appointment (phaseInfo present) once at least one save has
  // happened. Tapping opens a small popover with the absolute timestamp
  // and a Save & Exit button for walking away.
  const savedPill = phaseInfo && lastSavedAt &&
  <SavedPill
    lastSavedAt={lastSavedAt}
    open={showSavedPopover}
    onToggle={() => setShowSavedPopover((v) => !v)}
    onClose={() => setShowSavedPopover(false)}
    onSaveExit={onSaveExit} />;


  // Variant C single-row layout for in-appointment screens:
  //   [back] Title · [structure chip]    CONNECT—SOLVE—COMMIT  • 3:35
  // Drops the second row that used to carry the structure switcher.
  if (phaseInfo) {
    return (
      <>
        <div className="app-status" style={{ padding: '6px 14px 6px', minHeight: 44, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            {leading}
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {structureSwitcher &&
            <>
                <span style={{ color: 'var(--text-4)', flexShrink: 0 }}>·</span>
                <div style={{ minWidth: 0, flexShrink: 1 }}>{structureSwitcher}</div>
              </>}
          </div>
          <div style={{ flexShrink: 0 }}>
            <PhaseProgress phaseInfo={phaseInfo} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, position: 'relative' }}>
            {recPill}
            {savedPill}
            {syncPill}
            {action}
          </div>
        </div>
        {showRecSheet &&
        <RecordingControlSheet
          paused={recordingPaused}
          elapsedSec={recordingTime}
          onClose={() => setShowRecSheet(false)}
          onPause={() => { setShowRecSheet(false); onPauseRec && onPauseRec(); }}
          onResume={() => { setShowRecSheet(false); onResumeRec && onResumeRec(); }}
          onEnd={() => { setShowRecSheet(false); onEndRec && onEndRec(); }} />
        }
      </>);

  }

  return (
    <>
      <div className="app-status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {leading}
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {recPill}
          {syncPill}
          {action}
        </div>
      </div>
      {showRecSheet &&
      <RecordingControlSheet
        paused={recordingPaused}
        elapsedSec={recordingTime}
        onClose={() => setShowRecSheet(false)}
        onPause={() => { setShowRecSheet(false); onPauseRec && onPauseRec(); }}
        onResume={() => { setShowRecSheet(false); onResumeRec && onResumeRec(); }}
        onEnd={() => { setShowRecSheet(false); onEndRec && onEndRec(); }} />
      }
    </>);

}

// ─────── Saved pill + popover ───────
// Ambient "everything is captured" indicator that lives in the header
// action slot during an appointment. Updates every 30 s so the relative
// time stays accurate; tap opens a popover with the absolute timestamp
// and a Save & Exit button for walking away.
function SavedPill({ lastSavedAt, open, onToggle, onClose, onSaveExit }) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const rel = relativeSaved(lastSavedAt);
  const abs = absoluteTime(lastSavedAt);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Saved ${rel} — tap for save options`}
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 8px', borderRadius: 999,
          background: 'var(--success-bg, var(--surface-2))',
          color: 'var(--success, var(--text-2))',
          border: '1px solid var(--success, var(--border))',
          fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em',
          cursor: 'pointer'
        }}>
        <Icon.check style={{ width: 11, height: 11 }} />
        <span>Saved · {rel}</span>
      </button>
      {open &&
      <>
          <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'transparent' }} />
          <div
            role="dialog"
            aria-label="Save options"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              minWidth: 220, zIndex: 91,
              background: 'var(--surface)', color: 'var(--text)',
              border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: '0 14px 32px rgba(20,15,5,0.18)',
              padding: 12
            }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.04 }}>
              Last saved
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
              {abs}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.4 }}>
              Every change is captured automatically. Step away anytime — your work is safe.
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => { onClose && onClose(); onSaveExit && onSaveExit(); }}
              style={{ marginTop: 10, height: 40, fontSize: 13, fontWeight: 700 }}>
              Save & Exit
            </button>
          </div>
        </>}
    </div>);
}

function relativeSaved(ts) {
  if (!ts) return 'just now';
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

function absoluteTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ─────── Recording control sheet ───────
// Bottom sheet for Pause / Resume / End Recording. Surfaced by tapping the
// REC pill in the header. Keeps the rep in control mid-appointment without
// forcing them all the way back to the appointment overview.
function RecordingControlSheet({ paused, elapsedSec, onClose, onPause, onResume, onEnd }) {
  return (
    <Sheet onClose={onClose} title={paused ? 'Recording paused' : 'Recording'} eyebrow={`Elapsed · ${fmtTime(elapsedSec)}`}>
      <div style={{ padding: '8px 16px 0' }}>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
          Captured for coaching review. Pause anytime — your work keeps saving.
        </p>
      </div>
      <div style={{ padding: '14px 16px 18px', display: 'grid', gap: 8 }}>
        {paused ?
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onResume} style={{ height: 46, fontSize: 14, fontWeight: 700 }}>
            Resume recording
          </button> :
        <button type="button" className="btn btn-lg btn-block" onClick={onPause} style={{ height: 46, fontSize: 14, fontWeight: 700 }}>
            Pause recording
          </button>}
        <button
          type="button"
          className="btn btn-lg btn-block"
          onClick={onEnd}
          style={{ height: 46, fontSize: 14, fontWeight: 700, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          End recording
        </button>
      </div>
    </Sheet>);
}

// ─────── Recording idle warning ───────
// Modal that surfaces after a long idle stretch (gated upstream in app.jsx)
// so a rep who walked away has a clear nudge to pause. Two options: Pause
// now, or Keep going (which resets the idle timer).
function RecordingIdleModal({ elapsedSec, onPause, onContinue }) {
  return (
    <Sheet onClose={onContinue} title="Still here?" eyebrow={`Recording · ${fmtTime(elapsedSec)}`}>
      <div style={{ padding: '8px 16px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
          You haven't tapped anything in a while. Recording is still going.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, margin: '8px 0 0' }}>
          If you've stepped away, pause Rilla so the coaching review stays useful. Otherwise keep going — we'll check in again later.
        </p>
      </div>
      <div style={{ padding: '14px 16px 18px', display: 'grid', gap: 8 }}>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onPause} style={{ height: 46, fontSize: 14, fontWeight: 700 }}>
          Pause recording
        </button>
        <button type="button" className="btn btn-lg btn-block" onClick={onContinue} style={{ height: 46, fontSize: 14, fontWeight: 700 }}>
          Keep recording
        </button>
      </div>
    </Sheet>);
}

// ─────── Recording hard cap ───────
// Modal at the 3-hour mark so a rep who forgot to end the session has a
// clear out. Same two-option shape as the idle modal.
function RecordingHardCapModal({ elapsedSec, onEnd, onKeepGoing }) {
  return (
    <Sheet onClose={onKeepGoing} title="Recording has been on for a while" eyebrow={`Elapsed · ${fmtTime(elapsedSec)}`}>
      <div style={{ padding: '8px 16px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
          Rilla has been recording for over 2 hours. Most appointments are wrapped well before this point.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, margin: '8px 0 0' }}>
          End the session if you're done, or keep going if you're still mid-appointment.
        </p>
      </div>
      <div style={{ padding: '14px 16px 18px', display: 'grid', gap: 8 }}>
        <button
          type="button"
          className="btn btn-lg btn-block"
          onClick={onEnd}
          style={{ height: 46, fontSize: 14, fontWeight: 700, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
          End recording
        </button>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={onKeepGoing} style={{ height: 46, fontSize: 14, fontWeight: 700 }}>
          Keep recording
        </button>
      </div>
    </Sheet>);
}

// Cross-cutting step-progress indicator (Brief Prompt L).
// Two rows stacked vertically:
//  1. CONNECT · SOLVE · COMMIT phase markers — brand-themed for the active
//     phase, success-tinted for passed phases, muted for upcoming.
//  2. A current-step pill (e.g. "SOLVE · Build · measurements") that is
//     tappable; tapping it opens a sheet listing every step in the current
//     phase with check marks for completed steps and the active one
//     highlighted. The handler comes in via onClick (wired to a state
//     toggle in app.jsx).
function PhaseProgress({ phaseInfo }) {
  const PHASES = ['CONNECT', 'SOLVE', 'COMMIT'];
  const currentIdx = PHASES.indexOf(phaseInfo.current);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '2px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {PHASES.map((p, i) => {
          const isCurrent = i === currentIdx;
          const passed = i < currentIdx;
          return (
            <React.Fragment key={p}>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: 0.08,
                color: isCurrent ? 'var(--brand-fg)' : passed ? 'var(--success)' : 'var(--text-4)',
                background: isCurrent ? 'var(--brand)' : passed ? 'var(--success-bg)' : 'transparent',
                padding: '2px 5px', borderRadius: 3, transition: 'all 200ms ease'
              }}>{p}</span>
              {i < 2 &&
              <span style={{ width: 6, height: 1, background: passed ? 'var(--success)' : 'var(--border-strong)' }} />
              }
            </React.Fragment>);
        })}
      </div>
    </div>);
}

// ─────── PhaseStepsSheet ───────
// Bottom sheet listing every step in the current phase, with check marks
// for completed steps and a brand highlight on the current one. Reps can
// tap a step to jump to it directly (forward or backward — same freedom
// as the back button). Brief Prompt L.
function PhaseStepsSheet({ phase, currentView, stepLabelByView, onSelect, onClose }) {
  // Phase → ordered list of views. Mirrors PHASE_OF + FLOW_VIEWS in app.jsx.
  const VIEWS_BY_PHASE = {
    CONNECT: ['apt', 'needs'],
    SOLVE: ['scope', 'inspect', 'build', 'pitch', 'proposal'],
    COMMIT: ['present', 'sign', 'deposit', 'welcome', 'handoff']
  };
  const FRIENDLY_LABEL = {
    apt: 'Appointment',
    needs: 'Needs Assessment',
    scope: 'Scope · structures',
    inspect: 'Inspect · capture',
    build: 'Build · measurements',
    pitch: 'Slide deck',
    proposal: 'Build proposal',
    present: 'Present to homeowner',
    sign: 'Approve & Sign',
    deposit: 'Collect deposit',
    welcome: 'Welcome package · sent',
    handoff: 'Production handoff'
  };
  const steps = (VIEWS_BY_PHASE[phase] || []).map((v) => ({
    id: v,
    label: stepLabelByView?.[v] || FRIENDLY_LABEL[v] || v
  }));
  const currentIdx = steps.findIndex((s) => s.id === currentView);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '70%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 18px 8px', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--brand)', textTransform: 'uppercase' }}>{phase}</div>
          <h3 style={{ margin: '4px 0 4px' }}>Steps in this phase</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45 }}>
            Tap a step to jump there. Steps before the current one are checked; steps after are upcoming.
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {steps.map((s, i) => {
            const isCurrent = i === currentIdx;
            const isPast = currentIdx > -1 && i < currentIdx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect && onSelect(s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: isCurrent ? 'var(--brand-soft)' : 'var(--surface-2)',
                  border: isCurrent ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                  cursor: 'pointer', textAlign: 'left'
                }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: isPast ? 'var(--success)' : (isCurrent ? 'var(--brand)' : 'var(--surface)'),
                  color: (isPast || isCurrent) ? '#fff' : 'var(--text-3)',
                  border: isPast || isCurrent ? 'none' : '1.5px solid var(--border-strong)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>
                  {isPast ? '✓' : (i + 1)}
                </span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: isCurrent ? 700 : 600, color: 'var(--text)' }}>
                  {s.label}
                </span>
                {isCurrent &&
                  <span className="pill brand" style={{ fontSize: 9, padding: '2px 7px', flexShrink: 0 }}>Current</span>}
              </button>);
          })}
        </div>
      </div>
    </>);
}

// ─────── Tool-Bag Drawer ───────
// Right-side drawer giving the rep one-tap access to customer + property
// context, an "area work" map (completed jobs nearby), and Google reviews.
// The whole drawer is portaled into .app-root so the backdrop covers the
// AppContextBar header (without the portal, position:absolute would be
// trapped inside the inner content wrapper that sits below the header).
function ToolbagDrawer({ open, tab, onTabChange, onClose, customer, setCustomer, onSaveExit }) {
  const TABS = [
    { id: 'customer', label: 'Customer' },
    { id: 'property', label: 'Property' },
    { id: 'area', label: 'Area Work' },
    { id: 'reviews', label: 'Reviews' }];
  // Inner sheet (edit field, filter) layers ON TOP of the side drawer.
  // The sheet provides its own backdrop that covers the drawer in place —
  // we don't slide the drawer off-screen (that motion is jarring).
  const [innerSheet, setInnerSheet] = React.useState(null);
  if (!open) return null;
  const content = (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-right" role="dialog" aria-label="Sales tool bag" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ color: 'var(--brand)', display: 'inline-flex' }}><Icon.layers /></span>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Tool Bag</div>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon.x />
          </button>
        </div>
        <div className="drawer-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`drawer-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => onTabChange(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="drawer-body" style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'customer' && <ToolbagCustomerTab customer={customer} setCustomer={setCustomer} requestSheet={setInnerSheet} />}
          {tab === 'property' && <ToolbagPropertyTab customer={customer} />}
          {tab === 'area' && <ToolbagAreaTab customer={customer} requestSheet={setInnerSheet} />}
          {tab === 'reviews' && <ToolbagReviewsTab />}
        </div>
        {onSaveExit &&
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 16px',
          background: 'var(--surface)'
        }}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => { onClose && onClose(); onSaveExit(); }}
              style={{ height: 44, fontSize: 14, fontWeight: 700 }}>
              Save & Exit appointment
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'center' }}>
              Recording pauses · pick up right where you left off
            </div>
          </div>}
      </div>
      {innerSheet}
    </>);
  const mount = (typeof document !== 'undefined' && document.querySelector('.app-root')) || null;
  return mount ? ReactDOM.createPortal(content, mount) : content;
}

// Customer fields — pencil-only edit affordance. Tapping the pencil pushes a
// modal Sheet up to the drawer's parent so the side drawer recedes and the
// sheet reads as the only foreground element (no drawer-in-drawer).
function ToolbagCustomerTab({ customer, setCustomer, requestSheet }) {
  const FIELDS = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'insurance', label: 'Insurance', type: 'text' }];
  const telDigits = (customer.phone || '').replace(/[^0-9+]/g, '');
  const openEdit = (f) => {
    requestSheet(
      <ToolbagFieldEditSheet
        key={f.key}
        label={f.label}
        type={f.type}
        initial={customer[f.key] || ''}
        onClose={() => requestSheet(null)}
        onSave={(v) => { setCustomer({ ...customer, [f.key]: v }); requestSheet(null); }} />);
  };
  return (
    <div className="drawer-section">
      <div className="card" style={{ padding: 0, marginBottom: 14 }}>
        {FIELDS.map((f, i) => (
          <div
            key={f.key}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              borderBottom: i === FIELDS.length - 1 ? 'none' : '1px solid var(--border)'
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customer[f.key] || '—'}
              </div>
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Edit ${f.label.toLowerCase()}`}
              onClick={() => openEdit(f)}
              style={{ width: 36, height: 36, flexShrink: 0 }}>
              <Icon.pen style={{ color: 'var(--text-3)' }} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <a
          href={`tel:${telDigits}`}
          style={{
            textDecoration: 'none', color: 'var(--text)',
            padding: '10px 6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', minHeight: 64,
            borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--border)'
          }}>
          <span style={{
            width: 34, height: 34, borderRadius: 999,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(20,15,5,0.10)'
          }}>
            <Icon.phone />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em' }}>Call</span>
        </a>
        <a
          href={`sms:${telDigits}`}
          style={{
            textDecoration: 'none', color: 'var(--text)',
            padding: '10px 6px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', minHeight: 64,
            borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--border)'
          }}>
          <span style={{
            width: 34, height: 34, borderRadius: 999,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(20,15,5,0.10)'
          }}>
            <Icon.sms />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em' }}>Text</span>
        </a>
      </div>
    </div>);
}

// Edit sheet mirroring CustomerEditDialog from screens-flow.jsx — explicit
// Save / Cancel so the rep is never wondering whether their edit committed.
function ToolbagFieldEditSheet({ label, type, initial, onClose, onSave }) {
  const [val, setVal] = React.useState(initial);
  const inputRef = React.useRef(null);
  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);
  return (
    <Sheet
      onClose={onClose}
      title={`Edit ${label.toLowerCase()}`}
      zIndex={90}
      footer={
        <>
          <button className="btn btn-lg btn-block" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => onSave(val)}>Save</button>
        </>
      }>
      <div style={{ padding: '12px 16px 0' }}>
        <label className="label" style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.04 }}>{label}</label>
        <input
          ref={inputRef}
          className="input"
          type={type}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          style={{ height: 44, fontSize: 15, marginTop: 6 }} />
      </div>
    </Sheet>);
}

// Property tab — sales-relevant subset including value, township, school
// district, taxes, and recent permits.
function ToolbagPropertyTab({ customer }) {
  const p = customer.property || {};
  const fmt$ = (n) => n ? '$' + n.toLocaleString() : '—';
  const SECTIONS = [
    {
      title: 'Valuation',
      rows: [
        { label: 'Estimated value', value: fmt$(p.estValue), strong: true },
        { label: 'Last sale', value: p.lastSale ? `${fmt$(p.lastSale.price)} · ${p.lastSale.year}` : '—' },
        { label: 'Annual taxes', value: fmt$(p.annualTax) }]
    },
    {
      title: 'Structure',
      rows: [
        { label: 'Sq ft (living)', value: p.sqft ? p.sqft.toLocaleString() : '—' },
        { label: 'Year built', value: p.yearBuilt || '—' },
        { label: 'Stories', value: p.stories || '—' },
        { label: 'Lot size', value: p.lotSizeAc ? `${p.lotSizeAc} ac` : '—' },
        { label: 'Roof slope', value: p.slope || '—' },
        { label: 'Roof age (est.)', value: p.roofAgeEst || '—' },
        { label: 'Roofing squares', value: p.roofingSq ? `${p.roofingSq} sq` : '—' }]
    },
    {
      title: 'Jurisdiction',
      rows: [
        { label: 'Township', value: p.township || '—' },
        { label: 'School district', value: p.schoolDistrict || '—' },
        { label: 'Permits (5 yr)', value: p.permitsLast5yr != null ? String(p.permitsLast5yr) : '—' },
        { label: 'Most recent', value: p.lastPermit || '—' }]
    }];
  return (
    <div className="drawer-section">
      {SECTIONS.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 0.1,
            color: 'var(--text-3)', textTransform: 'uppercase',
            margin: '0 0 6px 4px'
          }}>{sec.title}</div>
          <div className="card" style={{ padding: 0 }}>
            {sec.rows.map((r, i) => (
              <div
                key={r.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderBottom: i === sec.rows.length - 1 ? 'none' : '1px solid var(--border)'
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{r.label}</div>
                  <div style={{
                    fontSize: r.strong ? 16 : 13,
                    fontWeight: r.strong ? 700 : 500,
                    color: 'var(--text)', marginTop: 2,
                    letterSpacing: r.strong ? '-0.01em' : undefined
                  }}>{r.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>);
}

// Area Work — aerial photo of the neighborhood with monochrome pins for each
// completed job. Filters are four buttons (Scope, Mfr, Product, Color); each
// opens a bottom Sheet of searchable multi-select options with an active-
// count badge. The sheet is pushed up to the drawer's parent so the side
// drawer recedes and the filter sheet reads as the foreground element.
// ArcGIS World Imagery satellite tile centered on the customer's
// neighborhood (Cedar Park, TX · z=17, no API key required).
const AREA_AERIAL_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/17/53866/29918';

function ToolbagAreaTab({ customer, requestSheet }) {
  const jobs = window.AREA_JOBS || [];
  const VALUES_BY_CAT = {
    scope: Array.from(new Set(jobs.map((j) => j.scope))),
    mfr: Array.from(new Set(jobs.map((j) => j.mfr))),
    product: Array.from(new Set(jobs.map((j) => j.product))),
    color: Array.from(new Set(jobs.map((j) => j.color)))
  };
  const CAT_META = [
    { key: 'scope', label: 'Scope' },
    { key: 'mfr', label: 'Manufacturer' },
    { key: 'product', label: 'Product' },
    { key: 'color', label: 'Color' }];
  const [filters, setFilters] = React.useState({ scope: [], mfr: [], product: [], color: [] });
  const [openJob, setOpenJob] = React.useState(null);
  const matches = (j) =>
    (!filters.scope.length || filters.scope.includes(j.scope)) &&
    (!filters.mfr.length || filters.mfr.includes(j.mfr)) &&
    (!filters.product.length || filters.product.includes(j.product)) &&
    (!filters.color.length || filters.color.includes(j.color));
  const visibleJobs = jobs.filter(matches);
  const totalActive = filters.scope.length + filters.mfr.length + filters.product.length + filters.color.length;

  const openFilterSheet = (meta) => {
    const apply = (next) => {
      setFilters((f) => ({ ...f, [meta.key]: next }));
      requestSheet(null);
    };
    requestSheet(
      <FilterMultiSelectSheet
        key={meta.key}
        label={meta.label}
        values={VALUES_BY_CAT[meta.key]}
        selected={filters[meta.key]}
        onClose={() => requestSheet(null)}
        onApply={apply} />);
  };

  return (
    <div className="drawer-area-pane">
      <div className="drawer-area-head">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
          Recent work near this home
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          Aerial view of completed jobs — tap a pin for materials and colors.
        </div>
      </div>

      <div className="drawer-map drawer-map-flex" onClick={() => setOpenJob(null)}>
        <div className="drawer-map-aerial" style={{ backgroundImage: `url(${AREA_AERIAL_URL})` }} />
        <div className="drawer-map-shade" />

        {/* you-are-here marker at the customer's house (map center) */}
        <div className="drawer-you-here" style={{ left: '50%', top: '50%' }} title="You are here">
          <span />
        </div>

        {visibleJobs.map((j) => (
          <button
            key={j.id}
            type="button"
            className="drawer-pin"
            style={{ left: `${j.x}%`, top: `${j.y}%` }}
            onClick={(e) => { e.stopPropagation(); setOpenJob(j); }}
            aria-label={`${j.scope} job ${j.distance}`}>
            <svg viewBox="0 0 24 32" aria-hidden="true">
              <path d="M12 1 C 6 1 1.6 5.4 1.6 11 C 1.6 19 12 31 12 31 C 12 31 22.4 19 22.4 11 C 22.4 5.4 18 1 12 1 Z"
                    fill="var(--brand)" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="3.6" fill="#fff" />
            </svg>
          </button>
        ))}

        {openJob && (
          <div
            className="drawer-pin-popover"
            style={{
              left: `${openJob.x}%`,
              top: `${openJob.y}%`,
              // Pin anchors at its tip (y%), head extends 24px above. Place the
              // popover below the tip when near the top edge; otherwise float
              // above the head with a 12px gap.
              transform: `translate(${openJob.x > 70 ? '-100%' : (openJob.x < 25 ? '0' : '-50%')}, ${openJob.y < 25 ? 'calc(0% + 12px)' : 'calc(-100% - 36px)'})`
            }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{openJob.scope} · {openJob.distance}</div>
              <button type="button" className="icon-btn" style={{ width: 24, height: 24 }} aria-label="Close" onClick={() => setOpenJob(null)}>
                <Icon.x />
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
              The {openJob.lastInitial}. residence · Completed {openJob.month}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45 }}>
              <div><b>{openJob.mfr}</b> {openJob.product}</div>
              <div style={{ color: 'var(--text-3)' }}>Color: {openJob.color}</div>
            </div>
          </div>
        )}
      </div>

      <div className="drawer-area-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 8px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            <b style={{ color: 'var(--text)' }}>{visibleJobs.length}</b> of {jobs.length} jobs shown
          </div>
          {totalActive > 0 &&
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              style={{ height: 26, padding: '0 8px', fontSize: 11 }}
              onClick={() => setFilters({ scope: [], mfr: [], product: [], color: [] })}>
              Clear all filters
            </button>}
        </div>

        {/* Filter buttons — one per category, each opens a multi-select sheet */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CAT_META.map((meta) => {
            const count = filters[meta.key].length;
            return (
              <button
                key={meta.key}
                type="button"
                className={`drawer-filter-btn ${count > 0 ? 'active' : ''}`}
                onClick={() => openFilterSheet(meta)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <Icon.filter style={{ flexShrink: 0, color: count > 0 ? 'var(--brand)' : 'var(--text-3)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta.label}</span>
                </div>
                <span className={`drawer-filter-count ${count > 0 ? 'active' : ''}`}>{count > 0 ? count : 'All'}</span>
              </button>);
          })}
        </div>
      </div>
    </div>);
}

// Multi-select filter sheet. Visual pattern follows the Add-material picker
// in screens-imagecap.jsx — search input on top, options grouped inside a
// rounded card with borderTop separators. Selection indicator is anchored to
// the right of each row.
function FilterMultiSelectSheet({ label, values, selected, onClose, onApply }) {
  const [draft, setDraft] = React.useState(selected);
  const [q, setQ] = React.useState('');
  const filteredValues = q
    ? values.filter((v) => v.toLowerCase().includes(q.toLowerCase()))
    : values;
  const toggle = (v) => setDraft((d) => d.includes(v) ? d.filter((x) => x !== v) : [...d, v]);
  const inputRef = React.useRef(null);
  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);
  return (
    <Sheet
      onClose={onClose}
      title={`Filter by ${label.toLowerCase()}`}
      zIndex={90}
      flexBody
      maxHeight="78%"
      footer={
        <>
          <button className="btn btn-lg btn-block" onClick={() => { setDraft([]); }}>Clear</button>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => onApply(draft)}>
            Apply{draft.length ? ` · ${draft.length}` : ''}
          </button>
        </>
      }>
      <div style={{ padding: '6px 16px 10px', flexShrink: 0 }}>
        <input
          ref={inputRef}
          type="text"
          value={q}
          placeholder={`Search ${label.toLowerCase()}…`}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%', height: 38,
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '0 12px', fontSize: 14,
            background: 'var(--surface)', outline: 'none',
            boxSizing: 'border-box'
          }} />
      </div>
      <div style={{ overflow: 'auto', padding: '0 16px 16px', flex: 1 }}>
        {filteredValues.length === 0 &&
          <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            No matches for "{q}".
          </div>}
        {filteredValues.length > 0 &&
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredValues.map((v, i) => {
              const isChecked = draft.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggle(v)}
                  style={{
                    width: '100%', textAlign: 'left', background: 'transparent',
                    border: 0, borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                  <span style={{
                    flex: 1, minWidth: 0,
                    fontSize: 13, fontWeight: isChecked ? 700 : 600,
                    color: 'var(--text)', letterSpacing: '-0.005em'
                  }}>{v}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 22, height: 22, borderRadius: 999,
                      border: isChecked ? 'none' : '1.5px solid var(--border-strong)',
                      background: isChecked ? 'var(--brand)' : 'transparent',
                      color: 'var(--brand-fg, #fff)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                    {isChecked && <Icon.check style={{ width: 13, height: 13 }} />}
                  </span>
                </button>);
            })}
          </div>}
      </div>
    </Sheet>);
}

function ToolbagReviewsTab() {
  const reviews = window.GOOGLE_REVIEWS || [];
  // Display average is 4.9 across the live brand surface — anchored rather
  // than computed from the mock sample (which has a single 4-star outlier).
  const avg = '4.9';
  return (
    <div className="drawer-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4285F4', fontSize: 18 }}>G</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Google reviews</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{avg} avg · {reviews.length} recent</div>
        </div>
        <div style={{ display: 'flex', gap: 1, color: '#f59e0b' }}>
          {[1,2,3,4,5].map((i) => <Icon.star key={i} width="14" height="14" fill="currentColor" stroke="none" />)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {reviews.map((r) => (
          <div key={r.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{r.author}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{r.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 1, color: '#f59e0b', marginBottom: 6 }}>
              {[1,2,3,4,5].map((i) => (
                <Icon.star key={i} width="12" height="12" fill={i <= r.stars ? 'currentColor' : 'none'} stroke="currentColor" />
              ))}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-2)' }}>{r.snippet}</div>
          </div>
        ))}
      </div>
    </div>);
}

// ─────── Tab Bar ───────
function TabBar({ tab, setTab }) {
  const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Icon.home },
  { id: 'schedule', label: 'Schedule', icon: Icon.cal },
  { id: 'customers', label: 'Customers', icon: Icon.user },
  { id: 'settings', label: 'Settings', icon: Icon.cog }];

  return (
    <div className="tab-bar" style={{ height: "55px" }}>
      {tabs.map((t) => {
        const T = t.icon;
        return (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <T />
            <span>{t.label}</span>
          </button>);

      })}
    </div>);

}

// ─────── Toast layer ───────
function ToastLayer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-wrap">
      <div className="toast">
        <span className="ai-mark" />
        <span>{toasts[toasts.length - 1].msg}</span>
      </div>
    </div>);

}

// ─────── Sheet shell ───────
// Shared wrapper for bottom-sheet modals. Renders backdrop + sheet container +
// grabber + (optional) title + body + (optional) footer. Animations live in CSS
// (.sheet-backdrop fade, .sheet slide-in). Callers control body content.
//
// Migrate sheets onto this incrementally — the inline `<div className="sheet">`
// pattern still works for sheets not yet ported.
function Sheet({
  onClose,
  title,
  eyebrow,
  maxHeight,
  flexBody = false,
  footer,
  zIndex,
  containerStyle,
  children
}) {
  const sheetStyle = {
    ...maxHeight ? { maxHeight } : {},
    ...flexBody ? { display: 'flex', flexDirection: 'column' } : {},
    ...zIndex ? { zIndex } : {},
    ...containerStyle || {}
  };
  return (
    <>
      <div
        className="sheet-backdrop"
        onClick={onClose}
        style={zIndex ? { zIndex: zIndex - 1 } : undefined} />
      <div className="sheet" style={sheetStyle}>
        <div className="grabber" />
        {(eyebrow || title) &&
        <div style={{ padding: '0 16px 4px' }}>
            {eyebrow &&
          <div style={{
            fontSize: 9, fontWeight: 700, color: 'var(--brand)',
            letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 4
          }}>{eyebrow}</div>}
            {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          </div>}
        {children}
        {footer &&
        <div style={{ padding: '14px 16px 18px', display: 'flex', gap: 8 }}>
            {footer}
          </div>}
      </div>
    </>);

}

// ─────── Checkbox ───────
// Shared replacement for the 15+ inline checkbox visuals scattered across screens.
// Render the box only — caller controls the row layout (label, click target, gap).
// Wrap in a `.tap-target` button or onClick row to get the 44×44 touch zone.
// `size` defaults to 18; pass 16 for dense lists, 22 for finding-row toggles.
// Animates a subtle bounce on every state change (Pass 3, D5).
function Checkbox({ checked, size = 18 }) {
  const iconSize = Math.max(10, Math.round(size * 0.6));
  const radius = size >= 22 ? 6 : 4;
  const firstRender = React.useRef(true);
  const [bounceKey, setBounceKey] = React.useState(0);
  React.useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setBounceKey((k) => k + 1);
  }, [checked]);
  return (
    <span
      key={bounceKey}
      style={{
        width: size, height: size, borderRadius: radius,
        background: checked ? 'var(--brand)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--brand)' : 'var(--border-strong)'}`,
        color: 'var(--brand-fg)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 120ms ease, border-color 120ms ease',
        animation: bounceKey > 0 ? 'checkbox-bounce 180ms cubic-bezier(.2,.8,.2,1)' : 'none'
      }}>
      {checked && <Icon.check style={{ width: iconSize, height: iconSize }} />}
    </span>);

}

// ─────── Dashboard ───────
function Dashboard({ brand, rep, onAppointmentClick, onCommissionsClick, onFollowupClick }) {
  const next = APPOINTMENTS.find((a) => a.status === 'next') || APPOINTMENTS[0];
  const upcoming = APPOINTMENTS.slice(1, 6);
  const followups = typeof FOLLOWUPS !== 'undefined' && FOLLOWUPS || [];
  const overdueCount = followups.filter((f) => f.overdue).length;

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
      {/* Commissions + Gross Profit — paired half-width cards */}
      <div style={{ padding: '8px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Commissions — clickable */}
        <div
          className="card card-pad"
          onClick={onCommissionsClick}
          style={{ background: 'var(--brand)', color: 'var(--brand-fg)', border: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
          
          {/* Faint sparkline across full card */}
          <svg
            viewBox="0 0 320 90"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.22 }}
            aria-hidden="true">
            
            <defs>
              <linearGradient id="commGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 72 C7 70, 13 64, 20 64 S33 67, 40 68 S53 57, 60 56 S73 59, 80 60 S93 49, 100 48 S113 51, 120 52 S133 39, 140 38 S153 43, 160 44 S173 31, 180 30 S193 35, 200 36 S213 25, 220 24 S233 27, 240 28 S253 17, 260 16 S273 21, 280 22 S293 11, 300 10 S313 13, 320 14 L320 90 L0 90 Z" fill="url(#commGrad)" />
            <path d="M0 72 C7 70, 13 64, 20 64 S33 67, 40 68 S53 57, 60 56 S73 59, 80 60 S93 49, 100 48 S113 51, 120 52 S133 39, 140 38 S153 43, 160 44 S173 31, 180 30 S193 35, 200 36 S213 25, 220 24 S233 27, 240 28 S253 17, 260 16 S273 21, 280 22 S293 11, 300 10 S313 13, 320 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>Commissions · MTD</div>
            <div className="ticker-amount" style={{ marginTop: 2, fontSize: 24 }}>{fmt(METRICS.commissionsMTD)}</div>
            <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{METRICS.commissionsCount} payouts</div>
          </div>
        </div>

        {/* Gross Profit — MTD, with trend line. Matches metric-card surface treatment. */}
        <div
          className="metric-card"
          style={{ position: 'relative', overflow: 'hidden' }}>
          
          <svg
            viewBox="0 0 320 90"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'var(--success)' }}
            aria-hidden="true">
            
            <defs>
              <linearGradient id="gpGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 76 C10 74, 22 70, 34 68 S58 64, 70 60 S94 56, 106 52 S130 48, 142 44 S166 38, 178 36 S202 30, 214 26 S238 22, 250 18 S274 14, 286 12 S310 8, 320 6 L320 90 L0 90 Z" fill="url(#gpGrad)" />
            <path d="M0 76 C10 74, 22 70, 34 68 S58 64, 70 60 S94 56, 106 52 S130 48, 142 44 S166 38, 178 36 S202 30, 214 26 S238 22, 250 18 S274 14, 286 12 S310 8, 320 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div className="label-sm">GP · MTD</div>
            <div className="metric-val">{fmt(METRICS.grossProfitMTD)}</div>
            <div className="metric-delta up">▲ {pct(METRICS.grossProfitDelta)} · {pct(METRICS.grossProfitMargin, 1)} margin</div>
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ padding: '10px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="metric-card">
          <div className="label-sm">Close rate</div>
          <div className="metric-val">{pct(METRICS.closeRate)}</div>
          <div className="metric-delta up">▲ {pct(METRICS.closeRateDelta, 0)} vs Q1</div>
        </div>
        <div className="metric-card">
          <div className="label-sm">Sold · MTD</div>
          <div className="metric-val">{fmt(METRICS.mtd)}</div>
          <div className="metric-delta down">▼ {pct(Math.abs(METRICS.mtdDelta))}</div>
        </div>
        <div className="metric-card" style={{ gridColumn: '1 / -1', position: 'relative', overflow: 'hidden' }}>
          <svg
            viewBox="0 0 320 90"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', color: 'oklch(0.72 0.10 235)' }}
            aria-hidden="true">
            
            <defs>
              <linearGradient id="ytdg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 74 C7 71, 13 68, 20 68 S33 69, 40 70 S53 61, 60 60 S73 63, 80 64 S93 53, 100 52 S113 55, 120 56 S133 43, 140 42 S153 47, 160 48 S173 35, 180 34 S193 39, 200 40 S213 29, 220 28 S233 31, 240 32 S253 21, 260 20 S273 25, 280 26 S293 13, 300 12 S313 15, 320 16 L320 90 L0 90 Z" fill="url(#ytdg)" />
            <path d="M0 74 C7 71, 13 68, 20 68 S33 69, 40 70 S53 61, 60 60 S73 63, 80 64 S93 53, 100 52 S113 55, 120 56 S133 43, 140 42 S153 47, 160 48 S173 35, 180 34 S193 39, 200 40 S213 29, 220 28 S233 31, 240 32 S253 21, 260 20 S273 25, 280 26 S293 13, 300 12 S313 15, 320 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div className="label-sm">Sold · YTD</div>
            <div className="metric-val">{fmt(METRICS.ytd)}</div>
            <div className="metric-delta up">▲ {pct(METRICS.ytdDelta)} vs '25</div>
          </div>
        </div>
      </div>

      {/* Next appointment */}
      <div className="section-label">Up Next</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card card-pad" onClick={() => onAppointmentClick(next)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="pill brand"><Icon.clock /> {next.when.split(' · ')[1]}</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginTop: 8, letterSpacing: '-0.015em' }}>{next.customer}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon.pin /> {next.address}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="pill">{next.trade}</span>
                <span className="pill">{next.leadSource}</span>
                <span className="pill">Est. {next.est}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-label">Later Today & Tomorrow</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {upcoming.map((a) =>
        <div key={a.id} className="card" style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => onAppointmentClick(a)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 4, height: 32, borderRadius: 999, background: 'var(--brand)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{a.customer}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{a.when} · {a.trade}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {followups.length > 0 &&
      <>
          <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Follow-ups · {followups.length}{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}</span>
          </div>
          <div style={{ padding: '0 16px 26px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {followups.map((f) =>
          <div key={f.id} className="card" style={{ padding: 12, cursor: 'pointer' }} onClick={() => onFollowupClick && onFollowupClick(f)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 999, background: f.overdue ? 'var(--danger)' : 'var(--brand)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.customer}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      "{f.reason}" · originally {f.originalDate}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4}}>
                      Due {f.dueDate}
                    </div>
                  </div>
                  <Icon.arrow style={{ color: 'var(--text-3)' }} />
                </div>
              </div>
          )}
          </div>
        </>
      }
    </div>);

}

// ─────── Schedule ───────
function Schedule({ onAppointmentClick }) {
  // Build 15 days centered on today (today = 2026-04-28)
  const TODAY = new Date(2026, 3, 28); // April is month 3 (0-indexed)
  const days = useMemo(() => {
    const arr = [];
    for (let i = -7; i <= 7; i++) {
      const d = new Date(TODAY);
      d.setDate(TODAY.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayKey = ymd(TODAY);

  // Map appointments to YMD key from `date` field
  const apptsByDay = useMemo(() => {
    const m = {};
    APPOINTMENTS.forEach((a) => {
      const key = a.date.slice(0, 10);
      (m[key] = m[key] || []).push(a);
    });
    return m;
  }, []);

  const [selectedKey, setSelectedKey] = useState(todayKey);
  const stripRef = useRef(null);
  const todayCellRef = useRef(null);

  // Scroll strip so today is centered on mount
  useEffect(() => {
    if (todayCellRef.current && stripRef.current) {
      const cell = todayCellRef.current;
      const strip = stripRef.current;
      const target = cell.offsetLeft - (strip.clientWidth - cell.clientWidth) / 2;
      strip.scrollTo({ left: target, behavior: 'auto' });
    }
  }, []);

  const selected = days.find((d) => ymd(d) === selectedKey) || TODAY;
  const dayAppts = apptsByDay[selectedKey] || [];

  const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Horizontal date strip */}
      <div
        ref={stripRef}
        style={{
          display: 'flex',
          gap: 6,
          padding: '14px 16px 14px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x proximity',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0
        }}>
        {days.map((d) => {
          const key = ymd(d);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const count = (apptsByDay[key] || []).length;
          return (
            <button
              key={key}
              ref={isToday ? todayCellRef : null}
              onClick={() => setSelectedKey(key)}
              style={{
                flexShrink: 0,
                width: 52,
                height: 64,
                border: 'none',
                borderRadius: 12,
                background: isSelected ? 'var(--brand)' : 'transparent',
                color: isSelected ? 'var(--brand-fg)' : 'var(--text)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                position: 'relative',
                scrollSnapAlign: 'center',
                transition: 'background 120ms ease'
              }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.06, opacity: isSelected ? 0.85 : 0.55 }}>
                {DOW_SHORT[d.getDay()]}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: isSelected ? 'var(--brand-fg)' : isToday ? 'var(--brand)' : 'var(--text)'
              }}>
                {d.getDate()}
              </div>
              {count > 0 &&
              <div style={{
                position: 'absolute',
                bottom: 6,
                width: 4,
                height: 4,
                borderRadius: 999,
                background: isSelected ? 'var(--brand-fg)' : 'var(--brand)'
              }} />
              }
            </button>);

        })}
      </div>

      {/* Selected day label */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>
            {DOW_FULL[selected.getDay()]}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
            {MONTHS[selected.getMonth()]} {selected.getDate()}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
          {dayAppts.length} {dayAppts.length === 1 ? 'appointment' : 'appointments'}
        </div>
      </div>

      {/* Appointments */}
      <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dayAppts.length === 0 ?
        <div style={{ padding: '36px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)', border: '1px dashed var(--border)', borderRadius: 12 }}>
            Nothing scheduled.
          </div> :

        dayAppts.map((a) =>
        <div key={a.id} className="card" style={{ padding: 12, cursor: 'pointer' }} onClick={() => onAppointmentClick(a)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {a.when.split(' · ')[1].split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
                    {a.when.split(' · ')[1].split(' ')[1]}
                  </div>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{a.customer}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.address}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    <span className="pill">{a.trade}</span>
                    <span className="pill brand">{a.est}</span>
                  </div>
                </div>
              </div>
            </div>
        )
        }
      </div>
    </div>);

}

function MiniCalendar() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = [2, 2, 0, 2, 2, 0, 0];
  const today = 1;
  return (
    <div style={{ padding: '6px 16px 0' }}>
      <div className="card card-pad">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {days.map((d, i) =>
          <div key={d} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{d}</div>
              <div style={{
              marginTop: 4, height: 36, borderRadius: 8,
              background: i === today ? 'var(--brand)' : 'var(--surface-2)',
              color: i === today ? 'var(--brand-fg)' : 'var(--text)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700
            }}>
                <div style={{ fontSize: 13 }}>{27 + i}</div>
                {counts[i] > 0 &&
              <div style={{ fontSize: 9, opacity: 0.8 }}>{counts[i]} appt</div>
              }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// ─────── Settings ───────
function Settings({ brand, theme, setTheme, rep, onLogout }) {
  const brandObj = BRANDS[brand];
  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
      <div className="section-label">Your brand</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: brand === 'skywalker' ? 'oklch(0.72 0.14 230)' : 'oklch(0.52 0.21 18)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em'
            }}>{brandObj.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{brandObj.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{brandObj.tagline} · {brandObj.license}</div>
            </div>
            <span className="pill" style={{ fontSize: 10 }}>Assigned</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>
            Brand follows the appointment. For multi-brand reps, individual appointments may show under a different brand. Talk to your manager if this is wrong.
          </div>
        </div>
      </div>

      <div className="section-label">Appearance</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Dark mode</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Comfortable viewing in low light</div>
          </div>
          <div className={`switch ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
        </div>
      </div>

      <div className="section-label">Account · {rep.name}</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Profile</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{rep.email}</div>
          </div>
          <Icon.arrow style={{ color: 'var(--text-3)' }} />
        </div>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Role</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{rep.role === 'senior' ? 'Senior Rep' : 'General Rep'} · Pitch deck reorder {rep.role === 'senior' ? 'unlocked' : 'locked'}</div>
          </div>
          <span className="pill" style={{ fontSize: 10 }}>{rep.role === 'senior' ? 'Senior' : 'General'}</span>
        </div>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Recording defaults</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Auto-start when appointment opens · ON</div>
          </div>
          <div className="switch on" />
        </div>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Pricing Engine</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Connected · last sync 2m ago</div>
          </div>
          <span className="pill success"><Icon.check /> LIVE</span>
        </div>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Device</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)'}}>{rep.deviceId} · iPhone 15 Pro</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <button className="btn btn-block" onClick={onLogout}>Sign out</button>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-4)', marginTop: 12}}>
          IHS Selling Way · v3.42 · build 2026.04.28
        </div>
      </div>
    </div>);

}

// ─────── Commissions detail ───────
function Commissions({ onBack }) {
  const paid = COMMISSIONS.filter((c) => c.status === 'paid');
  const pending = COMMISSIONS.filter((c) => c.status === 'pending');
  const totalPaid = paid.reduce((s, c) => s + c.sold * c.rate, 0);
  const totalPending = pending.reduce((s, c) => s + c.sold * c.rate, 0);

  const Row = ({ c }) =>
  <div className="card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>{c.customer}</div>
            {c.status === 'pending' && <span className="pill" style={{ fontSize: 10 }}>Pending</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{c.job}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 6 }}>
            Signed {c.date} · {pct(c.rate, 0)} of {fmt(c.sold)} · pays {c.payDate}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            {fmt(c.sold * c.rate)}
          </div>
        </div>
      </div>
    </div>;


  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
      {/* Summary card */}
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card card-pad" style={{ background: 'var(--brand)', color: 'var(--brand-fg)', border: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>Earned · MTD</div>
          <div className="ticker-amount" style={{ marginTop: 2 }}>{fmt(METRICS.commissionsMTD)}</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 11, opacity: 0.9 }}>
            <div>
              <div style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.04 }}>YTD</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{fmt(METRICS.commissionsYTD)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.04 }}>Pending</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{fmt(totalPending)}</div>
            </div>
            <div>
              <div style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.04 }}>Payouts</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{METRICS.commissionsCount}</div>
            </div>
          </div>
        </div>
      </div>

      {pending.length > 0 && <>
        <div className="section-label">Pending · {fmt(totalPending)}</div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pending.map((c) => <Row key={c.id} c={c} />)}
        </div>
      </>}

      <div className="section-label">Paid · {fmt(totalPaid)}</div>
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {paid.map((c) => <Row key={c.id} c={c} />)}
      </div>
    </div>);

}

// ─────── Customers (DST-PREP-04) ───────
function Customers({ onAppointmentClick, onOpenCustomer }) {
  const customers = typeof CUSTOMERS !== 'undefined' && CUSTOMERS || [];
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const FILTERS = [
  { id: 'all', label: 'All', count: customers.length },
  { id: 'active', label: 'Active', count: customers.filter((c) => c.status === 'active' || c.status === 'signed').length },
  { id: 'followup', label: 'Follow-ups', count: customers.filter((c) => c.status === 'followup').length },
  { id: 'insurance', label: 'Insurance', count: customers.filter((c) => c.status === 'insurance').length },
  { id: 'past', label: 'Past', count: customers.filter((c) => c.status === 'past').length }];


  const q = query.trim().toLowerCase();
  const visible = customers.filter((c) => {
    if (filter !== 'all') {
      if (filter === 'active' && c.status !== 'active' && c.status !== 'signed') return false;
      if (filter !== 'active' && c.status !== filter) return false;
    }
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.flags || []).some((f) => f.toLowerCase().includes(q))
    );
  });

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
      {/* Filter chips on the left, search field on the right — right edge
          aligns with the customer-card right edge (16px screen padding). */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', flex: 1, minWidth: 0 }}>
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 36, padding: '0 14px',
                  borderRadius: 999,
                  background: active ? 'var(--brand-soft)' : 'var(--surface)',
                  color: active ? 'var(--brand-soft-fg)' : 'var(--text-2)',
                  fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  border: active ? '1px solid var(--brand-soft)' : '1px solid var(--border)'
                }}>
                {f.label}
                <span style={{ fontSize: 11, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{f.count}</span>
              </button>);

          })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 12px',
          borderRadius: 999,
          background: 'var(--surface)', border: '1px solid var(--border)',
          flexShrink: 0, width: 200
        }}>
          <Icon.search style={{ color: 'var(--text-3)', flexShrink: 0, width: 14, height: 14 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers"
            style={{
              flex: 1, minWidth: 0,
              border: 0, outline: 'none', background: 'transparent',
              fontSize: 12, fontFamily: 'inherit', color: 'var(--text)',
              padding: 0
            }} />
          {query &&
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{ border: 0, background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1 }}>
            ×
          </button>}
        </div>
      </div>

      {visible.length === 0 &&
      <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          No customers match this view.
        </div>
      }

      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((c) =>
        <div key={c.id} className="card card-pad" style={{ cursor: 'pointer' }} onClick={() => onOpenCustomer && onOpenCustomer(c)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div className="avatar">
                {c.name.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{c.name}</div>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {c.lastInteraction.date}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.address}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <CustomerStatusPill status={c.status} />
                  {c.flags.map((flag) =>
                <span key={flag} className="pill" style={{ fontSize: 10 }}>{flag}</span>
                )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 6 }}>
                  {c.lastInteraction.type}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

}

function CustomerStatusPill({ status }) {
  const map = {
    active: { label: 'Active deal', className: 'brand' },
    signed: { label: 'Signed', className: 'success' },
    followup: { label: 'Follow-up', className: 'warn' },
    insurance: { label: 'Insurance', className: 'warn' },
    past: { label: 'Past customer', className: '' }
  };
  const m = map[status] || { label: status };
  return <span className={`pill ${m.className || ''}`} style={{ fontSize: 10 }}>{m.label}</span>;
}

// ─────── Customer Detail (DST-PREP-04) ───────
function CustomerDetail({ customer, onBack, onScheduleFollowup, onAppointmentClick }) {
  if (!customer) return null;
  const totalSpend = customer.deals.filter((d) => d.amount).reduce((s, d) => s + d.amount, 0);
  const initials = customer.name.split(/[\s&]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '?';
  const telHref = customer.phone ? `tel:${customer.phone.replace(/[^0-9+]/g, '')}` : undefined;
  const smsHref = customer.phone ? `sms:${customer.phone.replace(/[^0-9+]/g, '')}` : undefined;
  const mailHref = customer.email ? `mailto:${customer.email}` : undefined;
  const mapsHref = customer.address ? `https://maps.google.com/?q=${encodeURIComponent(customer.address)}` : undefined;
  const QA = window.QuickAction;
  const HC = window.HeroChip;

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Hero card — brand-soft gradient with avatar, name, address, status
          pills, and a 4-up action grid. Mirrors AppointmentHero so the
          two screens share the same "customer identity" vocabulary. */}
      <div style={{
        margin: '14px 16px 4px',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--brand-soft) 0%, var(--surface) 70%)'
      }}>
        <div style={{ padding: '16px 16px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
            boxShadow: '0 10px 22px rgba(20,15,5,0.14)'
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text)' }}>
              {customer.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
              <Icon.pin style={{ width: 12, height: 12, color: 'var(--text-3)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.address}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              <CustomerStatusPill status={customer.status} />
              {customer.flags.map((flag) =>
              <span key={flag} className="pill" style={{ fontSize: 10 }}>{flag}</span>
              )}
            </div>
          </div>
        </div>
        {/* 4-up action grid — same vocabulary as AppointmentHero. */}
        {QA &&
        <div style={{
          padding: '0 16px 14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8
        }}>
          <QA href={telHref} label="Call" Glyph={Icon.phone} />
          <QA href={smsHref} label="Text" Glyph={Icon.sms} />
          <QA href={mapsHref} label="Directions" Glyph={Icon.directions || Icon.pin} target="_blank" />
          <QA href={mailHref} label="Email" Glyph={Icon.mail} />
        </div>}
      </div>

      {/* Deals & estimates */}
      {/* Deals — non-interactive cards (display-only). */}
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Deals · {customer.deals.length}</span>
        {totalSpend > 0 &&
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
            Lifetime · {fmt(totalSpend)}
          </span>
        }
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {customer.deals.map((d) =>
        <div key={d.id} className="card card-pad">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{d.type}</div>
                  <DealStatusPill status={d.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{d.trade}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{d.date}</div>
              </div>
              {d.amount &&
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {fmt(d.amount)}
                </div>
            }
            </div>
          </div>
        )}
      </div>

      {/* Appointments — tap a row to jump into that appointment. Pulled
          from the global APPOINTMENTS list by customer name. */}
      {(() => {
        const custAppts = typeof APPOINTMENTS !== 'undefined' ?
          APPOINTMENTS.filter((a) => a.customer === customer.name) :
          [];
        if (custAppts.length === 0) return null;
        return (
          <>
            <div className="section-label">Appointments · {custAppts.length}</div>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {custAppts.map((a) =>
              <div
                key={a.id}
                className="card card-pad"
                style={{ cursor: 'pointer' }}
                onClick={() => onAppointmentClick && onAppointmentClick(a)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{a.when}</div>
                      <span className="pill">{a.trade}</span>
                    </div>
                    {a.leadSource &&
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{a.leadSource}</div>}
                    {a.est &&
                    <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Est. {a.est}</div>}
                  </div>
                </div>
              </div>
              )}
            </div>
          </>);
      })()}

      {/* Quick actions — primary action is the recommended next move. */}
      <div className="section-label">Stay in touch</div>
      <div style={{ padding: '0 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-primary btn-block" onClick={onScheduleFollowup}>
          <Icon.cal /> Schedule follow-up
        </button>
        <button className="btn btn-block btn-ghost">
          <Icon.mail /> Send referral request
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', padding: '8px 12px', lineHeight: 1.5 }}>
          New appointments are created in the CRM. The DST receives them via the appointment sync.
        </div>
      </div>
    </div>);

}

// ─────── Follow-up Detail (DST-FU) ───────
function FollowupDetail({ followup, brand, onBack, onScheduleRepresentation, onSendRehash }) {
  const [reason, setReason] = useState(followup?.reason || '');
  const [method, setMethod] = useState('call'); // call | sms | re-present | in-person
  const [date, setDate] = useState(followup?.dueDate || '');
  const [notes, setNotes] = useState(followup?.notes || '');
  if (!followup) return null;

  const initials = (followup.customer || '?').split(/[\s&]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Hero card — brand-soft gradient with the follow-up eyebrow,
          customer name, address, and overdue banner. Same vocabulary as
          AppointmentHero / CustomerDetail hero so the screens read as a
          family. */}
      <div style={{
        margin: '14px 16px 4px',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--brand-soft) 0%, var(--surface) 70%)'
      }}>
        <div style={{ padding: '16px 16px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
            boxShadow: '0 10px 22px rgba(20,15,5,0.14)'
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--brand-soft-fg)', letterSpacing: 0.1, textTransform: 'uppercase' }}>
              Follow-up · DST-FU
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text)', marginTop: 2 }}>
              {followup.customer}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
              <Icon.pin style={{ width: 12, height: 12, color: 'var(--text-3)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{followup.address}</span>
            </div>
          </div>
        </div>
        {followup.overdue &&
        <div style={{ margin: '0 16px 14px', padding: '10px 12px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 8, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.alert style={{ flexShrink: 0 }} />
          Overdue — was due {followup.dueDate}
        </div>}
      </div>

      {/* Original appointment card */}
      <div className="section-label">Original appointment · {followup.originalDate}</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{followup.trade} · est {followup.est}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Last proposal: <strong>{followup.priorTier}</strong></div>
            </div>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>Open record →</button>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 6 }}>
              Objections from prior visit
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {followup.objections.map((o, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                  <span style={{ flexShrink: 0, marginTop: 6, width: 4, height: 4, borderRadius: 999, background: 'var(--warn)' }} />
                  {o}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="pill" style={{ fontSize: 10 }}><Icon.cam /> Findings preserved</span>
            <span className="pill" style={{ fontSize: 10 }}><Icon.list /> Proposals shown</span>
            <span className="pill" style={{ fontSize: 10 }}><Icon.shield /> Walk-through · n/a</span>
          </div>
        </div>
      </div>

      {/* Follow-up plan */}
      <div className="section-label">Follow-up plan</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Reason</label>
            <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
              {FOLLOWUP_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Date & time</label>
            <input className="input" placeholder="Pick a date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {[
              { id: 'call', label: 'Call', Glyph: Icon.phone },
              { id: 'sms', label: 'SMS', Glyph: Icon.sms },
              { id: 're-present', label: 'Re-present', Glyph: Icon.cam },
              { id: 'in-person', label: 'In person', Glyph: Icon.user }].
              map((m) =>
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className="btn btn-sm"
                style={{
                  flexDirection: 'column', height: 'auto', padding: '10px 6px', gap: 4,
                  background: method === m.id ? 'var(--brand)' : 'var(--surface)',
                  color: method === m.id ? 'var(--brand-fg)' : 'var(--text)',
                  border: method === m.id ? 'none' : '1px solid var(--border)'
                }}>
                  <m.Glyph />
                  <span style={{ fontSize: 10 }}>{m.label}</span>
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="label" style={{ fontSize: 10 }}>Notes (rep-only)</label>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', minHeight: 80, fontFamily: 'inherit', resize: 'vertical', padding: 10 }} />
          </div>
        </div>
      </div>

      {/* Schedule actions */}
      <div className="section-label">Actions</div>
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onScheduleRepresentation}>
          <Icon.cal /> Schedule re-presentation appointment
        </button>
        <button className="btn btn-block" onClick={onSendRehash}>
          <Icon.mail /> Send rehash communication
        </button>
        <div style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', padding: '8px 12px', lineHeight: 1.5 }}>
          Re-presentations inherit prior findings, photos, and proposals automatically. Rehash close rate is tracked in your dashboard metrics.
        </div>
      </div>
    </div>);

}

function DealStatusPill({ status }) {
  const map = {
    'in-progress': { label: 'In progress', className: 'brand' },
    'signed': { label: 'Signed', className: 'success' },
    'installed': { label: 'Installed', className: 'success' },
    'open': { label: 'Open', className: 'warn' },
    'lead': { label: 'Lead', className: '' },
    'completed': { label: 'Completed', className: '' }
  };
  const m = map[status] || { label: status };
  return <span className={`pill ${m.className || ''}`} style={{ fontSize: 9, fontWeight: 700 }}>{m.label}</span>;
}

// ─────── Global Search ───────
function GlobalSearch({ onClose, onAppointmentClick, onOpenCustomer }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    return () => {clearTimeout(t);window.removeEventListener('keydown', onKey);};
  }, [onClose]);

  const q = query.trim().toLowerCase();

  // Build customer index (deduped by name)
  const customerIndex = useMemo(() => {
    const m = new Map();
    APPOINTMENTS.forEach((a) => {
      const key = a.customer;
      if (!m.has(key)) {
        m.set(key, {
          name: a.customer,
          address: a.address,
          appointments: []
        });
      }
      m.get(key).appointments.push(a);
    });
    return Array.from(m.values());
  }, []);

  const matchedCustomers = q ?
  customerIndex.filter((c) =>
  c.name.toLowerCase().includes(q) ||
  c.address.toLowerCase().includes(q)
  ) :
  [];

  const matchedAppointments = q ?
  APPOINTMENTS.filter((a) =>
  a.customer.toLowerCase().includes(q) ||
  a.address.toLowerCase().includes(q) ||
  a.trade.toLowerCase().includes(q) ||
  a.when.toLowerCase().includes(q) ||
  (a.leadSource || '').toLowerCase().includes(q) ||
  (a.notes || '').toLowerCase().includes(q)
  ) :
  [];

  const totalResults = matchedCustomers.length + matchedAppointments.length;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'var(--bg)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Search field row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0
      }}>
        <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', flex: 1 }}>
          <Icon.search style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers and appointments…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              fontFamily: 'inherit',
              color: 'var(--text)',
              padding: 0,
              minWidth: 0
            }} />

          {query &&
          <button
            onClick={() => setQuery('')}
            aria-label="Clear"
            style={{ border: 'none', background: 'transparent', color: 'var(--text-3)', fontSize: 11, cursor: 'pointer', padding: 4 }}>
              Clear
            </button>
          }
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>Cancel</button>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {!q &&
        <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            Search across customers and appointments.<br />
            Try a name, address, trade, or date.
          </div>
        }

        {q && totalResults === 0 &&
        <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            No results for “{query}”.
          </div>
        }

        {matchedCustomers.length > 0 &&
        <>
            <div className="section-label">Customers · {matchedCustomers.length}</div>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matchedCustomers.map((c) => {
              const lead = c.appointments[0];
              // Prefer routing to the customer detail when we have a full
              // CUSTOMERS record by name; fall back to opening the next
              // appointment if it's a search-only contact.
              const fullCust = typeof CUSTOMERS !== 'undefined' ?
                CUSTOMERS.find((x) => x.name === c.name) :
                null;
              const handleClick = () => {
                if (fullCust && onOpenCustomer) onOpenCustomer(fullCust);
                else onAppointmentClick(lead);
                onClose();
              };
              return (
                <div
                  key={c.name}
                  className="card"
                  style={{ padding: 12, cursor: 'pointer' }}
                  onClick={handleClick}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                        {c.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.address}</div>
                      </div>
                      <span className="pill">{c.appointments.length} appt{c.appointments.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>);

            })}
            </div>
          </>
        }

        {matchedAppointments.length > 0 &&
        <>
            <div className="section-label">Appointments · {matchedAppointments.length}</div>
            <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matchedAppointments.map((a) =>
            <div
              key={a.id}
              className="card"
              style={{ padding: 12, cursor: 'pointer' }}
              onClick={() => {onAppointmentClick(a);onClose();}}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
                        {a.when.split(' · ')[0]}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {a.when.split(' · ')[1]?.replace(' ', '\u00a0')}
                      </div>
                    </div>
                    <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.customer}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.address}</div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <span className="pill">{a.trade}</span>
                        <span className="pill brand">{a.est}</span>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </>
        }
      </div>
    </div>);

}

Object.assign(window, {
  fmt, fmt0, pct, fmtTime, tierTotal,
  AppStatusBar: AppContextBar, AppContextBar, OSStatusBar, TabBar, ToastLayer,
  PhaseTabBar, PhaseStepsSheet, ToolbagDrawer,
  Sheet, Checkbox,
  Dashboard, Schedule, Settings, Customers, CustomerDetail, FollowupDetail,
  Commissions, GlobalSearch,
  RecordingIdleModal, RecordingHardCapModal,
  useToasts
});