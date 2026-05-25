/* Coach Surface — manager-facing live view + (stubbed) coaching replay.

   What's here today:
   - CoachLanding: lists live sessions + recent completed appointments
   - CoachMirror:  read-only render of an active rep's appointment surface.
                   No phone-in-phone frame — the manager sees the rep's view
                   full-bleed inside their own device. Phase tabs let them
                   click between steps the rep has reached so far.
   - Coach:        thin wrapper that swaps landing ↔ mirror on local state

   What's stubbed:
   - Recent appointments show a disabled "Review" CTA. The full replay surface
     (screen recording aligned to Rilla audio + transcript scrubber) is the
     next slice — Jay's feedback explicitly called out the alignment as the
     killer feature, so it gets its own screen later.
   - Build / Slides / Proposal are greyed in the mirror as "rep hasn't reached
     this step yet." When the rep advances, those would unlock automatically.

   Mock-only. Real implementation needs a server feed of active sessions plus
   a screen-mirroring transport (WebRTC or polled snapshots) and the audio
   pipeline we're building toward owning end-to-end.
*/

const COACH_LIVE_SESSIONS = [
{ id: 'L-1', rep: 'Cole Anderson', repInitials: 'CA', customer: 'Marcus & Renée Whittaker', address: '4421 Bluffwood Ln', phase: 'SOLVE', step: 'Inspect', currentTab: 'inspect', startedAgo: '18 min' },
{ id: 'L-2', rep: 'Sam Patel', repInitials: 'SP', customer: 'Devon & Allie Park', address: '2719 Limestone Ridge', phase: 'CONNECT', step: 'Needs', currentTab: 'needs', startedAgo: '42 min' }];


const COACH_RECENT = [
{ id: 'R-1', rep: 'Cole Anderson', customer: 'Jose Alarcón', date: 'Yesterday', duration: '1:24', outcome: 'Signed · $34,200', outcomeTone: 'success' },
{ id: 'R-2', rep: 'Sam Patel', customer: 'The Petersons', date: 'Yesterday', duration: '0:58', outcome: 'Follow-up · Premium tier', outcomeTone: 'warn' },
{ id: 'R-3', rep: 'Maya Cole', customer: 'Yolanda Pierce', date: '2 days ago', duration: '1:12', outcome: 'Signed · $28,400', outcomeTone: 'success' },
{ id: 'R-4', rep: 'Cole Anderson', customer: 'The Sullivans', date: '3 days ago', duration: '1:31', outcome: 'Follow-up · spouse not home', outcomeTone: 'warn' }];


// SOLVE phase tabs as the manager sees them. The rep's `currentTab` from the
// session is the live step (red dot, brand-themed); steps before it are
// reviewable; steps after it are greyed.
const SOLVE_STEPS_FOR_MIRROR = [
{ id: 'scope', label: 'Scope' },
{ id: 'inspect', label: 'Inspect' },
{ id: 'build', label: 'Build' },
{ id: 'pitch', label: 'Slides' },
{ id: 'proposal', label: 'Proposal' }];


function CoachLanding({ onWatch }) {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ padding: '20px 16px 80px' }}>
        <div style={{ marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, letterSpacing: '-0.025em', fontWeight: 800 }}>
            Coach
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Watch a rep live, or review past appointments with the screen recording aligned to audio.
          </p>
        </div>

        {/* LIVE NOW */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="rec-dot" />
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--danger)', letterSpacing: 0.08, textTransform: 'uppercase' }}>
              Live now · {COACH_LIVE_SESSIONS.length}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COACH_LIVE_SESSIONS.map((s) =>
            <button
              key={s.id}
              type="button"
              onClick={() => onWatch(s)}
              className="card"
              style={{
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'center',
                padding: 14, border: '1px solid var(--border)',
                background: 'var(--surface)'
              }}>
                <div style={{
                width: 38, height: 38, borderRadius: 999,
                background: 'var(--brand)', color: 'var(--brand-fg)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, flexShrink: 0
              }}>
                  {s.repInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.rep}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.customer}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                    padding: '1px 7px', borderRadius: 999,
                    background: 'var(--brand-soft)', color: 'var(--brand)',
                    fontWeight: 700, fontSize: 9, letterSpacing: 0.06
                  }}>
                      {s.phase} · {s.step}
                    </span>
                    <span>started {s.startedAgo} ago</span>
                  </div>
                </div>
                <span style={{
                padding: '6px 12px', borderRadius: 999,
                background: 'var(--brand)', color: 'var(--brand-fg)',
                fontSize: 11, fontWeight: 700, flexShrink: 0
              }}>
                  Watch
                </span>
              </button>
            )}
          </div>
        </div>

        {/* RECENT (review stubbed) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-3)', letterSpacing: 0.08, textTransform: 'uppercase' }}>
              Recent · last 7 days
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontStyle: 'italic' }}>
              Replay · coming next
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COACH_RECENT.map((r) =>
            <div
              key={r.id}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, border: '1px solid var(--border)',
                background: 'var(--surface)'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{r.customer}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                    {r.rep} · {r.date} · {r.duration}
                  </div>
                </div>
                <div style={{
                fontSize: 10, fontWeight: 700,
                color: r.outcomeTone === 'success' ? 'var(--success)' : 'var(--warn)',
                flexShrink: 0,
                maxWidth: 130, textAlign: 'right', lineHeight: 1.3
              }}>
                  {r.outcome}
                </div>
                <button
                type="button"
                disabled
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: 'var(--surface-2)', color: 'var(--text-4)',
                  border: '1px solid var(--border)',
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0, cursor: 'not-allowed'
                }}>
                  Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}

// Mocked snapshots of what the rep has done in each step so far. In production
// these are derived from the live appointment state pushed from the rep's app.
// Here we hard-code Roofing on Main House to match the live session card.
function MirrorScopeView() {
  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
        Solve · scope
      </div>
      <h3 style={{ margin: '4px 0 12px', fontSize: 20, letterSpacing: '-0.02em' }}>
        What are we working on today?
      </h3>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.06, marginBottom: 8 }}>
        Structures
      </div>
      <div style={{
        padding: 14, border: '1.5px solid var(--brand)', borderRadius: 12,
        background: 'var(--surface)',
        display: 'flex', flexDirection: 'column', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'var(--brand)', color: 'var(--brand-fg)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, flexShrink: 0
          }}>1</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Main House</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Roofing'].map((s) =>
          <span
            key={s}
            style={{
              padding: '5px 10px',
              background: 'var(--brand-soft)', color: 'var(--brand)',
              border: '1px solid var(--brand)',
              borderRadius: 999,
              fontSize: 11, fontWeight: 700
            }}>
              {s}
            </span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
        Cole set up the scope · moved to Inspect 18 min ago
      </div>
    </div>);

}

function MirrorInspectView() {
  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
        Solve · inspect
      </div>
      <h3 style={{ margin: '4px 0 6px', fontSize: 20, letterSpacing: '-0.02em' }}>
        Capture what you see
      </h3>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
        Photograph any condition that matters. Star the ones to include in the homeowner presentation.
      </p>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.06, marginBottom: 8 }}>
        Captures
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[1, 2, 3, 4].map((i) =>
        <div
          key={i}
          className="placeholder-photo"
          style={{
            aspectRatio: '4 / 3',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'var(--text-3)', fontWeight: 600
          }}>
            roofing-{i}.jpg
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.06, marginBottom: 8 }}>
        Findings
      </div>
      <div style={{
        padding: 14, border: '1.5px solid var(--warn)', borderRadius: 12,
        background: 'var(--surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Roofing</div>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: 'oklch(0.78 0.14 75)', color: '#fff',
            fontSize: 9, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase'
          }}>Fair</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>3 photos · condition Fair</div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>Last capture · 8s ago</div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8 }}>
          "Granule loss across the south face — hail bruising on the field. Pipe boots cracked at the base."
        </div>
      </div>
      <div style={{
        padding: 14, border: '1.5px solid var(--danger)', borderRadius: 12,
        background: 'var(--surface)',
        marginTop: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', letterSpacing: 0.06, textTransform: 'uppercase' }}>Gutters</div>
          <span style={{
            padding: '2px 8px', borderRadius: 999,
            background: 'oklch(0.7 0.16 40)', color: '#fff',
            fontSize: 9, fontWeight: 700, letterSpacing: 0.04, textTransform: 'uppercase'
          }}>Poor</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700 }}>1 photo · condition Poor</div>
        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>Last capture · 2 min ago</div>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
        Cole is here right now · capturing live
      </div>
    </div>);

}

function MirrorUpcomingView({ label }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>
        Rep hasn't reached {label} yet
      </div>
      <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
        This view unlocks when Cole advances. The live position is the highlighted step above.
      </div>
    </div>);

}

function CoachMirror({ session, onBack }) {
  const [elapsed, setElapsed] = React.useState(0);
  // Active mirror step (manager scrubs back/forth across reached steps).
  // Defaults to the rep's current live step. The "passed" steps are
  // navigable; "upcoming" steps stay disabled.
  const [activeStep, setActiveStep] = React.useState(session.currentTab || 'inspect');
  React.useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const currentIdx = SOLVE_STEPS_FOR_MIRROR.findIndex((s) => s.id === session.currentTab);
  const stepState = (idx) =>
  idx < currentIdx ? 'passed' :
  idx === currentIdx ? 'live' :
  'upcoming';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Watching header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onBack}
          className="icon-btn"
          aria-label="Back to Coach">

          <Icon.back />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="rec-dot" />
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--danger)', letterSpacing: 0.06, textTransform: 'uppercase' }}>
              Watching live · {mm}:{ss} since you joined
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3, color: 'var(--text)' }}>
            {session.rep} · {session.customer}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {session.address}
          </div>
        </div>
      </div>

      {/* Phase tabs — passed/live clickable, upcoming greyed */}
      <div style={{
        display: 'flex', gap: 4,
        padding: '8px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
        overflowX: 'auto', flexShrink: 0
      }}>
        {SOLVE_STEPS_FOR_MIRROR.map((s, i) => {
          const state = stepState(i);
          const isActive = activeStep === s.id;
          const clickable = state !== 'upcoming';
          return (
            <button
              key={s.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setActiveStep(s.id)}
              style={{
                flex: '0 0 auto',
                padding: '6px 12px', borderRadius: 999,
                background:
                isActive ? 'var(--brand)' :
                state === 'live' ? 'var(--surface)' :
                'transparent',
                color:
                isActive ? 'var(--brand-fg)' :
                state === 'upcoming' ? 'var(--text-4)' :
                'var(--text-2)',
                border:
                isActive ? '1.5px solid var(--brand)' :
                state === 'upcoming' ? '1px dashed var(--border)' :
                '1px solid var(--border-strong)',
                fontSize: 11, fontWeight: 700,
                cursor: clickable ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: 5
              }}>
              {state === 'passed' && <span style={{ color: 'var(--success)' }}>✓</span>}
              {state === 'live' && !isActive && <span className="rec-dot" style={{ width: 6, height: 6 }} />}
              {s.label}
              {state === 'live' && isActive && <span style={{ fontSize: 9, opacity: 0.9 }}>· LIVE</span>}
            </button>);

        })}
      </div>

      {/* Mirror content — full-bleed, no inner phone frame */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--surface)' }}>
        {activeStep === 'scope' && <MirrorScopeView />}
        {activeStep === 'inspect' && <MirrorInspectView />}
        {(activeStep === 'build' || activeStep === 'pitch' || activeStep === 'proposal') &&
        <MirrorUpcomingView label={SOLVE_STEPS_FOR_MIRROR.find((s) => s.id === activeStep)?.label} />}

        {/* Audio + watching note pinned after the content so scrolling works */}
        <div style={{ padding: '4px 16px 20px' }}>
          <div style={{ padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', color: 'var(--brand)' }}><Icon.mic /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 12 }}>Audio · live with screen</div>
              <div style={{ color: 'var(--text-3)', fontSize: 10 }}>Recorded for replay coaching</div>
            </div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 18, flexShrink: 0 }}>
              {[6, 10, 14, 8, 16, 12, 18, 9, 13, 15].map((h, i) =>
              <span
                key={i}
                style={{
                  width: 3, height: h,
                  background: 'var(--brand)', borderRadius: 1,
                  opacity: 0.45 + i % 3 * 0.18
                }} />
              )}
            </div>
          </div>
          <div style={{
            marginTop: 10, padding: 12,
            background: 'var(--brand-soft)',
            borderRadius: 10,
            fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5
          }}>
            <strong style={{ color: 'var(--text)' }}>Watching, not interrupting.</strong> The rep doesn't see that you're here.
          </div>
        </div>
      </div>
    </div>);

}

function Coach() {
  // Local navigation state — landing list ↔ live mirror. Stays out of the
  // app-level `view` router so nothing else has to know Coach exists.
  const [session, setSession] = React.useState(null);
  if (session) {
    return <CoachMirror session={session} onBack={() => setSession(null)} />;
  }
  return <CoachLanding onWatch={(s) => setSession(s)} />;
}

Object.assign(window, { Coach, CoachLanding, CoachMirror });
