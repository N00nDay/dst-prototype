/* global React, Icon, TIERS, LINE_ITEMS, CUSTOMER, fmt, fmt0, tierTotal, BRANDS, REPS */

const { useState, useEffect, useRef, useMemo } = window;

// ─────── Quote Generation Loading ───────
function QuoteLoading({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
  'Sending inspection to Pricing Engine…',
  'Pulling material costs · Owens Corning, GAF',
  'Calculating labor by region (Cedar Park, TX)',
  'Applying brand margin & overhead',
  'Returning Good · Better · Best tiers'];

  useEffect(() => {
    if (step >= steps.length) {onDone();return;}
    const id = setTimeout(() => setStep((s) => s + 1), 380);
    return () => clearTimeout(id);
  }, [step]);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 999, border: '2.5px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Generating quote</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((s, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: i <= step ? 'var(--text)' : 'var(--text-4)', opacity: i <= step ? 1 : 0.5, transition: 'all 200ms' }}>
            {i < step ? <Icon.check style={{ color: 'var(--success)' }} /> : i === step ? <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 999, border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> : <span style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--surface-3)' }} />}
            <span>{s}</span>
          </div>
        )}
      </div>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>);

}

// ─────── Quote (phone + tablet versions) ───────
function Quote({ tablet, onBack, onPresent, onSign, selected, setSelected, addons, setAddons }) {
  const [expanded, setExpanded] = useState(null);
  const totalsByTier = useMemo(() => {
    const t = {};
    TIERS.forEach((tier) => {
      t[tier.id] = tierTotal(tier.id);
    });
    return t;
  }, []);

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <div className="app-header">
        <div>
          <div className="sub">{CUSTOMER.name.split(' ').slice(0, 2).join(' ')} · {CUSTOMER.address.split(',')[0]}</div>
        </div>
        {tablet &&
        <button className="btn btn-primary" onClick={onPresent}>Present to Homeowner <Icon.arrow /></button>
        }
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TIERS.map((tier) => {
          const isSel = selected === tier.id;
          return (
            <div key={tier.id} className={`tier-card ${isSel ? 'selected' : ''}`} onClick={() => setSelected(tier.id)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="tier-label">{tier.label}</span>
                  {tier.recommended && <span className="pill brand">Recommended</span>}
                </div>
                <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${isSel ? 'var(--brand)' : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isSel && <span style={{ width: 8, height: 8, background: 'var(--brand)', borderRadius: 999 }} />}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{tier.name}</span>
              </div>
              <div className="tier-price">{fmt(totalsByTier[tier.id])}</div>
              <div className="tier-summary">{tier.summary}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4 }}>
                {tier.inclusions.slice(0, 3).map((inc, i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                    <Icon.check style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                    {inc}
                  </div>
                )}
                {tier.inclusions.length > 3 &&
                <div style={{ fontSize: 11, color: 'var(--text-3)', paddingLeft: 22 }}>+ {tier.inclusions.length - 3} more</div>
                }
              </div>
              <button
                className="btn btn-sm btn-ghost"
                style={{ alignSelf: 'flex-start', paddingLeft: 0, color: 'var(--brand)' }}
                onClick={(e) => {e.stopPropagation();setExpanded(expanded === tier.id ? null : tier.id);}}>
                
                {expanded === tier.id ? 'Hide line items' : 'View line items'} <Icon.arrow />
              </button>
              {expanded === tier.id &&
              <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 10, marginTop: 4 }}>
                  {LINE_ITEMS.filter((li) => li[tier.id] > 0).map((li) =>
                <div key={li.code} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 8, fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span className="mono" style={{ color: 'var(--text-3)' }}>{li.code}</span>
                      <span>{li.label}</span>
                      <span className="mono" style={{ fontVariantNumeric: 'tabular-nums' }}>{li.qty}{li.unit !== 'job' ? ` ${li.unit}` : ''} · {fmt(li.qty * li[tier.id])}</span>
                    </div>
                )}
                </div>
              }
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Add-ons</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {tier.addonsAvailable.slice(0, 2).map((a) => {
                    const key = `${tier.id}-${a}`;
                    const on = addons[key];
                    return (
                      <div key={a} onClick={(e) => {e.stopPropagation();setAddons({ ...addons, [key]: !on });}}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 0', cursor: 'pointer' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`, background: on ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-fg)' }}>
                          {on && <Icon.check style={{ width: 10, height: 10 }} />}
                        </div>
                        {a}
                      </div>);

                  })}
                </div>
              </div>
            </div>);

        })}
      </div>

      <div style={{ padding: '14px 16px 22px' }}>
        {!tablet ?
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary btn-lg btn-block" onClick={onPresent}>Present to Homeowner <Icon.arrow /></button>
            <button className="btn btn-block" onClick={onSign}><Icon.pen /> Approve & Sign</button>
          </div> :

        <button className="btn btn-block btn-lg" onClick={onSign}><Icon.pen /> Approve & Sign — {fmt(totalsByTier[selected])}</button>
        }
      </div>
    </div>);

}

// ─────── Tablet Presentation Mode ───────
function PresentMode({ brand, selected, setSelected, addons, onSign, onBack }) {
  const totalsByTier = useMemo(() => {
    const t = {};
    TIERS.forEach((tier) => {t[tier.id] = tierTotal(tier.id);});
    return t;
  }, []);
  const sel = TIERS.find((t) => t.id === selected);

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '20px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="btn btn-sm btn-ghost" onClick={onBack}><Icon.back /> Exit presentation</button>
      </div>

      <div style={{ padding: '14px 28px 0' }}>
        <div className="present-hero">
          <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Your roofing proposal</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6 }}>
            {CUSTOMER.name.split('&')[0].trim()} family residence
          </div>
          <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>{CUSTOMER.address}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 14 }}>
            {BRANDS[brand].tagline} · {BRANDS[brand].license}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px 0' }}>
        <div className="tier-grid">
          {TIERS.map((tier) => {
            const isSel = selected === tier.id;
            return (
              <div key={tier.id} className={`tier-card ${isSel ? 'selected' : ''}`} onClick={() => setSelected(tier.id)} style={{ minHeight: 380 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="tier-label">{tier.label}</span>
                  {tier.recommended && <span className="pill brand">Recommended</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{tier.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em' }}>{fmt(totalsByTier[tier.id])}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                  {tier.summary}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>What's included</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tier.inclusions.map((inc, i) =>
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                      <Icon.check style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                      <span>{inc}</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                  <Icon.shield style={{ color: 'var(--brand)' }} /> {tier.warranty}
                </div>
              </div>);

          })}
        </div>
      </div>

      <div style={{ padding: '24px 28px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Your selection</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{sel.name} — {fmt(totalsByTier[sel.id])}</div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={onSign} style={{ fontSize: 16, height: 56, padding: '0 28px' }}>
          <Icon.pen /> Approve & Sign
        </button>
      </div>
    </div>);

}

// ─────── Signature Pad ───────
function SignaturePad({ tablet, brand, rep, selected, onClose, onSent }) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState([]); // array of arrays of points
  const [drawing, setDrawing] = useState(false);
  const [legalName, setLegalName] = useState('');
  const [emailing, setEmailing] = useState(false);

  const total = tierTotal(selected);
  const tier = TIERS.find((t) => t.id === selected);

  // Drawing
  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top, p: e.touches?.[0]?.force ?? 0.5 };
  };

  const start = (e) => {
    e.preventDefault();
    setDrawing(true);
    setStrokes((s) => [...s, [getPos(e)]]);
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    setStrokes((s) => {
      const copy = s.slice();
      copy[copy.length - 1] = [...copy[copy.length - 1], getPos(e)];
      return copy;
    });
  };
  const end = () => setDrawing(false);

  // Render strokes onto canvas with smoothing & pressure-like width
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    if (c.width !== r.width * dpr) {
      c.width = r.width * dpr;
      c.height = r.height * dpr;
    }
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'oklch(0.18 0.05 250)';
    strokes.forEach((stroke) => {
      if (stroke.length < 2) {
        ctx.beginPath();
        ctx.arc(stroke[0].x, stroke[0].y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      // smoothed quad curve
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1],b = stroke[i];
        const dx = b.x - a.x,dy = b.y - a.y;
        const speed = Math.min(20, Math.hypot(dx, dy));
        const w = Math.max(0.7, 2.4 - speed * 0.07);
        ctx.lineWidth = w;
        ctx.beginPath();
        if (i === 1) {
          ctx.moveTo(a.x, a.y);
        } else {
          const prev = stroke[i - 2];
          const mx = (prev.x + a.x) / 2,my = (prev.y + a.y) / 2;
          ctx.moveTo(mx, my);
          const mx2 = (a.x + b.x) / 2,my2 = (a.y + b.y) / 2;
          ctx.quadraticCurveTo(a.x, a.y, mx2, my2);
        }
        if (i === 1) ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });
  }, [strokes]);

  const undo = () => setStrokes((s) => s.slice(0, -1));
  const clear = () => setStrokes([]);

  const submit = () => {
    setEmailing(true);
    setTimeout(() => {
      setEmailing(false);
      onSent({
        legalName: legalName || 'Marcus J. Whittaker',
        signedAt: '2026-04-28T11:48:22-05:00',
        total,
        tier
      });
    }, 1100);
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <div className="app-header" style={{ paddingTop: 18 }}>
        <div>
          <h1>Approve & Sign</h1>
          <div className="sub">{tier.name} — {fmt(total)} · {CUSTOMER.name}</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
            By signing below, you authorize {BRANDS[brand].name} to perform the work described in <strong>{tier.name}</strong> at the address on file for the total of <strong>{fmt(total)}</strong>. Permits, decking allowance, and warranty terms are listed in the attached scope.
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <label className="label">Legal name</label>
        <input className="input" placeholder="e.g. Marcus J. Whittaker" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="label" style={{ marginBottom: 0 }}>Signature</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={undo} disabled={!strokes.length}><Icon.undo /> Undo</button>
            <button className="btn btn-sm btn-ghost" onClick={clear} disabled={!strokes.length}><Icon.trash /> Clear</button>
          </div>
        </div>
        <div className="sig-pad" style={{ height: tablet ? 240 : 180 }}>
          <canvas
            ref={canvasRef}
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
          
          {!strokes.length &&
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: 12, pointerEvents: 'none' }}>
              Sign here with finger or stylus
            </div>
          }
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          IP capture · timestamp · device fingerprint will be recorded.
        </div>
      </div>

      <div style={{ padding: '20px 16px 22px' }}>
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={submit}
          disabled={!strokes.length || !legalName.trim() || emailing}>
          
          {emailing ? <><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> Sending…</> : <>Continue <Icon.arrow /></>}
        </button>
      </div>
    </div>);

}

// ─────── Missing items sheet (for incomplete inspection) ───────
function MissingSheet({ items, onClose }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="grabber" />
        <h3>Inspection incomplete</h3>
        <div style={{ padding: '0 16px 4px', fontSize: 12, color: 'var(--text-3)' }}>
          A few categories still need photos before we can generate a quote.
        </div>
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((c) =>
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8 }}>
              <Icon.alert style={{ color: 'var(--warn)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Need {c.required - (c.have || 0)} more · {c.sub}</div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '0 16px 8px' }}>
          <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>Continue inspecting</button>
        </div>
      </div>
    </>);

}

Object.assign(window, { QuoteLoading, Quote, PresentMode, SignaturePad, MissingSheet });