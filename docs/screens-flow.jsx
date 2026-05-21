/* global React, Icon, INSPECTION_CATEGORIES, SEED_INSPECTION_ITEMS, CUSTOMER, REPS, fmt, fmt0, fmtTime, tierTotal, TIERS, LINE_ITEMS */

const { useState, useEffect, useRef, useMemo, useCallback } = window.React ? window : window;

// ─────── Login ───────
function Login({ brand, theme = 'light', device = 'phone', rep, onLogin }) {
  const [email, setEmail] = useState(rep?.email || 'cole.j@infinityhomeservices.com');
  const [pw, setPw] = useState('••••••••');
  return (
    <div className="app-root" style={{ position: 'relative' }} data-theme={theme} data-brand={brand}>
      <window.OSStatusBar device={device} />
      <div className="login-bg" />
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.04em',
          marginBottom: 18, boxShadow: 'var(--shadow)'
        }}>{window.BRANDS[brand].initials}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>{window.BRANDS[brand].name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, marginBottom: 24 }}>Sign in to continue</div>

        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ height: 12 }} />
        <label className="label">Password</label>
        <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <div style={{ height: 18 }} />
        <button className="btn btn-primary btn-lg btn-block" onClick={onLogin}>Sign in</button>
        <div style={{ height: 8 }} />
        <button className="btn btn-block btn-ghost" style={{ fontSize: 12 }}>Single sign-on (Microsoft)</button>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', padding: '14px 0 22px', fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>
        IHS Selling Way · v3.42
      </div>
      <div className="home-indicator" aria-hidden="true" />
    </div>);

}

// ─────── Appointment Detail ───────
// Tap-to-edit customer row — shows value as readonly text; tapping opens an edit
// modal (bottom drawer on phone, centered modal on tablet) so editing is intentional.
function CustomerRow({ label, value, onChange, type = 'text', tablet = false, last = false }) {
  const [editing, setEditing] = useState(false);
  return (
    <>
      <button
        onClick={() => setEditing(true)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '12px 14px',
          borderBottom: last ? 'none' : '1px solid var(--border)',
          background: 'transparent', border: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer'
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
        </div>
        <Icon.pen style={{ color: 'var(--text-4)', flexShrink: 0 }} />
      </button>
      {editing &&
      <CustomerEditDialog
        label={label}
        initial={value}
        type={type}
        tablet={tablet}
        onClose={() => setEditing(false)}
        onSave={(v) => {onChange(v);setEditing(false);}} />
      }
    </>);

}

// Backwards-compat alias — legacy callers may still import EditableRow.
function EditableRow(props) {return <CustomerRow {...props} />;}

function CustomerEditDialog({ label, initial, type, tablet, onClose, onSave }) {
  const [val, setVal] = useState(initial);
  const inputRef = useRef(null);
  useEffect(() => {setTimeout(() => inputRef.current?.focus(), 80);}, []);

  if (tablet) {
    return (
      <>
        <div className="sheet-backdrop" onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)' }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'var(--surface)', borderRadius: 14, padding: 22,
          minWidth: 360, maxWidth: '85%',
          boxShadow: 'var(--shadow-lg)', zIndex: 41
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Edit {label.toLowerCase()}</h3>
          <input
            ref={inputRef}
            className="input"
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ width: '100%', height: 44, fontSize: 15 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(val)}>Save</button>
          </div>
        </div>
      </>);

  }
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px' }}>
          <h3 style={{ margin: 0 }}>Edit {label.toLowerCase()}</h3>
        </div>
        <div style={{ padding: '12px 16px 0' }}>
          <label className="label">{label}</label>
          <input
            ref={inputRef}
            className="input"
            type={type}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            style={{ height: 44, fontSize: 15 }} />
        </div>
        <div style={{ padding: '14px 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-lg btn-block" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => onSave(val)}>Save</button>
        </div>
      </div>
    </>);

}

// Three-card phase chain — CONNECT / SOLVE / COMMIT. Each card is a single
// entry point. Tabs for sub-steps live INSIDE the phase pages (PhaseTabBar
// rendered above the body in app.jsx), not on these cards.
const PHASE_ACCENTS = {
  CONNECT: { tone: 'oklch(0.65 0.13 200)', soft: 'oklch(0.95 0.04 200)' },
  SOLVE:   { tone: 'var(--brand)',         soft: 'var(--brand-soft)'    },
  COMMIT:  { tone: 'var(--success)',       soft: 'var(--success-bg)'    }
};

function PhaseCard({ phase, index, summary, sub, onOpen, disabled }) {
  const isDisabled = disabled || !onOpen;
  const accent = PHASE_ACCENTS[phase] || PHASE_ACCENTS.SOLVE;
  return (
    <div className="card" style={{
      padding: 0, display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden',
      opacity: isDisabled ? 0.6 : 1
    }}>
      <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: 999, flexShrink: 0,
          background: isDisabled ? 'var(--surface-2)' : accent.soft,
          color: isDisabled ? 'var(--text-4)' : accent.tone,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, letterSpacing: '-0.01em'
        }}>{index}</span>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: isDisabled ? 'var(--text-4)' : accent.tone, textTransform: 'uppercase' }}>
          {phase}
        </div>
      </div>
      <div style={{ padding: '0 14px 12px', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>{summary}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>{sub}</div>
      </div>
      <div style={{ padding: '0 14px 14px' }}>
        <button className="btn btn-primary btn-block" onClick={isDisabled ? undefined : onOpen} disabled={isDisabled}>
          Enter {phase.toLowerCase()} <Icon.arrow />
        </button>
      </div>
    </div>);

}

// Quick-action chip — single tap launches native phone/text/directions/email.
function QuickAction({ href, label, Glyph, target }) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noreferrer' : undefined}
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
        <Glyph />
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em' }}>{label}</span>
    </a>);

}

// Hero card — anchors the appointment screen with customer identity,
// appointment context, quick actions, and the Start CTA. Replaces the
// previous flat "Start Appointment" button with something that reads as
// the page's anchor.
function AppointmentHero({ appt, custName, custInsurance, telHref, smsHref, mailHref, mapsHref, recording, recordingTime, onStart, tablet }) {
  const initials = (custName || '?').split(/[\s&]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const addressLine = appt?.address || CUSTOMER.address;
  return (
    <div style={{
      margin: tablet ? '14px 28px 4px' : '14px 16px 4px',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'linear-gradient(135deg, var(--brand-soft) 0%, var(--surface) 70%)',
      position: 'relative'
    }}>
      <div style={{
        padding: tablet ? '20px 22px 18px' : '16px 16px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 14
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
          boxShadow: '0 10px 22px rgba(20,15,5,0.14)'
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 22 : 19, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text)' }}>
            {custName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-2)', flexWrap: 'wrap' }}>
            <Icon.pin style={{ width: 12, height: 12, color: 'var(--text-3)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{addressLine}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {appt?.when &&
            <HeroChip icon={<Icon.cal />} label={appt.when} />}
            {appt?.trade &&
            <HeroChip icon={<Icon.shield />} label={appt.trade} />}
            {appt?.leadSource &&
            <HeroChip label={appt.leadSource} muted />}
            {appt?.est &&
            <HeroChip label={`Est. ${appt.est}`} muted />}
          </div>
        </div>
      </div>

      {/* Quick actions — sit inside the hero so they read as part of the customer card */}
      <div style={{
        padding: tablet ? '0 22px 14px' : '0 16px 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8
      }}>
        <QuickAction href={telHref} label="Call" Glyph={Icon.phone} />
        <QuickAction href={smsHref} label="Text" Glyph={Icon.sms} />
        <QuickAction href={mapsHref} label="Directions" Glyph={Icon.directions || Icon.pin} target="_blank" />
        <QuickAction href={mailHref} label="Email" Glyph={Icon.mail} />
      </div>

      {/* Start CTA / recording status */}
      <div style={{ padding: tablet ? '0 22px 18px' : '0 16px 14px' }}>
        {!recording ?
        <button className="btn btn-primary btn-lg btn-block" onClick={onStart} style={{ height: 50, fontSize: 14, fontWeight: 700, boxShadow: '0 10px 22px rgba(var(--brand-rgb, 30,40,255),0.15)' }}>
            <Icon.flash /> Start Appointment
          </button> :
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'var(--danger-bg)', color: 'var(--danger)',
          border: '1px solid var(--danger)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
            <span className="rec-dot" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Appointment in progress</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>Rilla is recording · {fmtTime(recordingTime)}</div>
            </div>
          </div>}
      </div>
    </div>);
}

function HeroChip({ icon, label, muted }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 999,
      background: muted ? 'var(--surface-2)' : 'var(--surface)',
      border: '1px solid var(--border)',
      color: muted ? 'var(--text-3)' : 'var(--text-2)',
      fontSize: 11, fontWeight: 600, letterSpacing: '-0.005em'
    }}>
      {icon && <span style={{ color: 'var(--text-3)', display: 'inline-flex' }}>{icon}</span>}
      {label}
    </span>);
}

function AppointmentDetail({ appt, recording, recordingTime, onStart, onBack, onOpenNeeds, onOpenInspection, onOpenBuild, onOpenProposal, onOpenPresent, onOpenSign, onOpenDeposit, onOpenHandoff, items, needsConfirmed = 0, findingsDiscussed = 0, tablet = false, solveCompleted = false }) {
  // Editable customer fields — owned locally so reps can correct stale CRM data
  // (DST-PREP-04 edit affordance).
  const [custName, setCustName] = useState(CUSTOMER.name);
  const [custEmail, setCustEmail] = useState(CUSTOMER.email);
  const [custPhone, setCustPhone] = useState(CUSTOMER.phone);
  const [custInsurance, setCustInsurance] = useState(CUSTOMER.insurance);

  // Quick-action helpers — wire native handoffs so the rep can call/text/email/route
  // directly from the appointment overview without leaving the app.
  const telHref = `tel:${(custPhone || '').replace(/[^0-9+]/g, '')}`;
  const smsHref = `sms:${(custPhone || '').replace(/[^0-9+]/g, '')}`;
  const mailHref = `mailto:${custEmail || ''}`;
  const mapsHref = `https://maps.apple.com/?q=${encodeURIComponent(appt?.address || CUSTOMER.address || '')}`;

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <AppointmentHero
        appt={appt}
        custName={custName}
        custInsurance={custInsurance}
        telHref={telHref}
        smsHref={smsHref}
        mailHref={mailHref}
        mapsHref={mapsHref}
        recording={recording}
        recordingTime={recordingTime}
        onStart={onStart}
        tablet={tablet} />

      {/* Appointment-context card — surfaces lead-source / notes the rep
          jotted earlier so they walk in primed. */}
      {(appt?.notes || appt?.leadSource) &&
      <div style={{ padding: tablet ? '6px 28px 0' : '6px 16px 0' }}>
        <div className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon.list />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Heads up for this visit
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4, lineHeight: 1.5 }}>
              {appt?.notes || appt?.leadSource}
            </div>
          </div>
        </div>
      </div>}

      {recording &&
      <>
          <div className="section-label">The IHS Selling Way</div>
          <div
          style={{
            padding: tablet ? '0 28px' : '0 16px',
            display: 'grid',
            gridTemplateColumns: tablet ? 'repeat(3, 1fr)' : '1fr',
            gap: tablet ? 12 : 10,
            alignItems: 'stretch'
          }}>
            <PhaseCard
            phase="CONNECT"
            index={1}
            summary="Needs Assessment"
            sub="Listen first. Capture goals, decision-makers, timeline, and constraints. Rep types or writes — AI cleans up handwriting on save."
            onOpen={onOpenNeeds} />
            <PhaseCard
            phase="SOLVE"
            index={2}
            summary="Inspect · Build · Proposal"
            sub="Photograph and dictate findings, build measurements and line items per scope of work, then assemble the proposal with live pricing."
            onOpen={onOpenInspection} />
            <PhaseCard
            phase="COMMIT"
            index={3}
            summary="Present · Sign & Deposit · Welcome"
            sub="Present the proposal, capture signature + deposit, and send the welcome package. Defer to follow-up if not signing today."
            onOpen={onOpenPresent}
            disabled={!solveCompleted} />
          </div>
        </>
      }

      <div className="section-label">Customer details</div>
      <div style={{ padding: tablet ? '0 28px' : '0 16px' }}>
        <div className="card">
          <CustomerRow label="Name" value={custName} onChange={setCustName} tablet={tablet} />
          <CustomerRow label="Email" value={custEmail} onChange={setCustEmail} tablet={tablet} type="email" />
          <CustomerRow label="Phone" value={custPhone} onChange={setCustPhone} tablet={tablet} type="tel" />
          <CustomerRow label="Insurance" value={custInsurance} onChange={setCustInsurance} tablet={tablet} last />
        </div>
      </div>

      <div style={{ height: 22 }} />
    </div>);

}


// ─────── Camera Modal (basic capture) ───────
// Open the camera, take as many photos as you want, then close. No AI, no
// dictation, no auto-categorization — the rep stars + tags photos on the
// Inspect tab afterwards. (Craig, May '26.)
function CameraModal({ onClose, onCommit }) {
  const [shots, setShots] = useState([]); // [{ id }, ...]
  const [flashing, setFlashing] = useState(false);

  const shoot = () => {
    setFlashing(true);
    setTimeout(() => setFlashing(false), 180);
    setShots((s) => [...s, { id: Date.now() + Math.random() }]);
  };

  const done = () => {
    // Commit each shot as a generic photo item. onCommit closes the modal,
    // but multiple sync calls are batched — items[] accumulates fine.
    shots.forEach((_, i) => {
      onCommit({
        cat: 'roof_system',
        label: `Photo ${i + 1}`,
        caption: '',
        confidence: 1,
        source: 'photo'
      });
    });
    if (shots.length === 0) onClose();
  };

  return (
    <div className="camera-shell">
      {/* fake camera viewfinder */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, #2a2a2a 0%, #0a0a0a 70%)' }}>
        {/* faux roof grid */}
        <svg width="100%" height="100%" viewBox="0 0 390 820" preserveAspectRatio="none" style={{ opacity: 0.4 }}>
          {Array.from({ length: 22 }).map((_, i) =>
          <line key={'h' + i} x1="0" x2="390" y1={i * 40} y2={i * 40 - 60} stroke="#444" strokeWidth="0.5" />
          )}
          {Array.from({ length: 14 }).map((_, i) =>
          <line key={'v' + i} x1={i * 30} x2={i * 30 + 70} y1="0" y2="820" stroke="#3a3a3a" strokeWidth="0.5" />
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5))' }} />
      </div>

      {/* shutter flash */}
      {flashing &&
      <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.7, zIndex: 4, pointerEvents: 'none', animation: 'fade 180ms ease' }} />}

      {/* top bar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 18px 10px', zIndex: 2 }}>
        <button onClick={onClose} aria-label="Close camera" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 0, height: 36, width: 36, borderRadius: 999, cursor: 'pointer' }}><Icon.x /></button>
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.06, fontVariantNumeric: 'tabular-nums', textTransform: 'uppercase', opacity: 0.85 }}>
          {shots.length === 0 ? 'Camera' : `${shots.length} photo${shots.length === 1 ? '' : 's'}`}
        </div>
        <button style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 0, height: 36, width: 36, borderRadius: 999, cursor: 'pointer' }} aria-label="Toggle flash"><Icon.flash /></button>
      </div>

      {/* viewfinder reticle */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 220, height: 220, border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 12, position: 'relative' }}>
          {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([y, x]) =>
          <div key={y + x} style={{ position: 'absolute', [y]: -1, [x]: -1, width: 22, height: 22, border: '3px solid #fff', borderRadius: 4, [`border${y[0].toUpperCase() + y.slice(1)}Width`]: 3, [`border${x[0].toUpperCase() + x.slice(1)}Width`]: 3 }} />
          )}
        </div>
      </div>

      {/* recent-shots strip */}
      {shots.length > 0 &&
      <div style={{ position: 'relative', padding: '0 18px 8px', zIndex: 2, display: 'flex', gap: 6, justifyContent: 'flex-end', overflowX: 'auto' }}>
          {shots.slice(-5).map((s) =>
        <div key={s.id} style={{
          width: 44, height: 44, borderRadius: 6, flexShrink: 0,
          background: 'oklch(0.78 0.01 80)',
          backgroundImage: 'repeating-linear-gradient(135deg, oklch(0.85 0.02 80) 0 5px, oklch(0.8 0.02 80) 5px 10px)',
          border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }} />
        )}
        </div>}

      {/* bottom controls — shutter + Done */}
      <div style={{ position: 'relative', padding: '8px 24px 36px', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <div />
        <button
          type="button"
          onClick={shoot}
          aria-label="Take photo"
          style={{
            width: 72, height: 72, borderRadius: 999,
            background: '#fff', border: '4px solid rgba(255,255,255,0.4)',
            backgroundClip: 'padding-box', cursor: 'pointer', padding: 0,
            boxShadow: '0 0 0 2px #fff inset, 0 6px 18px rgba(0,0,0,0.4)'
          }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={done}
            disabled={shots.length === 0}
            style={{
              height: 40, padding: '0 16px', borderRadius: 999, border: 0, cursor: shots.length === 0 ? 'not-allowed' : 'pointer',
              background: shots.length === 0 ? 'rgba(255,255,255,0.15)' : '#fff',
              color: shots.length === 0 ? 'rgba(255,255,255,0.5)' : '#111',
              fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em'
            }}>
            Done{shots.length > 0 ? ` · ${shots.length}` : ''}
          </button>
        </div>
      </div>

      <style>{'@keyframes fade { from { opacity: 0.7; } to { opacity: 0; } }'}</style>
    </div>);

}

// ─────── Dictation Modal (mic-only flow) ───────
// Captures a finding via voice without requiring a photo. Useful when an area
// is hard to photograph (interior attics, dark spaces, hard-to-reach corners).
function DictationModal({ onClose, onCommit }) {
  const [phase, setPhase] = useState('speaking'); // speaking | classifying | review
  const [transcript, setTranscript] = useState('');
  const [pending, setPending] = useState(null);

  // Demo dictation example — voice populates the Penetrations measurement field
  // with the pipe-boot count.
  const TRANSCRIPTS = [
  {
    text: "I'm counting four pipe boots on the back slope, all need replacement.",
    label: 'Pipe boots — 4 on back slope',
    caption: 'AI captured the count and populated the Penetrations field.',
    confidence: 0.94,
    // Field hint: which envelope measurement to set + qty.
    field: { facet: 'roofing', key: 'pipe_boots', qty: 4 }
  }];


  useEffect(() => {
    const pick = TRANSCRIPTS[Math.floor(Math.random() * TRANSCRIPTS.length)];
    let t = '';
    const words = pick.text.split(' ');
    let i = 0;
    const id = setInterval(() => {
      t += (i ? ' ' : '') + words[i];
      setTranscript(t);
      i++;
      if (i >= words.length) {
        clearInterval(id);
        setPhase('classifying');
        setTimeout(() => {setPending(pick);setPhase('review');}, 700);
      }
    }, 70);
    return () => clearInterval(id);
  }, []);

  const commit = () => {
    onCommit({
      cat: pending.cat || 'roof_system',
      label: pending.label,
      caption: pending.caption || pending.text,
      confidence: pending.confidence,
      source: 'mic',
      field: pending.field // pass field hint so InspectionScreen can populate measurement
    });
  };

  const catLabel = pending ? INSPECTION_CATEGORIES.find((c) => c.id === pending.cat)?.label : '';

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ paddingBottom: 18 }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.mic />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{phase === 'review' ? 'Confirm finding' : 'Listening…'}</h3>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {phase === 'speaking' && 'Talk through what you\'re seeing.'}
              {phase === 'classifying' && 'AI is structuring this finding.'}
              {phase === 'review' && 'AI placed this into a category for you.'}
            </div>
          </div>
          {phase !== 'review' && <span className="rec-dot" style={{ flexShrink: 0 }} />}
        </div>

        <div style={{ padding: '12px 16px' }}>
          <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, minHeight: 88, fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>
            {transcript || <span style={{ color: 'var(--text-3)' }}>Waiting for audio…</span>}
            {phase === 'speaking' &&
            <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--text-3)', verticalAlign: 'middle', marginLeft: 4, animation: 'pulse 1s infinite' }} />
            }
          </div>
        </div>

        {phase === 'classifying' &&
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 999, border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            Categorizing…
          </div>
        }

        {phase === 'review' && pending &&
        <div style={{ padding: '0 16px 12px' }}>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.05, textTransform: 'uppercase' }}>Added to</div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>{catLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{pending.label}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <span className="pill brand" style={{ fontSize: 10 }}>AI · {Math.round(pending.confidence * 100)}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-lg" style={{ flex: 1, minWidth: 0 }} onClick={onClose}>Re-record</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1, minWidth: 0 }} onClick={commit}>Looks right</button>
            </div>
          </div>
        }
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    </>);

}

Object.assign(window, {
  Login, AppointmentDetail, CameraModal, DictationModal
});