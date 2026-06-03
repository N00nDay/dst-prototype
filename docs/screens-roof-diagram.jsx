/* global React, Icon, ROOF_MODEL, EDGE_STYLE, SEED_DOWNSPOUTS, deriveRoofMeasurements, deriveGutterMeasurements, allRoofFacetIds, allRoofEaveIds, edgeById, facetById, pointOnEave, snapEaveEndT, downspoutDropLf, downspoutAutoDrop, nearestEavePoint */

/* RoofDiagram — interactive roofing / gutters measurement experience.
   ───────────────────────────────────────────────────────────────
   Replaces the manual Measurements pane for facets driven by the aerial roof
   plan (data-aerial.jsx). Renders the plan as an SVG. Selection + controls
   persist on the envelope and every change re-derives the flat measurements
   object pushed up via onApplyMeasurements(next, patch).

   mode='roofing'  → tap FACETS. Selected facets contribute area + all edges.
   mode='gutters'  → tap EAVES for gutter runs. Downspouts are placeable markers:
                     in the Downspouts tool, tap an eave to drop one, drag to move
                     it, tap one to edit its drop length or remove it. */

const WASTE_OPTIONS = [0, 7, 10, 12, 14, 17, 22];
const SUGGESTED_WASTE = 12;
const GUTTER_COLOR = 'oklch(0.55 0.14 235)';

// ── shared geometry helpers ──
const centroid = (pts) => {
  const n = pts.length;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
};
const ptsAttr = (pts) => pts.map((p) => p.join(',')).join(' ');

function RoofDiagram(props) {
  return props.mode === 'gutters' ? <GutterDiagram {...props} /> : <RoofingDiagram {...props} />;
}

// ── Source chip + frame shared by both modes ──
function DiagramHeader({ right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--brand-soft-fg)', background: 'var(--brand-soft)', padding: '3px 8px', borderRadius: 5, whiteSpace: 'nowrap'
        }}>Hover</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ROOF_MODEL.sourceId} · synced today
        </span>
      </div>
      {right}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// ROOFING — tap facets
// ───────────────────────────────────────────────────────────────
function RoofingDiagram({ env, onApplyMeasurements }) {
  const [overlay, setOverlay] = React.useState('area'); // area | pitch | lengths
  const selection = (env && env.roofSelection) || allRoofFacetIds();
  const waste = (env && env.roofWaste != null) ? env.roofWaste : SUGGESTED_WASTE;
  const stories = (env && env.roofStories != null) ? env.roofStories : 2;
  const selSet = new Set(selection);
  const derived = deriveRoofMeasurements(ROOF_MODEL, selection, { waste, stories });

  const commit = (nextSel, nextWaste, nextStories) => {
    const next = deriveRoofMeasurements(ROOF_MODEL, nextSel, { waste: nextWaste, stories: nextStories });
    onApplyMeasurements(next, { roofSelection: nextSel, roofWaste: nextWaste, roofStories: nextStories });
  };
  const toggleFacet = (id) => commit(selSet.has(id) ? selection.filter((x) => x !== id) : [...selection, id], waste, stories);
  const selectAll = () => commit(allRoofFacetIds(), waste, stories);
  const clearAll = () => commit([], waste, stories);
  const setWaste = (w) => commit(selection, w, stories);
  const setStories = (s) => commit(selection, waste, Math.max(1, s));
  const allOn = selection.length === ROOF_MODEL.facets.length;
  const noneOn = selection.length === 0;

  const overlayToggle = (
    <div className="roof-seg" role="tablist" aria-label="Diagram labels">
      {['area', 'pitch', 'lengths'].map((m) => (
        <button key={m} type="button" role="tab" aria-selected={overlay === m}
          className={'roof-seg__btn' + (overlay === m ? ' is-on' : '')} onClick={() => setOverlay(m)}>
          {m === 'area' ? 'Area' : m === 'pitch' ? 'Pitch' : 'Lengths'}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <DiagramHeader right={overlayToggle} />
      <div className="card" style={{ padding: 10, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <svg viewBox={ROOF_MODEL.viewBox} width="100%" style={{ display: 'block', height: 'auto', maxHeight: '46vh' }}
          preserveAspectRatio="xMidYMid meet" role="img" aria-label="Interactive roof plan — tap a facet to include or exclude it">
          {ROOF_MODEL.facets.map((f) => {
            const on = selSet.has(f.id);
            const [cx, cy] = centroid(f.pts);
            return (
              <g key={f.id}>
                <polygon className={'roof-facet ' + (on ? 'roof-facet--on' : 'roof-facet--off')}
                  points={ptsAttr(f.pts)} onClick={() => toggleFacet(f.id)} tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFacet(f.id); } }}
                  role="checkbox" aria-checked={on} aria-label={`${f.label} — ${f.areaSq} squares, ${f.pitch}`} />
                {overlay !== 'lengths' && (
                  <text x={cx} y={cy} className="roof-facet__lbl" style={{ fill: on ? 'var(--text)' : 'var(--text-4)' }}>
                    {overlay === 'area' ? f.areaSq : f.pitch}
                  </text>
                )}
              </g>
            );
          })}
          {ROOF_MODEL.edges.map((e) => {
            const active = e.facets.some((id) => selSet.has(id));
            const st = EDGE_STYLE[e.type] || { color: 'var(--text-3)' };
            const mx = (e.a[0] + e.b[0]) / 2, my = (e.a[1] + e.b[1]) / 2;
            return (
              <g key={e.id}>
                <line x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} className="roof-edge"
                  stroke={active ? st.color : 'oklch(0.8 0.01 80)'} strokeWidth={active ? 2.4 : 1.2} strokeOpacity={active ? 1 : 0.6} />
                {overlay === 'lengths' && active && (
                  <text x={mx} y={my} className="roof-edge__lbl" style={{ fill: st.color }}>{e.len}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px', margin: '10px 2px 2px' }}>
        {Object.keys(EDGE_STYLE).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: EDGE_STYLE[t].color }} />
            {EDGE_STYLE[t].label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '8px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: noneOn ? 'var(--danger)' : 'var(--text-2)' }}>
          {selection.length} of {ROOF_MODEL.facets.length} facets included
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAll} disabled={allOn}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearAll} disabled={noneOn}>Clear</button>
        </div>
      </div>

      <div className="roof-readout">
        <ReadoutCell label="Roof area" value={noneOn ? '0' : derived.area} unit="sq" wide
          sub={noneOn ? null : `${derived.area_steep} steep · ${derived.area_flat} low-slope`} />
        <ReadoutCell label="Pitch" value={derived.pitch || '—'} unit="" />
        <ReadoutCell label="Eaves" value={derived.eaves} unit="ft" />
        <ReadoutCell label="Rakes" value={derived.rakes} unit="ft" />
        <ReadoutCell label="Ridge" value={derived.ridge} unit="ft" />
        <ReadoutCell label="Hip" value={derived.hip} unit="ft" />
        <ReadoutCell label="Valley" value={derived.valley} unit="ft" />
        <ReadoutCell label="Drip edge" value={derived.drip_edge} unit="ft" />
        <ReadoutCell label="Step flash" value={derived.step_flashing} unit="ft" />
        <ReadoutCell label="Apron flash" value={derived.apron_flashing} unit="ft" />
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>Waste factor</span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>applied to shingle qty</span>
        </div>
        <div className="roof-waste">
          {WASTE_OPTIONS.map((w) => (
            <button key={w} type="button" className={'roof-waste__btn' + (waste === w ? ' is-on' : '')} onClick={() => setWaste(w)}>
              {w}%{w === SUGGESTED_WASTE ? <span className="roof-waste__sug">Suggested</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>Stories</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>drives lift / access on 3+ stories</div>
        </div>
        <div className="roof-stepper">
          <button type="button" aria-label="Fewer stories" onClick={() => setStories(stories - 1)} disabled={stories <= 1}>−</button>
          <span>{stories}</span>
          <button type="button" aria-label="More stories" onClick={() => setStories(stories + 1)}>+</button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// GUTTERS — tap eaves (runs) + placeable downspouts
// ───────────────────────────────────────────────────────────────
function GutterDiagram({ env, onApplyMeasurements }) {
  const [tool, setTool] = React.useState('runs');      // runs | downspouts
  const [selectedDsId, setSelectedDsId] = React.useState(null);
  const [drag, setDrag] = React.useState(null);        // { id, moved, eaveId, t }
  const svgRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const eaves = ROOF_MODEL.edges.filter((e) => e.type === 'eave');
  const selection = (env && env.gutterSelection) || allRoofEaveIds();
  const downspouts = (env && env.gutterDownspouts) || SEED_DOWNSPOUTS;
  const guards = !!(env && env.gutterGuards);
  const selSet = new Set(selection);
  const derived = deriveGutterMeasurements(ROOF_MODEL, selection, downspouts, { guards });

  const commit = (nextSel, nextDs, nextGuards) => {
    const next = deriveGutterMeasurements(ROOF_MODEL, nextSel, nextDs, { guards: nextGuards });
    onApplyMeasurements(next, { gutterSelection: nextSel, gutterDownspouts: nextDs, gutterGuards: nextGuards });
  };
  const toggleEave = (id) => commit(selSet.has(id) ? selection.filter((x) => x !== id) : [...selection, id], downspouts, guards);
  const selectAll = () => commit(allRoofEaveIds(), downspouts, guards);
  const clearAll = () => commit([], downspouts, guards);
  const setGuards = (g) => commit(selection, downspouts, g);

  const nextDsId = () => {
    const nums = downspouts.map((d) => parseInt(String(d.id).replace(/\D/g, ''), 10) || 0);
    return 'D' + ((nums.length ? Math.max.apply(null, nums) : 0) + 1);
  };
  const addDownspout = (eaveId, t) => {
    const id = nextDsId();
    commit(selection, [...downspouts, { id, eaveId, t: snapEaveEndT(edgeById(eaveId), t) }], guards);
    setSelectedDsId(id);
  };
  const removeDownspout = (id) => {
    commit(selection, downspouts.filter((d) => d.id !== id), guards);
    setSelectedDsId(null);
  };
  const moveDownspout = (id, eaveId, t) => commit(selection, downspouts.map((d) => d.id === id ? { ...d, eaveId, t } : d), guards);
  const setDrop = (id, dropLf) => commit(selection, downspouts.map((d) => d.id === id ? { ...d, dropLf } : d), guards);

  const allOn = selection.length === eaves.length;
  const noneOn = selection.length === 0;
  const isDsTool = tool === 'downspouts';

  // viewBox coords from a pointer event
  const clientToSvg = (evt) => {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return [p.x, p.y];
  };

  // viewBox point → pixel offset within the diagram wrapper (for anchoring the
  // popover to a marker, robust to any scaling/letterboxing).
  const svgToWrapPx = (x, y) => {
    const svg = svgRef.current, wrap = wrapRef.current;
    if (!svg || !wrap || !svg.getScreenCTM) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = x; pt.y = y;
    const sp = pt.matrixTransform(ctm);
    const wr = wrap.getBoundingClientRect();
    return [sp.x - wr.left, sp.y - wr.top];
  };

  // ── downspout drag (pointer-captured on the marker) ──
  const onMarkerDown = (evt, id) => {
    if (!isDsTool) return;
    evt.stopPropagation();
    try { evt.currentTarget.setPointerCapture(evt.pointerId); } catch (e) { /* noop */ }
    const d = { id, moved: false, eaveId: null, t: null };
    dragRef.current = d; setDrag(d);
  };
  const onMarkerMove = (evt) => {
    const d = dragRef.current;
    if (!d) return;
    const p = clientToSvg(evt);
    if (!p) return;
    const snap = nearestEavePoint(selection, p[0], p[1]);
    if (!snap) return;
    const nd = { id: d.id, moved: true, eaveId: snap.eaveId, t: snapEaveEndT(edgeById(snap.eaveId), snap.t) };
    dragRef.current = nd; setDrag(nd);
  };
  const onMarkerUp = (evt, id) => {
    const d = dragRef.current; dragRef.current = null;
    setDrag(null);
    if (d && d.moved && d.eaveId != null) moveDownspout(id, d.eaveId, d.t);
    else setSelectedDsId(id);
  };

  // tap an eave: runs → toggle the run; downspouts → drop a new marker there
  const onEaveClick = (evt, eaveId) => {
    if (!isDsTool) { toggleEave(eaveId); return; }
    if (!selSet.has(eaveId)) return; // can't hang a downspout on a run with no gutter
    const p = clientToSvg(evt);
    const snap = p && nearestEavePoint(selection, p[0], p[1]);
    addDownspout(snap ? snap.eaveId : eaveId, snap ? snap.t : 0.5);
  };

  const toolToggle = (
    <div className="roof-seg" role="tablist" aria-label="Gutter tool">
      {[['runs', 'Runs'], ['downspouts', 'Downspouts']].map(([m, lbl]) => (
        <button key={m} type="button" role="tab" aria-selected={tool === m}
          className={'roof-seg__btn' + (tool === m ? ' is-on' : '')}
          onClick={() => { setTool(m); setSelectedDsId(null); }}>{lbl}</button>
      ))}
    </div>
  );

  const selectedDs = downspouts.find((d) => d.id === selectedDsId) || null;

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <DiagramHeader right={toolToggle} />
      {isDsTool && (
        <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '-2px 2px 8px' }}>
          Tap an eave to drop a downspout · drag to move · tap one to edit or remove.
        </div>
      )}
      <div className="roof-svg-wrap" ref={wrapRef} style={{ position: 'relative' }}>
      <div className="card" style={{ padding: 10, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox={ROOF_MODEL.viewBox} width="100%"
          style={{ display: 'block', height: 'auto', maxHeight: '46vh', touchAction: isDsTool ? 'none' : 'auto' }}
          preserveAspectRatio="xMidYMid meet" role="img"
          aria-label="Interactive gutter plan — tap an eave for its gutter run; use the Downspouts tool to place drops">
          {/* Facets as static context */}
          {ROOF_MODEL.facets.map((f) => (
            <polygon key={f.id} className="roof-facet--context" points={ptsAttr(f.pts)} />
          ))}
          {/* Non-eave edges faint, for shape */}
          {ROOF_MODEL.edges.filter((e) => e.type !== 'eave').map((e) => (
            <line key={e.id} x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]}
              stroke="oklch(0.82 0.01 80)" strokeWidth={1} strokeOpacity={0.7} style={{ pointerEvents: 'none' }} />
          ))}
          {/* Eaves — gutter runs */}
          {eaves.map((e) => {
            const on = selSet.has(e.id);
            const mx = (e.a[0] + e.b[0]) / 2, my = (e.a[1] + e.b[1]) / 2;
            return (
              <g key={e.id}>
                <line x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} className="roof-gutter-line"
                  stroke={on ? GUTTER_COLOR : 'oklch(0.78 0.01 80)'} strokeWidth={on ? 3.4 : 1.4}
                  strokeOpacity={on ? 1 : 0.7} strokeDasharray={on ? 'none' : '4 3'} />
                <line x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]} className="roof-gutter-hit"
                  onClick={(ev) => onEaveClick(ev, e.id)} tabIndex={0}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onEaveClick(ev, e.id); } }}
                  role={isDsTool ? 'button' : 'checkbox'} aria-checked={isDsTool ? undefined : on}
                  aria-label={`Eave ${e.len} ft${isDsTool ? ' — tap to add a downspout' : on ? ' — gutter on' : ' — no gutter'}`} />
                {on && <text x={mx} y={my} className="roof-edge__lbl" style={{ fill: GUTTER_COLOR }}>{e.len}</text>}
              </g>
            );
          })}
          {/* Downspouts */}
          {downspouts.map((d) => {
            const live = drag && drag.id === d.id && drag.eaveId ? { eaveId: drag.eaveId, t: drag.t } : d;
            const eave = edgeById(live.eaveId);
            if (!eave) return null;
            const [x, y] = pointOnEave(eave, live.t);
            const active = selSet.has(live.eaveId);
            const isSel = d.id === selectedDsId;
            const r = isSel ? 8 : 6.5;
            return (
              <g key={d.id} style={{ pointerEvents: active && isDsTool ? 'auto' : 'none', cursor: isDsTool ? 'grab' : 'default', touchAction: 'none' }}
                onPointerDown={(ev) => onMarkerDown(ev, d.id)} onPointerMove={onMarkerMove} onPointerUp={(ev) => onMarkerUp(ev, d.id)}>
                {/* drop tick */}
                <line x1={x} y1={y} x2={x} y2={y + 12} stroke={active ? GUTTER_COLOR : 'oklch(0.78 0.01 80)'} strokeWidth={2.4} strokeLinecap="round" />
                {/* generous transparent finger target (~44px) */}
                <circle cx={x} cy={y} r={isDsTool ? 17 : 0} fill="transparent" />
                {isSel && <circle cx={x} cy={y} r={r + 4} fill="none" stroke={GUTTER_COLOR} strokeWidth={1.5} strokeOpacity={0.5} />}
                <circle cx={x} cy={y} r={r} fill={active ? GUTTER_COLOR : 'oklch(0.8 0.01 80)'}
                  stroke="#fff" strokeWidth={isSel ? 2.5 : 1.6} />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Downspout popover — pops out of the selected marker so edit / remove
          are right where the rep is looking. Hidden while dragging. */}
      {isDsTool && selectedDs && !drag && (() => {
        const eave = edgeById(selectedDs.eaveId);
        if (!eave) return null;
        const facet = facetById(eave.facets[0]);
        const [dx, dy] = pointOnEave(eave, selectedDs.t);
        const pos = svgToWrapPx(dx, dy);
        if (!pos) return null;
        const flipDown = pos[1] < 96; // not enough room above → drop below the dot
        // Keep the popover within the diagram; slide the caret to keep pointing at the dot.
        const wrapW = wrapRef.current ? wrapRef.current.getBoundingClientRect().width : 320;
        const POP_W = 210, half = POP_W / 2, pad = 8;
        const centerX = Math.max(half + pad, Math.min(wrapW - half - pad, pos[0]));
        const caretX = Math.max(16, Math.min(POP_W - 16, pos[0] - centerX + half));
        const auto = selectedDs.dropLf == null;
        const drop = downspoutDropLf(selectedDs);
        const autoVal = downspoutAutoDrop(selectedDs);
        return (
          <div className={'roof-ds-pop' + (flipDown ? ' roof-ds-pop--down' : '')} style={{ left: centerX, top: pos[1], '--caret': caretX + 'px' }}>
            <div className="roof-ds-pop__head">
              <span>{facet ? facet.label : 'Downspout'}</span>
              <button type="button" aria-label="Close" onClick={() => setSelectedDsId(null)}>✕</button>
            </div>
            <div className="roof-ds-pop__row">
              <span className="roof-ds-pop__lbl">Drop</span>
              {auto ? (
                <button type="button" className="roof-linkbtn" onClick={() => setDrop(selectedDs.id, autoVal)}>
                  Auto · {facet ? facet.stories : 2}-story · {autoVal} ft
                </button>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span className="roof-stepper roof-stepper--sm">
                    <button type="button" aria-label="Shorter drop" onClick={() => setDrop(selectedDs.id, Math.max(1, drop - 1))} disabled={drop <= 1}>−</button>
                    <span>{drop} ft</span>
                    <button type="button" aria-label="Longer drop" onClick={() => setDrop(selectedDs.id, drop + 1)}>+</button>
                  </span>
                  <button type="button" className="roof-linkbtn" onClick={() => setDrop(selectedDs.id, null)}>Auto</button>
                </span>
              )}
            </div>
            <button type="button" className="roof-ds-remove" onClick={() => removeDownspout(selectedDs.id)}>Remove downspout</button>
          </div>
        );
      })()}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 14px', margin: '10px 2px 2px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: GUTTER_COLOR }} /> Gutter run
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: GUTTER_COLOR }} /> Downspout
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ width: 14, height: 0, borderTop: '1.5px dashed var(--text-4)' }} /> No gutter
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '8px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: noneOn ? 'var(--danger)' : 'var(--text-2)' }}>
          {selection.length} of {eaves.length} runs · {derived.downspouts} downspout{derived.downspouts === 1 ? '' : 's'}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAll} disabled={allOn}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearAll} disabled={noneOn}>Clear</button>
        </div>
      </div>

      <div className="roof-readout">
        <ReadoutCell label="Gutter run" value={derived.gutter_lf} unit="ft" wide />
        <ReadoutCell label="Downspouts" value={derived.downspouts} unit="ea" />
        <ReadoutCell label="Downspout drop" value={derived.downspout_lf} unit="ft" wide />
        <ReadoutCell label="Guards" value={derived.guards_lf || '—'} unit={derived.guards_lf ? 'ft' : ''} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '0 2px' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>Gutter guards</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>run leaf guard the full selected length</div>
        </div>
        <button type="button" role="switch" aria-checked={guards} aria-label="Gutter guards"
          className={'roof-switch' + (guards ? ' is-on' : '')} onClick={() => setGuards(!guards)}>
          <span className="roof-switch__knob" />
        </button>
      </div>
    </div>
  );
}

function ReadoutCell({ label, value, unit, sub, wide }) {
  return (
    <div className={'roof-readout__cell' + (wide ? ' roof-readout__cell--wide' : '')}>
      <div className="roof-readout__label">{label}</div>
      <div className="roof-readout__value">{value}{unit ? <span className="roof-readout__unit">{unit}</span> : null}</div>
      {sub ? <div className="roof-readout__sub">{sub}</div> : null}
    </div>
  );
}

Object.assign(window, { RoofDiagram });
