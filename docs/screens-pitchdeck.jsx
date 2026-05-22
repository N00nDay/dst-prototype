/* global React, Icon, PITCH_SLIDES, PITCH_SKIP_REASONS, BRANDS, TIERS, CUSTOMER, fmt, tierTotal */
/* Pitch Deck — Core Six (DST-PD)
   Two modes:
     - mode="pick"   → Approach tab: rep chooses which slides to include and reorders
     - mode="present" → Present tab: full-screen-ish presentation runs the selected slides */

const { useState, useMemo } = window;

function PitchDeckScreen({ brand, rep, tablet, mode = 'present', slides, setSlides, skips, setSkips, included, setIncluded, selectedTier, setSelectedTier, rollupForTier, structures, proposals, pricingMode, onBack, onContinue }) {
  if (mode === 'pick') {
    return <SlidePicker
      brand={brand} rep={rep} tablet={tablet}
      slides={slides} setSlides={setSlides}
      included={included} setIncluded={setIncluded}
      onContinue={onContinue} />;
  }
  return <Presenter
    brand={brand} rep={rep} tablet={tablet}
    slides={slides.filter((s) => included?.[s.id] !== false)}
    skips={skips} setSkips={setSkips}
    selectedTier={selectedTier}
    setSelectedTier={setSelectedTier}
    rollupForTier={rollupForTier}
    structures={structures}
    proposals={proposals}
    pricingMode={pricingMode}
    onBack={onBack}
    onContinue={onContinue} />;
}

// ─────── Approach: slide picker (no live homeowner presentation) ───────
function SlidePicker({ brand, rep, tablet, slides, setSlides, included, setIncluded, onContinue }) {
  const includedCount = slides.filter((s) => included?.[s.id] !== false).length;
  const [skipPrompt, setSkipPrompt] = useState(null); // { id, label } when prompting
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const moveTo = (from, to) => {
    if (from === to || from == null || to == null) return;
    setSlides((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  // Toggling off a Core 6 slide (not a finding) requires a reason code.
  const handleToggle = (s) => {
    const isOn = included?.[s.id] !== false;
    if (!isOn) {
      setIncluded((cur) => ({ ...cur, [s.id]: true }));
      return;
    }
    if (s.kind === 'finding') {
      setIncluded((cur) => ({ ...cur, [s.id]: false }));
      return;
    }
    setSkipPrompt({ id: s.id, label: s.label });
  };

  const confirmSkip = (reason) => {
    setIncluded((cur) => ({ ...cur, [skipPrompt.id]: false, [`${skipPrompt.id}__reason`]: reason }));
    setSkipPrompt(null);
  };

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: tablet ? '20px 28px 8px' : '14px 16px 8px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 26 : 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Choose what to present
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>
          Drag the handle (⋮⋮) to reorder. Toggle Core 6 slides off if needed — we'll ask why. Findings auto-include from inspection.
        </div>
      </div>

      <div style={{ padding: tablet ? '14px 28px' : '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slides.map((s, i) => {
          const on = included?.[s.id] !== false;
          const isFinding = s.kind === 'finding';
          const skipReason = included?.[`${s.id}__reason`];
          const isDragging = dragIdx === i;
          const isDropTarget = overIdx === i && dragIdx != null && dragIdx !== i;
          return (
            <div
              key={s.id}
              draggable
              onDragStart={(e) => {
                setDragIdx(i);
                e.dataTransfer.effectAllowed = 'move';
                try {e.dataTransfer.setData('text/plain', String(i));} catch (_) {}
              }}
              onDragOver={(e) => {e.preventDefault();setOverIdx(i);e.dataTransfer.dropEffect = 'move';}}
              onDragLeave={() => {if (overIdx === i) setOverIdx(null);}}
              onDrop={(e) => {e.preventDefault();moveTo(dragIdx, i);setDragIdx(null);setOverIdx(null);}}
              onDragEnd={() => {setDragIdx(null);setOverIdx(null);}}
              className="card"
              style={{
                padding: 12, display: 'flex', alignItems: 'center', gap: 10,
                opacity: isDragging ? 0.4 : on ? 1 : 0.55,
                borderTop: isDropTarget ? '3px solid var(--brand)' : undefined,
                transition: 'opacity 120ms ease'
              }}>
              <div
                title="Drag to reorder"
                style={{
                  flexShrink: 0, cursor: 'grab',
                  width: 22, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-3)', userSelect: 'none',
                  fontFamily: 'sans-serif'
                }}>
                <Icon.grip />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', minWidth: 18, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: isFinding ? 'var(--warn)' : 'var(--brand)', letterSpacing: 0.06, textTransform: 'uppercase' }}>{s.label}</span>
                  {isFinding && <span className="pill warn" style={{ fontSize: 9 }}>from inspection</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title || s.finding?.headline}
                </div>
                {!on && skipReason &&
                <div style={{ fontSize: 10, color: 'var(--warn)', marginTop: 2, fontStyle: 'italic' }}>
                    Skipped: {skipReason}
                  </div>
                }
              </div>
              <div
                onClick={() => handleToggle(s)}
                className={`switch ${on ? 'on' : ''}`}
                style={{ cursor: 'pointer', flexShrink: 0 }} />
            </div>);

        })}
      </div>

      <div style={{ padding: tablet ? '8px 28px 28px' : '8px 16px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginBottom: 12 }}>
          {includedCount} of {slides.length} slides included · ready to build proposal
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={onContinue}>
          Continue to proposal <Icon.arrow />
        </button>
      </div>

      {/* Skip-reason sheet — required when toggling off a Core 6 slide */}
      {skipPrompt &&
      <>
          <div className="sheet-backdrop" onClick={() => setSkipPrompt(null)} />
          <div className="sheet">
            <div className="grabber" />
            <h3>Skip "{skipPrompt.label}"</h3>
            <div style={{ padding: '0 16px', fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
              Skipping a Core 6 slide is logged for coaching. Choose a reason.
            </div>
            <div style={{ padding: '6px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {PITCH_SKIP_REASONS.map((r) =>
            <button
              key={r}
              className="btn"
              style={{ justifyContent: 'flex-start', textAlign: 'left', height: 'auto', padding: '12px 14px' }}
              onClick={() => confirmSkip(r)}>
                  {r}
                </button>
            )}
            </div>
            <div style={{ padding: '4px 16px 16px' }}>
              <button className="btn btn-ghost btn-block" onClick={() => setSkipPrompt(null)}>Cancel</button>
            </div>
          </div>
        </>
      }
    </div>);

}

// ─────── Present: full presentation (Approach + Findings + Proposal preview) ───────
function Presenter({ brand, rep, tablet, slides, skips, setSkips, selectedTier, setSelectedTier, rollupForTier, structures, proposals, pricingMode, onBack, onContinue }) {
  // Append the comparison slide(s). All-in: one rolled-up slide. By
  // structure: one slide per structure, each tagged with the structure
  // name in the hero so the homeowner sees the building this view is for.
  const allSlides = useMemo(() => {
    const isByStructure = pricingMode === 'by' && (structures || []).length > 1;
    if (isByStructure) {
      const perStructureSlides = (structures || []).map((s, i) => ({
        id: `__comparison-${s.id}`,
        label: `Your options · ${s.name}`,
        kind: 'comparison',
        title: 'Choose your roof.',
        structureId: s.id,
        structureName: s.name,
        structureIndex: i + 1,
        structureCount: structures.length
      }));
      return [...slides, ...perStructureSlides];
    }
    return [...slides, { id: '__comparison', label: 'Your options', kind: 'comparison', title: 'Choose your roof.' }];
  }, [slides, pricingMode, structures]);
  const [idx, setIdx] = useState(0);
  // Finding-slide photo carousel — opening a photo lifts it here so the
  // overlay covers the whole presenter, not just the slide card.
  // (Craig, May '26: "I saw you built the carousel but clicking the image
  // is not opening it.")
  const [openPhoto, setOpenPhoto] = useState(null); // { slide, photoIndex }
  // Tier-gate feedback when the rep taps the Continue button without a
  // tier picked — scrolls to the roofing tier picker and flashes a toast
  // so the homeowner-facing screen reveals what's still needed.
  const [tierShakeKey, setTierShakeKey] = useState(0);
  const [tierToast, setTierToast] = useState(null);
  React.useEffect(() => {
    if (!tierToast) return;
    const t = setTimeout(() => setTierToast(null), 2500);
    return () => clearTimeout(t);
  }, [tierToast]);

  const brandObj = BRANDS[brand];
  const current = allSlides[idx];
  if (!current) return null;
  const onComparison = current.kind === 'comparison';
  const tierLocked = !!selectedTier && onComparison;

  // Build a finding-shaped object the FindingsScreen carousel can consume.
  const carouselFinding = useMemo(() => {
    if (!openPhoto) return null;
    const f = openPhoto.slide.finding;
    return {
      id: openPhoto.slide.id,
      cat: f.cat,
      headline: f.facetLabel,
      photos: (f.photos || []).map((p, i) => ({
        id: `${openPhoto.slide.id}-${i}`,
        label: `${f.facetLabel} · photo ${i + 1}`,
        file: `${f.cat}-${p.idx + 1}.jpg`
      }))
    };
  }, [openPhoto]);
  const carouselTotal = carouselFinding?.photos.length || 0;
  const stepPhoto = (delta) => setOpenPhoto((p) => {
    if (!p) return p;
    const total = (p.slide.finding.photos || []).length || 1;
    return { ...p, photoIndex: (p.photoIndex + delta + total) % total };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Top bar — exit + slide indicator + more-vert menu */}
      <div style={{ padding: tablet ? '18px 28px 8px' : '14px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        {onBack ?
        <button className="btn btn-sm btn-ghost" onClick={onBack} style={{ padding: '0 6px' }} aria-label="Exit presentation">
            <Icon.x /> Exit
          </button> :
        <span />}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {allSlides.map((s, i) => {
            const isSkipped = !!skips[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 22 : 8, height: 8, borderRadius: 999,
                  background: isSkipped ? 'var(--surface-3)' : i === idx ? 'var(--brand)' : i < idx ? 'var(--text-3)' : 'var(--border)',
                  border: 0, padding: 0, cursor: 'pointer', transition: 'all 160ms ease'
                }}
                aria-label={`Slide ${i + 1}`} />);

          })}
          <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 8 }}>
            {idx + 1}/{allSlides.length}
          </span>
        </div>
        <PresenterMenu />
      </div>

      {/* Slide stage — flex-grow + own scroll so the Back/Next bar stays fixed */}
      <div style={{ flex: 1, overflow: 'auto', padding: tablet ? '8px 28px' : '8px 16px' }}>
        {onComparison ?
        <ComparisonSlide
          tablet={tablet}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          rollupForTier={rollupForTier}
          rep={rep}
          structures={structures}
          proposals={proposals}
          forStructure={current.structureId ? {
            id: current.structureId,
            name: current.structureName,
            index: current.structureIndex,
            count: current.structureCount
          } : null} /> :

        <SlideStage slide={current} tablet={tablet} brandObj={brandObj} skipped={!!skips[current.id]} onOpenPhoto={(i) => setOpenPhoto({ slide: current, photoIndex: i })} />
        }
      </div>

      {/* Navigation — pinned to the bottom of the presenter, never shifts. */}
      <div style={{
        padding: tablet ? '16px 28px 22px' : '14px 16px 22px',
        display: 'flex', alignItems: 'stretch',
        justifyContent: tablet ? 'space-between' : 'stretch',
        gap: 12, flexShrink: 0,
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)'
      }}>
        <button
          className="btn btn-lg"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{ flex: tablet ? '0 0 auto' : 1, minWidth: tablet ? 120 : 0 }}>
          <Icon.back /> Back
        </button>
        {idx < allSlides.length - 1 ?
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setIdx((i) => i + 1)}
          style={{ flex: tablet ? '0 1 auto' : 1, minWidth: tablet ? 200 : 0 }}>
            Next <Icon.arrow />
          </button> :

        <div
          key={'tier-shake-' + tierShakeKey}
          className={tierShakeKey > 0 ? 'continue-bar-shake' : ''}
          style={{ position: 'relative', flex: tablet ? '0 1 auto' : 1, minWidth: tablet ? 240 : 0, display: 'flex' }}>
            {tierToast &&
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: '100%',
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'none', paddingBottom: 8
          }}>
                <div className="toast">{tierToast}</div>
              </div>}
            <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              if (selectedTier) {onContinue();return;}
              const el = document.getElementById('blk-tier-roofing');
              if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
              setTierShakeKey((k) => k + 1);
              setTierToast('Pick a package to continue');
            }}
            title={selectedTier ? '' : 'Pick a package to continue'}
            style={{
              flex: 1, minWidth: 0,
              opacity: selectedTier ? 1 : 0.45,
              cursor: 'pointer'
            }}>
              {selectedTier ? <>Continue to Sign <Icon.arrow /></> : 'Pick a package'}
            </button>
          </div>
        }
      </div>

      {/* Photo carousel for finding slides — reuses the FindingsScreen
          component so the in-presentation viewer matches the rep tool. */}
      {openPhoto && carouselFinding && carouselTotal > 0 &&
      <PhotoCarousel
        finding={carouselFinding}
        index={openPhoto.photoIndex}
        onPrev={() => stepPhoto(-1)}
        onNext={() => stepPhoto(1)}
        onClose={() => setOpenPhoto(null)} />}
    </div>);

}

function SlideStage({ slide, tablet, brandObj, skipped, onOpenPhoto }) {
  // Findings-kind slides — composed live from the Inspect tab's envelope cards.
  // Shows the facet, the rep's photos for that envelope, the condition pill,
  // and the dictated notes (which the rep talks through with the homeowner).
  // (Craig, May '26.)
  if (slide.kind === 'finding') {
    const f = slide.finding;
    const condTone = (
      f.condition === 'good' ? 'oklch(0.7 0.13 175)' :
      f.condition === 'fair' ? 'oklch(0.78 0.14 75)' :
      f.condition === 'poor' ? 'oklch(0.7 0.16 40)' : null);

    const photos = f.photos || [];
    const photoCount = photos.length;
    // Pick a stable grid layout based on count.
    const gridCols = photoCount <= 1 ? 1 : photoCount === 2 ? 2 : photoCount === 3 ? 3 : 4;

    return (
      <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: 0, minHeight: tablet ? 460 : 360, display: 'flex', flexDirection: 'column' }}>
        {skipped && <div className="pill warn" style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, zIndex: 3 }}>SKIPPED</div>}

        {/* Header */}
        <div style={{ padding: tablet ? '20px 24px 14px' : '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.12, textTransform: 'uppercase' }}>What we found</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 30 : 22, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.1 }}>
              {f.facetLabel}
            </div>
          </div>
          {f.condition && condTone &&
          <span style={{
            padding: tablet ? '6px 14px' : '4px 10px', borderRadius: 999,
            background: condTone, color: '#fff',
            fontSize: tablet ? 12 : 10, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase'
          }}>{f.condition}</span>}
        </div>

        {/* Photo grid (or empty placeholder) — tiles open the carousel on
            tap so the homeowner can see each one full-bleed (Craig, May '26). */}
        {photoCount > 0 ?
        <div style={{ flex: photoCount >= 3 ? '0 0 auto' : 1, display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 2, background: 'var(--border)', minHeight: tablet ? 240 : 180 }}>
            {photos.slice(0, 6).map(({ idx, item }, i) => {
              const isLastTile = i === 5 && photos.length > 6;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onOpenPhoto && onOpenPhoto(i)}
                  aria-label={`Open photo ${i + 1} of ${photos.length}`}
                  style={{
                    position: 'relative',
                    padding: 0, border: 0,
                    background: 'transparent',
                    cursor: onOpenPhoto ? 'zoom-in' : 'default',
                    overflow: 'hidden'
                  }}>
                  <div className="placeholder-photo" style={{ borderRadius: 0, border: 0, fontSize: 11, aspectRatio: photoCount === 1 ? 'auto' : '4 / 3', minHeight: photoCount === 1 ? (tablet ? 240 : 180) : (tablet ? 140 : 100), width: '100%' }}>
                    {f.cat}-{idx + 1}.jpg
                  </div>
                  {isLastTile &&
                  <span style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
                    pointerEvents: 'none'
                  }}>+{photos.length - 6} more</span>}
                </button>);
            })}
          </div> :
        <div className="placeholder-photo" style={{ flex: 1, borderRadius: 0, border: 0, fontSize: 12, fontStyle: 'italic', color: 'var(--text-3)', minHeight: tablet ? 200 : 140 }}>
            No photos attached
          </div>}

        {/* Notes */}
        {f.notes &&
        <div style={{ padding: tablet ? '18px 24px 22px' : '14px 16px 18px', fontSize: tablet ? 15 : 13, color: 'var(--text)', lineHeight: 1.55, background: 'var(--surface)' }}>
            {f.notes}
          </div>}
      </div>);

  }

  return (
    <div className="card card-pad" style={{ position: 'relative', overflow: 'hidden', padding: tablet ? '36px 32px' : '22px 18px', minHeight: tablet ? 460 : 360, display: 'flex', flexDirection: 'column' }}>
      {/* Brand accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--brand)' }} />

      {skipped &&
      <div className="pill warn" style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700 }}>
          SKIPPED
        </div>
      }

      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.12, textTransform: 'uppercase' }}>
        {slide.label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: tablet ? 40 : 26,
        fontWeight: 700,
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
        marginTop: 10,
        maxWidth: 640
      }}>
        {slide.title}
      </div>
      <div style={{ fontSize: tablet ? 16 : 13, color: 'var(--text-2)', marginTop: 14, lineHeight: 1.55, maxWidth: 560 }}>
        {slide.body}
      </div>

      {/* Process timeline */}
      {slide.timeline &&
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: tablet ? 'repeat(5, 1fr)' : '1fr', gap: 10 }}>
          {slide.timeline.map((t, i) =>
        <div key={i} style={{ position: 'relative', padding: '12px 12px 12px 36px', background: 'var(--surface-2)', borderRadius: 8 }}>
              <div style={{
            position: 'absolute', left: 8, top: 12,
            width: 22, height: 22, borderRadius: 999,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11
          }}>{t.step}</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>{t.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{t.detail}</div>
            </div>
        )}
        </div>
      }

      {/* Bullet list */}
      {slide.bullets &&
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slide.bullets.map((b, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flexShrink: 0, marginTop: 2, width: 6, height: 6, borderRadius: 999, background: 'var(--brand)' }} />
              <span style={{ fontSize: tablet ? 15 : 13, color: 'var(--text)', lineHeight: 1.5 }}>{b}</span>
            </div>
        )}
        </div>
      }

      <div style={{ marginTop: 'auto', paddingTop: 20, fontSize: 10, color: 'var(--text-4)', letterSpacing: 0.06, textTransform: 'uppercase', fontWeight: 600 }}>
        {slide.accent}
      </div>
    </div>);

}

Object.assign(window, { PitchDeckScreen });

// ─────── Comparison slide — homeowner-facing presentation ──────────
// This IS the customer-facing "Present to Customer" experience. Adapted from
// the IHS pricing-screens mockup (Screen 3) into our warm/shadcn-tilted system.
//
// Layout:
//   1. Customer-facing hero strip
//   2. Three tier cards w/ monthly hero + total subtext
//   3. "See side-by-side comparison" toggle → expandable compare table
//   4. Customer-friendly add-on grid (toggles)
//   5. Care Plan promo banner
//   6. Big monthly summary card at bottom

// Curated customer-facing add-ons offered after tier pick. Prices include labor.
// Note: Seamless Gutters is NOT an add-on — it's part of the Gutters scope above
// (Craig, May '26). LeafGuard MicroMesh is offered here as an add-on instead of
// bundled into the gutters package.
const PRESENT_ADDONS = [
{ id: 'guards', label: 'LeafGuard MicroMesh', desc: 'Micro-mesh leaf protection on every run. No more ladders twice a year.', price: 1450 },
{ id: 'skylight', label: 'Skylight', desc: 'Velux fixed deck-mount with full flashing kit.', price: 1875 },
{ id: 'chimney', label: 'Chimney Reflash', desc: 'New step + counter flashing. Stops the #1 leak source.', price: 985 }];


// Customer-facing scope catalog for the comparison slide. Mirrors the proposal
// builder (SCOPE_CATALOG in screens-build.jsx) but trimmed to what the homeowner
// needs to see. Each scope is either `tiered: true` (Good/Better/Best cards) or
// `tiered: false` (single full-width card — e.g. Gutters, where there's no
// meaningful Good/Better/Best ladder per Craig).
const PRESENT_SCOPES = [
{
  id: 'roofing', label: 'Roofing',
  headline: 'Your new roof.',
  blurb: 'Tear-off, underlayment, Owens Corning shingles, all flashings, install.',
  tiered: true,
  compareRows: [
  { label: 'Shingle product', good: 'OC TruDef Duration', better: 'OC Duration Designer (Class 4 IR)', best: 'OC Berkshire Collection' },
  { label: 'Profile', good: 'Architectural · standard', better: 'Architectural · impact-resistant', best: 'Designer luxury' },
  { label: 'Underlayment', good: 'Synthetic full deck', better: 'Synthetic + valley I&W', best: 'Full-deck Ice & Water Shield' },
  { label: 'Flashing', good: 'Re-set step flashing', better: 'Aluminum step + counter', best: 'Copper step + counter' },
  { label: 'Manufacturer warranty', good: '30-year', better: '50-year', best: 'Lifetime' },
  { label: 'IHS workmanship', good: '5 years', better: '10 years', best: 'Lifetime (transferable)' },
  { label: 'Best fit for', good: 'Budget-minded, 5–10 yr plan', better: 'Most families · best long-term value', best: 'Premium & forever homes' }],

  compareFootnote: 'All three are installed by the same Owens Corning-certified IHS crew. Only the shingle product and warranty tier change — install quality is the same.',
  tiers: [
  {
    id: 'good', label: 'Good', name: 'Standard', total: 11796,
    warranty: '30-yr mfr · 5-yr workmanship',
    inclusions: [
    'OC TruDef Duration architectural shingles',
    'Synthetic underlayment full deck',
    'New plumbing boots & pipe flashings',
    'Re-set step flashing where reusable']

  },
  {
    id: 'better', label: 'Better', name: 'Premium', total: 15448, recommended: true,
    warranty: '50-yr mfr · 10-yr workmanship',
    inclusions: [
    'OC Duration Designer (Class 4 impact-resistant)',
    'Ice & water shield — valleys + eaves',
    'Aluminum step + counter flashing',
    'Continuous ridge vent system']

  },
  {
    id: 'best', label: 'Best', name: 'Signature', total: 23552,
    warranty: 'Lifetime mfr · Lifetime transferable workmanship',
    inclusions: [
    'OC Berkshire Collection luxury shingles',
    'Ice & water shield — full deck',
    'Copper step + counter flashing',
    'Designer ridge cap + annual courtesy inspection']

  }]

},
{
  id: 'siding', label: 'Siding',
  headline: 'Siding to match.',
  blurb: 'Tear-off, weather wrap, fiber-cement install, paint & trim.',
  tiered: true,
  compareRows: [
  { label: 'Siding product', good: 'HardiePlank Select Cedarmill', better: 'HardiePlank ColorPlus + Shingle accents', best: 'HardiePlank Artisan series' },
  { label: 'Finish', good: 'ColorPlus standard', better: 'ColorPlus upgraded', best: 'On-site color match · two coats' },
  { label: 'Trim package', good: '5/4 standard trim', better: 'Upgraded trim + corner package', best: 'Custom architect-spec trim' },
  { label: 'Weather barrier', good: 'Tyvek HomeWrap', better: 'Tyvek HomeWrap + flashing tape', best: 'Full flashing kit at every penetration' },
  { label: 'Finish warranty', good: '15-year', better: '30-year', best: '30-year · transferable' },
  { label: 'Substrate warranty', good: '—', better: '—', best: 'Lifetime' },
  { label: 'Best fit for', good: 'Repaint-only homes', better: 'Most families · best long-term value', best: 'Custom builds & forever homes' }],

  compareFootnote: 'Both manufacturers (LP, James Hardie) are installed by the same fiber-cement-certified IHS crew. Only the product line and finish tier change.',
  tiers: [
  {
    id: 'good', label: 'Good', name: 'Standard', total: 19400,
    warranty: '15-yr finish warranty',
    inclusions: [
    'James Hardie HardiePlank Select Cedarmill',
    'ColorPlus standard finish',
    'Tyvek HomeWrap weather barrier',
    '5/4 trim package']

  },
  {
    id: 'better', label: 'Better', name: 'Premium', total: 26800, recommended: true,
    warranty: '30-yr finish warranty',
    inclusions: [
    'James Hardie HardiePlank ColorPlus',
    'HardieShingle accent panels',
    'Upgraded trim & corner package',
    'Caulk & seal full perimeter']

  },
  {
    id: 'best', label: 'Best', name: 'Signature', total: 35200,
    warranty: 'Lifetime substrate · 30-yr finish · transferable',
    inclusions: [
    'James Hardie Artisan series profile',
    'Custom trim · architect-spec corners',
    'On-site color match · two coats',
    'Full flashing kit at every penetration']

  }]

},
{
  id: 'gutters', label: 'Gutters',
  headline: 'Seamless gutters.',
  blurb: 'Color-matched aluminum, sized to your roof. One spec — no upsell ladder.',
  tiered: false,
  flat: {
    name: '6" K-Style Seamless Aluminum',
    total: 2570,
    warranty: '10-yr workmanship warranty',
    inclusions: [
    '6" seamless aluminum gutters, color-matched',
    'Heavy-duty hidden hangers every 24"',
    'Five oversized 3"×4" downspouts',
    'Splash blocks at every downspout']

  }
}];

// ─── Materials catalog — backs the "blow-out" full-screen material editor ──
// Customer-facing: name + qty + unit only. No costs, no profit (Craig, May '26).
// Each item can optionally carry `swaps` (alternate products/specs the rep can
// switch to inline) and `upgrade` (the next-tier upgrade target, if any).
//
// Keyed `${scopeId}.${tierId}`. For untiered scopes (gutters) we key by
// `${scopeId}.flat`.
const MATERIALS_BY_TIER = {
  'roofing.good': [
  { id: 'shingles', name: 'OC TruDef Duration shingles', qty: 35, unit: 'sq', swaps: ['OC Oakridge', 'OC TruDef Duration'], upgrade: 'OC Duration Designer (Class 4)' },
  { id: 'underlay', name: 'Synthetic underlayment', qty: 35, unit: 'sq', upgrade: 'Ice & Water Shield — full deck' },
  { id: 'iw-valley', name: 'Ice & water shield — valleys', qty: 0, unit: 'sq' },
  { id: 'drip', name: 'Drip edge', qty: 220, unit: 'lf', swaps: ['Aluminum drip edge', 'Galvanized drip edge'] },
  { id: 'starter', name: 'Starter strip', qty: 220, unit: 'lf' },
  { id: 'ridge-cap', name: 'Ridge cap shingles', qty: 45, unit: 'lf' },
  { id: 'ridge-vent', name: 'Ridge vent', qty: 30, unit: 'lf' },
  { id: 'step-flash', name: 'Step flashing (re-set)', qty: 60, unit: 'lf', upgrade: 'New aluminum step flashing' },
  { id: 'pipe-boots', name: 'Pipe boots', qty: 5, unit: 'ea', swaps: ['Standard rubber boot', 'Lead pipe boot'] },
  { id: 'nails', name: 'Roofing nails', qty: 8, unit: 'box' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 35, unit: 'sq' }],

  'roofing.better': [
  { id: 'shingles', name: 'OC Duration Designer (Class 4 IR)', qty: 35, unit: 'sq', swaps: ['OC Duration Designer', 'OC Duration Storm'], upgrade: 'OC Berkshire Collection' },
  { id: 'underlay', name: 'Synthetic underlayment', qty: 35, unit: 'sq' },
  { id: 'iw-valley', name: 'Ice & water shield — valleys + eaves', qty: 12, unit: 'sq', upgrade: 'Full-deck Ice & Water Shield' },
  { id: 'drip', name: 'Aluminum drip edge', qty: 220, unit: 'lf' },
  { id: 'starter', name: 'Pre-cut starter strip', qty: 220, unit: 'lf' },
  { id: 'ridge-cap', name: 'Hip & ridge cap shingles', qty: 45, unit: 'lf' },
  { id: 'ridge-vent', name: 'Continuous ridge vent', qty: 30, unit: 'lf' },
  { id: 'step-flash', name: 'New aluminum step flashing', qty: 60, unit: 'lf', upgrade: 'Copper step flashing' },
  { id: 'counter-flash', name: 'Aluminum counter flashing', qty: 32, unit: 'lf' },
  { id: 'pipe-boots', name: 'Lead pipe boots', qty: 5, unit: 'ea' },
  { id: 'nails', name: 'Coil nails', qty: 10, unit: 'box' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 35, unit: 'sq' }],

  'roofing.best': [
  { id: 'shingles', name: 'OC Berkshire Collection (luxury)', qty: 35, unit: 'sq', swaps: ['OC Berkshire', 'OC Woodmoor', 'OC Woodcrest'] },
  { id: 'underlay', name: 'Synthetic underlayment + I&W', qty: 35, unit: 'sq' },
  { id: 'iw-full', name: 'Ice & water shield — full deck', qty: 35, unit: 'sq' },
  { id: 'drip', name: 'Copper drip edge', qty: 220, unit: 'lf' },
  { id: 'starter', name: 'Pre-cut starter strip', qty: 220, unit: 'lf' },
  { id: 'ridge-cap', name: 'Designer ridge cap', qty: 45, unit: 'lf' },
  { id: 'ridge-vent', name: 'Continuous ridge vent', qty: 30, unit: 'lf' },
  { id: 'step-flash', name: 'Copper step flashing', qty: 60, unit: 'lf' },
  { id: 'counter-flash', name: 'Copper counter flashing', qty: 32, unit: 'lf' },
  { id: 'pipe-boots', name: 'Copper pipe collars', qty: 5, unit: 'ea' },
  { id: 'nails', name: 'Stainless coil nails', qty: 10, unit: 'box' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 35, unit: 'sq' },
  { id: 'inspection', name: 'Annual courtesy inspection', qty: 1, unit: 'yr' }],

  'siding.good': [
  { id: 'siding', name: 'HardiePlank Select Cedarmill', qty: 28, unit: 'sq', upgrade: 'HardiePlank ColorPlus' },
  { id: 'wrap', name: 'Tyvek HomeWrap', qty: 28, unit: 'sq' },
  { id: 'trim', name: '5/4 standard trim', qty: 180, unit: 'lf', upgrade: 'Upgraded trim package' },
  { id: 'corners', name: 'Outside corners', qty: 12, unit: 'ea' },
  { id: 'caulk', name: 'Exterior-grade caulk', qty: 24, unit: 'tube' },
  { id: 'finish', name: 'ColorPlus standard finish', qty: 1, unit: 'job' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 28, unit: 'sq' }],

  'siding.better': [
  { id: 'siding', name: 'HardiePlank ColorPlus', qty: 26, unit: 'sq', upgrade: 'HardiePlank Artisan series' },
  { id: 'accent', name: 'HardieShingle accent panels', qty: 2, unit: 'sq' },
  { id: 'wrap', name: 'Tyvek HomeWrap + flashing tape', qty: 28, unit: 'sq' },
  { id: 'trim', name: 'Upgraded trim package', qty: 180, unit: 'lf' },
  { id: 'corners', name: 'Mitered outside corners', qty: 12, unit: 'ea' },
  { id: 'caulk', name: 'Color-matched caulk full perimeter', qty: 30, unit: 'tube' },
  { id: 'finish', name: 'ColorPlus upgraded finish', qty: 1, unit: 'job' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 28, unit: 'sq' }],

  'siding.best': [
  { id: 'siding', name: 'HardiePlank Artisan series', qty: 26, unit: 'sq' },
  { id: 'accent', name: 'Artisan shingle accents', qty: 2, unit: 'sq' },
  { id: 'wrap', name: 'Full flashing kit at every penetration', qty: 1, unit: 'job' },
  { id: 'trim', name: 'Custom architect-spec trim', qty: 180, unit: 'lf' },
  { id: 'corners', name: 'Custom mitered corners', qty: 12, unit: 'ea' },
  { id: 'caulk', name: 'Color-matched caulk full perimeter', qty: 30, unit: 'tube' },
  { id: 'finish', name: 'On-site color match · two coats', qty: 1, unit: 'job' },
  { id: 'tearoff', name: 'Tear-off & disposal', qty: 28, unit: 'sq' }],

  'gutters.flat': [
  { id: 'gutter', name: '6" K-style seamless aluminum gutter', qty: 178, unit: 'lf', swaps: ['6" K-style aluminum', '6" half-round copper'] },
  { id: 'hangers', name: 'Heavy-duty hidden hangers', qty: 90, unit: 'ea' },
  { id: 'downspouts', name: '3"×4" oversized downspouts', qty: 5, unit: 'ea' },
  { id: 'elbows', name: 'Downspout elbows', qty: 12, unit: 'ea' },
  { id: 'splash', name: 'Splash blocks', qty: 5, unit: 'ea' },
  { id: 'sealant', name: 'Gutter sealant', qty: 4, unit: 'tube' }]

};

function materialsFor(scopeId, tierId) {
  return MATERIALS_BY_TIER[`${scopeId}.${tierId || 'flat'}`] || [];
}

function ComparisonSlide({ tablet, selectedTier, setSelectedTier, rollupForTier, rep, structures, proposals, forStructure }) {
  // 7.99% APR / 120 mo financing — matches FinancingScreen assumption.
  const monthly = (total) => {
    const r = 0.0799 / 12,n = 120;
    if (!total) return 0;
    return Math.round(total * r / (1 - Math.pow(1 + r, -n)));
  };

  // Per-scope selection. Roofing mirrors the parent's selectedTier so downstream
  // screens (sign, deposit) still see a single selection. Siding/Gutters are local.
  // Gutters value is 'included'|null since there's no Good/Better/Best ladder.
  const [selByScope, setSelByScope] = useState({
    roofing: selectedTier || null,
    siding: null,
    gutters: 'included'
  });
  const [addonsOn, setAddonsOn] = useState({});

  // Keep roofing in sync if the parent changes selectedTier externally.
  if (selectedTier !== undefined && selectedTier !== selByScope.roofing && selectedTier !== null) {
    // Defer until after render to avoid setState-in-render warning.
    Promise.resolve().then(() => setSelByScope((s) => s.roofing === selectedTier ? s : { ...s, roofing: selectedTier }));
  }

  const handleSelectTier = (scopeId, value) => {
    setSelByScope((s) => ({ ...s, [scopeId]: value }));
    if (scopeId === 'roofing' && setSelectedTier) setSelectedTier(value);
  };

  // Per-tier totals derived from the Proposal page state (aggregated across
  // structures). Falls back to the hardcoded scope.tiers[*].total when nothing
  // is picked on Build yet, so the presentation still renders in demo mode.
  const proposalTotal = (scopeId, tierId, fallback) => {
    const live = typeof aggregateTierTotal === 'function'
      ? aggregateTierTotal(structures, proposals, scopeId, tierId)
      : 0;
    return live > 0 ? live : fallback;
  };

  // Resolve each scope's current pick (tier object or flat object) + total.
  const scopePicks = PRESENT_SCOPES.map((scope) => {
    if (scope.tiered) {
      const pick = scope.tiers.find((t) => t.id === selByScope[scope.id]);
      const pickTotal = pick ? proposalTotal(scope.id, pick.id, pick.total) : 0;
      return { scope, pick, total: pickTotal };
    }
    const included = selByScope[scope.id] === 'included';
    return { scope, pick: included ? scope.flat : null, total: included ? scope.flat.total : 0, untiered: true };
  });

  const scopesTotal = scopePicks.reduce((s, x) => s + x.total, 0);
  const addonsTotal = Object.entries(addonsOn).reduce((sum, [id, on]) => on ? sum + (PRESENT_ADDONS.find((a) => a.id === id)?.price || 0) : sum, 0);
  const grandTotal = scopesTotal + addonsTotal;
  const grandMonthly = monthly(grandTotal);
  const anyPicked = scopePicks.some((x) => x.pick);
  // For the legacy "Continue to Sign" gate downstream we still require roofing chosen.
  const roofingPicked = !!scopePicks.find((x) => x.scope.id === 'roofing').pick;
  const firstName = CUSTOMER.name.split(/[ &]/)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tablet ? 18 : 14, paddingBottom: 8 }}>

      {/* ── 1. Customer-facing hero strip ─────────────────────── */}
      <div style={{
        background: 'var(--brand-soft)',
        color: 'var(--brand-soft-fg)',
        borderRadius: 14,
        padding: tablet ? '22px 28px' : '18px 18px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', opacity: 0.8 }}>
          Here's what we recommend
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 28 : 21, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.15, color: 'var(--text)' }}>
          Your project options, {firstName}.
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.45 }}>
          {scopePicks.length} scopes of work · pick a package for each, plus any add-ons.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          <HeroPill icon={<Icon.pin />} label={CUSTOMER.address.split(',')[0]} />
          <HeroPill icon={<Icon.user />} label={rep?.name || 'Your IHS rep'} />
          <HeroPill icon={<Icon.cal />} label="Quote valid 30 days" />
          {forStructure ?
            <HeroPill icon={<Icon.building />} label={`${forStructure.name} · ${forStructure.index} of ${forStructure.count}`} /> :
            (structures || []).length > 1 &&
              <HeroPill icon={<Icon.building />} label={`${structures.length} structures bundled`} />}
        </div>
      </div>

      {/* ── 2. Per-scope sections (Roofing/Siding tiered, Gutters flat) ──
          The per-scope tier-card grid is the homeowner-facing pricing
          view in both All-in and By-structure modes. By-structure mode
          gets one of these slides per building (tagged in the hero
          above); All-in mode rolls everything into a single slide. */}
      {PRESENT_SCOPES.map((scope, idx) => {
        // Substitute live proposal totals into the tier cards so the
        // homeowner-facing pricing tracks what the rep configured on Build.
        const liveScope = scope.tiered ?
        {
          ...scope,
          tiers: scope.tiers.map((t) => ({ ...t, total: proposalTotal(scope.id, t.id, t.total) }))
        } :
        scope;
        return (
          <ScopeSection
            key={scope.id}
            scope={liveScope}
            index={idx + 1}
            selected={selByScope[scope.id]}
            onSelect={(v) => handleSelectTier(scope.id, v)}
            monthly={monthly}
            tablet={tablet} />);

      })}

      {/* ── 3. Customer-friendly add-on grid ───────────────────── */}
      <div className="card" style={{ padding: tablet ? 20 : 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>Add to your project</div>
          <div style={{ fontSize: 10, color: 'var(--text-4)' }}>Bundle save: shared labor + permit</div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 20 : 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Want anything else done while we're here?</div>
        <div style={{ display: 'grid', gridTemplateColumns: tablet ? 'repeat(4, 1fr)' : '1fr 1fr', gap: 8, marginTop: 14 }}>
          {PRESENT_ADDONS.map((a) => {
            const on = !!addonsOn[a.id];
            return (
              <div
                key={a.id}
                onClick={() => setAddonsOn((s) => ({ ...s, [a.id]: !on }))}
                style={{
                  cursor: 'pointer',
                  border: `1.5px solid ${on ? 'var(--success)' : 'var(--border)'}`,
                  background: on ? 'var(--success-bg)' : 'var(--surface)',
                  borderRadius: 10,
                  padding: tablet ? 12 : 10,
                  display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'all 120ms ease'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)' }}>{a.label}</div>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999,
                    border: `1.5px solid ${on ? 'var(--success)' : 'var(--border-strong)'}`,
                    background: on ? 'var(--success)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', flexShrink: 0
                  }}>
                    {on && <Icon.check style={{ width: 11, height: 11 }} />}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4, minHeight: 28 }}>{a.desc}</div>
                <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: on ? 'var(--success)' : 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>+{fmt(a.price)}</div>
              </div>);

          })}
        </div>
      </div>

      {/* ── 4. Big monthly summary — aggregates all scopes + add-ons ── */}
      {anyPicked ?
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: tablet ? '24px 28px' : '18px 18px',
        display: 'flex', flexDirection: tablet ? 'row' : 'column',
        gap: tablet ? 28 : 16,
        alignItems: tablet ? 'center' : 'stretch',
        boxShadow: 'var(--shadow)'
      }}>
          <div style={{ flex: 1.2, paddingRight: tablet ? 24 : 0, borderRight: tablet ? '1px solid var(--border)' : 'none', borderBottom: tablet ? 'none' : '1px solid var(--border)', paddingBottom: tablet ? 0 : 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase', color: 'var(--text-3)' }}>Your monthly investment · 120 mo</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 56 : 44, fontWeight: 700, letterSpacing: '-0.035em', color: 'var(--brand)', lineHeight: 1, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
              {fmt(grandMonthly)}<span style={{ fontSize: tablet ? 18 : 15, color: 'var(--text-3)', fontWeight: 600, marginLeft: 4 }}>/mo</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>
              Total project: <strong style={{ color: 'var(--text)' }}>{fmt(grandTotal)}</strong>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {scopePicks.filter((x) => x.pick).map(({ scope, pick, untiered }) =>
          <div key={scope.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', gap: 12 }}>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{scope.label}</strong>
                  {' '}— {untiered ? 'included' : pick.name}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, flexShrink: 0 }}>{fmt(pick.total)}</span>
              </div>
          )}
            {PRESENT_ADDONS.filter((a) => addonsOn[a.id]).map((a) =>
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)' }}>
                <span>+ {a.label}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmt(a.price)}</span>
              </div>
          )}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Project total</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: 'var(--text)' }}>{fmt(grandTotal)}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 6, lineHeight: 1.45 }}>
              Est. monthly assumes 7.99% APR over 120 mo. Subject to credit approval.
              {!roofingPicked && <span style={{ color: 'var(--warn)', fontWeight: 600 }}> · Pick a roofing package to continue.</span>}
            </div>
          </div>
        </div> :

      <div className="card" style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>
          Pick a package above to lock in your monthly investment.
        </div>
      }
    </div>);
}

// ─── Scope section: header + cards block (tiered row or single flat card) ──
function ScopeSection({ scope, index, selected, onSelect, monthly, tablet }) {
  return (
    <div id={`blk-tier-${scope.id}`}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: tablet ? 12 : 10, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 8,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.12, textTransform: 'uppercase',
          color: 'var(--brand)'
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 18, height: 18, borderRadius: 999,
            background: 'var(--brand-soft)', color: 'var(--brand)',
            fontSize: 10, fontWeight: 800, lineHeight: 1
          }}>{index}</span>
          {scope.label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.015em' }}>
          {scope.headline}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4, flex: tablet ? 1 : '1 1 100%' }}>
          {scope.blurb}
        </span>
      </div>

      {scope.tiered ?
      <TieredCards scope={scope} selected={selected} onSelect={onSelect} monthly={monthly} tablet={tablet} /> :
      <FlatCard scope={scope} selected={selected} onSelect={onSelect} monthly={monthly} tablet={tablet} />
      }
    </div>);

}

// Three Good/Better/Best cards in a row (or stacked on phone) + optional
// per-scope "see side-by-side comparison" drawer underneath.
function TieredCards({ scope, selected, onSelect, monthly, tablet }) {
  const [showCompare, setShowCompare] = useState(false);
  const [blowout, setBlowout] = useState(null); // tier object opened in full-screen materials editor
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: tablet ? 'row' : 'column', gap: tablet ? 12 : 10 }}>
      {scope.tiers.map((tier) => {
          const isSel = selected === tier.id;
          const mo = monthly(tier.total);
          return (
            <div
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              style={{
                flex: 1, cursor: 'pointer',
                background: 'var(--surface)',
                border: `2px solid ${isSel ? 'var(--brand)' : 'transparent'}`,
                outline: isSel ? '0' : '1px solid var(--border)',
                outlineOffset: '-1px',
                boxShadow: isSel ? '0 0 0 3px var(--brand-soft), var(--shadow)' : 'var(--shadow-sm)',
                borderRadius: 14, padding: tablet ? 18 : 16,
                display: 'flex', flexDirection: 'column', gap: 9,
                position: 'relative',
                transition: 'box-shadow 160ms ease, border-color 160ms ease, outline-color 160ms ease'
              }}>
            {/* Blow-out button — opens fullscreen materials editor. (Craig, May '26.) */}
            <BlowoutButton onClick={(e) => {e.stopPropagation();setBlowout(tier);}} />
            {tier.recommended &&
              <span style={{
                position: 'absolute', top: -10, left: 16,
                background: 'var(--brand)', color: 'var(--brand-fg)',
                fontSize: 9, fontWeight: 800, letterSpacing: 0.1,
                textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 999,
                whiteSpace: 'nowrap'
              }}>Most Popular</span>
              }
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>{tier.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 18 : 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{tier.name}</div>

            <div style={{ marginTop: 2, paddingTop: 9, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 30 : 28, fontWeight: 700, letterSpacing: '-0.03em', color: isSel ? 'var(--brand)' : 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, transition: 'color 160ms' }}>
                {fmt(mo)}<span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginLeft: 3 }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, fontVariantNumeric: 'tabular-nums' }}>
                or <strong style={{ color: 'var(--text-2)' }}>{fmt(tier.total)}</strong> paid in full
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              {tier.inclusions.map((inc, i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>
                  <Icon.check style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2, width: 13, height: 13 }} />
                  <span>{inc}</span>
                </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
              <Icon.shield style={{ color: 'var(--brand)', flexShrink: 0 }} /> {tier.warranty}
            </div>
          </div>);

        })}
      </div>

      {scope.compareRows &&
      <CompareDrawer
        scope={scope}
        selected={selected}
        showCompare={showCompare}
        setShowCompare={setShowCompare}
        tablet={tablet} />
      }

      {blowout &&
      <MaterialsBlowout
        scope={scope}
        tier={blowout}
        tablet={tablet}
        onClose={() => setBlowout(null)} />
      }
    </div>);

}

// Per-scope side-by-side comparison drawer — toggle button + collapsible table.
function CompareDrawer({ scope, selected, showCompare, setShowCompare, tablet }) {
  return (
    <div>
      <button
        onClick={() => setShowCompare((v) => !v)}
        className="btn"
        style={{
          width: '100%', height: 40,
          border: '1px dashed var(--border-strong)',
          background: 'var(--surface)',
          color: 'var(--text-2)',
          fontSize: 12, fontWeight: 600,
          justifyContent: 'center', gap: 8
        }}>
        <Icon.grid style={{ width: 13, height: 13 }} />
        {showCompare ? `Hide side-by-side ${scope.label.toLowerCase()} comparison` : `See side-by-side ${scope.label.toLowerCase()} comparison`}
        <span style={{ display: 'inline-block', transform: showCompare ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', marginLeft: 2, lineHeight: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </button>
      {showCompare &&
      <div className="card" style={{ marginTop: 8, padding: 0, overflow: 'hidden' }}>
          <div style={{
          display: 'grid',
          gridTemplateColumns: tablet ? '1.1fr 1fr 1fr 1fr' : '1.1fr 0.9fr 0.9fr 0.9fr',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          fontSize: 10, fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase', color: 'var(--text-3)'
        }}>
            <div style={{ padding: tablet ? '12px 14px' : '10px 8px' }}>Detail</div>
            {scope.tiers.map((t) =>
          <div key={t.id} style={{
            padding: tablet ? '12px 14px' : '10px 8px',
            borderLeft: '1px solid var(--border)',
            textAlign: 'center',
            color: t.id === selected ? 'var(--brand)' : 'var(--text-3)',
            background: t.id === selected ? 'var(--brand-soft)' : 'transparent'
          }}>{t.label}</div>
          )}
          </div>
          {scope.compareRows.map((r, i) =>
        <div key={i} style={{
          display: 'grid',
          gridTemplateColumns: tablet ? '1.1fr 1fr 1fr 1fr' : '1.1fr 0.9fr 0.9fr 0.9fr',
          borderTop: i === 0 ? 'none' : '1px solid var(--border)',
          background: i % 2 ? 'var(--surface-2)' : 'transparent'
        }}>
              <div style={{ padding: tablet ? '12px 14px' : '10px 8px', fontSize: tablet ? 12 : 11, fontWeight: 600, color: 'var(--text-2)' }}>{r.label}</div>
              {scope.tiers.map((t) =>
          <div key={t.id} style={{
            padding: tablet ? '12px 14px' : '10px 8px',
            borderLeft: '1px solid var(--border)',
            fontSize: tablet ? 12 : 11,
            color: 'var(--text)',
            background: t.id === selected ? 'var(--brand-soft)' : 'transparent',
            textAlign: 'center', lineHeight: 1.35
          }}>{r[t.id]}</div>
          )}
            </div>
        )}
          {scope.compareFootnote &&
        <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
            {scope.compareFootnote}
          </div>
        }
        </div>
      }
    </div>);

}

// Single full-width card for scopes without a meaningful Good/Better/Best
// ladder (Gutters). Customer can include or skip it.
function FlatCard({ scope, selected, onSelect, monthly, tablet }) {
  const isSel = selected === 'included';
  const flat = scope.flat;
  const [blowout, setBlowout] = useState(false);
  const mo = monthly(flat.total);
  return (
    <>
    <div
        onClick={() => onSelect(isSel ? null : 'included')}
        style={{
          cursor: 'pointer',
          background: 'var(--surface)',
          border: `2px solid ${isSel ? 'var(--brand)' : 'transparent'}`,
          outline: isSel ? '0' : '1px solid var(--border)',
          outlineOffset: '-1px',
          boxShadow: isSel ? '0 0 0 3px var(--brand-soft), var(--shadow)' : 'var(--shadow-sm)',
          borderRadius: 14,
          padding: tablet ? '20px 22px' : 16,
          display: 'flex',
          flexDirection: tablet ? 'row' : 'column',
          gap: tablet ? 24 : 14,
          alignItems: 'stretch',
          position: 'relative',
          transition: 'box-shadow 160ms ease, border-color 160ms ease, outline-color 160ms ease'
        }}>
      {/* Blow-out button — opens fullscreen materials editor. (Craig, May '26.) */}
      <BlowoutButton onClick={(e) => {e.stopPropagation();setBlowout(true);}} />
      {/* Left: spec + inclusions */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingRight: 32 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase' }}>One spec</span>
          <span style={{ fontSize: 10, color: 'var(--text-4)' }}>·</span>
          <span style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic' }}>no Good/Better/Best needed for gutters</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 20 : 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{flat.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: tablet ? 'repeat(2, 1fr)' : '1fr', columnGap: 16, rowGap: 5, marginTop: 2 }}>
          {flat.inclusions.map((inc, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4 }}>
              <Icon.check style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2, width: 13, height: 13 }} />
              <span>{inc}</span>
            </div>
            )}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
          <Icon.shield style={{ color: 'var(--brand)', flexShrink: 0 }} /> {flat.warranty}
        </div>
      </div>

      {/* Right: price + include toggle */}
      <div style={{
          flexShrink: 0,
          width: tablet ? 200 : 'auto',
          borderLeft: tablet ? '1px solid var(--border)' : 'none',
          borderTop: tablet ? 'none' : '1px solid var(--border)',
          paddingLeft: tablet ? 22 : 0,
          paddingTop: tablet ? 0 : 14,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 14
        }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 34 : 30, fontWeight: 700, letterSpacing: '-0.03em', color: isSel ? 'var(--brand)' : 'var(--text)', fontVariantNumeric: 'tabular-nums', lineHeight: 1, transition: 'color 160ms' }}>
            {fmt(mo)}<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', marginLeft: 3 }}>/mo</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
            or <strong style={{ color: 'var(--text-2)' }}>{fmt(flat.total)}</strong> paid in full
          </div>
        </div>
        <button
            onClick={(e) => {e.stopPropagation();onSelect(isSel ? null : 'included');}}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px',
              borderRadius: 8,
              border: isSel ? '0' : '1px solid var(--border-strong)',
              background: isSel ? 'var(--brand)' : 'var(--surface)',
              color: isSel ? 'var(--brand-fg)' : 'var(--text-2)',
              fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 160ms ease'
            }}>
          {isSel ?
            <><Icon.check style={{ width: 13, height: 13 }} /> Included</> :

            'Add to project'
            }
        </button>
      </div>
    </div>
    {blowout &&
      <MaterialsBlowout
        scope={scope}
        tier={null}
        tablet={tablet}
        onClose={() => setBlowout(false)} />
      }
    </>);

}

// ─── Bundle summary card (multi-structure) ────────────────────
// Phase 2.5 PR-2 + PR-3 redesign port. Shown above the scope cards on
// the presentation slide when structures.length > 1. Organized by
// scope (Roofing, Siding, Gutters, Windows & Doors); within each scope
// each participating structure shows the tier that was picked for it
// upstream in the Build screen. (Proposals state lifted to app.jsx in
// PR-3a; this card consumes it.)
const PR3_TIER_LABEL = { good: 'Good', better: 'Better', best: 'Best' };
const PR3_TIER_COLOR = {
  good: 'var(--text-3)',
  better: 'var(--brand)',
  best: 'var(--success)'
};
const PR3_ALL_SCOPES = [
  { id: 'roofing', label: 'Roofing' },
  { id: 'siding', label: 'Siding' },
  { id: 'gutters', label: 'Gutters' },
  { id: 'windoors', label: 'Windows & Doors' }
];

// Derive a structure's picked tier per scope from the proposals bag.
// Order of preference: best > better > good (the highest tier that has
// any product picked counts as the rep's intended pick for the homeowner
// preview). Returns null if no products are picked for that scope.
function pickedTierFor(proposal, scopeId) {
  const sp = proposal?.scopeProducts?.[scopeId];
  if (!sp) return null;
  if (sp.best) return 'best';
  if (sp.better) return 'better';
  if (sp.good) return 'good';
  return null;
}

function BundleSummaryCard({ structures, proposals, tablet }) {
  // Only render a scope row if at least one structure has it included.
  const activeScopes = PR3_ALL_SCOPES.filter((sc) =>
    (structures || []).some((s) => (s.scopes || []).includes(sc.id))
  );
  return (
    <div className="card" style={{
      padding: tablet ? '18px 22px' : '14px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--brand)',
      borderRadius: 14
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--brand)', textTransform: 'uppercase' }}>
          Bundled project · {structures.length} structures
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>One number, all buildings</div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 20 : 17, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
        Here's everything that's included.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeScopes.map((sc, scIdx) => {
          // Structures that include this scope.
          const participants = (structures || []).filter((s) => (s.scopes || []).includes(sc.id));
          return (
            <div key={sc.id} style={{
              padding: '10px 12px',
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 18, height: 18, borderRadius: 999,
                  background: 'var(--brand-soft)', color: 'var(--brand)',
                  fontSize: 10, fontWeight: 800
                }}>{scIdx + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)', letterSpacing: 0.06, textTransform: 'uppercase' }}>{sc.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>
                  {participants.length} of {structures.length} buildings
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {participants.map((s) => {
                  const tier = pickedTierFor((proposals || {})[s.id], sc.id);
                  const accent = tier ? PR3_TIER_COLOR[tier] : 'var(--text-4)';
                  const label = tier ? PR3_TIER_LABEL[tier] : 'Pending';
                  return (
                    <div key={s.id} style={{
                      padding: '6px 10px', borderRadius: 8,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: accent, letterSpacing: 0.06, textTransform: 'uppercase', minWidth: 48 }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    </div>);
                })}
              </div>
            </div>);
        })}
      </div>
    </div>);
}

function HeroPill({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 11, color: 'var(--text-2)',
      fontWeight: 600
    }}>
      <span style={{ display: 'inline-flex', color: 'var(--text-3)' }}>{icon}</span>
      {label}
    </span>);

}

// ─── Blow-out button — top-right of each tier card. Icon-only.  ──────────
// Tapping pops a full-screen materials editor (Craig, May '26).
function BlowoutButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Expand materials"
      title="Expand materials"
      style={{
        position: 'absolute', top: 10, right: 10, zIndex: 2,
        width: 26, height: 26, padding: 0,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease'
      }}
      onMouseEnter={(e) => {e.currentTarget.style.background = 'var(--surface-2)';e.currentTarget.style.color = 'var(--text)';}}
      onMouseLeave={(e) => {e.currentTarget.style.background = 'var(--surface)';e.currentTarget.style.color = 'var(--text-3)';}}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    </button>);
}

// ─── Materials Blow-out — full-screen-of-device materials editor ───
// Shows name + quantity only (no costs, no profit, per Craig). Rep can edit
// the quantity inline, swap to an alternate product of the SAME type, add a
// new line via a catalog picker, or remove a line. Unit is read-only (it's
// a property of the material, not something the rep edits). The "upgrade"
// shortcut was dropped — Craig (May '26): too assumptive. Reps make spec
// changes by Swap or Add.
//
// Modal sizing: positioned absolute inset 0 inside the device screen so it
// behaves like a true full-screen view inside the phone/tablet frame (Craig,
// May '26: "should be full screen of the device, not a modal that extends
// beyond it"). Rendered via portal targeting `.device-screen`.

// Material-type taxonomy. Used to (1) filter the Swap drawer to the same
// type as the line being swapped (so I&W doesn't show drip edge, per Craig)
// and (2) categorize the Add-from-catalog drawer.
const MATERIAL_TYPE_BY_ID = {
  // Roofing
  shingles: 'Shingles',
  underlay: 'Underlayment',
  'iw-valley': 'Ice & Water Shield',
  'iw-full': 'Ice & Water Shield',
  drip: 'Drip Edge',
  starter: 'Starter Strip',
  'ridge-cap': 'Ridge Cap',
  'ridge-vent': 'Ridge Vent',
  'step-flash': 'Step Flashing',
  'counter-flash': 'Counter Flashing',
  'pipe-boots': 'Pipe Boots',
  nails: 'Fasteners',
  tearoff: 'Tear-off & Disposal',
  inspection: 'Service',
  // Siding
  siding: 'Siding',
  accent: 'Accent Panel',
  wrap: 'Weather Wrap',
  trim: 'Trim',
  corners: 'Corners',
  caulk: 'Caulk',
  finish: 'Finish',
  // Gutters
  gutter: 'Gutter',
  hangers: 'Hangers',
  downspouts: 'Downspouts',
  elbows: 'Elbows',
  splash: 'Splash Blocks',
  sealant: 'Sealant'
};

// Catalog of materials available to add, keyed by scope. Each item carries
// a `type`, a manufacturer/line for catalog grouping (so the picker can
// mimic the Build product picker), a display `name`, and a `unit`.
// IMPORTANT: NO prices/expenses appear on this picker — Craig (May '26):
// "mimic the add material picker from the Build page, just do not show
// expenses on it".
const MATERIAL_CATALOG = {
  roofing: [
    { type: 'Shingles', mfr: 'Owens Corning', line: 'TruDef', name: 'Duration shingles', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Oakridge', name: 'Architectural', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Duration', name: 'Designer (Class 4 IR)', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Duration', name: 'Storm', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Berkshire', name: 'Collection (luxury)', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Woodmoor', name: 'Designer', unit: 'sq' },
    { type: 'Shingles', mfr: 'Owens Corning', line: 'Woodcrest', name: 'Designer', unit: 'sq' },
    { type: 'Shingles', mfr: 'GAF', line: 'Timberline', name: 'HDZ', unit: 'sq' },
    { type: 'Shingles', mfr: 'CertainTeed', line: 'Landmark', name: 'Architectural', unit: 'sq' },
    { type: 'Underlayment', mfr: 'IHS', line: 'Synthetic', name: 'Full deck underlayment', unit: 'sq' },
    { type: 'Underlayment', mfr: 'IHS', line: 'Synthetic', name: 'Underlayment + I&W combo', unit: 'sq' },
    { type: 'Ice & Water Shield', mfr: 'GAF', line: 'WeatherWatch', name: 'I&W — valleys only', unit: 'sq' },
    { type: 'Ice & Water Shield', mfr: 'GAF', line: 'WeatherWatch', name: 'I&W — valleys + eaves', unit: 'sq' },
    { type: 'Ice & Water Shield', mfr: 'GAF', line: 'StormGuard', name: 'I&W — full deck', unit: 'sq' },
    { type: 'Drip Edge', mfr: 'IHS', line: 'Aluminum', name: 'Drip edge', unit: 'lf' },
    { type: 'Drip Edge', mfr: 'IHS', line: 'Galvanized', name: 'Drip edge', unit: 'lf' },
    { type: 'Drip Edge', mfr: 'IHS', line: 'Copper', name: 'Drip edge', unit: 'lf' },
    { type: 'Starter Strip', mfr: 'IHS', line: 'Pre-cut', name: 'Starter strip', unit: 'lf' },
    { type: 'Starter Strip', mfr: 'IHS', line: 'Cut-from-3-tab', name: 'Starter strip', unit: 'lf' },
    { type: 'Ridge Cap', mfr: 'Owens Corning', line: 'ProEdge', name: 'Hip & ridge cap', unit: 'lf' },
    { type: 'Ridge Cap', mfr: 'Owens Corning', line: 'DecoRidge', name: 'Designer ridge cap', unit: 'lf' },
    { type: 'Ridge Vent', mfr: 'GAF', line: 'Cobra', name: 'Continuous ridge vent', unit: 'lf' },
    { type: 'Ridge Vent', mfr: 'IHS', line: 'Static', name: 'Box vent', unit: 'ea' },
    { type: 'Step Flashing', mfr: 'IHS', line: 'Re-set', name: 'Step flashing (existing)', unit: 'lf' },
    { type: 'Step Flashing', mfr: 'IHS', line: 'Aluminum', name: 'New step flashing', unit: 'lf' },
    { type: 'Step Flashing', mfr: 'IHS', line: 'Copper', name: 'New step flashing', unit: 'lf' },
    { type: 'Counter Flashing', mfr: 'IHS', line: 'Aluminum', name: 'Counter flashing', unit: 'lf' },
    { type: 'Counter Flashing', mfr: 'IHS', line: 'Copper', name: 'Counter flashing', unit: 'lf' },
    { type: 'Pipe Boots', mfr: 'IHS', line: 'Rubber', name: 'Standard pipe boot', unit: 'ea' },
    { type: 'Pipe Boots', mfr: 'IHS', line: 'Lead', name: 'Lead pipe boot', unit: 'ea' },
    { type: 'Pipe Boots', mfr: 'IHS', line: 'Copper', name: 'Copper pipe collar', unit: 'ea' },
    { type: 'Fasteners', mfr: 'IHS', line: 'Coil nails', name: 'Roofing nails', unit: 'box' },
    { type: 'Fasteners', mfr: 'IHS', line: 'Stainless', name: 'Stainless coil nails', unit: 'box' },
    { type: 'Tear-off & Disposal', mfr: 'IHS', line: 'Tear-off', name: 'Tear-off & disposal', unit: 'sq' },
    { type: 'Skylight', mfr: 'Velux', line: 'Deck-mount', name: 'Skylight + full flashing kit', unit: 'ea' },
    { type: 'Skylight', mfr: 'IHS', line: 'Flashing kit', name: 'Skylight flashing kit only', unit: 'ea' },
    { type: 'Decking', mfr: 'IHS', line: 'CDX', name: 'Plywood (4×8 sheet)', unit: 'ea' },
    { type: 'Decking', mfr: 'IHS', line: 'OSB', name: 'OSB decking (4×8 sheet)', unit: 'ea' },
    { type: 'Vent', mfr: 'IHS', line: 'Bath fan', name: 'Vent boot', unit: 'ea' }
  ],
  siding: [
    { type: 'Siding', mfr: 'James Hardie', line: 'HardiePlank', name: 'Select Cedarmill', unit: 'sq' },
    { type: 'Siding', mfr: 'James Hardie', line: 'HardiePlank', name: 'ColorPlus', unit: 'sq' },
    { type: 'Siding', mfr: 'James Hardie', line: 'Artisan', name: 'Series', unit: 'sq' },
    { type: 'Siding', mfr: 'LP', line: 'SmartSide', name: 'Lap siding', unit: 'sq' },
    { type: 'Accent Panel', mfr: 'James Hardie', line: 'HardieShingle', name: 'Accent panels', unit: 'sq' },
    { type: 'Accent Panel', mfr: 'James Hardie', line: 'Artisan', name: 'Shingle accents', unit: 'sq' },
    { type: 'Weather Wrap', mfr: 'DuPont', line: 'Tyvek', name: 'HomeWrap', unit: 'sq' },
    { type: 'Weather Wrap', mfr: 'DuPont', line: 'Tyvek', name: 'HomeWrap + flashing tape', unit: 'sq' },
    { type: 'Weather Wrap', mfr: 'IHS', line: 'Penetrations', name: 'Full flashing kit', unit: 'job' },
    { type: 'Trim', mfr: 'IHS', line: '5/4', name: 'Standard trim', unit: 'lf' },
    { type: 'Trim', mfr: 'IHS', line: 'Upgraded', name: 'Trim package', unit: 'lf' },
    { type: 'Trim', mfr: 'IHS', line: 'Architect-spec', name: 'Custom trim', unit: 'lf' },
    { type: 'Corners', mfr: 'IHS', line: 'Standard', name: 'Outside corners', unit: 'ea' },
    { type: 'Corners', mfr: 'IHS', line: 'Mitered', name: 'Mitered outside corners', unit: 'ea' },
    { type: 'Corners', mfr: 'IHS', line: 'Custom', name: 'Custom mitered corners', unit: 'ea' },
    { type: 'Caulk', mfr: 'IHS', line: 'Exterior', name: 'Exterior-grade caulk', unit: 'tube' },
    { type: 'Caulk', mfr: 'IHS', line: 'Color-matched', name: 'Caulk full perimeter', unit: 'tube' },
    { type: 'Finish', mfr: 'James Hardie', line: 'ColorPlus', name: 'Standard finish', unit: 'job' },
    { type: 'Finish', mfr: 'James Hardie', line: 'ColorPlus', name: 'Upgraded finish', unit: 'job' },
    { type: 'Finish', mfr: 'IHS', line: 'On-site', name: 'Color match · two coats', unit: 'job' },
    { type: 'Tear-off & Disposal', mfr: 'IHS', line: 'Tear-off', name: 'Tear-off & disposal', unit: 'sq' }
  ],
  gutters: [
    { type: 'Gutter', mfr: 'IHS', line: 'K-Style', name: '6" seamless aluminum', unit: 'lf' },
    { type: 'Gutter', mfr: 'IHS', line: 'K-Style', name: '5" seamless aluminum', unit: 'lf' },
    { type: 'Gutter', mfr: 'IHS', line: 'Half-Round', name: '6" copper', unit: 'lf' },
    { type: 'Hangers', mfr: 'IHS', line: 'Hidden', name: 'Heavy-duty hangers', unit: 'ea' },
    { type: 'Hangers', mfr: 'IHS', line: 'Standard', name: 'Hangers', unit: 'ea' },
    { type: 'Downspouts', mfr: 'IHS', line: 'Oversized', name: '3"×4" downspouts', unit: 'ea' },
    { type: 'Downspouts', mfr: 'IHS', line: 'Standard', name: '2"×3" downspouts', unit: 'ea' },
    { type: 'Elbows', mfr: 'IHS', line: 'Downspout', name: 'Elbows', unit: 'ea' },
    { type: 'Splash Blocks', mfr: 'IHS', line: 'Concrete', name: 'Splash blocks', unit: 'ea' },
    { type: 'Sealant', mfr: 'IHS', line: 'Gutter', name: 'Sealant', unit: 'tube' },
    { type: 'Guards', mfr: 'LeafGuard', line: 'MicroMesh', name: 'Leaf guards', unit: 'lf' }
  ]
};

function typeForItem(item) {
  return item.type || MATERIAL_TYPE_BY_ID[item.id] || 'Other';
}

function MaterialsBlowout({ scope, tier, tablet, onClose }) {
  const tierKey = tier?.id || 'flat';
  const seed = useMemo(() => materialsFor(scope.id, tierKey), [scope.id, tierKey]);
  const [items, setItems] = useState(() => seed.map((m, i) => ({ ...m, _k: `seed-${i}`, type: typeForItem(m) })));
  const [nextK, setNextK] = useState(seed.length);
  // Bottom-sheet drawers — only one open at a time.
  const [addOpen, setAddOpen] = useState(false);
  const [swapFor, setSwapFor] = useState(null);

  const update = (k, patch) => setItems((arr) => arr.map((it) => it._k === k ? { ...it, ...patch } : it));
  const remove = (k) => setItems((arr) => arr.filter((it) => it._k !== k));

  // Add an item from the catalog. Carries type + unit so the row knows what
  // it is for swap-filtering / display.
  const addFromCatalog = (cat) => {
    setItems((arr) => [...arr, {
      id: `custom-${nextK}`,
      name: `${cat.line} · ${cat.name}`,
      qty: 1,
      unit: cat.unit,
      type: cat.type,
      _k: `new-${nextK}`
    }]);
    setNextK((n) => n + 1);
    setAddOpen(false);
  };

  // Swap to a catalog product. Updates name + unit (unit is derived from
  // product); preserves quantity.
  const applySwap = (k, cat) => {
    update(k, { name: `${cat.line} · ${cat.name}`, unit: cat.unit, type: cat.type });
    setSwapFor(null);
  };

  const headerLabel = tier ? `${tier.label} · ${tier.name}` : flatLabelFor(scope);
  const fontDisp = 'var(--font-display)';

  // Swap-drawer context: the row we're swapping + catalog filtered to that type.
  const swapItem = swapFor != null ? items.find((it) => it._k === swapFor) : null;
  const swapType = swapItem ? typeForItem(swapItem) : null;
  const swapCandidates = swapType ? (MATERIAL_CATALOG[scope.id] || []).filter((c) => c.type === swapType) : [];

  // Catalog grouped by type for the Add drawer (mimic the Build page's
  // product picker — manufacturer · line · name, no prices).
  const catalogForScope = MATERIAL_CATALOG[scope.id] || [];
  const catalogByType = useMemo(() => {
    const m = {};
    catalogForScope.forEach((c) => {
      (m[c.type] = m[c.type] || []).push(c);
    });
    return m;
  }, [catalogForScope]);

  // Portal target: the device-screen wrapper. Falls back to document.body
  // if not found (e.g. in tests).
  const portalHost = (typeof document !== 'undefined' && document.querySelector('.device-screen')) || (typeof document !== 'undefined' && document.body) || null;

  const ui = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Materials for ${headerLabel}`}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: tablet ? '20px 24px 16px' : '14px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: 'var(--surface)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--brand)' }}>
              <span style={{ background: 'var(--brand-soft)', color: 'var(--brand)', padding: '3px 8px', borderRadius: 999 }}>{scope.label}</span>
              <span style={{ color: 'var(--text-3)' }}>·</span>
              <span style={{ color: 'var(--text-2)', fontWeight: 700 }}>{tier ? tier.label : 'One spec'}</span>
            </div>
            <div style={{ fontFamily: fontDisp, fontSize: tablet ? 24 : 18, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 6, lineHeight: 1.15 }}>
              {tier ? tier.name : scope.flat.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.4 }}>
              {items.length} line item{items.length === 1 ? '' : 's'} · edit qty, swap, add or remove.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 999,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              cursor: 'pointer', color: 'var(--text-2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
            <Icon.x />
          </button>
        </div>

        {/* Body — scrolling list */}
        <div style={{ flex: 1, overflow: 'auto', padding: tablet ? '16px 24px' : '12px 12px', background: 'var(--surface-2)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: tablet ? '1fr 90px 60px 110px' : '1fr',
            gap: 6,
            padding: tablet ? '0 4px 8px' : 0,
            fontSize: 9, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-4)', textTransform: 'uppercase'
          }}>
            <span>Item</span>
            {tablet && <span style={{ textAlign: 'right' }}>Qty</span>}
            {tablet && <span style={{ textAlign: 'center' }}>U/O</span>}
            {tablet && <span style={{ textAlign: 'right' }}>Actions</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((it) =>
            <MaterialRow
              key={it._k}
              item={it}
              tablet={tablet}
              onQtyChange={(v) => update(it._k, { qty: v })}
              onSwap={() => setSwapFor(it._k)}
              onRemove={() => remove(it._k)} />
            )}

            {items.length === 0 &&
            <div style={{
              padding: '32px 20px', textAlign: 'center',
              background: 'var(--surface)', border: '1px dashed var(--border-strong)',
              borderRadius: 10, color: 'var(--text-3)', fontSize: 13
            }}>
                No items yet — tap <strong>Add material</strong> below to build the list.
              </div>
            }

            {/* Add-material affordance — opens bottom-sheet catalog picker. */}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              style={{
                marginTop: 4,
                padding: '12px 14px',
                background: 'var(--surface)', border: '1.5px dashed var(--brand)',
                borderRadius: 10, color: 'var(--brand)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
              <Icon.plus /> Add material
            </button>
          </div>
        </div>

        {/* Footer — Done */}
        <div style={{
          padding: tablet ? '14px 24px 18px' : '12px 16px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4, flex: 1, minWidth: 0 }}>
            Changes apply to <strong style={{ color: 'var(--text-2)' }}>this package only</strong>.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ flexShrink: 0 }}>
            <Icon.check /> Done
          </button>
        </div>

        {/* Add-material bottom sheet — mimics the Build page's product
            picker drawer. Shows manufacturer · product · name grouped by
            type. No prices/expenses (Craig, May '26). */}
        {addOpen &&
        <MaterialAddSheet
          scope={scope}
          catalogByType={catalogByType}
          onPick={addFromCatalog}
          onClose={() => setAddOpen(false)} />
        }

        {/* Swap bottom sheet — filtered to the same material TYPE as the
            row being swapped (Craig: "I&W should not show drip edge"). */}
        {swapItem &&
        <MaterialSwapSheet
          scope={scope}
          item={swapItem}
          candidates={swapCandidates}
          onPick={(cat) => applySwap(swapItem._k, cat)}
          onClose={() => setSwapFor(null)} />
        }
    </div>);

  return portalHost ? ReactDOM.createPortal(ui, portalHost) : ui;
}

function flatLabelFor(scope) {
  return `One spec · ${scope.flat?.name || scope.label}`;
}

// ─── Icon-button style (swap / remove actions on rows) ─────────────────
function iconBtnStyle(variant) {
  const base = {
    width: 32, height: 32, borderRadius: 6, padding: 0,
    background: 'var(--surface-2)', border: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-2)'
  };
  if (variant === 'danger') return { ...base, color: 'var(--danger)' };
  return base;
}

// ─── A single material row — qty editable, unit read-only, swap+remove ──
// Craig (May '26): drop the upgrade button (assumptive); quantity editable;
// U/O is a property of the material so it's not editable here. Swap opens
// the bottom-drawer material picker filtered to the row's type.
function MaterialRow({ item, tablet, onQtyChange, onSwap, onRemove }) {
  const type = typeForItem(item);
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: tablet ? '10px 12px' : '10px 12px',
      display: 'grid',
      gridTemplateColumns: tablet ? '1fr 90px 60px 110px' : '1fr auto',
      gap: tablet ? 10 : 8,
      alignItems: 'center'
    }}>
      {/* Name + type pill */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
          {type}
        </span>
        <span style={{
          fontSize: tablet ? 13 : 13, fontWeight: 600, color: 'var(--text)',
          letterSpacing: '-0.01em', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {item.name}
        </span>
      </div>

      {/* Phone layout: qty + unit (read-only) + actions in a single trailing cluster */}
      {!tablet &&
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
          <input
          type="number"
          value={item.qty}
          min={0}
          onChange={(e) => onQtyChange(Number(e.target.value) || 0)}
          aria-label="Quantity"
          style={{
            width: 56, border: '1px solid var(--border)', background: 'var(--surface-2)',
            padding: '6px 8px', borderRadius: 6, fontSize: 13, fontWeight: 700,
            textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text)'
          }} />
          <span
          aria-label="Unit (read-only)"
          style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
            background: 'var(--surface-2)', padding: '6px 8px', borderRadius: 6,
            border: '1px solid var(--border)',
            minWidth: 36, textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: 0.04
          }}>{item.unit}</span>
          <button type="button" onClick={onSwap} title="Swap" aria-label="Swap" style={iconBtnStyle()}>
            <Icon.swap />
          </button>
          <button type="button" onClick={onRemove} title="Remove" aria-label="Remove" style={iconBtnStyle('danger')}>
            <Icon.trash />
          </button>
        </div>
      }

      {/* Tablet layout: qty / unit / actions in distinct grid columns */}
      {tablet &&
        <input
          type="number"
          value={item.qty}
          min={0}
          onChange={(e) => onQtyChange(Number(e.target.value) || 0)}
          aria-label="Quantity"
          style={{
            width: '100%', border: '1px solid var(--border)', background: 'var(--surface-2)',
            padding: '8px 10px', borderRadius: 6, fontSize: 14, fontWeight: 700,
            textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text)'
          }} />
      }
      {tablet &&
        <span
          aria-label="Unit (read-only)"
          style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-3)',
            background: 'var(--surface-2)', padding: '8px 6px', borderRadius: 6,
            border: '1px solid var(--border)',
            textAlign: 'center',
            textTransform: 'uppercase', letterSpacing: 0.04
          }}>{item.unit}</span>
      }
      {tablet &&
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onSwap}
            title="Swap"
            style={{
              ...iconBtnStyle(),
              width: 'auto', padding: '0 10px', gap: 4,
              fontSize: 11, fontWeight: 700
            }}>
            <Icon.swap /> Swap
          </button>
          <button type="button" onClick={onRemove} title="Remove" aria-label="Remove" style={iconBtnStyle('danger')}>
            <Icon.trash />
          </button>
        </div>
      }
    </div>);
}

// ─── Add-material bottom sheet — mimics the Build product picker ────────
// Lists catalog entries grouped by type. Each row shows manufacturer · line
// · name (matching the Build page's ProductPickerDrawer) but does NOT show
// price/expenses (Craig, May '26).
function MaterialAddSheet({ scope, catalogByType, onPick, onClose }) {
  const types = Object.keys(catalogByType);
  return (
    <React.Fragment>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--brand)', textTransform: 'uppercase' }}>{scope.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· catalog</span>
          </div>
          <h3 style={{ margin: '2px 0 4px' }}>Add a material</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            Pick the manufacturer · product · name. Quantity defaults to 1 — edit in place after adding.
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {types.map((type) =>
            <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.1, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 2 }}>
                {type}
              </div>
              {catalogByType[type].map((p, i) =>
                <button
                  key={`${type}-${i}`}
                  type="button"
                  onClick={() => onPick(p)}
                  className="card"
                  style={{
                    padding: 12, textAlign: 'left', cursor: 'pointer', display: 'block',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)',
                      color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: 0.04
                    }}>
                      {p.mfr.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{p.mfr}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginTop: 2 }}>{p.line} · {p.name}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                      background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 999,
                      border: '1px solid var(--border)',
                      textTransform: 'uppercase', letterSpacing: 0.04,
                      flexShrink: 0
                    }}>{p.unit}</span>
                  </div>
                </button>
              )}
            </div>
          )}
          {types.length === 0 &&
            <div style={{ padding: '40px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
              Catalog is empty for this scope.
            </div>
          }
        </div>
      </div>
    </React.Fragment>);
}

// ─── Swap bottom sheet — filtered to the row's type ─────────────────────
// "Swap should bring up the bottom drawer material selector filtered to
// that type of material. I&W should not show drip edge for example." —Craig
function MaterialSwapSheet({ scope, item, candidates, onPick, onClose }) {
  const type = typeForItem(item);
  return (
    <React.Fragment>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.12, color: 'var(--brand)', textTransform: 'uppercase' }}>{scope.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· swap {type.toLowerCase()}</span>
          </div>
          <h3 style={{ margin: '2px 0 4px' }}>Swap “{item.name}”</h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.4 }}>
            Showing {type.toLowerCase()} options only. Quantity is preserved.
          </div>
        </div>
        <div style={{ overflow: 'auto', padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {candidates.map((p, i) => {
            const candidateName = `${p.line} · ${p.name}`;
            const isCurrent = candidateName === item.name;
            return (
              <button
                key={`${type}-${i}`}
                type="button"
                onClick={() => !isCurrent && onPick(p)}
                disabled={isCurrent}
                className="card"
                style={{
                  padding: 12, textAlign: 'left',
                  cursor: isCurrent ? 'default' : 'pointer',
                  display: 'block',
                  border: isCurrent ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                  background: isCurrent ? 'var(--brand-soft)' : 'var(--surface)',
                  opacity: 1
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)',
                    color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, flexShrink: 0, letterSpacing: 0.04
                  }}>
                    {p.mfr.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase' }}>{p.mfr}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', marginTop: 2 }}>{p.line} · {p.name}</div>
                    {isCurrent && <span className="pill brand" style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>Current</span>}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                    background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 999,
                    border: '1px solid var(--border)',
                    textTransform: 'uppercase', letterSpacing: 0.04,
                    flexShrink: 0
                  }}>{p.unit}</span>
                </div>
              </button>);
          })}
          {candidates.length === 0 &&
            <div style={{ padding: '32px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
              No alternates in catalog for {type.toLowerCase()}.
            </div>
          }
        </div>
      </div>
    </React.Fragment>);
}

function PresenterMenu() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // 'email' = scheduling sheet open as a prerequisite to sending the proposal
  // 'followup' = standalone follow-up scheduling
  const [sheet, setSheet] = useState(null);

  const trigger = (action) => {
    setSheet(null);
    setOpen(false);
    setToast(action);
    setTimeout(() => setToast(null), 2400);
  };
  return (
    <>
      <div style={{ position: 'relative', width: 50, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="More options"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: open ? 'var(--surface-2)' : 'transparent',
            border: 0, cursor: 'pointer', color: 'var(--text-2)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, letterSpacing: -1, padding: 0
          }}>
          ⋮
        </button>
        {open &&
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />
          <div style={{
            position: 'absolute', top: 38, right: 0, zIndex: 51,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, minWidth: 240,
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
          }}>
            <MenuItem icon={<Icon.cal />} label="Schedule follow-up" sub="If they're not ready today" onClick={() => {setOpen(false);setSheet('followup');}} />
            <MenuItem icon={<Icon.mail />} label="Email proposal" sub="Requires a scheduled follow-up" onClick={() => {setOpen(false);setSheet('email');}} />
          </div>
        </>
        }
      </div>

      {/* Sheet + toast render OUTSIDE the menu's relative wrapper so
          .sheet's position: absolute resolves up to the app-root rather
          than the 50px-wide menu column. */}
      {sheet &&
      <FollowupSchedulerSheet
        mode={sheet}
        onClose={() => setSheet(null)}
        onConfirm={(meta) => {
          if (sheet === 'email') {
            trigger(`Proposal emailed · follow-up set for ${meta.label}`);
          } else {
            trigger(`Follow-up scheduled for ${meta.label} — added to dashboard`);
          }
        }} />
      }

      {toast &&
      <div style={{
        position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--text)', color: 'var(--bg)',
        padding: '10px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        zIndex: 60, boxShadow: 'var(--shadow-lg)',
        maxWidth: 'calc(100vw - 32px)', textAlign: 'center'
      }}>
        ✓ {toast}
      </div>
      }
    </>);

}

// Scheduling sheet — also gates "Email proposal" so a rep can't drop a quote
// into the homeowner's inbox and walk away. Picks a date+window+channel.
function FollowupSchedulerSheet({ mode, onClose, onConfirm }) {
  // Pre-populate next-business-day at 10 AM.
  const fmtDate = (d) => d.toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Skip weekends.
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 1);

  const [date, setDate] = useState(fmtDate(tomorrow));
  const [windowSlot, setWindowSlot] = useState('morning');
  const [channel, setChannel] = useState('call');
  const [note, setNote] = useState('');

  const isEmail = mode === 'email';
  const minDate = fmtDate(new Date());
  const valid = !!date;

  const WINDOWS = [
  { id: 'morning', label: 'Morning', sub: '8–11 AM' },
  { id: 'midday', label: 'Midday', sub: '11 AM–2 PM' },
  { id: 'afternoon', label: 'Afternoon', sub: '2–5 PM' },
  { id: 'evening', label: 'Evening', sub: '5–7 PM' }];

  const CHANNELS = [
  { id: 'call', label: 'Phone call', icon: <Icon.phone /> },
  { id: 'text', label: 'Text message', icon: <Icon.mic /> },
  { id: 'visit', label: 'In-person', icon: <Icon.pin /> }];


  const submit = () => {
    if (!valid) return;
    const d = new Date(date + 'T12:00:00');
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const win = WINDOWS.find((w) => w.id === windowSlot);
    onConfirm({ date, windowSlot, channel, note, label: `${dayLabel} · ${win.label}` });
  };

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} style={{ zIndex: 70 }} />
      <div className="sheet" style={{ zIndex: 71, maxHeight: '92%' }}>
        <div className="grabber" />
        <div style={{ padding: '0 16px 4px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--brand)', letterSpacing: 0.1, textTransform: 'uppercase' }}>
            {isEmail ? 'Email proposal · step 1 of 2' : 'Schedule follow-up'}
          </div>
          <h3 style={{ margin: '4px 0 4px' }}>
            {isEmail ? 'Lock in a follow-up first' : 'When should we circle back?'}
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            {isEmail ?
            "Proposals don't close themselves. Pick a date and channel — the email goes out together with the follow-up logged to your dashboard." :
            "Pick a date, a window, and how you'll reach out. It lands in their record and on your dashboard."}
          </div>
        </div>

        <div style={{ padding: '14px 16px 4px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Date + window */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="label" style={{ fontSize: 10 }}>Date</label>
              <input
                type="date"
                className="input"
                value={date}
                min={minDate}
                onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label" style={{ fontSize: 10 }}>Time window</label>
              <select
                className="input"
                value={windowSlot}
                onChange={(e) => setWindowSlot(e.target.value)}>
                {WINDOWS.map((w) =>
                <option key={w.id} value={w.id}>{w.label} · {w.sub}</option>
                )}
              </select>
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="label" style={{ fontSize: 10 }}>Reach-out method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {CHANNELS.map((c) => {
                const sel = c.id === channel;
                return (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id)}
                    className="btn btn-sm"
                    style={{
                      height: 40,
                      borderColor: sel ? 'var(--brand)' : 'var(--border)',
                      background: sel ? 'var(--brand-soft)' : 'var(--surface)',
                      color: sel ? 'var(--brand-soft-fg)' : 'var(--text-2)',
                      fontWeight: sel ? 700 : 500,
                      gap: 6
                    }}>
                    {c.icon} {c.label}
                  </button>);

              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="label" style={{ fontSize: 10 }}>Quick note <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>· optional</span></label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isEmail ? "Anything the homeowner said you want to address on the follow-up?" : "What are you circling back on?"}
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--surface)',
                color: 'var(--text)', fontSize: 13, lineHeight: 1.5,
                fontFamily: 'inherit', resize: 'vertical', minHeight: 60,
                outline: 'none'
              }} />
          </div>

          {/* Email-mode info row */}
          {isEmail &&
          <div style={{
            padding: '10px 12px',
            background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
            borderRadius: 8,
            display: 'flex', gap: 10, alignItems: 'flex-start',
            fontSize: 11, lineHeight: 1.5
          }}>
              <Icon.mail style={{ flexShrink: 0, marginTop: 1 }} />
              <span>The proposal email and the follow-up reminder go out as one action. Both get logged to the customer record.</span>
            </div>
          }
        </div>

        <div style={{ padding: '12px 16px 14px', display: 'flex', gap: 8 }}>
          <button className="btn btn-block" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn btn-primary btn-block"
            style={{ flex: 2, opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}
            onClick={submit}>
            {isEmail ? <><Icon.mail /> Schedule & email proposal</> : <><Icon.check /> Schedule follow-up</>}
          </button>
        </div>
      </div>
    </>);

}

function MenuItem({ icon, label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '12px 14px',
      background: 'transparent', border: 0,
      borderBottom: '1px solid var(--border)',
      cursor: 'pointer', textAlign: 'left'
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--surface-2)', color: 'var(--text-2)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{sub}</span>
      </span>
    </button>);

}