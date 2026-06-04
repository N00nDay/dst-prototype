/* global React, ELEVATION_MODEL, OPENING_STYLE, deriveWindoorMeasurements, allWindoorOpeningIds, deriveSidingMeasurements, sidingSqft, allSidingRegionIds, ptsAttr */

/* Elevation diagrams — driven by the exact Hover geometry (data-aerial.jsx).
   Each side renders the real wall polygons (SI regions) + opening polygons
   (windows / doors / garage), projected to 2D. WindoorDiagram makes the
   openings tappable; SidingDiagram makes the wall regions tappable. */

const centroid = (pts) => {
  const n = pts.length || 1;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
};

function ElevHeader({ subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{
        fontSize: 10, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
        color: 'var(--brand-soft-fg)', background: 'var(--brand-soft)', padding: '3px 8px', borderRadius: 5
      }}>Hover</span>
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{ELEVATION_MODEL.sourceId} · {subtitle}</span>
    </div>
  );
}

function SideSwitcher({ model, side, setSide, countOf }) {
  return (
    <div className="roof-seg roof-seg--wide" role="tablist" aria-label="Elevation side" style={{ display: 'flex', width: '100%', marginBottom: 8 }}>
      {model.sides.map((s) => {
        const c = countOf(s);
        return (
          <button key={s.id} type="button" role="tab" aria-selected={side === s.id}
            className={'roof-seg__btn' + (side === s.id ? ' is-on' : '')} style={{ flex: 1 }}
            onClick={() => setSide(s.id)}>
            {s.label}<span className="elev-side-count">{c}</span>
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// WINDOWS & DOORS — tap opening polygons
// ───────────────────────────────────────────────────────────────
function WindoorDiagram({ env, onApplyMeasurements }) {
  const model = ELEVATION_MODEL;
  const [side, setSide] = React.useState('front');
  const [addType, setAddType] = React.useState(null);
  const svgRef = React.useRef(null);
  const selection = (env && env.windoorSelection) || allWindoorOpeningIds();
  const added = (env && env.windoorAdded) || [];
  const selSet = new Set(selection);
  const derived = deriveWindoorMeasurements(model, selection, added);
  const activeSide = model.sides.find((s) => s.id === side) || model.sides[0];

  const commit = (nextSel, nextAdded) => onApplyMeasurements(deriveWindoorMeasurements(model, nextSel, nextAdded), { windoorSelection: nextSel, windoorAdded: nextAdded });
  const toggle = (id) => commit(selSet.has(id) ? selection.filter((k) => k !== id) : [...selection, id], added);

  const items = activeSide.openings.map((o) => ({ ...o, added: false }))
    .concat(added.filter((a) => a.side === side).map((a) => ({ ...a, added: true })));
  const sideKeys = items.map((i) => i.id);
  const sideSel = sideKeys.filter((k) => selSet.has(k)).length;
  const selectAllSide = () => commit([...new Set([...selection, ...sideKeys])], added);
  const clearSide = () => commit(selection.filter((k) => !sideKeys.includes(k)), added);

  const clientToSvg = (evt) => {
    const svg = svgRef.current;
    if (!svg || !svg.getScreenCTM) return null;
    const ctm = svg.getScreenCTM(); if (!ctm) return null;
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(ctm.inverse()); return [p.x, p.y];
  };
  const nextFa = () => 'FA-' + ((added.reduce((m, a) => Math.max(m, parseInt(String(a.id).replace(/\D/g, ''), 10) || 0), 0)) + 1);
  const onCanvasClick = (evt) => {
    if (!addType) return;
    const p = clientToSvg(evt); if (!p) return;
    const [x, y] = p, w = addType === 'garage' ? 120 : addType === 'door' ? 30 : 28, h = addType === 'garage' ? 70 : addType === 'door' ? 64 : 44;
    const pts = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]].map((q) => [Math.round(q[0]), Math.round(q[1])]);
    const id = nextFa();
    commit([...selection, id], [...added, { id, type: addType, side, pts }]);
  };
  const removeAdded = (id) => commit(selection.filter((k) => k !== id), added.filter((a) => a.id !== id));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ElevHeader subtitle="windows & doors" />
      <SideSwitcher model={model} side={side} setSide={setSide}
        countOf={(s) => { const ks = s.openings.map((o) => o.id).concat(added.filter((a) => a.side === s.id).map((a) => a.id)); return `${ks.filter((k) => selSet.has(k)).length}/${ks.length}`; }} />

      <div className="card" style={{ padding: 8, background: 'var(--surface)', overflow: 'hidden' }}>
        <svg ref={svgRef} viewBox={model.viewBox} width="100%" style={{ display: 'block', height: 'auto', cursor: addType ? 'crosshair' : 'default' }}
          preserveAspectRatio="xMidYMid meet" role="img" onClick={onCanvasClick}
          aria-label={`${activeSide.label} elevation — tap an opening to include or exclude it`}>
          {activeSide.walls.map((w) => (
            <polygon key={w.id} className="elev-wall" points={ptsAttr(w.pts)} />
          ))}
          {items.map((o) => {
            const on = selSet.has(o.id);
            const st = OPENING_STYLE[o.type] || { color: 'var(--text-3)' };
            const [cx, cy] = centroid(o.pts);
            return (
              <g key={o.id} onClick={(e) => { e.stopPropagation(); toggle(o.id); }}
                tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o.id); } }}
                role="checkbox" aria-checked={on} aria-label={`${st.label} ${o.id}${o.added ? ' (field-added)' : ''} ${on ? 'included' : 'excluded'}`}
                style={{ cursor: 'pointer' }}>
                <polygon points={ptsAttr(o.pts)}
                  fill={on ? st.color : '#fff'} fillOpacity={on ? 0.5 : 0.85}
                  stroke={on ? st.color : 'oklch(0.55 0.02 80)'} strokeWidth={on ? 2.5 : 2}
                  strokeDasharray={on ? (o.added ? '7 4' : 'none') : '5 4'} />
                {o.added && (
                  <g onClick={(e) => { e.stopPropagation(); removeAdded(o.id); }} style={{ cursor: 'pointer' }} aria-label={`Remove ${o.id}`}>
                    <circle cx={cx} cy={cy} r={11} fill="var(--danger)" stroke="#fff" strokeWidth={1.5} />
                    <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                    <line x1={cx - 4} y1={cy + 4} x2={cx + 4} y2={cy - 4} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 2px 0', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>Hover missed one?</span>
        {[['window', 'Window'], ['door', 'Door'], ['garage', 'Garage']].map(([t, lbl]) => (
          <button key={t} type="button" className={'roof-mini-btn' + (addType === t ? ' is-on-add' : '')}
            onClick={() => setAddType(addType === t ? null : t)}>
            {addType === t ? `Tap to place ${lbl.toLowerCase()}` : `+ ${lbl}`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 14px', margin: '10px 2px 2px' }}>
        {Object.keys(OPENING_STYLE).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: OPENING_STYLE[t].color }} />{OPENING_STYLE[t].label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '8px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{sideSel} of {sideKeys.length} on {activeSide.label.toLowerCase()}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAllSide} disabled={sideSel === sideKeys.length}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearSide} disabled={sideSel === 0}>Clear</button>
        </div>
      </div>

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
// SIDING — tap wall (SI) region polygons
// ───────────────────────────────────────────────────────────────
function SidingDiagram({ env, onApplyMeasurements }) {
  const model = ELEVATION_MODEL;
  const [side, setSide] = React.useState('front');
  const selection = (env && env.sidingSelection) || allSidingRegionIds();
  const selSet = new Set(selection);
  const activeSide = model.sides.find((s) => s.id === side) || model.sides[0];
  const totalSqft = sidingSqft(model, selection);
  const sqValue = Math.round(totalSqft / 100 * 10) / 10;

  const commit = (next) => onApplyMeasurements(deriveSidingMeasurements(model, next), { sidingSelection: next });
  const toggle = (id) => commit(selSet.has(id) ? selection.filter((k) => k !== id) : [...selection, id]);
  const sideIds = activeSide.walls.map((w) => w.id);
  const sideSel = sideIds.filter((id) => selSet.has(id)).length;
  const selectAllSide = () => commit([...new Set([...selection, ...sideIds])]);
  const clearSide = () => commit(selection.filter((id) => !sideIds.includes(id)));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ElevHeader subtitle="siding per elevation" />
      <SideSwitcher model={model} side={side} setSide={setSide}
        countOf={(s) => `${s.walls.filter((w) => selSet.has(w.id)).length}/${s.walls.length}`} />

      <div className="card" style={{ padding: 8, background: 'var(--surface)', overflow: 'hidden' }}>
        <svg viewBox={model.viewBox} width="100%" style={{ display: 'block', height: 'auto' }}
          preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${activeSide.label} elevation — tap a wall region to include or exclude its siding`}>
          {activeSide.walls.map((w) => {
            const on = selSet.has(w.id);
            const [cx, cy] = centroid(w.pts);
            return (
              <g key={w.id} onClick={() => toggle(w.id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(w.id); } }}
                role="checkbox" aria-checked={on} aria-label={`${w.id} ${w.sqft} square feet ${on ? 'included' : 'excluded'}`}
                style={{ cursor: 'pointer' }}>
                <polygon points={ptsAttr(w.pts)}
                  fill={on ? 'oklch(0.55 0.1 250)' : '#fff'} fillOpacity={on ? 0.22 : 0.04}
                  stroke={on ? 'oklch(0.45 0.09 250)' : 'oklch(0.55 0.02 80)'} strokeWidth={on ? 2.5 : 2}
                  strokeDasharray={on ? 'none' : '5 4'} />
                <text x={cx} y={cy} className="siding-zone__lbl" style={{ fill: on ? 'oklch(0.3 0.09 250)' : 'var(--text-3)' }}>{w.id}</text>
              </g>
            );
          })}
          {/* openings drawn as holes for context */}
          {activeSide.openings.map((o) => (
            <polygon key={o.id} points={ptsAttr(o.pts)} fill="#fff" stroke="oklch(0.7 0.01 80)" strokeWidth={1} style={{ pointerEvents: 'none' }} />
          ))}
        </svg>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 2px 0' }}>Tap a wall region to include / exclude its siding area.</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '10px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{sideSel} of {sideIds.length} on {activeSide.label.toLowerCase()}</span>
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
