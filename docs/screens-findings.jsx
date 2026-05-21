/* global React, Icon, FINDINGS_SEED, CUSTOMER */
/* Findings & Education surface (DST-FE) — homeowner-facing, no prices */

const { useState } = window;

const SEVERITY_STYLE = {
  routine: { label: 'Routine', color: 'var(--text-3)', bg: 'var(--surface-3)' },
  notable: { label: 'Notable', color: 'var(--warn)', bg: 'var(--warn-bg)' },
  action: { label: 'Action recommended', color: 'var(--danger)', bg: 'var(--danger-bg)' }
};

function FindingsScreen({ findings, setFindings, tablet, onBack, onContinue }) {
  // focus = { finding, photoIndex } when carousel is open
  const [focus, setFocus] = useState(null);
  const [education, setEducation] = useState(null);

  const toggleDiscussed = (id) => {
    setFindings((s) => s.map((f) => f.id === id ? { ...f, discussed: !f.discussed } : f));
  };

  const openCarousel = (finding, photoIndex = 0) => setFocus({ finding, photoIndex });
  const closeCarousel = () => setFocus(null);
  const stepCarousel = (delta) => setFocus((prev) => {
    if (!prev) return prev;
    const photos = getPhotos(prev.finding);
    const next = (prev.photoIndex + delta + photos.length) % photos.length;
    return { ...prev, photoIndex: next };
  });

  const lastName = CUSTOMER.name.split(' ').slice(-1)[0];

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{ padding: tablet ? '24px 28px 6px' : '16px 16px 6px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.1, color: 'var(--brand)', textTransform: 'uppercase' }}>SOLVE · Findings</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 36 : 24, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, lineHeight: 1.1 }}>
          Here's what we found on your roof, {lastName}s.
        </div>
        <div style={{ fontSize: tablet ? 14 : 12, color: 'var(--text-3)', marginTop: 8, maxWidth: 520 }}>
          We'll walk through each finding together. Tap "How this affects your home" to learn more about anything that's unclear. Pricing comes next.
        </div>
      </div>

      {/* Findings stack */}
      <div style={{ padding: tablet ? '16px 28px 0' : '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {findings.map((f) =>
        <FindingCard
          key={f.id}
          f={f}
          tablet={tablet}
          onOpenEducation={() => setEducation(f)}
          onToggleDiscussed={() => toggleDiscussed(f.id)}
          onOpenPhoto={(idx) => openCarousel(f, idx)} />
        )}
      </div>

      {/* CTA — full-width Continue, no summary card */}
      <div style={{ padding: tablet ? '20px 28px 28px' : '18px 16px 22px' }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onContinue}>
          Continue to solution <Icon.arrow />
        </button>
      </div>

      {/* Full-screen carousel — every photo for this finding, swipeable */}
      {focus &&
      <PhotoCarousel
        finding={focus.finding}
        index={focus.photoIndex}
        onPrev={() => stepCarousel(-1)}
        onNext={() => stepCarousel(1)}
        onClose={closeCarousel} />
      }

      {/* Education sheet */}
      {education &&
      <>
          <div className="sheet-backdrop" onClick={() => setEducation(null)} />
          <div className="sheet">
            <div className="grabber" />
            <div style={{ padding: '0 16px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 4 }}>How this affects your home</div>
              <h3 style={{ margin: '0 0 10px' }}>{education.headline}</h3>
            </div>
            <div style={{ padding: '0 16px 4px' }}>
              <div className="placeholder-photo" style={{ height: 140, marginBottom: 12 }}>diagram-or-video.mp4</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--text-2)' }}>{education.education}</div>
            </div>
            <div style={{ padding: '14px 16px 8px' }}>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setEducation(null)}>Got it</button>
            </div>
          </div>
        </>
      }
    </div>);

}

// Always return at least one photo so older findings without explicit
// photos[] still render a slot.
function getPhotos(f) {
  if (f.photos && f.photos.length) return f.photos;
  return [{ id: f.id + '-1', label: f.headline, file: `${f.cat}-photo.jpg` }];
}

function FindingCard({ f, tablet, onOpenEducation, onToggleDiscussed, onOpenPhoto }) {
  const sev = SEVERITY_STYLE[f.severity];
  const photos = getPhotos(f);
  const hero = photos[0];
  const thumbs = photos.slice(1);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', border: f.discussed ? '1px solid var(--success)' : '1px solid var(--border)' }}>
      {/* Hero image — clickable to open carousel at index 0 */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => onOpenPhoto(0)}
          aria-label={`Open ${hero.label}`}
          style={{
            display: 'block', padding: 0, border: 0, background: 'transparent',
            width: '100%', cursor: 'zoom-in'
          }}>
          <div className="placeholder-photo" style={{ width: '100%', height: tablet ? 280 : 180, borderRadius: 0, border: 0, fontSize: 11 }}>
            {hero.file}
          </div>
        </button>
        <span className="pill" style={{ position: 'absolute', top: 12, left: 12, background: sev.bg, color: sev.color, fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>
          {sev.label}
        </span>
        {f.discussed &&
        <span className="pill success" style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}>
            <Icon.check /> Discussed
          </span>
        }
        {/* Photo count badge — appears only when there's more than one */}
        {photos.length > 1 &&
        <span className="pill" style={{
          position: 'absolute', bottom: 12, right: 12,
          background: 'rgba(0,0,0,0.7)', color: '#fff',
          fontSize: 10, fontWeight: 700, pointerEvents: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 4
        }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            {photos.length} photos
          </span>
        }
      </div>

      {/* Thumbnail strip — each individually clickable into the carousel at
          its own index. Reduced when there's only the hero. */}
      {thumbs.length > 0 &&
      <div style={{
        display: 'flex', gap: 6, padding: tablet ? '10px 22px 0' : '8px 14px 0',
        overflowX: 'auto'
      }}>
          {thumbs.map((p, i) =>
        <button
          key={p.id}
          type="button"
          onClick={() => onOpenPhoto(i + 1)}
          aria-label={`Open ${p.label}`}
          style={{
            flex: '0 0 auto',
            width: tablet ? 90 : 64,
            height: tablet ? 64 : 48,
            padding: 0, border: '1px solid var(--border)',
            borderRadius: 6, overflow: 'hidden',
            background: 'transparent', cursor: 'zoom-in',
            position: 'relative'
          }}>
              <div className="placeholder-photo" style={{
            width: '100%', height: '100%',
            borderRadius: 0, border: 0, fontSize: 8,
            lineHeight: 1.1
          }}>
                {p.file}
              </div>
            </button>
        )}
        </div>
      }
      
      <div style={{ padding: tablet ? '18px 22px' : '14px 16px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: tablet ? 22 : 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {f.headline}
        </div>
        <div style={{ fontSize: tablet ? 14 : 13, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.55 }}>
          {f.body}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={onOpenEducation}>
            How this affects your home
          </button>
          <button
            className={`btn btn-sm ${f.discussed ? 'btn-ghost' : 'btn-primary'}`}
            onClick={onToggleDiscussed}
            style={{ marginLeft: 'auto' }}>
            {f.discussed ? <><Icon.undo /> Re-open</> : <><Icon.check /> Mark discussed</>}
          </button>
        </div>
      </div>
    </div>);

}

Object.assign(window, { FindingsScreen, PhotoCarousel, getPhotos });

// ─── Full-screen photo carousel ───
// Opens when any image (hero or thumbnail) is tapped. Swipe / arrow-key /
// chevron-button navigation through every photo on that finding.
function PhotoCarousel({ finding, index, onPrev, onNext, onClose }) {
  const photos = getPhotos(finding);
  const photo = photos[index];

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Touch-swipe.
  const startX = React.useRef(null);
  const onTouchStart = (e) => {startX.current = e.touches[0].clientX;};
  const onTouchEnd = (e) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) {
      if (dx > 0) onPrev();else
      onNext();
    }
    startX.current = null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 80, display: 'flex', flexDirection: 'column',
        animation: 'fade 180ms ease'
      }}>
      {/* Top bar — counter, finding headline, close */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '14px 14px 10px',
        color: '#fff'
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.12, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
            Photo {index + 1} of {photos.length}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {finding.headline}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 0,
            height: 36, width: 36, borderRadius: 999, cursor: 'pointer',
            flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
          }}>
          <Icon.x />
        </button>
      </div>

      {/* Image stage */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
        <div className="placeholder-photo" style={{
          width: '94%', maxWidth: 900, height: '78%',
          background: 'rgba(255,255,255,0.05)',
          color: 'rgba(255,255,255,0.55)',
          borderColor: 'rgba(255,255,255,0.15)'
        }}>
          {photo.file}
        </div>

        {/* Prev / Next chevrons — only when there's more than one photo */}
        {photos.length > 1 &&
        <>
            <CarouselArrow side="left" onClick={onPrev} />
            <CarouselArrow side="right" onClick={onNext} />
          </>
        }
      </div>

      {/* Caption */}
      <div style={{ padding: '8px 20px 4px', color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
        {photo.label}
      </div>

      {/* Thumbnail rail — tap any to jump */}
      {photos.length > 1 &&
      <div style={{
        display: 'flex', gap: 6, padding: '10px 14px 14px',
        overflowX: 'auto', justifyContent: photos.length <= 5 ? 'center' : 'flex-start'
      }}>
          {photos.map((p, i) => {
          const sel = i === index;
          return (
            <button
              key={p.id}
              onClick={(e) => {
                e.stopPropagation();
                // Step relative to current index — keeps API minimal.
                const delta = i - index;
                if (delta > 0) for (let k = 0;k < delta;k++) onNext();else
                if (delta < 0) for (let k = 0;k < -delta;k++) onPrev();
              }}
              aria-label={`Show ${p.label}`}
              style={{
                flex: '0 0 auto',
                width: 56, height: 40,
                padding: 0,
                border: sel ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)',
                borderRadius: 4, overflow: 'hidden',
                background: 'rgba(255,255,255,0.05)',
                opacity: sel ? 1 : 0.6,
                cursor: 'pointer', position: 'relative'
              }}>
              <div className="placeholder-photo" style={{
                width: '100%', height: '100%',
                border: 0, borderRadius: 0,
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.6)', fontSize: 7
              }}>
                {p.file}
              </div>
            </button>);

        })}
        </div>
      }
    </div>);

}

function CarouselArrow({ side, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous photo' : 'Next photo'}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [side]: 12,
        background: 'rgba(255,255,255,0.18)', color: '#fff', border: 0,
        height: 44, width: 44, borderRadius: 999, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)'
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: side === 'left' ? 'rotate(180deg)' : 'none' }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>);

}