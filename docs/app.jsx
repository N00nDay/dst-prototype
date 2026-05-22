/* global React, ReactDOM */
/* global Icon, BRANDS, APPOINTMENTS, INSPECTION_CATEGORIES, SEED_INSPECTION_ITEMS, TIERS, CUSTOMER, REPS, SYNC_STATES, NEEDS_SEED, FINDINGS_SEED, PITCH_SLIDES, CUSTOMERS, FOLLOWUPS */
/* global SEED_ENVELOPE, ENVELOPE_FACETS */
/* global AppStatusBar, OSStatusBar, TabBar, ToastLayer, Dashboard, Schedule, Settings, Customers, CustomerDetail, FollowupDetail, Commissions, useToasts */
/* global Login, AppointmentDetail, InspectionScreen, ImageCaptureScreen, CameraModal, DictationModal, AnnotateSheet */
/* global PhaseTabBar */
/* global NeedsAssessmentScreen, FindingsScreen, PitchDeckScreen, ProposalBuilderScreen */
/* global ScopeScreen */
/* global PresentMode, SignaturePad, MissingSheet */
/* global FinancingScreen */
/* global WalkthroughScreen, DepositScreen, WelcomePackageScreen, HandoffScreen */
/* global GlobalSearch */

const { useState, useEffect, useRef, useMemo } = React;

// Production defaults — formerly tweakable via the dev-only Tweaks panel,
// which has been removed in favor of values that match the live rep
// experience. `device` is the form factor (phone vs tablet preview);
// `repId` resolves the authenticated rep from REPS (in prod this comes
// from the SSO session); `theme` is the visual theme. `syncState` is
// vestigial — the sync-indicator pill is no longer rendered.
const APP_DEFAULTS = {
  device: 'phone',
  repId: 'cole',
  theme: 'light',
  syncState: 'recent'
};

// Linear flow inside an appointment (CONNECT → SOLVE → COMMIT).
// Scope is the first SOLVE step — the rep names structures + picks
// envelopes once, and the rest of SOLVE (Inspect, Build, Slides,
// Proposal) runs per-structure from that list.
const FLOW_VIEWS = ['apt', 'needs', 'scope', 'inspect', 'build', 'pitch', 'proposal', 'present', 'sign', 'deposit', 'welcome', 'handoff'];
const PHASE_OF = {
  apt: 'CONNECT', needs: 'CONNECT',
  scope: 'SOLVE', inspect: 'SOLVE', build: 'SOLVE', pitch: 'SOLVE', proposal: 'SOLVE',
  present: 'COMMIT', sign: 'COMMIT', deposit: 'COMMIT', welcome: 'COMMIT', handoff: 'COMMIT'
};

// Sub-step tab strip per phase. SOLVE is a linear sequence now —
// Scope (set up structures), Inspect (per-structure photos + findings),
// Build (per-structure measurements/materials), Slides (per-structure
// findings + Core 6), Proposal (G/B/B per structure + add-ons).
// Reps can jump backwards through these tabs freely; forward progression
// is handled by the per-screen Continue button.
const SOLVE_TABS = [
{ id: 'scope',    label: 'Scope' },
{ id: 'inspect',  label: 'Inspect' },
{ id: 'build',    label: 'Build' },
{ id: 'pitch',    label: 'Slides' },
{ id: 'proposal', label: 'Proposal' }];

// COMMIT tabs — Present runs the full presentation (Approach + Findings + Proposal preview),
// Sign & Deposit handles closing, third tab swaps Welcome↔Follow-up.
const COMMIT_TABS_FN = (deferred) => [
{ id: 'present', label: 'Present', views: ['present'] },
{ id: 'sign', label: 'Sign & Deposit', views: ['sign', 'deposit'] },
deferred ?
{ id: 'followup', label: 'Follow-up', views: ['followup'] } :
{ id: 'welcome', label: 'Welcome', views: ['welcome', 'handoff'] }];


function App() {
  // Static defaults (formerly tweakable). `repId` is fixed to match the
  // live rep experience; `syncState` is vestigial.
  const { repId, syncState } = APP_DEFAULTS;
  // Device + theme are local React state so the design-preview Phone /
  // Tablet switcher and the Settings → theme picker keep working without
  // a Tweaks panel behind them.
  const [device, setDevice] = useState(APP_DEFAULTS.device);
  const [theme, setTheme] = useState(APP_DEFAULTS.theme);

  // Rep is derived from authenticated session (IDP-01). In mock, the
  // active rep is whichever repId APP_DEFAULTS points at.
  const rep = REPS[repId] || REPS.cole;
  const brand = rep.brand; // brand follows the rep's primary assignment

  // ── Core app state ─────────────────────────────────────
  const [authed, setAuthed] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [appt, setAppt] = useState(null);
  const [view, setView] = useState('list');
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);

  // ── Inspection state ──────────────────────────────────
  const [items, setItems] = useState(SEED_INSPECTION_ITEMS);
  // Multi-structure model — promoted from a single implicit "the house" to an
  // ordered list of structures (Main House, Guest House, Barn, Condo Unit A…).
  // Each structure carries its own envelope (per-facet measurements/line items)
  // and a `scopes` list controlling which envelope tabs apply. (Craig, May '26.)
  const [structures, setStructures] = useState([{
    id: 'main',
    name: 'Main House',
    scopes: [],
    envelope: SEED_ENVELOPE
  }]);
  const [activeStructureId, setActiveStructureId] = useState('main');
  const activeStructureIdx = Math.max(0, structures.findIndex((s) => s.id === activeStructureId));
  const activeStructure = structures[activeStructureIdx] || structures[0];
  // Legacy `envelope` / `setEnvelope` — derived from the active structure so
  // every downstream consumer (Inspect, Pitch, Proposal) reads/writes the
  // currently selected structure transparently.
  const envelope = activeStructure.envelope;
  const setEnvelope = (updater) => {
    setStructures((arr) => arr.map((s, i) => {
      if (i !== activeStructureIdx) return s;
      const next = typeof updater === 'function' ? updater(s.envelope) : updater;
      return { ...s, envelope: next };
    }));
  };
  // Structure CRUD — names follow "Structure N" if no name supplied; scopes
  // default to "all" so freshly added structures have every envelope available.
  const addStructure = (name) => {
    const id = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const finalName = name && name.trim() || `Structure ${structures.length + 1}`;
    setStructures((arr) => [...arr, {
      id, name: finalName,
      scopes: [],
      envelope: {}
    }]);
    setActiveStructureId(id);
  };
  const duplicateStructure = (srcId) => {
    const src = structures.find((s) => s.id === srcId);
    if (!src) return;
    const id = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    // Deep-clone envelope so edits don't ripple back into the source.
    const clonedEnv = JSON.parse(JSON.stringify(src.envelope || {}));
    setStructures((arr) => [...arr, { ...src, id, name: `${src.name} (copy)`, envelope: clonedEnv }]);
    setActiveStructureId(id);
    push(`Duplicated · ${src.name}`);
  };
  const renameStructure = (id, name) => {
    setStructures((arr) => arr.map((s) => s.id === id ? { ...s, name: name.trim() || s.name } : s));
  };
  const removeStructure = (id) => {
    if (structures.length <= 1) return;
    const removedName = structures.find((s) => s.id === id)?.name || 'Structure';
    const nextActive = activeStructureId === id ?
      (structures.find((s) => s.id !== id)?.id || structures[0].id) :
      activeStructureId;
    setStructures((arr) => arr.filter((s) => s.id !== id));
    setActiveStructureId(nextActive);
    push(`Removed · ${removedName}`);
  };
  const setStructureScopes = (id, scopes) => {
    setStructures((arr) => arr.map((s) => s.id === id ? { ...s, scopes } : s));
  };
  const [showCamera, setShowCamera] = useState(false);
  const [showDictation, setShowDictation] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  // Lifted to app-root so the annotate sheet can render above the OS / app /
  // phase headers (full-screen photo viewer). (Craig, May '26.)
  const [openPhoto, setOpenPhoto] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFacet, setActiveFacet] = useState('roofing'); // facetId for Camera/Dictation tagging
  // Highest SOLVE step the rep has COMPLETED (advanced past). PhaseTabBar
  // uses this for both the "done" visual and the forward-tap gate. A step
  // is completed only when the rep moves FORWARD to a higher-index step
  // (typically via Continue) — landing on a step doesn't complete it,
  // so visiting Build then returning to Inspect leaves Build as upcoming.
  const [farthestSolveStepIdx, setFarthestSolveStepIdx] = useState(-1);
  const prevSolveIdxRef = React.useRef(-1);
  useEffect(() => {
    const newIdx = SOLVE_TABS.findIndex((t) => t.id === view);
    const prevIdx = prevSolveIdxRef.current;
    // If we advanced from a SOLVE step to a higher SOLVE step, mark the
    // previous step completed. Backward navigation and non-SOLVE transitions
    // (e.g. apt → scope, or going to 'present') don't bump completion.
    if (newIdx >= 0 && prevIdx >= 0 && newIdx > prevIdx) {
      setFarthestSolveStepIdx((c) => Math.max(c, prevIdx));
    }
    if (newIdx >= 0) prevSolveIdxRef.current = newIdx;
  }, [view]);

  // ── Needs Assessment ──────────────────────────────────
  const [needsFields, setNeedsFields] = useState(NEEDS_SEED);
  const needsConfirmed = useMemo(
    () => Object.entries(needsFields).filter(([k, v]) => k !== 'repNotes' && v.status === 'confirmed').length,
    [needsFields]
  );

  // ── Findings ──────────────────────────────────────────
  const [findings, setFindings] = useState(FINDINGS_SEED);
  const findingsDiscussed = useMemo(() => findings.filter((f) => f.discussed).length, [findings]);

  // ── Pitch Deck ────────────────────────────────────────
  // Approach = rep picks which slides to include (mode='pick'). Present = runs
  // the included slides + the proposal preview (mode='present').
  const [pitchSlides, setPitchSlides] = useState(PITCH_SLIDES);
  const [pitchSkips, setPitchSkips] = useState({});
  const [pitchIncluded, setPitchIncluded] = useState({}); // { [slideId]: false } if excluded

  // Findings appear as slides at the start of the presentation.
  // Source of truth: envelope cards on the Inspect tab. One slide per
  // envelope per structure that has any content (condition set, notes,
  // or photos attached). Each finding slide carries the structure name
  // so multi-structure decks read unambiguously. (Craig, May '26.)
  const composedPitchSlides = useMemo(() => {
    const findingSlides = [];
    (structures || []).forEach((structure) => {
      (ENVELOPE_FACETS || []).forEach((f) => {
        if (!structure.scopes?.includes(f.id)) return;
        const env = structure.envelope?.[f.id] || {};
        const removed = new Set(env.removed || []);
        const added = new Set(env.added || []);
        const photos = [];
        (items || []).forEach((it, idx) => {
          if (it.source === 'mic') return;
          const key = String(idx);
          const autoMatch = !!it.starred && it.facetId === f.id;
          if ((autoMatch && !removed.has(key)) || added.has(key)) {
            photos.push({ idx, item: it });
          }
        });
        const hasContent = photos.length > 0 || !!env.condition || (env.notes || '').trim().length > 0;
        if (!hasContent) return;
        // Multi-structure decks prefix the finding label with the structure
        // name so reps and homeowners always know which building they're on.
        const isMulti = (structures || []).length > 1;
        findingSlides.push({
          id: `finding-${structure.id}-${f.id}`,
          kind: 'finding',
          label: isMulti ? `What we found · ${structure.name}` : 'What we found',
          title: isMulti ? `${structure.name} · ${f.label}` : f.label,
          body: env.notes || '',
          accent: 'Findings · slide',
          structureId: structure.id,
          structureName: structure.name,
          finding: {
            cat: f.id,
            facetLabel: f.label,
            condition: env.condition || null,
            notes: env.notes || '',
            photos
          }
        });
      });
    });
    return [...findingSlides, ...pitchSlides];
  }, [structures, items, pitchSlides]);
  // Reorder only persists Core Six order; finding slides re-compose from
  // state. Accepts either a fresh array or the functional-update form so
  // callers can do `setSlides(prev => ...)` against the combined list.
  const handleSetPitchSlides = (next) => {
    const resolved = typeof next === 'function' ? next(composedPitchSlides) : next;
    setPitchSlides((resolved || []).filter((s) => s.kind !== 'finding'));
  };

  // ── Proposal Builder ──────────────────────────────────
  const [selectedTier, setSelectedTier] = useState('better');
  const [addons, setAddons] = useState({});
  const [swaps, setSwaps] = useState({});
  const [discounts, setDiscounts] = useState({});
  // Per-structure proposal state (Phase 2.5 PR-3 lift). Each structure
  // carries its own includedScopes / scopeProducts / scopeDiscount /
  // scopeWarranty. Lives at app.jsx so Present (ComparisonSlide) can
  // read per-structure tier picks without a back-channel from the
  // Proposal builder.
  const [proposals, setProposals] = useState({});
  // Lifted pricing mode — Proposal screen sets it, Present reads it.
  // 'allin' = one rolled-up comparison slide. 'by' = one comparison slide
  // per structure, each tagged with the structure name in the hero. Default
  // flips to 'by' on multi-structure jobs.
  const [pricingMode, setPricingMode] = useState((structures || []).length > 1 ? 'by' : 'allin');

  // ── Close-out state ───────────────────────────────────
  const [signed, setSigned] = useState(null);
  const [walkthrough, setWalkthrough] = useState(null);
  const [walkTopics, setWalkTopics] = useState({});
  const [deposit, setDeposit] = useState(null);
  const [financingResult, setFinancingResult] = useState(null);
  const [deferred, setDeferred] = useState(false); // signed-now vs deferred → swaps Welcome ↔ Follow-up tab
  // Craig (May '26): COMMIT card on the appointment overview is gated on
  // SOLVE being completed. Flips true the first time the rep advances into
  // a COMMIT-phase view (Present / Sign / Deposit / Welcome / Handoff).
  const [solveCompleted, setSolveCompleted] = useState(false);

  // ── Customers / Follow-ups (round 2) ─────────────────
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedFollowup, setSelectedFollowup] = useState(null);

  const { toasts, push } = useToasts();

  // Apply theme + sync data attributes at the host level
  useEffect(() => {
    document.documentElement.setAttribute('data-host-theme', theme);
  }, [theme]);

  // Recording timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // SOLVE → COMMIT gate. Once the rep advances into any COMMIT view, mark
  // SOLVE as completed so the appointment overview unlocks the Enter commit
  // card.
  useEffect(() => {
    if (PHASE_OF[view] === 'COMMIT') setSolveCompleted(true);
  }, [view]);

  const requiredTotal = INSPECTION_CATEGORIES.reduce((s, c) => s + c.required, 0);
  const isTablet = device === 'tablet';
  const sync = SYNC_STATES[syncState] || SYNC_STATES.recent;

  // ── Handlers ──────────────────────────────────────────
  const handleAppointmentClick = (a) => {setAppt(a);setView('apt');};

  const handleStart = () => {
    setRecording(true);
    setRecTime(0);
    push('Rilla is recording · captured for coaching review');
  };

  const handleCapture = (facetId) => { if (facetId) setActiveFacet(facetId); setShowCamera(true); };
  const handleDictate = (facetId) => { if (facetId) setActiveFacet(facetId); setShowDictation(true); };
  const commitItem = (item) => {
    // Tag every capture with the structure it was taken on so photos
    // stay scoped to their building. (Craig, May '26 — images are unique
    // to structures and should not carry over to the next one.)
    setItems((s) => [...s, { ...item, facetId: activeFacet, structureId: activeStructureId }]);
    setShowCamera(false);
    setShowDictation(false);
    // Dictation that carries a measurement hint stages a Pending value on the
    // matching envelope — it shows an "Apply dictation" badge on the Build tab
    // and does NOT auto-set the measurement (Craig, May '26).
    if (item.field) {
      setEnvelope((s) => {
        const cur = s?.[item.field.facet] || {};
        const pending = cur.pendingMeas || {};
        return {
          ...s,
          [item.field.facet]: {
            ...cur,
            pendingMeas: { ...pending, [item.field.key]: item.field.qty }
          }
        };
      });
      push(`Dictated · ${item.field.key} = ${item.field.qty} (tap Build to apply)`);
    } else {
      push(`Added · ${item.label}`);
    }
  };

  const guardOpenBuild = () => {
    setView('proposal');
  };

  // Continue cascade for per-structure SOLVE steps. Inspect and Build each
  // run one structure at a time — Continue either advances to the next
  // structure (staying on the current step) or moves on to the next step
  // and snaps the active structure back to the first one.
  const continueFromPerStructure = (currentStep, nextStep) => {
    const idx = structures.findIndex((s) => s.id === activeStructureId);
    if (idx === -1 || idx >= structures.length - 1) {
      // Last (or only) structure — advance to next step, snap back to first.
      setActiveStructureId(structures[0].id);
      setView(nextStep);
    } else {
      // More structures remain on this step — advance the active one.
      setActiveStructureId(structures[idx + 1].id);
      push(`${currentStep === 'inspect' ? 'Inspecting' : 'Building'} · ${structures[idx + 1].name}`);
    }
  };

  // Label/sub for the Continue button on per-structure SOLVE steps. The
  // wording reflects whether more structures remain or we're advancing to
  // the next step entirely.
  const continueCascadeFor = (currentStep, nextStepLabel) => {
    const idx = structures.findIndex((s) => s.id === activeStructureId);
    const isLast = idx === -1 || idx >= structures.length - 1;
    const total = structures.length;
    if (isLast) {
      return {
        label: `Continue to ${nextStepLabel}`,
        sub: total === 1 ? '' : `${total} of ${total} structures · ${nextStepLabel.toLowerCase()} starts on ${structures[0].name}`
      };
    }
    const next = structures[idx + 1];
    return {
      label: `Continue · ${next.name}`,
      sub: `${idx + 1} of ${total} structures · next: ${next.name}`
    };
  };

  const handleSigned = (payload) => {
    setSigned(payload);
    setView('deposit');
    push('Signed · collecting deposit');
  };
  const handleDepositDone = () => {
    const tier = TIERS.find((t) => t.id === selectedTier);
    const total = signed?.total || 0;
    setDeposit({ amount: Math.round(total * 0.10), method: 'card', last4: '4242' });
    setView('welcome');
  };
  const handleDepositSkip = () => {
    setDeposit({ amount: 0, method: 'deferred', last4: '----', pending: true });
    setView('welcome');
    push('Deposit deferred · deal flagged for follow-up');
  };
  // After Welcome Package, the rep taps "Complete Appointment" to wrap
  // the visit: stop the recording and return to the appointment overview.
  const handleBackToAppointment = () => {
    setRecording(false);
    setView('apt');
  };
  const handleBackToSchedule = () => {
    setView('list');
    setTab('dashboard');
    setRecording(false);
    // Reset appointment-scoped state so a fresh appointment starts clean.
    setSigned(null);setWalkthrough(null);setDeposit(null);setWalkTopics({});
    setItems(SEED_INSPECTION_ITEMS);
    setStructures([{
      id: 'main', name: 'Main House',
      scopes: [],
      envelope: SEED_ENVELOPE
    }]);
    setActiveStructureId('main');
    setFindings(FINDINGS_SEED);
    setPitchSlides(PITCH_SLIDES);
    setPitchSkips({});
    setSwaps({});setAddons({});setDiscounts({});
    setNeedsFields(NEEDS_SEED);
    setSolveCompleted(false);
  };

  const missingForSheet = INSPECTION_CATEGORIES.map((c) => {
    const have = items.filter((i) => i.cat === c.id).length;
    return { ...c, have };
  }).filter((c) => c.have < c.required);

  // ── Title + leading + action chrome per view ─────────
  const titleByView = {
    list: { dashboard: 'Dashboard', schedule: 'Schedule', customers: 'Customers', settings: 'Settings' }[tab] || 'Dashboard',
    commissions: 'Commissions',
    apt: appt ? appt.customer : 'Appointment',
    needs: 'Needs Assessment',
    scope: 'Scope',
    inspect: 'Inspect',
    findings: 'Findings',
    pitch: 'Slides',
    build: 'Build',
    proposal: 'Proposal',
    present: 'Present',
    sign: 'Signature',
    walkthrough: 'Walk-through',
    deposit: 'Deposit',
    welcome: 'Welcome Package',
    handoff: 'Production Handoff',
    financing: 'Financing',
    customer: selectedCustomer?.name || 'Customer',
    followup: selectedFollowup ? `Follow-up · ${selectedFollowup.customer}` : 'Follow-up'
  };
  const title = titleByView[view] || '';

  // Phase info for the rich progress indicator (Prompt L).
  const stepLabelByView = {
    apt: '',
    needs: 'Needs Assessment',
    scope: 'Scope · structures',
    inspect: 'Inspect · capture',
    findings: `Findings`,
    pitch: 'Slide deck',
    build: 'Build · measurements',
    proposal: 'Build proposal',
    present: 'Present to homeowner',
    sign: 'Approve & Sign',
    walkthrough: 'Walk-through video',
    deposit: 'Collect deposit',
    welcome: 'Welcome package · sent',
    handoff: 'Production handoff'
  };
  const phaseInfo = FLOW_VIEWS.includes(view) ?
  { current: PHASE_OF[view], stepLabel: stepLabelByView[view] } :
  null;

  // Structure switcher chip — renders in the header on Inspect + Build.
  // Always shows (even on single-structure jobs) so the rep has a
  // consistent place to confirm which building they're on and to add
  // another structure from the dropdown.
  const structureSwitcher = (view === 'inspect' || view === 'build') && structures.length >= 1 ?
    <window.StructureSwitchChip
      structures={structures}
      activeStructureId={activeStructureId}
      setActiveStructureId={setActiveStructureId}
      activeIdx={activeStructureIdx}
      onBackToScope={() => setView('scope')} /> :
    null;

  const backBtn = (onBack) =>
  <button className="btn btn-sm btn-ghost" aria-label="Back" onClick={onBack} style={{ padding: '0 6px' }}>
      <Icon.back />
    </button>;


  let action = null;
  let leading = null;

  if (view === 'list' || view === 'commissions') {
    action =
    <button className="btn btn-sm btn-ghost" aria-label="Search" onClick={() => setShowSearch(true)} style={{ padding: '0 8px' }}>
        <Icon.search />
      </button>;

    if (view === 'commissions') leading = backBtn(() => setView('list'));
  } else if (view === 'apt') leading = backBtn(() => setView('list'));else
  if (view === 'needs') leading = backBtn(() => setView('apt'));else
  if (view === 'scope') leading = backBtn(() => setView('apt'));else
  if (view === 'inspect') {leading = backBtn(() => setView('scope'));} else
  if (view === 'pitch') leading = backBtn(() => setView('apt'));else
  if (view === 'build') leading = backBtn(() => setView('inspect'));else
  if (view === 'proposal') leading = backBtn(() => setView('apt'));else
  if (view === 'present') leading = backBtn(() => setView('proposal'));else
  if (view === 'sign') leading = backBtn(() => setView('proposal'));else
  if (view === 'deposit') leading = backBtn(() => setView('sign'));else
  if (view === 'handoff') leading = backBtn(() => setView('welcome'));else
  if (view === 'customer') leading = backBtn(() => {setSelectedCustomer(null);setView('list');setTab('customers');});else
  if (view === 'followup') leading = backBtn(() => {setSelectedFollowup(null);setView('list');setTab('dashboard');});
  // welcome + financing have no back button — terminal/modal states

  // ── Render the app shell ──────────────────────────────
  const renderApp = () => {
    if (!authed) {
      return <Login brand={brand} theme={theme} device={isTablet ? 'tablet' : 'phone'} rep={rep} onLogin={() => setAuthed(true)} />;
    }

    const hasSubHeader = view !== 'present' && (
      SOLVE_TABS.some((t) => t.id === view) ||
      COMMIT_TABS_FN(deferred).some((t) => (t.views || [t.id]).includes(view))
    );

    return (
      <div className={`app-root ${isTablet ? 'tablet' : ''} ${view === 'list' || view === 'commissions' ? 'has-tabbar' : ''} ${hasSubHeader ? 'has-sub-header' : ''}`} data-theme={theme} data-brand={brand}>
        <OSStatusBar device={isTablet ? 'tablet' : 'phone'} theme={theme} />
        {view !== 'financing' && view !== 'present' &&
        <AppStatusBar
          title={title}
          recording={recording}
          recordingTime={recTime}
          sync={sync}
          action={action}
          leading={leading}
          phaseInfo={phaseInfo}
          structureSwitcher={structureSwitcher} />
        }

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {view !== 'present' && SOLVE_TABS.some((t) => t.id === view) &&
          <PhaseTabBar
            tabs={SOLVE_TABS}
            activeId={view}
            farthestIdx={farthestSolveStepIdx}
            onSelect={(id) => setView(id)} />
          }
          {view !== 'present' && COMMIT_TABS_FN(deferred).some((t) => (t.views || [t.id]).includes(view)) && (() => {
            const tabs = COMMIT_TABS_FN(deferred);
            const active = tabs.find((t) => (t.views || [t.id]).includes(view));
            return (
              <PhaseTabBar
                tabs={tabs}
                activeId={active?.id}
                onSelect={(id) => {
                  const t = tabs.find((x) => x.id === id);
                  setView(t?.views && t.views[0] || id);
                }} />);

          })()}
          {view === 'list' &&
          <>
              {tab === 'dashboard' && <Dashboard brand={brand} rep={rep} onAppointmentClick={handleAppointmentClick} onCommissionsClick={() => setView('commissions')} onFollowupClick={(f) => {setSelectedFollowup(f);setView('followup');}} />}
              {tab === 'schedule' && <Schedule onAppointmentClick={handleAppointmentClick} />}
              {tab === 'customers' && <Customers onAppointmentClick={handleAppointmentClick} onOpenCustomer={(c) => {setSelectedCustomer(c);setView('customer');}} />}
              {tab === 'settings' && <Settings brand={brand} theme={theme} setTheme={setTheme} rep={rep} onLogout={() => setAuthed(false)} />}
            </>
          }

          {view === 'commissions' && <Commissions onBack={() => setView('list')} />}

          {view === 'apt' && appt &&
          <AppointmentDetail
            appt={appt}
            tablet={isTablet}
            recording={recording}
            recordingTime={recTime}
            items={items}
            needsConfirmed={needsConfirmed}
            findingsDiscussed={findingsDiscussed}
            onStart={handleStart}
            onBack={() => setView('list')}
            onOpenNeeds={() => setView('needs')}
            onOpenInspection={() => { setActiveStructureId(structures[0].id); setView('scope'); }}
            onOpenBuild={() => { setActiveStructureId(structures[0].id); setView('build'); }}
            onOpenProposal={guardOpenBuild}
            onOpenPresent={() => setView('present')}
            onOpenSign={() => setView('sign')}
            onOpenDeposit={() => setView('deposit')}
            onOpenHandoff={() => setView('handoff')}
            solveCompleted={solveCompleted} />
          }

          {view === 'needs' &&
          <NeedsAssessmentScreen
            fields={needsFields}
            setFields={setNeedsFields}
            onBack={() => setView('apt')}
            onContinue={() => setView('scope')} />
          }

          {view === 'scope' &&
          <ScopeScreen
            tablet={isTablet}
            structures={structures.map((s, i) => ({ ...s, idx: i + 1 }))}
            onAddStructure={() => addStructure()}
            onRenameStructure={renameStructure}
            onRemoveStructure={removeStructure}
            onSetStructureScopes={setStructureScopes}
            onBack={() => setView('apt')}
            onContinue={() => { setActiveStructureId(structures[0].id); setView('inspect'); }} />
          }

          {view === 'inspect' &&
          <ImageCaptureScreen
            items={items}
            setItems={setItems}
            envelope={envelope}
            setEnvelope={setEnvelope}
            structures={structures}
            activeStructureId={activeStructureId}
            setActiveStructureId={setActiveStructureId}
            onCapture={handleCapture}
            onDictate={handleDictate}
            onTapPhoto={(i) => setOpenPhoto(i)}
            onBack={() => setView('scope')}
            onBackToScope={() => setView('scope')}
            onContinueBuild={() => setView('build')}
            continueCascade={continueCascadeFor('inspect', 'Build')}
            onContinue={() => continueFromPerStructure('inspect', 'build')} />
          }

          {view === 'build' &&
          <InspectionScreen
            items={items}
            setItems={setItems}
            envelope={envelope}
            setEnvelope={setEnvelope}
            structures={structures}
            activeStructureId={activeStructureId}
            setActiveStructureId={setActiveStructureId}
            onAddStructure={addStructure}
            onDuplicateStructure={duplicateStructure}
            onRenameStructure={renameStructure}
            onRemoveStructure={removeStructure}
            onSetStructureScopes={setStructureScopes}
            onDictate={handleDictate}
            onBack={() => setView('inspect')}
            continueCascade={continueCascadeFor('build', 'Slides')}
            onContinue={() => continueFromPerStructure('build', 'pitch')} />
          }


          {view === 'pitch' &&
          <PitchDeckScreen
            brand={brand}
            rep={rep}
            tablet={isTablet}
            mode="pick"
            slides={composedPitchSlides}
            setSlides={handleSetPitchSlides}
            included={pitchIncluded}
            setIncluded={setPitchIncluded}
            skips={pitchSkips}
            setSkips={setPitchSkips}
            onBack={() => setView('apt')}
            onContinue={guardOpenBuild} />
          }

          {view === 'proposal' &&
          <ProposalBuilderScreen
            tablet={isTablet}
            brand={brand}
            rep={rep}
            selected={selectedTier}
            setSelected={setSelectedTier}
            structures={structures}
            activeStructureId={activeStructureId}
            setActiveStructureId={setActiveStructureId}
            setStructureScopes={setStructureScopes}
            addons={addons} setAddons={setAddons}
            swaps={swaps} setSwaps={setSwaps}
            discounts={discounts} setDiscounts={setDiscounts}
            proposals={proposals} setProposals={setProposals}
            pricingMode={pricingMode} setPricingMode={setPricingMode}
            onBack={() => setView('apt')}
            onPresent={() => setView('present')} />
          }

          {view === 'present' &&
          <PitchDeckScreen
            brand={brand}
            rep={rep}
            tablet={isTablet}
            mode="present"
            slides={composedPitchSlides}
            included={pitchIncluded}
            setIncluded={setPitchIncluded}
            skips={pitchSkips}
            setSkips={setPitchSkips}
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            rollupForTier={(id) => null}
            structures={structures}
            proposals={proposals}
            pricingMode={pricingMode}
            onBack={() => setView('apt')}
            onContinue={() => setView('sign')} />
          }

          {view === 'sign' &&
          <SignaturePad
            tablet={isTablet}
            brand={brand}
            rep={rep}
            selected={selectedTier}
            onClose={() => setView('proposal')}
            onSent={handleSigned} />
          }


          {view === 'deposit' &&
          <DepositScreen
            tablet={isTablet}
            brand={brand}
            total={signed?.total || 0}
            onContinue={handleDepositDone}
            onSkip={handleDepositSkip} />
          }

          {view === 'welcome' &&
          <WelcomePackageScreen
            tablet={isTablet}
            brand={brand}
            rep={rep}
            signed={signed}
            walkthrough={walkthrough}
            deposit={deposit}
            onOpenHandoff={() => setView('handoff')}
            onBackToSchedule={handleBackToAppointment} />
          }

          {view === 'handoff' &&
          <HandoffScreen
            tablet={isTablet}
            brand={brand}
            rep={rep}
            signed={signed}
            walkthrough={walkthrough}
            deposit={deposit}
            onBackToSchedule={handleBackToSchedule} />
          }

          {view === 'financing' &&
          <FinancingScreen
            tablet={isTablet}
            brand={brand}
            amount={signed?.total || Math.round(Object.values(swaps).length ? 36000 : 36000)}
            onCancel={() => setView('proposal')}
            onDecisionResolved={(result) => {setFinancingResult(result);setView('proposal');push(`Financing · ${result.decision}`);}} />
          }

          {view === 'customer' && selectedCustomer &&
          <CustomerDetail
            customer={selectedCustomer}
            onBack={() => {setSelectedCustomer(null);setView('list');setTab('customers');}}
            onScheduleFollowup={() => push('Schedule follow-up · open the calendar to set a date')}
            onAppointmentClick={handleAppointmentClick} />
          }

          {view === 'followup' && selectedFollowup &&
          <FollowupDetail
            followup={selectedFollowup}
            brand={brand}
            onBack={() => {setSelectedFollowup(null);setView('list');setTab('dashboard');}}
            onScheduleRepresentation={() => push('Re-presentation scheduled · prior context will carry over')}
            onSendRehash={() => push('Rehash communication sent · template logged to audit trail')} />
          }

          {showDictation && <DictationModal onClose={() => setShowDictation(false)} onCommit={commitItem} />}
          {showMissing && <MissingSheet items={missingForSheet} onClose={() => setShowMissing(false)} />}
          {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} onAppointmentClick={handleAppointmentClick} onOpenCustomer={(c) => {setSelectedCustomer(c);setView('customer');setShowSearch(false);}} />}
          {/* Toasts disabled per Craig — strewn-about black pills weren't
              reading as cohesive. push() calls remain as no-ops in case
              we want to bring this back behind a unified design. */}
        </div>

        {/* Full-screen camera, mounted above the inner wrapper so it covers
            the OS status bar and app header. (Craig, May '26.) */}
        {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCommit={commitItem} />}

        {/* Full-screen photo viewer / annotation — mounted outside inner wrapper
            so it covers the OS status bar, app header and phase tab bar. */}
        {openPhoto != null && items[openPhoto] &&
        <AnnotateSheet
          photo={items[openPhoto]}
          onClose={() => setOpenPhoto(null)}
          onChange={(patch) => setItems((s) => s.map((it, i) => i === openPhoto ? { ...it, ...patch } : it))} />
        }

        {(view === 'list' || view === 'commissions') && <TabBar tab={tab} setTab={setTab} />}
        <div className="home-indicator" aria-hidden="true" />
      </div>);

  };

  // ── Outer host with device frame + Phone/Tablet switcher ──
  // The switcher is the only design-preview affordance still rendered
  // outside the device frame; it flips the local `device` state without
  // routing through any global tweaks system.
  return (
    <div className="shell-bg" data-host-theme={theme}>
      <div className="device-switcher">
        <button className={device === 'phone' ? 'active' : ''} onClick={() => setDevice('phone')}>
          <span style={{ display: 'inline-block', width: 8, height: 12, border: '1.5px solid currentColor', borderRadius: 2 }} />
          Phone
        </button>
        <button className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')}>
          <span style={{ display: 'inline-block', width: 14, height: 11, border: '1.5px solid currentColor', borderRadius: 2 }} />
          Tablet
        </button>
      </div>

      <div className={isTablet ? 'tablet-frame' : 'phone-frame'} data-screen-label={isTablet ? 'Tablet' : 'Phone'}>
        <div className="device-screen">
          {renderApp()}
        </div>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);