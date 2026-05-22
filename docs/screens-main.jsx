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
  const activeIdx = Math.max(0, tabs.findIndex((t) => t.id === activeId));
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 4,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '6px 12px 8px',
      display: 'flex', alignItems: 'center', gap: 0
    }}>
      {tabs.map((t, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        const isCompletedAhead = i > activeIdx && i <= farthestIdx;
        const isUnreached = i > farthestIdx;
        const canTap = isPast || isCompletedAhead;
        return (
          <React.Fragment key={t.id}>
            <button
              type="button"
              onClick={canTap ? () => onSelect(t.id) : undefined}
              disabled={!canTap}
              aria-current={isActive ? 'step' : undefined}
              style={{
                flex: '0 1 auto',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '4px 6px',
                background: 'transparent', border: 0,
                color: isActive ? 'var(--text)' : isUnreached ? 'var(--text-4)' : 'var(--text-2)',
                fontSize: 11, fontWeight: isActive ? 700 : 600, letterSpacing: '-0.01em',
                cursor: canTap ? 'pointer' : 'default',
                whiteSpace: 'nowrap'
              }}>
              <span style={{
                width: 18, height: 18, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'var(--brand)' : isPast ? 'var(--brand)' : 'transparent',
                color: (isActive || isPast) ? 'var(--brand-fg)' : isUnreached ? 'var(--text-4)' : 'var(--text-2)',
                border: (isActive || isPast) ? 'none' : `1px solid ${isUnreached ? 'var(--border)' : 'var(--border-strong)'}`,
                fontSize: 10, fontWeight: 700, lineHeight: 1, flexShrink: 0
              }}>{isPast ? '✓' : i + 1}</span>
              {t.label}
            </button>
            {i < tabs.length - 1 &&
              <span style={{
                flex: '1 1 auto',
                height: 1,
                background: i < farthestIdx ? 'var(--brand)' : 'var(--border)',
                minWidth: 8
              }} />
            }
          </React.Fragment>);
      })}
    </div>);

}

// ─────── Brand chip + recording row ───────
function AppContextBar({ title, recording, recordingTime, sync = null, action = null, leading = null, phaseInfo = null, structureSwitcher = null }) {
  // Sync pill removed per Craig — redundant signal at top of every screen.
  const syncPill = null;


  const recPill = recording &&
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
      <span className="rec-dot" />
      <span style={{ fontSize: 11 }}>REC · {fmtTime(recordingTime)}</span>
    </div>;


  // Two-row layout when we're inside the in-appointment flow.
  // Row 1: back/title + CONNECT·SOLVE·COMMIT + REC/action.
  // Row 2: structure picker (left-aligned) — always rendered when there's
  //        an active structure, even for single-structure jobs.
  if (phaseInfo) {
    return (
      <div className="app-status" style={{ flexDirection: 'column', alignItems: 'stretch', padding: '6px 14px 6px', minHeight: 64, gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            {leading}
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <PhaseProgress phaseInfo={phaseInfo} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {recPill}
            {syncPill}
            {action}
          </div>
        </div>
        {structureSwitcher &&
        <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
          {structureSwitcher}
        </div>}
      </div>);

  }

  return (
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
    </div>);

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
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
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
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{rep.deviceId} · iPhone 15 Pro</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        <button className="btn btn-block" onClick={onLogout}>Sign out</button>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-4)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
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
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
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

  const FILTERS = [
  { id: 'all', label: 'All', count: customers.length },
  { id: 'active', label: 'Active', count: customers.filter((c) => c.status === 'active' || c.status === 'signed').length },
  { id: 'followup', label: 'Follow-ups', count: customers.filter((c) => c.status === 'followup').length },
  { id: 'insurance', label: 'Insurance', count: customers.filter((c) => c.status === 'insurance').length },
  { id: 'past', label: 'Past', count: customers.filter((c) => c.status === 'past').length }];


  const visible = customers.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'active') return c.status === 'active' || c.status === 'signed';
    return c.status === filter;
  });

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto' }}>
      {/* Filter chips row */}
      <div style={{ padding: '12px 16px 8px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 28, padding: '0 11px',
                border: 0, borderRadius: 999,
                background: active ? 'var(--brand)' : 'var(--surface)',
                color: active ? 'var(--brand-fg)' : 'var(--text-2)',
                fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em',
                cursor: 'pointer', boxShadow: active ? 'none' : 'var(--shadow-sm)',
                border: active ? 'none' : '1px solid var(--border)'
              }}>
              {f.label}
              <span style={{ fontSize: 10, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{f.count}</span>
            </button>);

        })}
      </div>

      {visible.length === 0 &&
      <div style={{ padding: '40px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          No customers in this view.
        </div>
      }

      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((c) =>
        <div key={c.id} className="card" style={{ padding: 12, cursor: 'pointer' }} onClick={() => onOpenCustomer && onOpenCustomer(c)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, borderRadius: 8 }}>
                {c.name.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.name}</div>
                  <span style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {c.lastInteraction.date}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.address}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  <CustomerStatusPill status={c.status} />
                  {c.flags.map((flag) =>
                <span key={flag} className="pill" style={{ fontSize: 10 }}>{flag}</span>
                )}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 6, fontStyle: 'italic' }}>
                  {c.lastInteraction.type}
                </div>
              </div>
              <Icon.arrow style={{ color: 'var(--text-3)', marginTop: 8 }} />
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

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0' }}>
        <div className="avatar" style={{ width: 48, height: 48, fontSize: 16, borderRadius: 10, marginBottom: 10 }}>
          {customer.name.split(' ').map((s) => s[0]).filter(Boolean).slice(0, 2).join('')}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{customer.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.pin /> {customer.address}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          <CustomerStatusPill status={customer.status} />
          {customer.flags.map((flag) =>
          <span key={flag} className="pill" style={{ fontSize: 10 }}>{flag}</span>
          )}
        </div>
      </div>

      {/* Contact card */}
      <div className="section-label">Contact</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.mail style={{ color: 'var(--text-3)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Email</div>
              <div style={{ fontSize: 13 }}>{customer.email}</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.mic style={{ color: 'var(--text-3)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Phone</div>
              <div style={{ fontSize: 13 }}>{customer.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deals & estimates */}
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Deals & estimates · {customer.deals.length}</span>
        {totalSpend > 0 &&
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
            Lifetime · {fmt(totalSpend)}
          </span>
        }
      </div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {customer.deals.map((d) =>
        <div key={d.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.type}</div>
                  <DealStatusPill status={d.status} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{d.trade}</div>
                <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{d.date}</div>
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

      {/* Quick actions */}
      <div className="section-label">Actions</div>
      <div style={{ padding: '0 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-block" onClick={onScheduleFollowup}>
          <Icon.cal /> Schedule follow-up
        </button>
        <button className="btn btn-block btn-ghost" style={{ fontSize: 12 }}>
          <Icon.mail /> Send referral request
        </button>
        <div style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', padding: '8px 12px', lineHeight: 1.5 }}>
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

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.1, textTransform: 'uppercase' }}>
          Follow-up · DST-FU
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>{followup.customer}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.pin /> {followup.address}
        </div>
        {followup.overdue &&
        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
            <Icon.alert style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Overdue · was due {followup.dueDate}
          </div>
        }
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
function GlobalSearch({ onClose, onAppointmentClick }) {
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
              return (
                <div
                  key={c.name}
                  className="card"
                  style={{ padding: 12, cursor: 'pointer' }}
                  onClick={() => {onAppointmentClick(lead);onClose();}}>
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
  PhaseTabBar, PhaseStepsSheet,
  Sheet, Checkbox,
  Dashboard, Schedule, Settings, Customers, CustomerDetail, FollowupDetail,
  Commissions, GlobalSearch,
  useToasts
});