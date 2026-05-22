/* global React, Icon, NEEDS_TOPICS, CUSTOMER, APPOINTMENTS, fmt */
/* Needs Assessment surface — re-designed (May '26)
   ───────────────────────────────────────────────────────────────
   Craig: prior screen was clunky and overbearing. This is a
   conversational scratchpad. Each topic is an *area of guidance*
   ("Budget", "Timeline", …) — not a scripted question. CRM intake
   data prefills the top of each tile so the rep doesn't re-ask
   what was already captured on the call. Reps add their own notes
   on top — type or write by hand (cleaned up by AI on save). */

const { useState, useEffect, useRef } = window;

function NeedsAssessmentScreen({ fields, setFields, onBack, onContinue }) {
  // Per-topic rep scratchpad. Initialized empty — the CRM prefill displays
  // separately, above the scratchpad, so the rep can see what's known but
  // doesn't see a wall of text to "edit". Cleaner mental model.
  const [notes, setNotes] = useState(() => {
    const initial = {};
    NEEDS_TOPICS.forEach((t) => {initial[t.id] = '';});
    return initial;
  });
  const [editing, setEditing] = useState(null);
  // Craig (May '26 v2): dictation FAB. Rep speaks their way through the
  // conversation; AI parses each topic and offers to fill the scratchpad.
  const [dictating, setDictating] = useState(false);

  const applyDictation = (fills) => {
    setNotes((s) => {
      const next = { ...s };
      fills.forEach((f) => {next[f.id] = f.value;});
      return next;
    });
    if (setFields) {
      setFields((s) => {
        const next = { ...s };
        fills.forEach((f) => {next[f.id] = { ...(next[f.id] || {}), value: f.value, status: 'confirmed' };});
        return next;
      });
    }
    setDictating(false);
  };

  const editingDef = NEEDS_TOPICS.find((t) => t.id === editing) || null;

  const saveTopic = (id, val) => {
    setNotes((s) => ({ ...s, [id]: val }));
    if (setFields) {
      setFields((s) => ({ ...s, [id]: { ...(s[id] || {}), value: val, status: 'confirmed' } }));
    }
    setEditing(null);
  };

  const customer = CUSTOMER;
  const next = APPOINTMENTS.find((a) => a.status === 'next') || APPOINTMENTS[0];
  const lastName = customer.name.split(' ').slice(-1)[0];

  // Topics filled (excluding rep-only notes)
  const filledCount = NEEDS_TOPICS.filter((t) => !t.repOnly && (notes[t.id] || '').trim()).length;
  const totalCount = NEEDS_TOPICS.filter((t) => !t.repOnly).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Hero — frames it as listening, not interrogating */}
      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Get to know the {lastName}s
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.45 }}>
          A scratchpad for the conversation — not a script. We've pre-filled what intake captured.
          Add anything new in the notes area. Type or write — AI cleans up handwriting on save.
        </div>
      </div>

      {/* CRM intake summary band */}
      <div style={{ padding: '14px 16px 4px' }}>
        <div className="card" style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="ai-mark" />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.06, color: 'var(--text-3)', textTransform: 'uppercase' }}>
              From the intake call · 2 days ago
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <IntakeChip label="Lead" value="Storm canvass · Apr 12" />
            <IntakeChip label="Trade" value={next.trade} />
            <IntakeChip label="Insurance" value="State Farm" />
            <IntakeChip label="Est." value={next.est} />
          </div>
        </div>
      </div>

      {/* Topic scratchpad list */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {NEEDS_TOPICS.map((t) =>
          <TopicTile
            key={t.id}
            topic={t}
            note={notes[t.id]}
            onTap={() => setEditing(t.id)} />
          )}
      </div>

      <div style={{ padding: '14px 16px 24px' }}>
        {filledCount > 0 &&
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginBottom: 12 }}>
          {`${filledCount} of ${totalCount} topics noted`}
        </div>}
        <button className="btn btn-primary btn-lg btn-block" onClick={onContinue}>
          Continue to scope <Icon.arrow />
        </button>
      </div>
      </div>

      {/* Dictate FAB — same coordinates as the Build page Dictate FAB
           (centered horizontally, bottom: 32, brand pill). */}
      <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
        <button
          type="button"
          onClick={() => setDictating(true)}
          aria-label="Dictate needs assessment"
          title="Dictate"
          style={{
            pointerEvents: 'auto', width: 56, height: 56, padding: 0, borderRadius: 999,
            background: 'var(--brand)', color: 'var(--brand-fg)', border: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer'
          }}>
          <Icon.mic style={{ width: 22, height: 22 }} />
        </button>
      </div>

      {dictating &&
      <NeedsDictationSheet
        onClose={() => setDictating(false)}
        onApply={applyDictation} />}

      {editingDef &&
      <TopicSheet
        topic={editingDef}
        initial={notes[editingDef.id]}
        onClose={() => setEditing(null)}
        onSave={(v) => saveTopic(editingDef.id, v)} />}
    </div>);

}

// ─── Intake chip (small fact pulled from CRM) ─────────────────
function IntakeChip({ label, value }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 999,
      background: 'var(--surface)', border: '1px solid var(--border)',
      fontSize: 11, fontWeight: 600
    }}>
      <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
      <span>{value}</span>
    </span>);

}

// ─── Topic tile — area of guidance, not a question ────────────
function TopicTile({ topic, note, onTap }) {
  const hasNote = (note || '').trim().length > 0;
  return (
    <button
      onClick={onTap}
      className="card"
      style={{
        textAlign: 'left', cursor: 'pointer', width: '100%',
        padding: 14, border: 0,
        display: 'flex', flexDirection: 'column', gap: 8,
        background: 'var(--surface)'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{topic.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{topic.hint}</div>
        </div>
      </div>

      {topic.prefill &&
      <div style={{
        padding: '10px 12px', borderRadius: 8,
        background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
        borderLeft: '3px solid var(--brand)',
        fontSize: 12, lineHeight: 1.45
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: 0.06, opacity: 0.75, textTransform: 'uppercase', marginBottom: 3 }}>
            <Icon.sparkles style={{ width: 10, height: 10 }} />
            From intake call
          </div>
          <div style={{ fontStyle: 'italic' }}>{topic.prefill}</div>
        </div>}

      <div style={{
        padding: 12, borderRadius: 8,
        border: '1px dashed var(--border-strong)',
        background: hasNote ? 'var(--surface-2)' : 'transparent',
        minHeight: hasNote ? 'auto' : 56,
        fontSize: 13, lineHeight: 1.5,
        color: hasNote ? 'var(--text)' : 'var(--text-4)',
        display: 'flex', alignItems: 'center', gap: 8,
        whiteSpace: 'pre-wrap'
      }}>
        {hasNote ? note :
        <>
            <Icon.pen style={{ width: 12, height: 12, flexShrink: 0 }} />
            <span style={{ fontStyle: 'italic' }}>Tap to add notes · type or write</span>
          </>}
      </div>
    </button>);

}

// ─── Type / Write sheet ───────────────────────────────────────
function TopicSheet({ topic, initial, onClose, onSave }) {
  const [tab, setTab] = useState('write'); // write first — pen-and-paper habit
  const [typed, setTyped] = useState(initial || '');
  const [strokes, setStrokes] = useState([]);
  const [cleaning, setCleaning] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => {e.preventDefault();drawing.current = true;setStrokes((s) => [...s, [getPos(e)]]);};
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    setStrokes((s) => {
      const cp = s.slice();
      cp[cp.length - 1] = [...cp[cp.length - 1], getPos(e)];
      return cp;
    });
  };
  const end = () => {drawing.current = false;};

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const r = c.getBoundingClientRect();
    if (c.width !== r.width * dpr) {c.width = r.width * dpr;c.height = r.height * dpr;}
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.lineCap = 'round';ctx.lineJoin = 'round';
    ctx.strokeStyle = 'oklch(0.32 0.08 250)';
    ctx.lineWidth = 1.8;
    strokes.forEach((stroke) => {
      if (stroke.length < 2) {ctx.beginPath();ctx.arc(stroke[0].x, stroke[0].y, 1.2, 0, Math.PI * 2);ctx.fill();return;}
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        const a = stroke[i - 1],b = stroke[i];
        const mx = (a.x + b.x) / 2,my = (a.y + b.y) / 2;
        ctx.quadraticCurveTo(a.x, a.y, mx, my);
      }
      ctx.stroke();
    });
  }, [strokes]);

  // Simulated handwriting-recognition output, varies a bit by topic.
  const SAMPLE_CLEANUPS = {
    budget: 'Comfortable with mid-range; said no number but mentioned monthly payment under $400 would work.',
    timeline: 'Wants it done before late summer storms. Flexible on exact week.',
    deciders: 'Renée wants to see Better and Best options side-by-side. Marcus okay either way.',
    insurance: 'Adjuster coming Friday. Will send the report when received.',
    concerns: 'Worried about another north-slope leak. Wants impact-rated shingle option discussed.',
    constraints: 'Avoid Tuesdays — Renée on calls. Side gate latch sticks.',
    source: 'Talked to neighbor at 4419 who used us last fall — said the crew was clean.',
    rep_notes: 'Renée is more skeptical — lead with Care Plan story when she joins.'
  };

  const handleSave = () => {
    if (tab === 'type') {
      onSave(typed);
      return;
    }
    setCleaning(true);
    setTimeout(() => {
      const cleaned = SAMPLE_CLEANUPS[topic.id] || typed || '(handwriting recognized)';
      onSave(cleaned);
    }, 1000);
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>{topic.label}</h3>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{topic.hint}</div>
          </div>
        </div>

        {topic.prefill && <div style={{ padding: '10px 16px 0' }}>
            <div style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            borderLeft: '3px solid var(--brand)',
            fontSize: 11, lineHeight: 1.4, fontStyle: 'italic'
          }}>
              <strong style={{ fontStyle: 'normal' }}>From intake:</strong> {topic.prefill}
            </div>
          </div>}

        <div style={{ padding: '12px 16px 0' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface-2)', borderRadius: 10 }}>
            {[{ id: 'write', label: 'Write', Glyph: Icon.pen },
            { id: 'type', label: 'Type', Glyph: Icon.keyboard }].map((t) =>
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, height: 38, borderRadius: 8, border: 0,
                background: tab === t.id ? 'var(--surface)' : 'transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text-3)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none'
              }}>
                <t.Glyph /> {t.label}
              </button>
            )}
          </div>
        </div>

        {tab === 'type' &&
        <div style={{ padding: '14px 16px 0' }}>
            <textarea
            className="input"
            placeholder="Anything new from the conversation…"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            style={{ width: '100%', minHeight: 160, padding: 12, fontSize: 14, lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical' }} />
          </div>}

        {tab === 'write' &&
        <div style={{ padding: '14px 16px 0' }}>
            <div style={{ position: 'relative', width: '100%', height: 220, background: 'oklch(0.99 0.005 80)', borderRadius: 10, border: '1px dashed var(--border-strong)', overflow: 'hidden' }}>
              <canvas
              ref={canvasRef}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
              onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
              onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
              {!strokes.length &&
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: 12, pointerEvents: 'none', textAlign: 'center', padding: 16 }}>
                  Write with finger or stylus — we'll convert to text on save.
                </div>}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setStrokes(strokes.slice(0, -1))} disabled={!strokes.length}>
                <Icon.undo /> Undo
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setStrokes([])} disabled={!strokes.length}>
                <Icon.eraser /> Clear
              </button>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 10, color: 'var(--text-4)', alignSelf: 'center' }}>
                <span className="ai-mark" /> Cleaned on save
              </span>
            </div>
          </div>}

        <div style={{ padding: '16px 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-lg btn-block" onClick={onClose} disabled={cleaning}>Cancel</button>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleSave}
            disabled={cleaning || (tab === 'type' ? !typed.trim() : !strokes.length)}>
            {cleaning ?
            <><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 999, border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} /> AI cleaning…</> :
            'Save note'}
          </button>
        </div>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    </>);

}

// ─── Dictation sheet — multi-topic auto-fill ─────────────────
// Rep taps the mic FAB, talks through the conversation, AI parses and
// proposes a value for every topic it could detect. Each suggestion is a
// row with the original phrase and the cleaned-up note. Rep applies all
// or cherry-picks.
function NeedsDictationSheet({ onClose, onApply }) {
  const FULL_TRANSCRIPT =
  "Talked to Marcus and Renée — they're hoping to finish before late summer storms, flexible on the exact week. " +
  "Renée wants to see Better and Best options side-by-side, Marcus is okay either way. " +
  "They're with State Farm, claim's open, adjuster's coming Friday. " +
  "Main concern is another leak on the north slope — wants to talk impact-rated shingles. " +
  "On budget they said monthly under four hundred would work, no hard number. " +
  "Heads up — avoid Tuesdays, Renée's on calls. Side gate latch sticks.";

  const FILLS = [
  { id: 'budget', confidence: 0.84, value: 'Comfortable with mid-range; no number shared but monthly payment under $400 would work.' },
  { id: 'timeline', confidence: 0.92, value: 'Wants it done before late summer storms. Flexible on the exact week.' },
  { id: 'deciders', confidence: 0.95, value: 'Renée wants to see Better and Best options side-by-side. Marcus okay either way.' },
  { id: 'insurance', confidence: 0.97, value: 'State Farm. Claim open · adjuster coming Friday.' },
  { id: 'concerns', confidence: 0.93, value: 'Worried about another north-slope leak. Wants impact-rated shingle option discussed.' },
  { id: 'constraints', confidence: 0.88, value: 'Avoid Tuesdays — Renée on calls. Side gate latch sticks.' }];


  const [phase, setPhase] = useState('speaking'); // speaking | parsing | review
  const [transcript, setTranscript] = useState('');
  const [picked, setPicked] = useState(() => {
    const o = {};FILLS.forEach((f) => {o[f.id] = true;});return o;
  });

  useEffect(() => {
    let cancelled = false;
    const words = FULL_TRANSCRIPT.split(' ');
    let t = '',i = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      t += (i ? ' ' : '') + words[i];
      setTranscript(t);
      i++;
      if (i >= words.length) {
        clearInterval(id);
        setPhase('parsing');
        setTimeout(() => {if (!cancelled) setPhase('review');}, 900);
      }
    }, 45);
    return () => {cancelled = true;clearInterval(id);};
  }, []);

  const togglePick = (id) => setPicked((s) => ({ ...s, [id]: !s[id] }));
  const pickedCount = Object.values(picked).filter(Boolean).length;

  const handleApply = () => {
    const out = FILLS.filter((f) => picked[f.id]);
    onApply(out);
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '92%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon.mic />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>
              {phase === 'speaking' && 'Listening…'}
              {phase === 'parsing' && 'Structuring…'}
              {phase === 'review' && 'Review what we heard'}
            </h3>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {phase === 'speaking' && "Talk through the conversation — AI will sort it into topics."}
              {phase === 'parsing' && 'AI is matching what you said to each topic.'}
              {phase === 'review' && 'Uncheck anything that\u2019s off — we\u2019ll fill the scratchpad with the rest.'}
            </div>
          </div>
          {phase !== 'review' && <span className="rec-dot" style={{ flexShrink: 0 }} />}
        </div>

        <div style={{ padding: '12px 16px 6px' }}>
          <div style={{ padding: 14, background: 'var(--surface-2)', borderRadius: 10, minHeight: 88, maxHeight: 160, overflow: 'auto', fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
            {transcript || <span style={{ color: 'var(--text-3)' }}>Waiting for audio…</span>}
            {phase === 'speaking' &&
            <span style={{ display: 'inline-block', width: 6, height: 14, background: 'var(--text-3)', verticalAlign: 'middle', marginLeft: 4, animation: 'pulse 1s infinite' }} />}
          </div>
        </div>

        {phase === 'parsing' &&
        <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-3)' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 999, border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          Categorizing into topics…
        </div>}

        {phase === 'review' &&
        <div style={{ padding: '4px 16px 8px', overflow: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FILLS.map((f) => {
            const topic = NEEDS_TOPICS.find((t) => t.id === f.id);
            if (!topic) return null;
            const on = !!picked[f.id];
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => togglePick(f.id)}
                className="card"
                style={{
                  textAlign: 'left', cursor: 'pointer', padding: 12,
                  border: on ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                  background: on ? 'var(--brand-soft)' : 'var(--surface)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  color: 'inherit'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Checkbox checked={on} size={18} />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>{topic.label}</div>
                  <span className="pill brand" style={{ fontSize: 9, padding: '1px 6px' }}>AI · {Math.round(f.confidence * 100)}%</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4, paddingLeft: 26 }}>{f.value}</div>
              </button>);
          })}
        </div>}

        <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 8 }}>
          <button className="btn btn-lg btn-block" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={handleApply}
            disabled={phase !== 'review' || pickedCount === 0}>
            {phase === 'review' ?
            pickedCount === FILLS.length ? `Fill all ${FILLS.length} topics` : `Fill ${pickedCount} topic${pickedCount === 1 ? '' : 's'}` :
            'Fill topics'}
          </button>
        </div>
        <style>{'@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 50% { opacity: 0.35; } }'}</style>
      </div>
    </>);

}

Object.assign(window, { NeedsAssessmentScreen });