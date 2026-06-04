/* global React, ELEVATION_MODEL, OPENING_STYLE, openingType, openingRect, deriveWindoorMeasurements, allWindoorOpeningIds, SIDING_MODEL, deriveSidingMeasurements, sidingSqft, sidingRegionRect, allSidingRegionIds */

/* WindoorDiagram — interactive Windows & Doors measurement experience.
   ───────────────────────────────────────────────────────────────
   Renders the real Hover elevation image per side with a highlighted rectangle
   over each opening (like a roofing facet). Selection is keyed by the opening's
   Hover id, so a corner/bay window that appears on two elevations toggles on
   both and counts once. The rep can field-add openings Hover missed (e.g.
   bush-covered basement windows). Counts push up via onApplyMeasurements. */

function WindoorDiagram({ env, onApplyMeasurements }) {
  const model = ELEVATION_MODEL;
  const [side, setSide] = React.useState('front');
  const [addType, setAddType] = React.useState(null); // null | 'window' | 'door' | 'garage'
  const svgRef = React.useRef(null);

  const selection = (env && env.windoorSelection) || allWindoorOpeningIds();
  const added = (env && env.windoorAdded) || [];
  const selSet = new Set(selection);
  const derived = deriveWindoorMeasurements(model, selection, added);
  const activeSide = model.sides.find((s) => s.id === side) || model.sides[0];

  const commit = (nextSel, nextAdded) =>
    onApplyMeasurements(deriveWindoorMeasurements(model, nextSel, nextAdded), { windoorSelection: nextSel, windoorAdded: nextAdded });
  const toggle = (key) => commit(selSet.has(key) ? selection.filter((k) => k !== key) : [...selection, key], added);

  // openings visible on the active side (Hover placements + field-adds here)
  const items = activeSide.places.map((p) => ({ key: p.key, type: openingType(p.key), cx: p.cx, cy: p.cy, w: p.w, h: p.h, added: false }))
    .concat(added.filter((a) => a.side === side).map((a) => ({ key: a.key, type: a.type, cx: a.cx, cy: a.cy, added: true })));

  const sideKeys = items.map((i) => i.key);
  const sideSel = sideKeys.filter((k) => selSet.has(k)).length;
  const selectAllSide = () => commit([...new Set([...selection, ...sideKeys])], added);
  const clearSide = () => commit(selection.filter((k) => !sideKeys.includes(k)), added);

  const clientToSvg = (evt) => {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(ctm.inverse());
    return [p.x, p.y];
  };
  const nextFa = () => 'FA-' + ((added.reduce((m, a) => Math.max(m, parseInt(String(a.key).replace(/\D/g, ''), 10) || 0), 0)) + 1);
  const onCanvasClick = (evt) => {
    if (!addType) return;
    const p = clientToSvg(evt);
    if (!p) return;
    const key = nextFa();
    const nextAdded = [...added, { key, type: addType, side, cx: Math.round(p[0]), cy: Math.round(p[1]) }];
    commit([...selection, key], nextAdded);
  };
  const removeAdded = (key) => commit(selection.filter((k) => k !== key), added.filter((a) => a.key !== key));

  const ADD_TYPES = [['window', 'Window'], ['door', 'Door'], ['garage', 'Garage']];

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      {/* source */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--brand-soft-fg)', background: 'var(--brand-soft)', padding: '3px 8px', borderRadius: 5
        }}>Hover</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{model.sourceId} · synced today</span>
      </div>

      {/* side switcher */}
      <div className="roof-seg roof-seg--wide" role="tablist" aria-label="Elevation side" style={{ display: 'flex', width: '100%', marginBottom: 8 }}>
        {model.sides.map((s) => {
          const ks = s.places.map((p) => p.key).concat(added.filter((a) => a.side === s.id).map((a) => a.key));
          const n = ks.filter((k) => selSet.has(k)).length;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={side === s.id}
              className={'roof-seg__btn' + (side === s.id ? ' is-on' : '')} style={{ flex: 1 }}
              onClick={() => setSide(s.id)}>
              {s.label}<span className="elev-side-count">{n}/{ks.length}</span>
            </button>
          );
        })}
      </div>

      {/* elevation image + opening rects */}
      <div className="card" style={{ padding: 8, background: 'var(--surface)', overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox={`0 0 ${model.imgW} ${model.imgH}`} width="100%"
          style={{ display: 'block', height: 'auto', cursor: addType ? 'crosshair' : 'default' }}
          preserveAspectRatio="xMidYMid meet" role="img" onClick={onCanvasClick}
          aria-label={`${activeSide.label} elevation — tap an opening to include or exclude it`}>
          <image href={activeSide.img} x={0} y={0} width={model.imgW} height={model.imgH} style={{ pointerEvents: 'none' }} />
          {items.map((o) => {
            const on = selSet.has(o.key);
            const st = OPENING_STYLE[o.type] || { color: 'var(--text-3)' };
            const r = openingRect(o.type, o.cx, o.cy, o.w, o.h);
            return (
              <g key={o.key} onClick={(e) => { e.stopPropagation(); toggle(o.key); }}
                tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o.key); } }}
                role="checkbox" aria-checked={on} aria-label={`${st.label} ${o.key}${o.added ? ' (field-added)' : ''} ${on ? 'included' : 'excluded'}`}
                style={{ cursor: 'pointer' }}>
                <rect x={r.x - 4} y={r.y - 4} width={r.w + 8} height={r.h + 8} fill="transparent" />
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={2}
                  fill={on ? st.color : '#fff'} fillOpacity={on ? 0.26 : 0.04}
                  stroke={on ? st.color : 'oklch(0.55 0.02 80)'} strokeWidth={on ? 3 : 2}
                  strokeDasharray={on ? (o.added ? '7 4' : 'none') : '5 4'} />
                {o.added && (
                  <g onClick={(e) => { e.stopPropagation(); removeAdded(o.key); }} style={{ cursor: 'pointer' }} aria-label={`Remove ${o.key}`}>
                    <circle cx={r.x + r.w} cy={r.y} r={9} fill="var(--danger)" stroke="#fff" strokeWidth={1.5} />
                    <line x1={r.x + r.w - 3.5} y1={r.y - 3.5} x2={r.x + r.w + 3.5} y2={r.y + 3.5} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
                    <line x1={r.x + r.w - 3.5} y1={r.y + 3.5} x2={r.x + r.w + 3.5} y2={r.y - 3.5} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* add controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 2px 0', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>Hover missed one?</span>
        {ADD_TYPES.map(([t, lbl]) => (
          <button key={t} type="button" className={'roof-mini-btn' + (addType === t ? ' is-on-add' : '')}
            onClick={() => setAddType(addType === t ? null : t)}>
            {addType === t ? `Tap to place ${lbl.toLowerCase()}` : `+ ${lbl}`}
          </button>
        ))}
      </div>

      {/* legend */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 14px', margin: '10px 2px 2px' }}>
        {Object.keys(OPENING_STYLE).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: OPENING_STYLE[t].color }} />
            {OPENING_STYLE[t].label}
          </span>
        ))}
      </div>

      {/* per-side count + select/clear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '8px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          {sideSel} of {sideKeys.length} on {activeSide.label.toLowerCase()}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAllSide} disabled={sideSel === sideKeys.length}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearSide} disabled={sideSel === 0}>Clear</button>
        </div>
      </div>

      {/* totals across all sides (deduped) */}
      <div className="roof-readout" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {[['Windows', derived.windows], ['Doors', derived.doors], ['Garage doors', derived.garage_doors], ['Sliders', derived.sliders]].map(([label, val]) => (
          <div key={label} className="roof-readout__cell">
            <div className="roof-readout__label">{label}</div>
            <div className="roof-readout__value">{val}<span className="roof-readout__unit">ea</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// SIDING — tap SI-x wall regions (area only)
// ───────────────────────────────────────────────────────────────
function SidingDiagram({ env, onApplyMeasurements }) {
  const model = SIDING_MODEL;
  const [side, setSide] = React.useState('front');
  const selection = (env && env.sidingSelection) || allSidingRegionIds();
  const selSet = new Set(selection);
  const activeSide = model.sides.find((s) => s.id === side) || model.sides[0];

  const totalSqft = sidingSqft(model, selection);
  const sqValue = Math.round(totalSqft / 100 * 10) / 10;

  // Merge siding_area into existing measurements (siding keeps its other
  // take-off fields). The Inspection handler does the merge.
  const commit = (next) => onApplyMeasurements(deriveSidingMeasurements(model, next), { sidingSelection: next });
  const toggle = (id) => commit(selSet.has(id) ? selection.filter((k) => k !== id) : [...selection, id]);

  const sideIds = activeSide.regions.map((r) => r.id);
  const sideSel = sideIds.filter((id) => selSet.has(id)).length;
  const selectAllSide = () => commit([...new Set([...selection, ...sideIds])]);
  const clearSide = () => commit(selection.filter((id) => !sideIds.includes(id)));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
          color: 'var(--brand-soft-fg)', background: 'var(--brand-soft)', padding: '3px 8px', borderRadius: 5
        }}>Hover</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{model.sourceId} · siding per elevation</span>
      </div>

      {/* side switcher */}
      <div className="roof-seg roof-seg--wide" role="tablist" aria-label="Elevation side" style={{ display: 'flex', width: '100%', marginBottom: 8 }}>
        {model.sides.map((s) => {
          const n = s.regions.filter((r) => selSet.has(r.id)).length;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={side === s.id}
              className={'roof-seg__btn' + (side === s.id ? ' is-on' : '')} style={{ flex: 1 }}
              onClick={() => setSide(s.id)}>
              {s.label}<span className="elev-side-count">{n}/{s.regions.length}</span>
            </button>
          );
        })}
      </div>

      {/* elevation image + clickable region zones */}
      <div className="card" style={{ padding: 8, background: 'var(--surface)', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${model.imgW} ${model.imgH}`} width="100%" style={{ display: 'block', height: 'auto' }}
          preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`${activeSide.label} elevation — tap a wall region to include or exclude its siding`}>
          <image href={activeSide.img} x={0} y={0} width={model.imgW} height={model.imgH} style={{ pointerEvents: 'none' }} />
          {activeSide.regions.map((rg) => {
            const on = selSet.has(rg.id);
            const r = sidingRegionRect(rg);
            return (
              <g key={rg.id} onClick={() => toggle(rg.id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(rg.id); } }}
                role="checkbox" aria-checked={on} aria-label={`${rg.id} ${rg.sqft} square feet ${on ? 'included' : 'excluded'}`}
                style={{ cursor: 'pointer' }}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={3}
                  fill={on ? 'oklch(0.55 0.1 250)' : '#fff'} fillOpacity={on ? 0.24 : 0.04}
                  stroke={on ? 'oklch(0.45 0.09 250)' : 'oklch(0.55 0.02 80)'} strokeWidth={on ? 3 : 2}
                  strokeDasharray={on ? 'none' : '5 4'} />
                <text x={rg.cx} y={rg.cy} className="siding-zone__lbl" style={{ fill: on ? 'oklch(0.32 0.09 250)' : 'var(--text-3)' }}>{rg.id}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 2px 0' }}>
        Tap a wall region to include / exclude its siding area.
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '10px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          {sideSel} of {sideIds.length} on {activeSide.label.toLowerCase()}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAllSide} disabled={sideSel === sideIds.length}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearSide} disabled={sideSel === 0}>Clear</button>
        </div>
      </div>

      <div className="roof-readout" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="roof-readout__cell">
          <div className="roof-readout__label">Siding area</div>
          <div className="roof-readout__value">{sqValue}<span className="roof-readout__unit">sq</span></div>
          <div className="roof-readout__sub">{totalSqft.toLocaleString()} ft² across {selection.length} regions</div>
        </div>
        <div className="roof-readout__cell">
          <div className="roof-readout__label">Regions</div>
          <div className="roof-readout__value">{selection.length}<span className="roof-readout__unit">of {allSidingRegionIds().length}</span></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WindoorDiagram, SidingDiagram });
