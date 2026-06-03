/* global React, ELEVATION_MODEL, OPENING_STYLE, deriveWindoorMeasurements, allWindoorOpeningIds */

/* WindoorDiagram — interactive Windows & Doors measurement experience.
   ───────────────────────────────────────────────────────────────
   Renders the real Hover elevation image per side (Front / Right / Back /
   Left) with a tappable PIN over each window / door / slider. Selected pins
   drive the windoors counts, pushed up via onApplyMeasurements(next, patch).
   The same elevation images back the Siding experience later. */

function WindoorDiagram({ env, onApplyMeasurements }) {
  const model = ELEVATION_MODEL;
  const [side, setSide] = React.useState('front');
  const selection = (env && env.windoorSelection) || allWindoorOpeningIds();
  const selSet = new Set(selection);
  const derived = deriveWindoorMeasurements(model, selection);
  const activeSide = model.sides.find((s) => s.id === side) || model.sides[0];

  const commit = (next) => onApplyMeasurements(deriveWindoorMeasurements(model, next), { windoorSelection: next });
  const toggle = (id) => commit(selSet.has(id) ? selection.filter((x) => x !== id) : [...selection, id]);

  const sideIds = activeSide.openings.map((o) => o.id);
  const sideSel = sideIds.filter((id) => selSet.has(id)).length;
  const selectAllSide = () => commit([...new Set([...selection, ...sideIds])]);
  const clearSide = () => commit(selection.filter((id) => !sideIds.includes(id)));

  // pin sizing in image space (880-wide) — generous so it stays tappable
  const R = 15, HIT = 30;
  const check = (cx, cy) => `M ${cx - 6} ${cy} L ${cx - 1.5} ${cy + 5} L ${cx + 6.5} ${cy - 5.5}`;

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
          const n = s.openings.filter((o) => selSet.has(o.id)).length;
          return (
            <button key={s.id} type="button" role="tab" aria-selected={side === s.id}
              className={'roof-seg__btn' + (side === s.id ? ' is-on' : '')} style={{ flex: 1 }}
              onClick={() => setSide(s.id)}>
              {s.label}<span className="elev-side-count">{n}/{s.openings.length}</span>
            </button>
          );
        })}
      </div>

      {/* elevation image + pins */}
      <div className="card" style={{ padding: 8, background: 'var(--surface)', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${model.imgW} ${model.imgH}`} width="100%" style={{ display: 'block', height: 'auto' }}
          preserveAspectRatio="xMidYMid meet" role="img"
          aria-label={`${activeSide.label} elevation — tap an opening to include or exclude it`}>
          <image href={activeSide.img} x={0} y={0} width={model.imgW} height={model.imgH} style={{ pointerEvents: 'none' }} />
          {activeSide.openings.map((o) => {
            const on = selSet.has(o.id);
            const st = OPENING_STYLE[o.type] || { color: 'var(--text-3)' };
            return (
              <g key={o.id} onClick={() => toggle(o.id)} tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(o.id); } }}
                role="checkbox" aria-checked={on} aria-label={`${st.label} ${on ? 'included' : 'excluded'}`}
                style={{ cursor: 'pointer' }}>
                <circle cx={o.cx} cy={o.cy} r={HIT} fill="transparent" />
                <circle cx={o.cx} cy={o.cy} r={R}
                  fill={on ? st.color : '#fff'} fillOpacity={on ? 1 : 0.92}
                  stroke={on ? '#fff' : st.color} strokeWidth={on ? 2.5 : 2.5}
                  strokeDasharray={on ? 'none' : '4 3'} />
                {on
                  ? <path d={check(o.cx, o.cy)} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  : <line x1={o.cx - 5} y1={o.cy - 5} x2={o.cx + 5} y2={o.cy + 5} stroke={st.color} strokeWidth={2.4} strokeLinecap="round" />}
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 14px', margin: '10px 2px 2px' }}>
        {Object.keys(OPENING_STYLE).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-2)' }}>
            <span style={{ width: 11, height: 11, borderRadius: 11, background: OPENING_STYLE[t].color }} />
            {OPENING_STYLE[t].label}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· tap a pin to include / exclude</span>
      </div>

      {/* per-side count + select/clear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '8px 2px 0' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
          {sideSel} of {sideIds.length} on {activeSide.label.toLowerCase()}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="roof-mini-btn" onClick={selectAllSide} disabled={sideSel === sideIds.length}>Select all</button>
          <button type="button" className="roof-mini-btn" onClick={clearSide} disabled={sideSel === 0}>Clear</button>
        </div>
      </div>

      {/* totals across all sides */}
      <div className="roof-readout" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[['Windows', derived.windows], ['Doors', derived.doors], ['Sliders', derived.sliders]].map(([label, val]) => (
          <div key={label} className="roof-readout__cell">
            <div className="roof-readout__label">{label}</div>
            <div className="roof-readout__value">{val}<span className="roof-readout__unit">ea</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { WindoorDiagram });
