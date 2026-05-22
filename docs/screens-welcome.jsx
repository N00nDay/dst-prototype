/* global React, Icon, BRANDS, CUSTOMER, WELCOME_CONTENTS, fmt */
/* Post-signature Welcome experience (DST-WP).
   Per Craig (May '26): no PM references, no color picking, no question
   prompts. Focus the homeowner on what's already locked in and what
   happens between today and walk-through day. */

const { useState, useEffect } = window;

// ─── Production-timeline milestones (standard 2-day install) ──
const TIMELINE = [
{ day: 'Today', title: 'Contract signed', desc: "You're locked in. Materials get ordered from Owens Corning this afternoon.", state: 'done' },
{ day: 'This week', title: 'Confirmation packet', desc: "Signed contract, scope sheet, and color selections arrive in your email.", state: 'next' },
{ day: '~10 days out', title: 'Pre-install walk', desc: "We walk the property, mark the dumpster drop, and confirm access.", state: 'upcoming' },
{ day: 'Install · day 1', title: 'Tear-off & decking check', desc: "Old roof comes off. We flag any rot before laying new material.", state: 'upcoming' },
{ day: 'Install · day 2', title: 'Shingles + flashings', desc: "Full install. Magnetic nail sweep across the lawn and drive.", state: 'upcoming' },
{ day: 'Final day', title: 'Your walk-through ⭐', desc: "You inspect, you sign off. Only then do we release final payment.", state: 'upcoming' }];


// ─── What's locked in — concrete recap of what was decided today ──
const LOCKED_IN = [
{ icon: 'check', label: 'Scope of work', detail: "Full tear-off, replace decking as needed, new underlayment, drip edge, ridge vent, and shingles." },
{ icon: 'palette', label: 'Color selections', detail: "Confirmed on the swatch board today — locked in your file. We don't re-open colors at install." },
{ icon: 'doc', label: 'Contract & deposit', detail: "Signed and received. A copy is already on its way to your inbox." },
{ icon: 'warranty', label: 'Warranties', detail: "Manufacturer + workmanship — both registered automatically once install closes out." }];


function WelcomePackageScreen({ tablet, brand, rep, signed, deposit, walkthrough, onBackToSchedule }) {
  const brandObj = BRANDS[brand];
  const tier = signed?.tier;
  const total = signed?.total || 0;
  const firstName = CUSTOMER.name.split(/[ &]/)[0];

  return (
    <div className="scroll-area" style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>

      {/* ── CELEBRATION HERO ─────────────────────────────── */}
      <div style={{
        background: 'var(--brand-soft)',
        padding: tablet ? '32px 28px 24px' : '22px 16px 18px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 999,
          background: 'var(--success-bg)', color: 'var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
          border: '1.5px solid var(--success)'
        }}>
          <Icon.check style={{ width: 28, height: 28 }} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--success)', letterSpacing: 0.12, textTransform: 'uppercase' }}>
          Signed · Deposit · Locked in
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: tablet ? 32 : 22,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginTop: 6, lineHeight: 1.1
        }}>
          Welcome to the family, {firstName}.
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8, maxWidth: 560, margin: '8px auto 0', lineHeight: 1.5 }}>
          Your <strong>{tier?.name || 'roof'}</strong> project is officially on the schedule. Here's what's locked in and exactly what happens next.
        </div>
      </div>

      {/* ── SECTION 1: WHAT'S LOCKED IN ───────────────── */}
      <SectionHeader n={1} id="sec-locked" title="What's locked in" sub="Everything we decided together today. Already in your file." />
      <div style={{ padding: tablet ? '0 28px' : '0 16px' }}>
        <LockedInBlock tablet={tablet} tier={tier} total={total} />
      </div>

      {/* ── SECTION 2: WHAT TO EXPECT ──────────────────── */}
      <SectionHeader n={2} id="sec-expect" title="What happens next" sub="Your project, day by day. You'll get a text at every milestone." />
      <div style={{ padding: tablet ? '0 28px' : '0 16px' }}>
        <TimelineBlock tablet={tablet} />
      </div>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <div style={{ padding: tablet ? '28px 28px 24px' : '22px 16px 22px' }}>
        <button className="btn btn-primary btn-lg btn-block" onClick={onBackToSchedule}>
          Complete Appointment <Icon.arrow />
        </button>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-4)', marginTop: 10, lineHeight: 1.5 }}>
          A copy of the signed contract, scope, and color choices is in {CUSTOMER.email}.
        </div>
      </div>
    </div>);
}

// ─── Helper components ──────────────────────────────────

function SectionHeader({ n, id, title, sub }) {
  return (
    <div id={id} style={{ padding: '24px 16px 8px', scrollMarginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{
          width: 24, height: 24, borderRadius: 999,
          background: 'var(--brand)', color: 'var(--brand-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12
        }}>{n}</span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>{title}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, paddingLeft: 34 }}>{sub}</div>
    </div>);

}

// ─── 1. Locked-in recap (replaces colors + ask-homeowner) ───
function LockedInBlock({ tablet, tier, total }) {
  const ICONS = {
    check: <Icon.check />,
    palette: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>,
    doc: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
    warranty: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Summary header */}
      <div style={{
        padding: tablet ? '14px 18px' : '12px 14px',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.08, color: 'var(--text-3)', textTransform: 'uppercase' }}>Project total</div>
          <div style={{ fontSize: tablet ? 22 : 18, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--text)', marginTop: 2 }}>
            {typeof fmt !== 'undefined' && fmt.dollars ? fmt.dollars(total) : `$${total.toLocaleString()}`}
          </div>
        </div>
        <span className="pill success" style={{ fontSize: 10, fontWeight: 700 }}>
          <Icon.check /> Deposit received
        </span>
      </div>

      {/* Locked-in items */}
      {LOCKED_IN.map((item, i) =>
      <div key={item.label} style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: tablet ? '14px 18px' : '12px 14px',
        borderTop: i === 0 ? 'none' : '1px solid var(--border)'
      }}>
          <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--brand-soft)', color: 'var(--brand-soft-fg)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>{ICONS[item.icon]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>{item.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{item.detail}</div>
          </div>
        </div>
      )}
    </div>);

}

// ─── 2. Timeline block ───
function TimelineBlock({ tablet }) {
  return (
    <div className="card" style={{ padding: tablet ? 20 : 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {TIMELINE.map((m, i) => {
          const isLast = i === TIMELINE.length - 1;
          const stateColor = m.state === 'done' ? 'var(--success)' :
          m.state === 'next' ? 'var(--brand)' :
          'var(--border-strong)';
          const stateBg = m.state === 'done' ? 'var(--success-bg)' :
          m.state === 'next' ? 'var(--brand-soft)' :
          'var(--surface-2)';
          const stateFg = m.state === 'done' ? 'var(--success)' :
          m.state === 'next' ? 'var(--brand-soft-fg)' :
          'var(--text-3)';
          return (
            <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0, position: 'relative' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 999,
                  background: stateBg,
                  border: `2px solid ${stateColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stateFg, flexShrink: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                  zIndex: 1
                }}>
                  {m.state === 'done' ? <Icon.check style={{ width: 13, height: 13 }} /> : i + 1}
                </div>
                {!isLast && <div style={{ width: 2, flex: 1, background: m.state === 'done' ? 'var(--success)' : 'var(--border)', marginTop: 2 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.08, textTransform: 'uppercase', color: stateColor }}>{m.day}</div>
                <div style={{ fontSize: tablet ? 14 : 13, fontWeight: 700, color: 'var(--text)', marginTop: 2, letterSpacing: '-0.01em' }}>{m.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </div>);

        })}
      </div>

      <div style={{
        marginTop: 14, padding: '10px 12px',
        background: 'var(--success-bg)', color: 'var(--success)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 11, lineHeight: 1.5
      }}>
        <Icon.mic style={{ flexShrink: 0 }} />
        <span style={{ color: 'var(--text-2)' }}>You'll get a text at every milestone — "<em>materials delivered</em>" → "<em>tear-off complete</em>" → "<em>ready for walk-through</em>".</span>
      </div>
    </div>);

}

Object.assign(window, { WelcomePackageScreen });
