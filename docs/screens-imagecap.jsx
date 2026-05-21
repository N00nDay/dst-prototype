/* global React, Icon, ENVELOPE_FACETS, MEASUREMENT_SCHEMA, CATALOGS */
/* Image Capture & Annotation screen — first SOLVE tab.
   Replaces the old measurements-heavy Inspection tab. Reps shoot photos,
   annotate, and star the ones to include in the presentation. AI assigns
   starred photos to an envelope (Roofing / Siding / Gutters / Windows & Doors)
   and the rep refines condition + issues per envelope.
   Dictation captures quantities as Pending — they only set measurements
   after the rep taps Apply on the Build tab. */

const { useState, useMemo, useRef, useEffect } = window;

// ─── Condition scale + issue catalogs ─────────────────────────
// Three-step scale — keeps reps decisive at the door. (Craig, May '26.)
const CONDITIONS = [
{ id: 'good', label: 'Good', tone: 'oklch(0.7 0.13 175)' },
{ id: 'fair', label: 'Fair', tone: 'oklch(0.78 0.14 75)' },
{ id: 'poor', label: 'Poor', tone: 'oklch(0.7 0.16 40)' }];


// Issue catalogs — full lists per envelope, as supplied by Craig (May '26).
const FACET_ISSUES = {
  roofing: [
  'Missing Shingles', 'Curling', 'Granule Loss', 'Storm Damage',
  'Ice Damage', 'Hail Damage', 'Leaks', 'Flashing Issues',
  'Algae / Moss', 'Sagging', 'Valley Damage', 'Chimney Flashing',
  'Skylight Issues', 'Ventilation Issues', 'Ponding Water'],

  siding: [
  'Cracking', 'Warping', 'Fading', 'Moisture Damage',
  'Rot', 'Mold / Mildew', 'Missing Pieces', 'Impact Damage',
  'Pest Damage', 'Gaps / Seperation', 'Chalking', 'Buckling'],

  gutters: [
  'Leaking Corners', 'Not Properly Pitched', 'Clogging', 'Sagging',
  'Pulling Away', 'Missing Sections', 'Overflow', 'Ice Damming',
  'Rusting', 'Damaged Guards', 'Rot / Wood Decay', 'Peeling Paint',
  'Animal / Pest Entry', 'Holes / Gaps', 'Warping', 'Water Staining',
  'Mold / Mildew', 'Sagging Soffit Panels'],

  windoors: [
  'Foggy / Failed Seals', 'Drafty', 'Hard to Operate', 'Broken Hardware',
  'Condensation', 'Cracked Glass', 'Water Infiltration', 'Rotted Frames',
  'Missing Screens'],

  attic: [
  'Inadequate Ventilation', 'Insufficient Insulation', 'Moisture / Condensation',
  'Daylight Visible', 'Pest Activity', 'Mold / Mildew', 'Exposed Wiring',
  'Bath Fan Venting Into Attic', 'Frost Buildup', 'Stained Sheathing']

};

// AI confidence pill (mocked)
function AiPill({ confidence }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 999,
      background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
      fontSize: 9, fontWeight: 700, letterSpacing: 0.04
    }}>
      <span className="ai-mark" /> AI · {Math.round((confidence ?? 0.9) * 100)}%
    </span>);

}

// ─── ImageCaptureScreen ───────────────────────────────────────
function ImageCaptureScreen({
  items, setItems,
  envelope, setEnvelope,
  structures, activeStructureId, setActiveStructureId,
  onCapture, onDictate,
  onTapPhoto,
  onBack, onBackToScope, onContinueBuild,
  continueCascade, onContinue
}) {
  const [activeFacet, setActiveFacet] = useState('roofing');
  const [pickerOpen, setPickerOpen] = useState(null); // facetId for picker
  const [dismissFor, setDismissFor] = useState(null); // facetId pending dismissal

  // Active structure + position (for the chip + Continue copy).
  const activeIdx = Math.max(0, (structures || []).findIndex((s) => s.id === activeStructureId));
  const activeStructure = (structures || [])[activeIdx];
  const isMulti = (structures || []).length > 1;

  // Findings always show all four envelope categories — reps inspect the
  // entire envelope of every structure, regardless of which scopes of work
  // were tapped during Scope. (Craig, May '26: "Findings are not dictated
  // by the scopes of work being quoted, we inspect the entire envelope,
  // show all finding cards.")
  const visibleFacets = useMemo(() => {
    return ENVELOPE_FACETS.filter((f) => ['roofing', 'siding', 'gutters', 'windoors'].includes(f.id));
  }, []);

  // Photos are scoped to the active structure. Captures stay on the
  // building they were taken on and don't bleed into the next structure.
  // (Craig, May '26.)
  const structurePhotos = useMemo(() => {
    return (items || [])
      .map((it, gi) => ({ ...it, _globalIdx: gi }))
      .filter((it) => {
        if (!activeStructureId) return true;
        // Legacy items without a structureId attach to the first structure.
        if (!it.structureId) return activeIdx === 0;
        return it.structureId === activeStructureId;
      });
  }, [items, activeStructureId, activeIdx]);

  // Snap to a visible facet if none matches (defensive only).
  useEffect(() => {
    if (!visibleFacets.find((f) => f.id === activeFacet)) {
      setActiveFacet(visibleFacets[0]?.id || 'roofing');
    }
  }, [visibleFacets.map((f) => f.id).join('|')]);

  // Helpers ────────────────────────────────────────────────
  const togglePhoto = (idx, patch) => {
    setItems((s) => s.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };
  const setFacetField = (facetId, patch) => {
    setEnvelope((s) => ({ ...s, [facetId]: { ...(s?.[facetId] || {}), ...patch } }));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="scroll-area" data-screen-label="Inspect — Capture" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {/* Intro — page title up top. Structure switcher lives in the
            AppContextBar phase row (rendered globally in app.jsx). On
            multi-structure jobs the title names the active building so the
            rep always knows whose findings they're on, paired with the
            switcher chip in the header. (Craig, May '26.) */}
        <div style={{ padding: '14px 16px 4px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {isMulti ? `Inspecting ${activeStructure?.name || ''}` : 'Capture what you see'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.45 }}>
            Photograph any condition that matters. Star the ones to include in the homeowner presentation —
            AI groups starred photos into the right scope below.
            {isMulti && activeIdx < (structures.length - 1) ?
              ` When this structure is complete, advance to ${structures[activeIdx + 1].name}.` :
              ''}
          </div>
        </div>

      {/* Photo grid */}
      <div className="section-label">Captures</div>
      <PhotoGrid items={structurePhotos} onTapPhoto={onTapPhoto} onToggleStar={(globalIdx) => togglePhoto(globalIdx, { starred: !items[globalIdx].starred })} />

      {/* Findings cards — always one card per envelope category (Roofing,
          Siding, Gutters, Windows & Doors). We inspect the whole envelope
          regardless of which scopes are being quoted on this structure. */}
      <div className="section-label">Findings{isMulti ? ` · ${activeStructure?.name || ''}` : ''}</div>
      <div style={{ padding: '0 16px 110px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visibleFacets.map((f) =>
          <EnvelopeCard
            key={f.id}
            facet={f}
            env={envelope[f.id] || {}}
            items={items}
            structurePhotos={structurePhotos}
            onChange={(patch) => setFacetField(f.id, patch)}
            onOpenPicker={() => setPickerOpen(f.id)}
            onDismiss={() => setDismissFor(f.id)} />
          )}
      </div>

      {/* Capture FABs — Photo + Dictate */}
      <CaptureFabs onCapture={() => onCapture(activeFacet)} />

      {/* Manual-attach photo picker per envelope */}
      {pickerOpen &&
        <AttachPicker
          facetId={pickerOpen}
          items={items}
          structurePhotos={structurePhotos}
          env={envelope[pickerOpen] || {}}
          onToggle={(idx) => {
            const it = items[idx];
            const env = envelope[pickerOpen] || {};
            const removed = new Set(env.removed || []);
            const added = new Set(env.added || []);
            const key = String(idx);
            const autoMatch = !!it.starred && it.facetId === pickerOpen;
            const currentlyAttached = (autoMatch && !removed.has(key)) || added.has(key);
            if (currentlyAttached) {
              // Detach from this facet only — leave the photo's underlying
              // star / facetId alone so it remains available elsewhere.
              if (autoMatch) removed.add(key);
              added.delete(key);
            } else {
              // Attach to this facet AND star the photo so it surfaces in
              // the homeowner presentation. Don't overwrite an existing
              // facetId — just promote it into this facet's added set so
              // the photo can live on multiple finding cards if needed.
              if (!it.starred) togglePhoto(idx, { starred: true });
              if (it.facetId === pickerOpen) {
                removed.delete(key);
              } else {
                added.add(key);
              }
            }
            setFacetField(pickerOpen, { added: [...added], removed: [...removed] });
          }}
          onClose={() => setPickerOpen(null)} />}

      {/* Dismiss-reason drawer — reps drop a scope they don't want surfaced
          (e.g. perfect roof). Reason code becomes part of the audit trail. */}
      {dismissFor &&
        <DismissReasonSheet
          facet={ENVELOPE_FACETS.find((f) => f.id === dismissFor)}
          onClose={() => setDismissFor(null)}
          onConfirm={(reason) => {
            setFacetField(dismissFor, { dismissed: reason });
            setDismissFor(null);
          }} />}
      </div>

      {/* Continue cascade — advances to next structure or to Build.
          Gated until the structure has at least one photo AND every
          visible finding card carries a condition + memo OR is
          dismissed. Sub-line names what's missing so the rep knows
          why they're blocked. */}
      {continueCascade && onContinue && (() => {
        const photoCount = structurePhotos.length;
        const incompleteFindings = visibleFacets.filter((f) => {
          const e = envelope[f.id] || {};
          if (e.dismissed) return false;
          const hasCondition = !!e.condition;
          const hasNotes = (e.notes || '').trim().length > 0;
          return !(hasCondition && hasNotes);
        });
        const needsPhoto = photoCount === 0;
        const ready = !needsPhoto && incompleteFindings.length === 0;
        let gateSub = '';
        if (!ready) {
          const bits = [];
          if (needsPhoto) bits.push('1 photo');
          if (incompleteFindings.length > 0) bits.push(`${incompleteFindings.length} finding${incompleteFindings.length === 1 ? '' : 's'} (condition + memo or dismiss)`);
          gateSub = `Add ${bits.join(' and ')} to continue`;
        }
        return (
          <window.ContinueBar
            tablet={true}
            label={continueCascade.label}
            sub={ready ? '' : gateSub}
            enabled={ready}
            onContinue={onContinue}
            onBack={onBackToScope || onBack}
            backLabel="Back to Scope" />);
      })()}
    </div>);

}

// ─── Photo grid ───────────────────────────────────────────────
function PhotoGrid({ items, onTapPhoto, onToggleStar }) {
  // Photos only. Empty on load — the rep populates the grid by tapping Photo.
  // (Craig, May '26.) Items may carry `_globalIdx` so callbacks reach the
  // right entry in the parent array even when this grid is filtered by
  // structure.
  const photos = items.
  map((it, idx) => ({ it, idx: it._globalIdx ?? idx })).
  filter(({ it }) => it.source !== 'mic');
  if (photos.length === 0) {
    return (
      <div style={{ padding: '0 16px' }}>
        <div className="card" style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)', borderStyle: 'dashed', lineHeight: 1.6 }}>
          No captures yet. Tap <strong>Photo</strong> below to take your first picture.
        </div>
      </div>);

  }
  return (
    <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {photos.map(({ it, idx }) =>
      <PhotoTile key={idx} item={it} idx={idx} onTap={() => onTapPhoto(idx)} onToggleStar={() => onToggleStar(idx)} />
      )}
    </div>);

}

function PhotoTile({ item, idx, onTap, onToggleStar }) {
  const starred = !!item.starred;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      <button
        type="button"
        onClick={onTap}
        style={{ width: '100%', textAlign: 'left', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', display: 'block' }}>
        <div className="placeholder-photo" style={{ height: 92, borderRadius: 0, border: 0, fontSize: 9 }}>
          {item.facetId?.slice(0, 4) || 'capt'}-{idx + 1}.jpg
        </div>
      </button>
      <button
        type="button"
        onClick={onToggleStar}
        aria-label={starred ? 'Unstar photo' : 'Star photo'}
        style={{
          position: 'absolute', top: 6, right: 6,
          width: 26, height: 26, borderRadius: 999, border: 0,
          background: starred ? 'oklch(0.75 0.17 75)' : 'rgba(0,0,0,0.55)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
        }}>
        <Icon.star style={{ fill: starred ? '#fff' : 'none', width: 13, height: 13 }} />
      </button>
    </div>);

}

// ─── Annotate sheet ───────────────────────────────────────────
function AnnotateSheet({ photo, onClose, onChange }) {
  const canvasRef = useRef(null);
  const [strokes, setStrokes] = useState(photo.annotations || []);
  const drawing = useRef(false);
  const isDictation = photo.source === 'mic';

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => {if (isDictation) return;e.preventDefault();drawing.current = true;setStrokes((s) => [...s, [getPos(e)]]);};
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
    ctx.strokeStyle = 'oklch(0.65 0.22 30)';
    ctx.lineWidth = 4;
    strokes.forEach((stroke) => {
      if (stroke.length < 2) {ctx.beginPath();ctx.arc(stroke[0].x, stroke[0].y, 2.5, 0, Math.PI * 2);ctx.fill();return;}
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

  const save = () => {onChange({ annotations: strokes });onClose();};
  const starred = !!photo.starred;

  return (
    <div className="annotate-fullscreen">
      {/* Header: title (left), Undo / Clear / Star (right) */}
      <div style={{
        flexShrink: 0,
        padding: '14px 16px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.4)', color: '#fff'
      }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'rgba(255,255,255,0.12)', color: '#fff', border: 0,
            height: 36, width: 36, borderRadius: 999, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}><Icon.x /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.label || 'Photo'}</div>
          {photo.caption && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.caption}</div>}
        </div>
        {!isDictation &&
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <button
            type="button"
            onClick={() => setStrokes(strokes.slice(0, -1))}
            disabled={!strokes.length}
            aria-label="Undo"
            style={{
              height: 36, width: 36, borderRadius: 999, border: 0, padding: 0,
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              opacity: strokes.length ? 1 : 0.35,
              cursor: strokes.length ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><Icon.undo /></button>
            <button
            type="button"
            onClick={() => setStrokes([])}
            disabled={!strokes.length}
            aria-label="Clear"
            style={{
              height: 36, width: 36, borderRadius: 999, border: 0, padding: 0,
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              opacity: strokes.length ? 1 : 0.35,
              cursor: strokes.length ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}><Icon.eraser /></button>
          </div>}
        <button
          type="button"
          onClick={() => onChange({ starred: !starred })}
          aria-label={starred ? 'Unstar photo' : 'Star photo'}
          style={{
            height: 36, width: 36, borderRadius: 999, border: 0, padding: 0,
            background: starred ? 'oklch(0.75 0.17 75)' : 'rgba(255,255,255,0.12)',
            color: '#fff', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          <Icon.star style={{ fill: starred ? '#fff' : 'none' }} />
        </button>
      </div>

      {/* Canvas: flex-fills remaining height */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative',
        background: isDictation ? 'var(--brand-soft)' : '#1a1a1a',
        overflow: 'hidden'
      }}>
        {isDictation ?
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-soft-fg)', gap: 8 }}>
            <Icon.mic />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Voice dictation</span>
            <span style={{ fontSize: 11, opacity: 0.8 }}>No photo to annotate</span>
          </div> :
        <>
            <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(135deg, oklch(0.78 0.01 80) 0 14px, oklch(0.72 0.01 80) 14px 28px)',
            opacity: 0.55
          }} />
            <div style={{
            position: 'absolute', top: 14, left: 14,
            fontSize: 10, fontWeight: 700, color: 'var(--text-2)',
            background: 'var(--surface)', padding: '3px 7px', borderRadius: 4
          }}>{photo.facetId?.slice(0, 4) || 'capt'}.jpg</div>
            <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
            onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
            <div style={{
            position: 'absolute', bottom: 12, left: 0, right: 0,
            textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.65)',
            pointerEvents: 'none', letterSpacing: 0.04
          }}>Mark areas of concern</div>
          </>}
      </div>

      {/* Footer: Cancel / Save \u2014 always visible, no overflow */}
      <div style={{
        flexShrink: 0,
        padding: '12px 16px 16px',
        display: 'flex', gap: 8,
        background: 'rgba(0,0,0,0.45)',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <button
          className="btn btn-lg btn-block"
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 0 }}>
          Cancel
        </button>
        <button className="btn btn-primary btn-lg btn-block" onClick={save}>Save</button>
      </div>
    </div>);

}

// ─── Envelope card ────────────────────────────────────────────
function EnvelopeCard({ facet, env, items, structurePhotos, onChange, onOpenPicker, onDismiss }) {
  // Photos attached: starred items with matching facetId, minus removed, plus added.
  // Dictations never surface as photo thumbnails. (Craig, May '26.)
  // Photo attachment is constrained to the active structure — photos
  // shot on one building never bleed into another's findings.
  const removed = new Set(env.removed || []);
  const added = new Set(env.added || []);
  const allowedSet = new Set((structurePhotos || items).map((it) => it._globalIdx ?? -1));
  const attachedIndices = [];
  items.forEach((it, idx) => {
    if (it.source === 'mic') return;
    // Restrict to photos from the active structure when structurePhotos
    // is provided. Legacy items are included via the same predicate.
    if (structurePhotos && !allowedSet.has(idx)) return;
    const key = String(idx);
    const autoMatch = !!it.starred && it.facetId === facet.id;
    if (autoMatch && !removed.has(key)) attachedIndices.push(idx);else
    if (added.has(key)) attachedIndices.push(idx);
  });

  const issues = env.issues || [];
  // Issue pills were removed (Craig, May '26 — too cumbersome).
  // Existing issues kept on env so older drafts don't lose data.

  const condition = env.condition || null;
  const cond = CONDITIONS.find((c) => c.id === condition);
  const dismissed = !!env.dismissed;

  // ── Dismissed state ───────────────────────────────
  // When a rep dismisses a finding (e.g. roof is in great shape, no work
  // needed) the card collapses to a single quiet row showing the reason
  // and an Undo affordance. (Craig, May '26.)
  if (dismissed) {
    return (
      <div className="card" style={{
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface-2)', borderStyle: 'dashed'
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'var(--surface)', color: 'var(--text-3)', border: '1px solid var(--border)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon.check style={{ width: 13, height: 13 }} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            {facet.label} · dismissed
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1, lineHeight: 1.35 }}>
            {env.dismissed?.reasonLabel || env.dismissed?.reason || 'Not applicable for this structure'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange({ dismissed: null })}
          style={{
            height: 28, padding: '0 10px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border-strong)',
            color: 'var(--text-2)', fontSize: 11, fontWeight: 700, cursor: 'pointer'
          }}>Undo</button>
      </div>);

  }

  const ScopeIconCmp = window.ScopeIcon?.[facet.id];
  const hasDictation = !!env.notes;
  const parsedCount = (env.parsedFromMemo || []).length;

  return (
    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ─── Header strip ───────────────────────────────────────
          Scope icon + title + segmented condition pills + dismiss.
          Subline below the title surfaces the carry-forward state at a
          glance ("2 photos · 4 materials parsed") instead of just photo
          count, so the rep doesn't have to scan the card to know what's
          on it. */}
      <div style={{ padding: '12px 14px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {ScopeIconCmp &&
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: cond ? `color-mix(in srgb, ${cond.tone} 14%, var(--surface-2))` : 'var(--surface-2)',
          color: cond ? cond.tone : 'var(--text-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ScopeIconCmp size={26} />
        </div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{facet.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {attachedIndices.length} photo{attachedIndices.length === 1 ? '' : 's'}
            {parsedCount > 0 &&
            <> · <span style={{ color: 'var(--success)', fontWeight: 700 }}>{parsedCount} material{parsedCount === 1 ? '' : 's'} parsed</span></>}
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${facet.label} findings`}
          title="Dismiss this finding"
          style={{
            width: 28, height: 28, borderRadius: 8, padding: 0,
            background: 'transparent', color: 'var(--text-3)',
            border: '1px solid var(--border)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0
          }}>
          <Icon.x style={{ width: 12, height: 12 }} />
        </button>
      </div>

      {/* Condition selector — own row, full width, equal-width buttons.
          Reps tap big targets, fast. */}
      <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6 }}>
        {CONDITIONS.map((c) => {
          const active = c.id === condition;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange({ condition: active ? null : c.id })}
              aria-pressed={active}
              style={{
                flex: 1, minWidth: 0,
                padding: '10px 8px', borderRadius: 8,
                border: active ? `1.5px solid ${c.tone}` : '1px solid var(--border)',
                background: active ? c.tone : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-2)',
                fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em',
                cursor: 'pointer'
              }}>{c.label}</button>);
        })}
      </div>

      {/* ─── Dictation panel ────────────────────────────────────
          Pre-dictation: a single wide CTA centered in the card.
          Post-dictation: notes + parsed materials side-by-side on
          tablet (auto-fit collapses to one column on narrower screens).
          Grouping notes + parsed in one bordered section makes it clear
          they're both outputs of the same dictation action. */}
      <DictationPanel
        facet={facet}
        env={env}
        onChange={onChange}
        hasDictation={hasDictation} />

      {/* ─── Photos strip ───────────────────────────────────────
          Single tight row: thumbnails inline with the [+ add] tile.
          No big section header eating vertical space. */}
      <div style={{
        padding: '10px 14px 12px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
            Photos
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>
            {attachedIndices.length} in presentation
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
          {attachedIndices.map((idx) => {
            const it = items[idx];
            const key = String(idx);
            return (
              <div key={idx} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1 / 1', background: 'oklch(0.78 0.01 80)' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'repeating-linear-gradient(135deg, oklch(0.85 0.02 80) 0 4px, oklch(0.8 0.02 80) 4px 8px)'
                }} />
                <button
                  type="button"
                  onClick={() => {
                    const isAutoMatch = it.starred && it.facetId === facet.id;
                    const r = new Set(env.removed || []);
                    const a = new Set(env.added || []);
                    if (isAutoMatch) r.add(key);else a.delete(key);
                    onChange({ added: [...a], removed: [...r] });
                  }}
                  aria-label="Remove from scope"
                  style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 16, height: 16, borderRadius: 999,
                    background: 'rgba(0,0,0,0.65)', color: '#fff', border: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 9, padding: 0
                  }}>
                  <Icon.x />
                </button>
              </div>);
          })}
          <button
            type="button"
            onClick={onOpenPicker}
            aria-label="Add photos"
            style={{
              position: 'relative', aspectRatio: '1 / 1', padding: 0,
              borderRadius: 4, border: '1px dashed var(--border-strong)',
              background: 'var(--surface)', color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            <Icon.plus />
          </button>
        </div>
      </div>
    </div>);

}

// ─── Dictation panel ──────────────────────────────────────────
// Wraps the dictate state machine + the two outputs (notes + parsed
// materials) in one bordered section. Empty state is a single CTA;
// post-dictation, the two outputs sit side-by-side via auto-fit grid so
// the card stays compact on tablet and stacks on phone.
function DictationPanel({ facet, env, onChange, hasDictation }) {
  const [status, setStatus] = useState(hasDictation ? 'ready' : 'idle');

  const beginDictate = () => {
    setStatus('recording');
    setTimeout(() => {
      const mock = MOCK_DICTATION_BY_FACET[facet.id] || MOCK_DICTATION_BY_FACET.roofing;
      const notesNext = mock.notes || mock;
      if (Array.isArray(mock.parsed)) {
        const updated = applyParsedFromMemo({ ...env, notes: notesNext }, mock.parsed);
        onChange({ notes: notesNext, lineItems: updated.lineItems, parsedFromMemo: updated.parsedFromMemo });
      } else {
        onChange({ notes: notesNext });
      }
      setStatus('ready');
    }, 1400);
  };

  // Empty state — centered CTA, no chrome.
  if (status === 'idle' && !hasDictation) {
    return (
      <div style={{
        padding: '14px 14px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={beginDictate}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 18px', borderRadius: 999,
            border: 0, background: 'var(--brand)', color: 'var(--brand-fg)',
            cursor: 'pointer',
            fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
            boxShadow: '0 6px 16px rgba(20,15,5,0.12)'
          }}>
          <Icon.mic style={{ width: 16, height: 16 }} /> Dictate findings for {facet.label}
        </button>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.45, textAlign: 'center', maxWidth: 480 }}>
          AI parses your memo into homeowner-facing notes and quantified materials. You can edit either side after.
        </div>
      </div>);
  }

  // Recording — single pulsing strip.
  if (status === 'recording') {
    return (
      <div style={{
        margin: '0 14px 14px',
        padding: '14px 16px', borderRadius: 10,
        border: '1.5px solid var(--brand)',
        background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, animation: 'micPulse 1.2s ease-in-out infinite'
        }}><Icon.mic style={{ width: 14, height: 14 }} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Listening…</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Transcribing and parsing materials</div>
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
          {[0, 1, 2, 3, 4].map((i) =>
            <span key={i} style={{
              width: 3, borderRadius: 2, background: 'var(--brand)',
              animation: `barpulse 0.9s ease-in-out ${i * 0.12}s infinite`
            }} />
          )}
        </div>
      </div>);
  }

  // Ready — two-column grid: notes on the left, parsed materials on the
  // right. auto-fit + minmax collapses to one column when card is narrow.
  const parsed = env.parsedFromMemo || [];
  return (
    <div style={{
      padding: '12px 14px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 10
    }}>
      {/* Notes pane */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
            Memo
          </span>
        </div>
        <textarea
          value={env.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Edit your dictated findings…"
          rows={5}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', fontSize: 12, lineHeight: 1.5,
            fontFamily: 'inherit', resize: 'vertical', minHeight: 96,
            outline: 'none'
          }} />
      </div>
      {/* Parsed materials pane */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
            Materials parsed
          </span>
          {parsed.length > 0 &&
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
            · carried to Build
          </span>}
        </div>
        {parsed.length > 0 ?
        <ParsedFromMemoList
          facetId={facet.id}
          items={parsed}
          lineItems={env.lineItems || {}}
          onChange={onChange} /> :
        <div style={{
          padding: '14px 12px', borderRadius: 8,
          border: '1px dashed var(--border-strong)',
          background: 'var(--surface-2)', color: 'var(--text-3)',
          fontSize: 11, fontWeight: 600, lineHeight: 1.45, textAlign: 'center'
        }}>
          AI didn't find quantifiable materials in this memo. Add them manually on Build · Materials.
        </div>}
      </div>
    </div>);
}

// ─── Notes block — two-step dictation ────────────────────────
// Step 1: rep taps "Dictate findings" — mic captures voice (mocked here as a
// short processing spinner). Step 2: transcribed text appears in an editable
// textarea so the rep can clean it up before it ships in the report.
// (Craig, May '26.)
// Mock dictation output. In production, the rep's audio is transcribed and
// routed through an LLM with structured outputs — `notes` is the qualitative
// narrative the homeowner sees, `parsed` is the structured line items the
// LLM pulled out and routes onto that scope's Build · Materials list.
// For the prototype the LLM is faked: every facet returns a fixed parse so
// the carry-forward UX is testable without a real STT/LLM round trip.
const MOCK_DICTATION_BY_FACET = {
  roofing: {
    notes:
      "Asphalt shingles showing widespread granule loss on south and west " +
      "exposures. Several lifted shingles near the ridge. Step flashing at the " +
      "chimney is loose and rusting. Pipe boots are cracked and should be replaced.",
    parsed: [
      { catalogId: 'pipe_boot_14',  section: 'materials', label: 'Pipe Boot 1–4″',     qty: 4,  unit: 'PC' },
      { catalogId: 'step_flash_pc', section: 'materials', label: 'Step Flashing',      qty: 8,  unit: 'PC' }
    ]
  },
  siding: {
    notes:
      "Vinyl siding on the north elevation has impact damage near the hose bib " +
      "and two panels are pulling away at the bottom course. Chalking visible " +
      "across the west wall. No rot at the trim.",
    parsed: [
      { catalogId: 'siding_panel', section: 'materials', label: 'Replacement panels', qty: 2, unit: 'EA' }
    ]
  },
  gutters: {
    notes:
      "Gutters along the front are sagging and pulling away from the fascia " +
      "near the downspout. Inside corner is leaking. Several spike-and-ferrule " +
      "hangers have backed out. Recommend new seamless run with hidden hangers.",
    parsed: [
      { catalogId: 'gutter_seamless', section: 'materials', label: 'Seamless gutter run', qty: 48, unit: 'FT' },
      { catalogId: 'downspout',       section: 'materials', label: 'Downspout',           qty: 2,  unit: 'EA' }
    ]
  },
  windoors: {
    notes:
      "Front entry door has a failed weatherstrip and visible daylight at the " +
      "threshold. Two upstairs windows have foggy glass indicating failed seals. " +
      "All other units operate smoothly with intact screens.",
    parsed: [
      { catalogId: 'weatherstrip', section: 'materials', label: 'Door weatherstrip', qty: 1, unit: 'EA' },
      { catalogId: 'igu_replace',  section: 'materials', label: 'IGU replacement',   qty: 2, unit: 'EA' }
    ]
  },
  attic: {
    notes:
      "Attic insulation is uneven with bare spots near the eaves. Bath fan " +
      "vents directly into the attic. Ridge vent is partially blocked. No " +
      "active moisture but staining on the north sheathing suggests past leaks.",
    parsed: [
      { catalogId: 'blown_insulation', section: 'materials', label: 'Blown-in insulation top-up', qty: 600, unit: 'SF' },
      { catalogId: 'bath_fan_vent',    section: 'materials', label: 'Bath fan vent kit',          qty: 1,   unit: 'EA' }
    ]
  }
};

// Apply parsed line items to the envelope. If the catalog id already exists
// in env.lineItems[section] (the auto-derived take-off does this for most
// roofing/siding items), update the qty in place; otherwise append a new
// row tagged `fromMemo` so the Build screen knows where it came from. We
// also stash the parsed list on env.parsedFromMemo so the finding card can
// echo the carry-forward summary without re-parsing.
function applyParsedFromMemo(env, parsed) {
  const lineItems = { ...(env.lineItems || {}) };
  (parsed || []).forEach((p) => {
    const sec = p.section || 'materials';
    const rows = [...(lineItems[sec] || [])];
    const idx = rows.findIndex((r) => r.id === p.catalogId);
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], qty: p.qty, fromMemo: true };
    } else {
      rows.push({ id: p.catalogId, qty: p.qty, fromMemo: true, custom: { name: p.label, unit: p.unit, price: 0 } });
    }
    lineItems[sec] = rows;
  });
  return { ...env, lineItems, parsedFromMemo: parsed || [] };
}

// ─── Parsed-from-memo carry-forward list ──────────────────────
// First-class editable rows shown on the EnvelopeCard after dictation
// runs. Each row carries the catalog item the LLM matched plus the qty
// it pulled out. The rep can:
//   - edit qty inline via the stepper
//   - tap the material name to swap it for a different catalog item
//   - remove the row from this summary (the line item stays on Build)
// Mutations also flow through to env.lineItems so Build · Materials
// stays in sync with what shows up here.
function ParsedFromMemoList({ facetId, items, lineItems, onChange }) {
  const [pickerFor, setPickerFor] = useState(null); // catalogId being changed
  const catalog = (typeof CATALOGS !== 'undefined' && CATALOGS[facetId]?.materials) || [];

  const updateItem = (catalogId, patch) => {
    const next = (items || []).map((it) => it.catalogId === catalogId ? { ...it, ...patch } : it);
    const lineItemsNext = { ...(lineItems || {}) };
    const sec = patch.section || (items.find((i) => i.catalogId === catalogId)?.section || 'materials');
    const rows = [...(lineItemsNext[sec] || [])];
    const rowIdx = rows.findIndex((r) => r.id === catalogId);
    if (rowIdx >= 0 && patch.qty != null) {
      rows[rowIdx] = { ...rows[rowIdx], qty: patch.qty };
      lineItemsNext[sec] = rows;
    }
    onChange({ parsedFromMemo: next, lineItems: lineItemsNext });
  };

  const swapMaterial = (oldCatalogId, newCatalogEntry) => {
    if (!newCatalogEntry) return;
    const next = (items || []).map((it) => it.catalogId === oldCatalogId ?
      { ...it, catalogId: newCatalogEntry.id, label: newCatalogEntry.name, unit: newCatalogEntry.unit } :
      it);
    const lineItemsNext = { ...(lineItems || {}) };
    Object.keys(lineItemsNext).forEach((sec) => {
      lineItemsNext[sec] = (lineItemsNext[sec] || []).map((r) => r.id === oldCatalogId ?
        { ...r, id: newCatalogEntry.id } :
        r);
    });
    onChange({ parsedFromMemo: next, lineItems: lineItemsNext });
    setPickerFor(null);
  };

  const removeItem = (catalogId) => {
    const next = (items || []).filter((it) => it.catalogId !== catalogId);
    onChange({ parsedFromMemo: next });
  };

  return (
    <div>
      <div style={{
        borderRadius: 10, background: 'var(--success-bg)', border: '1px solid var(--success)',
        overflow: 'hidden'
      }}>
        {items.map((it, idx) =>
        <div key={it.catalogId} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px',
          borderTop: idx === 0 ? 'none' : '1px solid color-mix(in srgb, var(--success) 30%, transparent)'
        }}>
            {/* Material name — click to swap */}
            <button
              type="button"
              onClick={() => setPickerFor(pickerFor === it.catalogId ? null : it.catalogId)}
              title="Change material"
              style={{
                flex: 1, minWidth: 0, textAlign: 'left',
                background: 'transparent', border: 0, padding: 0,
                color: 'var(--success)', cursor: catalog.length ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em'
              }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
              {catalog.length > 0 &&
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>}
            </button>
            {/* Qty stepper */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: '#fff', border: '1px solid var(--success)', borderRadius: 6,
              padding: 1, flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => updateItem(it.catalogId, { qty: Math.max(0, (Number(it.qty) || 0) - 1) })}
                aria-label="Decrease quantity"
                style={{ width: 20, height: 22, border: 0, background: 'transparent', color: 'var(--success)', fontSize: 14, fontWeight: 700, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                −
              </button>
              <input
                type="number"
                value={it.qty == null ? '' : it.qty}
                onChange={(e) => updateItem(it.catalogId, { qty: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                style={{
                  width: 36, height: 22, border: 0, outline: 'none', textAlign: 'center',
                  background: 'transparent', color: 'var(--text)',
                  fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', padding: 0
                }} />
              <button
                type="button"
                onClick={() => updateItem(it.catalogId, { qty: (Number(it.qty) || 0) + 1 })}
                aria-label="Increase quantity"
                style={{ width: 20, height: 22, border: 0, background: 'transparent', color: 'var(--success)', fontSize: 14, fontWeight: 700, padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </button>
            </div>
            {it.unit &&
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--success)', letterSpacing: 0.04,
              textTransform: 'uppercase', flexShrink: 0
            }}>{it.unit}</span>}
            {/* Remove */}
            <button
              type="button"
              onClick={() => removeItem(it.catalogId)}
              aria-label={`Remove ${it.label}`}
              title="Remove from summary (Build line item stays)"
              style={{
                width: 22, height: 22, padding: 0, borderRadius: 6,
                background: 'transparent', color: 'var(--success)',
                border: '1px solid var(--success)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0
              }}>
              <Icon.x style={{ width: 10, height: 10 }} />
            </button>
          </div>
        )}
      </div>
      {pickerFor && catalog.length > 0 &&
      <MaterialPickerSheet
        currentLabel={(items || []).find((p) => p.catalogId === pickerFor)?.label || ''}
        catalog={catalog}
        onPick={(entry) => swapMaterial(pickerFor, entry)}
        onClose={() => setPickerFor(null)} />}
    </div>);
}

// ─── Bottom-drawer material picker ────────────────────────────
// Replaces the inline catalog popover. Lets the rep swap which catalog
// item a memo-parsed line is mapped to — searchable, grouped, full-height.
function MaterialPickerSheet({ currentLabel, catalog, onPick, onClose }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    if (!needle) return catalog;
    return catalog.filter((c) => c.name.toLowerCase().includes(needle) || (c.group || '').toLowerCase().includes(needle));
  }, [q, catalog]);
  const byGroup = useMemo(() => {
    const g = {};
    for (const c of filtered) {
      const k = c.group || 'Other';
      (g[k] = g[k] || []).push(c);
    }
    return g;
  }, [filtered]);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '80%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 4px' }}>Change material</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
            Currently: <strong style={{ color: 'var(--text-2)' }}>{currentLabel || '—'}</strong>
          </div>
          <input
            type="text"
            value={q}
            placeholder="Search materials…"
            onChange={(e) => setQ(e.target.value)}
            style={{ width: '100%', height: 38, border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', fontSize: 14, background: 'var(--surface)', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(byGroup).length === 0 &&
          <div style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
            No matches for "{q}".
          </div>}
          {Object.entries(byGroup).map(([group, rows]) =>
          <div key={group}>
              <div style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 4 }}>{group}</div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {rows.map((c, i) =>
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(c)}
                style={{
                  width: '100%', textAlign: 'left', background: 'transparent',
                  border: 0, borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  padding: '10px 12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.005em' }}>{c.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.04, textTransform: 'uppercase', flexShrink: 0 }}>{c.unit}</span>
                </button>
              )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>);
}

function NotesBlock({ facetId, env, onChange, onApplyParsed }) {
  const [status, setStatus] = useState(env.notes ? 'ready' : 'idle');
  // status: 'idle' | 'recording' | 'ready'

  const beginDictate = () => {
    setStatus('recording');
    // Mock processing — in production this is replaced by streaming STT.
    setTimeout(() => {
      const mock = MOCK_DICTATION_BY_FACET[facetId] || MOCK_DICTATION_BY_FACET.roofing;
      onChange({ notes: mock.notes || mock });
      if (onApplyParsed && Array.isArray(mock.parsed)) onApplyParsed(mock.parsed);
      setStatus('ready');
    }, 1400);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Notes</div>
        {status === 'ready' && env.notes &&
        <button
          type="button"
          onClick={beginDictate}
          style={{
            marginLeft: 'auto', height: 24, padding: '0 8px',
            border: '1px solid var(--border)', background: 'var(--surface)',
            borderRadius: 999, fontSize: 10, fontWeight: 700, color: 'var(--text-2)',
            display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer'
          }}>
            <Icon.mic style={{ width: 11, height: 11 }} /> Re-dictate
          </button>}
      </div>

      {status === 'idle' &&
      <button
        type="button"
        onClick={beginDictate}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '14px 16px', borderRadius: 10,
          border: '1.5px dashed var(--border-strong)',
          background: 'var(--surface-2)', color: 'var(--text-2)',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
          justifyContent: 'center', gap: 10,
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', fontFamily: 'inherit'
        }}>
          <span style={{
          width: 30, height: 30, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}><Icon.mic style={{ width: 14, height: 14 }} /></span>
          Dictate findings for this section
        </button>}

      {status === 'recording' &&
      <div style={{
        width: '100%', boxSizing: 'border-box',
        padding: '14px 16px', borderRadius: 10,
        border: '1.5px solid var(--brand)',
        background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
          <span style={{
          width: 30, height: 30, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, animation: 'micPulse 1.2s ease-in-out infinite'
        }}><Icon.mic style={{ width: 14, height: 14 }} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Listening…</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Transcribing your findings</div>
          </div>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 22 }}>
            {[0, 1, 2, 3, 4].map((i) =>
          <span key={i} style={{
            width: 3, borderRadius: 2, background: 'var(--brand)',
            animation: `barpulse 0.9s ease-in-out ${i * 0.12}s infinite`
          }} />
          )}
          </div>
        </div>}

      {status === 'ready' &&
      <textarea
        value={env.notes || ''}
        onChange={(e) => onChange({ notes: e.target.value })}
        placeholder="Edit your dictated findings…"
        rows={4}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text)', fontSize: 12, lineHeight: 1.5,
          fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
          outline: 'none'
        }} />}
    </div>);

}

// ─── Manual attach picker ─────────────────────────────────────
function AttachPicker({ facetId, items, structurePhotos, env, onToggle, onClose }) {
  const facet = ENVELOPE_FACETS.find((f) => f.id === facetId);
  const removed = new Set(env.removed || []);
  const added = new Set(env.added || []);
  const allowedSet = structurePhotos ? new Set(structurePhotos.map((it) => it._globalIdx)) : null;
  const isAttached = (it, idx) => {
    const key = String(idx);
    const autoMatch = !!it.starred && it.facetId === facetId;
    if (autoMatch && !removed.has(key)) return true;
    if (added.has(key)) return true;
    return false;
  };

  // Sort: starred first, then everything else — preserve original index for stable
  // toggle/state. Dictations are excluded — they're not photos. (Craig, May '26.)
  const ordered = useMemo(() => {
    return items.
    map((it, idx) => ({ it, idx })).
    filter(({ it, idx }) => it.source !== 'mic' && (!allowedSet || allowedSet.has(idx))).
    sort((a, b) => (b.it.starred ? 1 : 0) - (a.it.starred ? 1 : 0));
  }, [items, structurePhotos]);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ top: 0, height: '100%', maxHeight: '100%', borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 4px' }}>Photos for {facet?.label}</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Tap to add or remove. AI starts with starred photos matching this scope.</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 12px' }}>
          {items.length === 0 &&
          <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>No captures yet.</div>}
          <div className="attach-picker-grid">
            {ordered.map(({ it, idx }) => {
              const attached = isAttached(it, idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggle(idx)}
                  style={{
                    position: 'relative', padding: 0, border: 0, cursor: 'pointer',
                    borderRadius: 8, overflow: 'hidden',
                    background: it.source === 'mic' ? 'var(--brand-soft)' : 'oklch(0.78 0.01 80)',
                    aspectRatio: '1 / 1',
                    boxShadow: attached ? '0 0 0 3px var(--brand)' : 'none'
                  }}>
                  {it.source === 'mic' ?
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-soft-fg)' }}>
                      <Icon.mic />
                    </div> :
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'repeating-linear-gradient(135deg, oklch(0.85 0.02 80) 0 8px, oklch(0.8 0.02 80) 8px 16px)'
                  }} />}
                  {attached &&
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, borderRadius: 999, background: 'var(--brand)', color: 'var(--brand-fg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}><Icon.check /></span>}
                  {it.starred &&
                  <span style={{
                    position: 'absolute', bottom: 4, left: 4,
                    width: 18, height: 18, borderRadius: 999, background: 'oklch(0.75 0.17 75)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}><Icon.star style={{ width: 11, height: 11, fill: '#fff' }} /></span>}
                </button>);

            })}
          </div>
        </div>
        <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>Done</button>
        </div>
      </div>
    </>);

}

// ─── Dismiss-reason drawer ────────────────────────────────────
// Bottom drawer the rep uses to drop a finding card off the inspection.
// Reason code becomes part of the audit trail and shows on the dismissed
// card stub so other reps know why this scope was set aside. (Craig,
// May '26.)
const DISMISS_REASONS = [
{ id: 'good_shape', label: 'In good shape — no work needed' },
{ id: 'recent_work', label: 'Recently replaced / under warranty' },
{ id: 'out_of_scope', label: 'Out of scope for this appointment' },
{ id: 'homeowner_declined', label: 'Homeowner declined inspection' },
{ id: 'inaccessible', label: 'Inaccessible / unsafe to inspect' },
{ id: 'other', label: 'Other reason' }];


function DismissReasonSheet({ facet, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  if (!facet) return null;
  const reason = DISMISS_REASONS.find((r) => r.id === selected);
  const canConfirm = !!reason && (reason.id !== 'other' || note.trim().length > 0);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '70%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 4px' }}>Dismiss {facet.label}?</h3>
          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.45 }}>
            Pick a reason. The finding is hidden from this inspection and the reason is logged for audit.
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 12px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {DISMISS_REASONS.map((r, i) => {
              const on = r.id === selected;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 14px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                    border: 0,
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: on ? 'var(--brand-soft)' : 'var(--surface)',
                    cursor: 'pointer'
                  }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 999,
                    border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`,
                    background: on ? 'var(--brand)' : 'transparent',
                    color: 'var(--brand-fg)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {on && <Icon.check style={{ width: 11, height: 11 }} />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.label}</span>
                </button>);

            })}
          </div>
          {selected === 'other' &&
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tell us why…"
            rows={3}
            style={{
              marginTop: 10, width: '100%', boxSizing: 'border-box',
              padding: '10px 12px', borderRadius: 10,
              border: '1px solid var(--border-strong)', background: 'var(--surface)',
              color: 'var(--text)', fontSize: 13, lineHeight: 1.45,
              fontFamily: 'inherit', resize: 'vertical', minHeight: 70,
              outline: 'none'
            }} />}
        </div>
        <div style={{ padding: '10px 16px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <button className="btn btn-block" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ flex: 2, opacity: canConfirm ? 1 : 0.45, cursor: canConfirm ? 'pointer' : 'not-allowed' }}
            disabled={!canConfirm}
            onClick={() => onConfirm({
              reason: reason.id,
              reasonLabel: reason.id === 'other' ? note.trim() : reason.label,
              note: note.trim() || null,
              ts: Date.now()
            })}>
            Dismiss finding
          </button>
        </div>
      </div>
    </>);

}

// ─── Photo FAB row ───────────────────────────────────────────
// Dictate FAB removed — dictation that produces structured findings +
// material counts is intended to live behind a single flow, not as a
// standalone capture affordance on this screen.
function CaptureFabs({ onCapture }) {
  return (
    <div style={{ position: 'absolute', bottom: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
      <button
        onClick={onCapture}
        aria-label="Capture photo"
        title="Capture photo"
        style={{
          pointerEvents: 'auto', width: 56, height: 56, padding: 0, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)', border: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 28px rgba(0,0,0,0.18), 0 4px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer'
        }}>
        <Icon.cam style={{ width: 22, height: 22 }} />
      </button>
    </div>);

}

// ─── Structure switcher chip ──────────────────────────────────
// Tappable chip in the page header showing which structure the rep is on.
// Tapping opens a small dropdown listing all structures. Only renders when
// 2+ structures exist (single-structure jobs don't need the chrome).
function StructureSwitchChip({ structures, activeStructureId, setActiveStructureId, activeIdx, onBackToScope }) {
  const [open, setOpen] = useState(false);
  const active = structures[activeIdx];
  if (!active) return null;
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 22, padding: '0 8px', borderRadius: 8,
          background: 'var(--brand-soft)', border: '1px solid var(--brand)',
          fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1,
          color: 'var(--brand-soft-fg)', cursor: 'pointer'
        }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--brand)', color: 'var(--brand-fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>
          {activeIdx + 1}
        </span>
        {active.name}
        {structures.length > 1 &&
        <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 600 }}>{activeIdx + 1} of {structures.length}</span>}
        <span style={{ fontSize: 10 }}>▾</span>
      </button>
      {open &&
      <>
          <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 4, background: 'transparent'
        }} />
          <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          width: 280, background: 'var(--surface)',
          border: '1px solid var(--border-strong)', borderRadius: 12,
          boxShadow: '0 12px 32px rgba(20,15,5,0.18)',
          zIndex: 5, overflow: 'hidden'
        }}>
            <div style={{ padding: '10px 14px 8px', fontSize: 10, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.12, textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
              Structures · {structures.length}
            </div>
            {structures.map((s, i) => {
            const isActive = s.id === activeStructureId;
            return (
              <button
                key={s.id}
                onClick={() => {setActiveStructureId(s.id);setOpen(false);}}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: isActive ? 'var(--brand-soft)' : 'transparent',
                  border: 'none', borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  textAlign: 'left'
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: 5, background: isActive ? 'var(--brand)' : 'var(--surface-3)', color: isActive ? 'var(--brand-fg)' : 'var(--text-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{(s.scopes || []).length} scope{(s.scopes || []).length === 1 ? '' : 's'}</div>
                  </div>
                </button>);

          })}
            <button
              type="button"
              onClick={() => {setOpen(false);onBackToScope && onBackToScope();}}
              style={{
                width: '100%', padding: '10px 14px',
                borderTop: '1px solid var(--border)',
                border: 0, borderTopStyle: 'solid', borderTopWidth: 1, borderTopColor: 'var(--border)',
                background: 'var(--surface-2)', color: 'var(--brand)',
                fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', textAlign: 'left'
              }}>
              <Icon.plus style={{ width: 12, height: 12 }} />
              Add another structure in Scope
              <span style={{ marginLeft: 'auto' }}>→</span>
            </button>
          </div>
        </>
      }
    </div>);

}

Object.assign(window, { ImageCaptureScreen, AnnotateSheet, StructureSwitchChip });