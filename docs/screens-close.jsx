/* global React, Icon, CUSTOMER, BRANDS, REPS, TIERS, WELCOME_CONTENTS, HANDOFF_ITEMS, fmt, fmtTime, tierTotal */
/* Close-out surfaces: Walk-through Video (DST-CON-04), Deposit (DST-PAY), Welcome Package (DST-WP) */

const { useState, useEffect, useRef } = window;

// ─────── Walk-through Video capture ───────
function WalkthroughScreen({ tablet, signed, topicsState, setTopicsState, onSkip, onContinue }) {
  const [phase, setPhase] = useState('idle'); // idle | recording | reviewing
  const [time, setTime] = useState(0);
  const [recDuration, setRecDuration] = useState(0);

  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const TOPICS = [
  'Front of house',
  'Side elevation (left)',
  'Side elevation (right)',
  'Back of house',
  'Roof perimeter from ground',
  'Scope boundaries (what we\'re replacing)',
  'Areas we are NOT touching'];


  const start = () => {setPhase('recording');setTime(0);};
  const stop = () => {setRecDuration(time);setPhase('reviewing');};
  const retake = () => {setPhase('idle');setTime(0);setRecDuration(0);};

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      {/* Viewfinder shell — reuses camera modal feel */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #2a2a2a 0%, #0a0a0a 70%)' }}>
          <svg width="100%" height="100%" viewBox="0 0 390 820" preserveAspectRatio="none" style={{ opacity: 0.4 }}>
            {Array.from({ length: 22 }).map((_, i) =>
            <line key={'h' + i} x1="0" x2="390" y1={i * 40} y2={i * 40 - 60} stroke="#444" strokeWidth="0.5" />
            )}
            {Array.from({ length: 14 }).map((_, i) =>
            <line key={'v' + i} x1={i * 30} x2={i * 30 + 70} y1="0" y2="820" stroke="#3a3a3a" strokeWidth="0.5" />
            )}
          </svg>
        </div>

        {/* Top status row */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px', zIndex: 2, color: '#fff' }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>Walk-through · clean-contracting</div>
          {phase === 'recording' &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
              <span className="rec-dot" /> REC · {fmtTime(time)}
            </div>
          }
          {phase === 'reviewing' &&
          <span className="pill success" style={{ fontSize: 10 }}>
              <Icon.check /> Captured · {fmtTime(recDuration)}
            </span>
          }
        </div>

        {/* Body */}
        <div style={{ position: 'absolute', inset: 0, top: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          {phase === 'idle' &&
          <div style={{ width: 220, height: 220, border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 12, position: 'relative' }} />
          }
          {phase === 'recording' &&
          <div style={{ color: '#fff', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em' }}>{fmtTime(time)}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Talk through what's in frame</div>
            </div>
          }
          {phase === 'reviewing' &&
          <div className="placeholder-photo" style={{ width: '78%', height: 200, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}>walkthrough-{recDuration}s.mp4</div>
          }
        </div>
      </div>

      {/* Topics + record controls */}
      <div style={{ background: 'var(--surface)', padding: 16, borderTop: '1px solid var(--border)', maxHeight: '50%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.06, color: 'var(--text-3)', textTransform: 'uppercase' }}>Walk through these</div>
          <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{Object.values(topicsState).filter(Boolean).length}/{TOPICS.length}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
          {TOPICS.map((t) => {
            const on = topicsState[t];
            return (
              <div key={t}
              onClick={() => setTopicsState((s) => ({ ...s, [t]: !on }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: 12 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`, background: on ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-fg)' }}>
                  {on && <Icon.check style={{ width: 10, height: 10 }} />}
                </div>
                <span style={{ color: on ? 'var(--text-3)' : 'var(--text)', textDecoration: on ? 'line-through' : 'none' }}>{t}</span>
              </div>);

          })}
        </div>

        {phase === 'idle' &&
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary btn-lg btn-block" onClick={start}>
              <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 999, background: '#fff' }} /> Start recording
            </button>
            <button className="btn btn-block btn-ghost" style={{ fontSize: 11 }} onClick={onSkip}>
              Skip · requires reason code
            </button>
          </div>
        }
        {phase === 'recording' &&
        <button className="btn btn-block btn-lg" style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }} onClick={stop}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#fff' }} /> Stop · {fmtTime(time)}
          </button>
        }
        {phase === 'reviewing' &&
        <div style={{ display: 'flex', flexDirection: tablet ? 'row' : 'column', gap: 8 }}>
            <button className="btn btn-lg" style={{ flex: tablet ? 1 : 'none' }} onClick={retake}><Icon.undo /> Retake</button>
            <button className="btn btn-primary btn-lg" style={{ flex: tablet ? 2 : 'none' }} onClick={() => onContinue({ duration: recDuration, topicsCovered: Object.values(topicsState).filter(Boolean).length, topicsTotal: TOPICS.length })}>
              Continue · deposit <Icon.arrow />
            </button>
          </div>
        }
      </div>
    </div>);

}

// ─────── Deposit collection ───────
function DepositScreen({ tablet, brand, total, onContinue, onSkip }) {
  const brandObj = BRANDS[brand];
  const defaultAmount = Math.round(total * 0.10);
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState('card'); // card | ach | text
  const [phase, setPhase] = useState('input'); // input | processing | awaiting | confirmed
  const [last4] = useState('4242');
  const [authorized, setAuthorized] = useState(false);

  // "Text link" flow — homeowner gets a secure link, pays from their own device.
  // This is the right primary path for cautious customers (older homeowners,
  // anyone uncomfortable typing card info on the rep's tablet). Defaults to
  // the customer phone on file; rep can edit before sending.
  const [linkPhone, setLinkPhone] = useState(CUSTOMER.phone);
  const [linkSentAt, setLinkSentAt] = useState(null);
  const [linkOpened, setLinkOpened] = useState(false);

  // Simulate homeowner activity on the payment-link page so the rep sees the
  // funnel move in real time (link sent → opened → paid). Same idea as the
  // welcome package delivery dots elsewhere in the app.
  useEffect(() => {
    if (phase !== 'awaiting') return;
    const t1 = setTimeout(() => setLinkOpened(true), 2200);
    const t2 = setTimeout(() => setPhase('confirmed'), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const submit = () => {
    if (method === 'text') {
      setLinkSentAt(new Date());
      setLinkOpened(false);
      setPhase('awaiting');
      return;
    }
    setPhase('processing');
    setTimeout(() => setPhase('confirmed'), 1400);
  };

  const resendLink = () => {
    setLinkSentAt(new Date());
    setLinkOpened(false);
  };
  const cancelLink = () => {
    setPhase('input');
    setLinkSentAt(null);
    setLinkOpened(false);
  };

  if (phase === 'confirmed') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tablet ? 48 : 28, background: 'var(--bg)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Icon.check style={{ width: 32, height: 32 }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 32 : 24, fontWeight: 700, letterSpacing: '-0.025em' }}>Deposit received</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 56 : 40, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>{fmt(amount)}</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, textAlign: 'center', maxWidth: 360 }}>
          {method === 'card' ? `Charged to card ending in ${last4}` :
           method === 'ach'  ? 'ACH debit authorized · clears in 1–2 business days' :
                               `Paid from homeowner's device · text link to ${linkPhone}`}
        </div>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 28 }} onClick={onContinue}>
          Send welcome package <Icon.arrow />
        </button>
      </div>);

  }

  // Awaiting state — rep sent a text payment link; we wait for the homeowner
  // to tap it and pay on their own device. Rep can resend or cancel.
  if (phase === 'awaiting') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tablet ? 48 : 24, textAlign: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 999,
              background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon.sms style={{ width: 30, height: 30 }} />
            </div>
            <span style={{
              position: 'absolute', inset: -6,
              borderRadius: 999, border: '2px solid var(--brand)',
              opacity: 0.4,
              animation: 'pulse 1.8s ease-out infinite'
            }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand)', letterSpacing: 0.12, textTransform: 'uppercase' }}>
              {linkOpened ? 'Homeowner is paying…' : 'Text link sent'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 28 : 22, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>
              Waiting on the homeowner
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8, maxWidth: 360, lineHeight: 1.5 }}>
              {fmt(amount)} payment link sent to <strong style={{ color: 'var(--text-2)' }}>{linkPhone}</strong>. They'll tap, pay from their own device, and you'll see it confirm here automatically.
            </div>
          </div>

          {/* Status timeline */}
          <div className="card" style={{ padding: 14, width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <LinkStatusRow label="Link sent" detail={linkSentAt ? `to ${linkPhone}` : '—'} done />
            <LinkStatusRow label="Link opened" detail={linkOpened ? 'just now' : 'waiting…'} done={linkOpened} active={!linkOpened} />
            <LinkStatusRow label="Payment received" detail="waiting…" />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button className="btn" onClick={resendLink}><Icon.sms /> Resend</button>
            <button className="btn btn-ghost" onClick={cancelLink}>Cancel link</button>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Homeowner-facing hero */}
      <div style={{ padding: tablet ? '36px 28px 12px' : '20px 16px 4px', textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, margin: '0 auto', background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {brandObj.initials}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 36 : 24, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 16 }}>Deposit</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
          10% to lock your install slot. The remainder bills after final walk.
        </div>
      </div>

      {/* Amount */}
      <div style={{ padding: tablet ? '20px 28px 0' : '20px 16px 0' }}>
        <div className="card card-pad" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>Amount</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 56 : 40, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            {fmt(amount)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>of {fmt(total)} total · default 10%</div>
        </div>
      </div>

      {/* Payment method tabs */}
      <div style={{ padding: tablet ? '20px 28px 0' : '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface-2)', borderRadius: 10 }}>
          {[
            { id: 'card', label: 'Card' },
            { id: 'ach',  label: 'Bank · ACH' },
            { id: 'text', label: 'Text link' }
          ].map((m) =>
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: 0,
              background: method === m.id ? 'var(--surface)' : 'transparent',
              color: method === m.id ? 'var(--text)' : 'var(--text-3)',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              boxShadow: method === m.id ? 'var(--shadow-sm)' : 'none'
            }}>
              {m.label}
            </button>
          )}
        </div>
      </div>

      {/* Form — homeowner-only banner + masked fields */}
      <div style={{ padding: tablet ? '14px 28px 0' : '14px 16px 0' }}>
        {method !== 'text' &&
          <div style={{ padding: '8px 10px', background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)', borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.user style={{ width: 12, height: 12 }} /> Homeowner enters this — rep does not key payment info
          </div>
        }

        {method === 'card' &&
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FormField label="Card number" placeholder="•••• •••• •••• 4242" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <FormField label="Expiry" placeholder="MM/YY" />
              <FormField label="CVV" placeholder="•••" />
              <FormField label="ZIP" placeholder="78613" />
            </div>
          </div>
        }
        {method === 'ach' &&
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FormField label="Routing number" placeholder="•••••••••" />
            <FormField label="Account number" placeholder="••••••" />
            <FormField label="Name on account" placeholder="Renée Whittaker" />
          </div>
        }
        {method === 'text' &&
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.sms />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Pay from your phone</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>
                  We text a secure payment link. Tap, choose card or bank, and pay from your own device. We get a notification the moment it goes through.
                </div>
              </div>
            </div>
            <div>
              <label className="label" style={{ fontSize: 10 }}>Send to</label>
              <input
                className="input"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                placeholder="(512) 555-2284"
                inputMode="tel" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              <Icon.shield style={{ flexShrink: 0, color: 'var(--brand)' }} />
              <span>Link is one-time, expires in 24 hours, and locked to this deal. No card info touches the rep app.</span>
            </div>
          </div>
        }
      </div>

      {method !== 'text' &&
        <div style={{ padding: tablet ? '14px 28px 0' : '14px 16px 0' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
            <input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} style={{ marginTop: 3 }} />
            I authorize {brandObj.name} to charge {fmt(amount)} as the project deposit. The remainder bills after final walk.
          </label>
        </div>
      }

      <div style={{ padding: '18px 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="btn btn-primary btn-lg btn-block"
          disabled={(method !== 'text' && !authorized) || phase === 'processing' || (method === 'text' && !linkPhone.trim())}
          onClick={submit}>
          {phase === 'processing'
            ? <><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> Processing…</>
            : method === 'text'
              ? <><Icon.sms /> Text payment link · {fmt(amount)}</>
              : <>Pay deposit · {fmt(amount)}</>}
        </button>
        <button className="btn btn-block btn-ghost" style={{ fontSize: 11 }} onClick={onSkip}>
          Collect later · move on without deposit
        </button>
      </div>
    </div>);

}

// Status row used in the awaiting-payment-link screen above.
function LinkStatusRow({ label, detail, done, active }) {
  const color = done ? 'var(--success)' : active ? 'var(--brand)' : 'var(--text-3)';
  const bg    = done ? 'var(--success-bg)' : active ? 'var(--brand-soft)' : 'var(--surface-2)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 999,
        background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        {done
          ? <Icon.check style={{ width: 12, height: 12 }} />
          : active
            ? <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            : <span style={{ width: 6, height: 6, borderRadius: 999, background: 'currentColor' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{detail}</div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder }) {
  return (
    <div>
      <label className="label" style={{ fontSize: 10 }}>{label}</label>
      <input className="input" placeholder={placeholder} />
    </div>);

}

// ─────── Welcome Package confirmation (replaces post-sign success state) ───────
function WelcomePackageScreen({ tablet, brand, rep, signed, deposit, walkthrough, onBackToSchedule, onOpenHandoff }) {
  const brandObj = BRANDS[brand];
  const [emailStatus, setEmailStatus] = useState('sent'); // sent → delivered → opened
  const [smsStatus, setSmsStatus] = useState('sent');
  const [showAudit, setShowAudit] = useState(false);

  // Simulate delivery progression
  useEffect(() => {
    const t1 = setTimeout(() => setEmailStatus('delivered'), 1400);
    const t2 = setTimeout(() => setSmsStatus('delivered'), 1700);
    const t3 = setTimeout(() => setEmailStatus('opened'), 4200);
    return () => {clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, []);

  const tier = signed?.tier;
  const total = signed?.total || 0;

  const lastName = CUSTOMER.name.split(' ').slice(-1)[0];

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Celebration hero */}
      <div style={{ padding: tablet ? '36px 28px 12px' : '22px 16px 8px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Icon.check style={{ width: 28, height: 28 }} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--success)', letterSpacing: 0.1, textTransform: 'uppercase' }}>COMMIT · COMPLETE</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 36 : 24, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4 }}>
          Welcome package sent to the {lastName}s
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>
          Production team is alerted. Handoff in ~1 business day.
        </div>
      </div>

      {/* What was sent */}
      <div className="section-label">What was sent</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DeliveryRow icon={<Icon.mail />} label="Email" to={CUSTOMER.email} status={emailStatus} />
        <DeliveryRow icon={<Icon.mic />} label="SMS" to={CUSTOMER.phone} status={smsStatus} />
      </div>

      {/* Contents preview */}
      <div className="section-label">Contents</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WELCOME_CONTENTS.map((c) => {
              const I = Icon[c.icon] || Icon.mail;
              return (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <I />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.detail}</div>
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 16px 22px' }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onBackToSchedule}>
          Return to Appointment <Icon.arrow />
        </button>
      </div>
    </div>);

}

function DeliveryRow({ icon, label, to, status }) {
  const dotColor = status === 'opened' ? 'var(--success)' : status === 'delivered' ? 'var(--brand)' : 'var(--text-3)';
  const dotLabel = { sent: 'Sent', delivered: 'Delivered', opened: 'Opened' }[status] || status;
  return (
    <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{to} · 2 min ago</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: dotColor }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: dotColor, letterSpacing: 0.04, textTransform: 'uppercase' }}>{dotLabel}</span>
      </div>
    </div>);

}

// ─────── Production Handoff (DST-PH) ───────
function HandoffScreen({ tablet, brand, rep, signed, walkthrough, deposit, onBackToSchedule }) {
  const brandObj = BRANDS[brand];
  const [received, setReceived] = useState(false);

  // Simulate production receipt acknowledgment.
  useEffect(() => {
    const t = setTimeout(() => setReceived(true), 4500);
    return () => clearTimeout(t);
  }, []);

  const tier = signed?.tier;
  const total = signed?.total || 0;
  const dealName = `${CUSTOMER.name.split('&')[0].trim()} · ${tier?.name || 'Premium'} · ${fmt(total)}`;

  // Compute walk-through and risk-flag detail strings at render time.
  const itemDetail = {
    walkthrough: walkthrough?.skipped ?
    'Skipped · production notified' :
    walkthrough ?
    `${fmtTime(walkthrough.duration)} · ${walkthrough.topicsCovered}/${walkthrough.topicsTotal} topics` :
    'Not captured',
    photos: '14 photos across 7 categories',
    flags: [
    deposit?.pending && 'Deposit deferred',
    walkthrough?.skipped && 'Walk-through skipped'].
    filter(Boolean).join(' · ') || 'None'
  };

  const items = HANDOFF_ITEMS.map((it) => ({
    ...it,
    detail: it.detail || itemDetail[it.id] || '—',
    warning: it.id === 'walkthrough' && walkthrough?.skipped
  }));

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{ padding: tablet ? '24px 28px 8px' : '16px 16px 4px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.1, textTransform: 'uppercase' }}>COMMIT · Handoff</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 30 : 22, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 2, lineHeight: 1.15 }}>
          Handed off to {brandObj.short} operations
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
          {dealName}
        </div>
      </div>

      {/* Receipt acknowledgment */}
      <div style={{ padding: '14px 16px 0' }}>
        <div className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: received ? 'var(--success-bg)' : 'var(--surface)', border: received ? '1px solid var(--success)' : '1px solid var(--border)', transition: 'all 300ms ease' }}>
          {received ?
          <>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.check style={{ width: 16, height: 16 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>Acknowledged by Production</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Project Manager: Tina Hsu · ETA call scheduled within 1 business day</div>
              </div>
            </> :

          <>
              <span style={{ flexShrink: 0, display: 'inline-block', width: 22, height: 22, borderRadius: 999, border: '2.5px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Waiting for production team to acknowledge</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Receipt usually within minutes, max 1 business day.</div>
              </div>
            </>
          }
        </div>
      </div>

      {/* Package contents checklist */}
      <div className="section-label">Package contents</div>
      <div style={{ padding: '0 16px' }}>
        <div className="card">
          {items.map((it, i) => {
            const IconComp = Icon[it.icon] || Icon.list;
            return (
              <div key={it.id} style={{
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: it.warning ? 'var(--warn-bg)' : 'var(--success-bg)',
                  color: it.warning ? 'var(--warn)' : 'var(--success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {it.warning ? <Icon.alert /> : <Icon.check />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</div>
                  <div style={{ fontSize: 11, color: it.warning ? 'var(--warn)' : 'var(--text-3)', marginTop: 2 }}>
                    {it.detail}
                  </div>
                </div>
                <IconComp />
              </div>);

          })}
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', padding: '12px 24px', lineHeight: 1.5 }}>
        Handoff packages are read-only after they leave the rep app. Updates go through the CRM and reach production by sync.
      </div>

      <div style={{ padding: '8px 16px 22px' }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onBackToSchedule}>
          Back to schedule
        </button>
      </div>
    </div>);

}

Object.assign(window, { WalkthroughScreen, DepositScreen, HandoffScreen });