/* global React, Icon, BRANDS, FINANCING_PROVIDER, FINANCING_DECISIONS, CUSTOMER, fmt */
/* Financing application — DST-FIN — homeowner-facing on tablet */

const { useState, useMemo } = window;

function FinancingScreen({ tablet, brand, amount, onCancel, onDecisionResolved }) {
  const brandObj = BRANDS[brand];
  const [phase, setPhase] = useState('input');  // input | submitting | resolved
  const [decision, setDecision] = useState(null); // approved | counter | declined | pending
  const [loanAmt, setLoanAmt] = useState(amount || 30000);
  const [term, setTerm] = useState(60); // months

  // Form fields — homeowner enters; rep does not
  const [ssn, setSsn] = useState('');
  const [dob, setDob] = useState('');
  const [income, setIncome] = useState('');
  const [housing, setHousing] = useState('');

  const rate = FINANCING_PROVIDER.rateFloor;
  const monthly = useMemo(() => {
    // Standard amortization
    const r = rate / 12;
    const n = term;
    if (!r || !n) return 0;
    return Math.round((loanAmt * r) / (1 - Math.pow(1 + r, -n)));
  }, [loanAmt, term, rate]);

  const canSubmit = ssn.length >= 4 && dob && income && housing;

  const submit = (forcedDecision) => {
    setPhase('submitting');
    // Demo: cycle through decisions; primary path is approved.
    setTimeout(() => {
      const d = forcedDecision || 'approved';
      setDecision(d);
      setPhase('resolved');
    }, 1800);
  };

  // ── Resolved state ──
  if (phase === 'resolved' && decision) {
    return <DecisionView
      decision={decision}
      amount={loanAmt}
      counterAmount={Math.round(loanAmt * 0.7)}
      monthly={monthly}
      term={term}
      rate={rate}
      tablet={tablet}
      brand={brand}
      onAccept={() => onDecisionResolved({ decision, approvedAmount: decision === 'counter' ? Math.round(loanAmt * 0.7) : loanAmt, monthly, term, rate })}
      onTryAgain={() => { setPhase('input'); setDecision(null); }}
      onDeclineAndContinue={() => onDecisionResolved({ decision: 'declined' })} />;
  }

  // ── Input state ──
  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Minimal homeowner-facing chrome */}
      <div style={{ padding: tablet ? '36px 28px 18px' : '20px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12, letterSpacing: '-0.02em' }}>
            {brandObj.initials}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.02 }}>{FINANCING_PROVIDER.display}</span>
        </div>
        <button onClick={onCancel} className="btn btn-sm btn-ghost" style={{ fontSize: 11 }}>
          Cancel · return to rep
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: tablet ? '4px 28px 0' : '4px 16px 0' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 36 : 24, fontWeight: 700, letterSpacing: '-0.025em' }}>
          Apply for financing
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, maxWidth: 540 }}>
          Soft credit pull · no impact on your score. Pre-approval in under a minute.
        </div>
      </div>

      {/* Loan amount + term */}
      <div style={{ padding: tablet ? '20px 28px 0' : '18px 16px 0' }}>
        <div className="card card-pad" style={{ padding: '18px 18px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>Loan amount</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 40 : 32, fontWeight: 700, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{fmt(loanAmt)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase' }}>Est. monthly</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 32 : 24, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>{fmt(monthly)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-4)', fontFamily: 'var(--font-mono)' }}>{(rate * 100).toFixed(2)}% APR · {term}mo</div>
            </div>
          </div>

          {/* Term selector */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.04, textTransform: 'uppercase', marginBottom: 6 }}>Term</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {FINANCING_PROVIDER.terms.map((t) => {
                const active = term === t;
                return (
                  <button key={t}
                    onClick={() => setTerm(t)}
                    style={{
                      flex: 1, height: 38, borderRadius: 8, border: 0,
                      background: active ? 'var(--brand)' : 'var(--surface-2)',
                      color: active ? 'var(--brand-fg)' : 'var(--text-2)',
                      fontWeight: 700, fontSize: 11, cursor: 'pointer', letterSpacing: '-0.01em',
                    }}>
                    {t}<span style={{ opacity: 0.6 }}>mo</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Homeowner-enters banner */}
      <div style={{ padding: tablet ? '20px 28px 0' : '16px 16px 0' }}>
        <div style={{ padding: '8px 10px', background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.user style={{ width: 12, height: 12 }} /> You enter this · your rep never sees your financial info
        </div>
      </div>

      {/* Personal + financial fields */}
      <div style={{ padding: tablet ? '14px 28px 0' : '14px 16px 0' }}>
        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FinField label="Full legal name" value={CUSTOMER.name.split('&')[0].trim()} muted />
          <FinField label="Property address" value={CUSTOMER.address} muted />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FinField label="Date of birth" placeholder="MM/DD/YYYY" value={dob} onChange={setDob} />
            <FinField label="Social security" placeholder="•••-••-••••" value={ssn} onChange={setSsn} mask />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <FinField label="Gross annual income" placeholder="$" value={income} onChange={setIncome} />
            <FinField label="Housing payment / mo" placeholder="$" value={housing} onChange={setHousing} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ padding: tablet ? '20px 28px 22px' : '18px 16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-primary btn-lg btn-block" disabled={!canSubmit || phase === 'submitting'} onClick={() => submit()}>
          {phase === 'submitting'
            ? (<><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> Checking with provider…</>)
            : <>Get my pre-approval</>}
        </button>
        {/* Dev shortcut to other decision states — kept inline to make demo states reachable */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', fontSize: 9, color: 'var(--text-4)', marginTop: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>dev · simulate:</span>
          {['approved', 'counter', 'pending', 'declined'].map((d) => (
            <button key={d} onClick={() => submit(d)} className="btn btn-sm btn-ghost" style={{ height: 18, padding: '0 6px', fontSize: 9, fontFamily: 'var(--font-mono)' }}>{d}</button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', textAlign: 'center', marginTop: 6, lineHeight: 1.5 }}>
          By submitting, you authorize {brandObj.name} and {FINANCING_PROVIDER.name} to perform a soft credit inquiry. This does not affect your credit score.
        </div>
      </div>
    </div>
  );
}

function FinField({ label, placeholder, value, onChange, muted, mask }) {
  return (
    <div>
      <label className="label" style={{ fontSize: 10 }}>{label}</label>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        readOnly={muted}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{ background: muted ? 'var(--surface-2)' : 'var(--surface)', color: muted ? 'var(--text-3)' : 'var(--text)', fontFamily: mask ? 'var(--font-mono)' : 'inherit' }} />
    </div>
  );
}

// ─────── Decision view ───────
function DecisionView({ decision, amount, counterAmount, monthly, term, rate, tablet, brand, onAccept, onTryAgain, onDeclineAndContinue }) {
  const d = FINANCING_DECISIONS[decision];
  const brandObj = BRANDS[brand];
  const color = decision === 'approved' ? 'var(--success)' : decision === 'declined' ? 'var(--danger)' : decision === 'counter' ? 'var(--warn)' : 'var(--text-3)';
  const bg    = decision === 'approved' ? 'var(--success-bg)' : decision === 'declined' ? 'var(--danger-bg)' : decision === 'counter' ? 'var(--warn-bg)' : 'var(--surface-3)';
  const displayedAmount = decision === 'counter' ? counterAmount : amount;

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: tablet ? '36px 28px 18px' : '20px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12 }}>
          {brandObj.initials}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{FINANCING_PROVIDER.display}</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tablet ? '28px' : '20px 16px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          {decision === 'approved' && <Icon.check style={{ width: 32, height: 32 }} />}
          {decision === 'counter' && <Icon.alert style={{ width: 28, height: 28 }} />}
          {decision === 'declined' && <Icon.x style={{ width: 28, height: 28 }} />}
          {decision === 'pending' && <span style={{ display: 'inline-block', width: 26, height: 26, borderRadius: 999, border: '3px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />}
        </div>

        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, color: color, textTransform: 'uppercase' }}>{d.label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 40 : 30, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, maxWidth: 520, lineHeight: 1.1 }}>
          {decision === 'approved' && `You're approved for ${fmt(displayedAmount)}.`}
          {decision === 'counter'  && `Approved for ${fmt(displayedAmount)} — a bit less than requested.`}
          {decision === 'declined' && "We weren't able to approve this application."}
          {decision === 'pending'  && 'We need a few more minutes.'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8, maxWidth: 460, lineHeight: 1.5 }}>
          {d.detail}
        </div>

        {(decision === 'approved' || decision === 'counter') && (
          <div className="card card-pad" style={{ marginTop: 22, padding: '16px 20px', minWidth: tablet ? 360 : '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase' }}>Monthly</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>{fmt(monthly)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase' }}>Terms</div>
                <div style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>{(rate * 100).toFixed(2)}% APR · {term}mo</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: tablet ? 360 : '100%' }}>
          {(decision === 'approved' || decision === 'counter') && (
            <button className="btn btn-primary btn-lg btn-block" onClick={onAccept}>
              Continue with this option <Icon.arrow />
            </button>
          )}
          {decision === 'counter' && (
            <button className="btn btn-block" onClick={onTryAgain}>Try a different amount</button>
          )}
          {decision === 'declined' && (
            <>
              <button className="btn btn-primary btn-lg btn-block" onClick={onDeclineAndContinue}>
                Explore other payment options
              </button>
              <button className="btn btn-block btn-ghost" onClick={onTryAgain}>Try again</button>
            </>
          )}
          {decision === 'pending' && (
            <>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5, marginTop: -8 }}>
                Pending decisions don't block your rep. We'll surface a notification when it resolves.
              </div>
              <button className="btn btn-block" onClick={onDeclineAndContinue}>
                Continue with the appointment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FinancingScreen });
