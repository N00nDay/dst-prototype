# DST PRD ↔ Wireframe Delta Report

Reconciliation between the DST clickable wireframe (`/Users/craighowell/Documents/projects/dst/docs/`) and the source-of-truth documents:

- PRD: `IHS_DST_PRD_v12.docx`
- Specs: `IHS_DST_Surface_Specs_v1.7.docx`

Default posture: the wireframe is current design intent. PRD/Specs language is treated as a candidate for revision unless the wireframe behavior is materially unusual or the intent is unclear from the code.

## Summary

- Total deltas: 38
- Adopt: 27 · Confirm with Jay: 8 · Open question: 3
- Highest-impact areas:
  1. Multi-structure model (every SOLVE surface now operates per-structure).
  2. Inspect / Build screen split (Inspect = capture; Build = measurements + materials + labor + other).
  3. Findings now flow through the Pitch Deck as auto-composed slides, not a standalone Findings screen.
  4. GP-markup slider with per-scope approval thresholds replaces PRD's named-discount catalog (military, teacher, etc.).
  5. Three v1 surfaces are coded but unrouted: Walkthrough Video, Financing, standalone Findings. These need an explicit decision.

## Deltas

### 1. Multi-structure model (structures array, per-structure envelopes)

- **Item:** Multi-structure appointment model
- **Where in wireframe:** [docs/app.jsx:110-167](docs/app.jsx:110), [docs/screens-scope.jsx:36](docs/screens-scope.jsx:36), [docs/screens-imagecap.jsx:98-107](docs/screens-imagecap.jsx:98), [docs/screens-inspection.jsx:144-205](docs/screens-inspection.jsx:144), [docs/screens-build.jsx:162-279](docs/screens-build.jsx:162)
- **Where in PRD:** Not present. PRD section 6.17 mentions multi-trade and bundled scopes (DST-MT-01 through DST-MT-07) but assumes a single property surface. Specs DST-SUR-06 / 09 do not describe per-structure state.
- **Delta type:** Addition
- **PRD says:** A single proposal can include bundled trades; nothing about multiple physical structures on one appointment.
- **Wireframe shows:** Appointment carries an ordered `structures` array (Main House, Guest House, Barn, Condo Unit A, etc.). Each structure carries its own `envelope` (per-facet measurements + line items), `scopes` (selected envelopes), and proposal slice (scopeProducts, scopeDiscount, scopeWarranty). Inspect, Build, Slides, and Proposal each run per-structure with a Continue cascade that advances structure-by-structure, then step-by-step.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 4 (Appointment as identity) and Section 6.17: "A single appointment may include one or more physical structures (main house, detached garage, guest house, multi-unit). Inspection, build, presentation, and proposal each run per-structure with a unified handoff package. Reps name and scope each structure before SOLVE begins; structures cannot be added mid-build without returning to Scope."

### 2. SOLVE phase decomposed into five steps (Scope, Inspect, Build, Slides, Proposal)

- **Item:** SOLVE step stepper with five steps
- **Where in wireframe:** [docs/app.jsx:46-51](docs/app.jsx:46), [docs/screens-main.jsx:93](docs/screens-main.jsx:93)
- **Where in PRD:** PRD section 6.3 / 6.5 / 6.6 / 6.7 names Inspection, Pitch Deck, Proposal Building, Pricing Presentation as separate capabilities. Specs renders them as DST-SUR-06 / 08 / 09 / 10.
- **Delta type:** Change
- **PRD says:** Inspection → Findings & Education → Pitch Deck → Proposal → Pricing Presentation as five distinct surfaces.
- **Wireframe shows:** SOLVE is presented to the rep as five tabs: Scope, Inspect, Build, Slides, Proposal. Findings & Education is not its own SOLVE step; findings flow into the Slides tab as auto-composed slides (see delta 4). Pricing Presentation is folded into COMMIT as Present (see delta 3).
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update Section 5 and Section 6 to describe SOLVE as five steps: Scope (name structures, pick envelopes), Inspect (photo capture + condition + notes per envelope), Build (measurements + materials + labor + other per envelope), Slides (rep-curated deck of findings + Core Six), Proposal (per-structure product/warranty/discount). Pricing Presentation moves into COMMIT as the Present step.

### 3. Pricing Presentation lives in COMMIT (Present), not SOLVE

- **Item:** Present step routing
- **Where in wireframe:** [docs/app.jsx:33-38](docs/app.jsx:33), [docs/app.jsx:863-882](docs/app.jsx:863)
- **Where in PRD:** PRD 6.7 (Pricing Presentation, SOLVE phase)
- **Delta type:** Change
- **PRD says:** Pricing presentation is part of SOLVE.
- **Wireframe shows:** Present is the first COMMIT step, reached from Proposal via "Present to Homeowner". Pitch Deck (Slides) in present-mode runs the rep through Core Six + findings + the per-structure pricing comparison.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Reassign Pricing Presentation from SOLVE to COMMIT. SOLVE ends when the rep is ready to show pricing. COMMIT opens with Present.

### 4. Findings flow into the Pitch Deck as composed slides

- **Item:** Findings ↔ Pitch Deck composition
- **Where in wireframe:** [docs/app.jsx:218-260](docs/app.jsx:218), [docs/screens-pitchdeck.jsx:225-359](docs/screens-pitchdeck.jsx:225), unrouted: [docs/screens-findings.jsx:12](docs/screens-findings.jsx:12)
- **Where in PRD:** PRD 6.4 (Findings and Education, DST-EDU-01 through DST-EDU-06). Specs DST-SUR-07.
- **Delta type:** Change
- **PRD says:** Findings & Education is a standalone surface between Inspection and Pitch Deck; renders large finding cards with plain-language headlines, severity pills, and education overlays.
- **Wireframe shows:** A `composedPitchSlides` memo derives one slide per (structure, envelope) that has content (condition set, notes, or starred photos). These finding slides prepend the Core Six slides in the Pitch Deck. Standalone `FindingsScreen` exists in `screens-findings.jsx` but is not routed and not reachable. The PhotoCarousel from `screens-findings.jsx` is reused inside the Pitch Deck for finding slides.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Rewrite Section 6.4. Findings are not a standalone surface. They are auto-composed as slides at the head of the Pitch Deck from per-structure inspection state (one slide per envelope per structure with any content). The rep can include, exclude, or reorder the finding slides alongside Core Six in the Slides step. Education overlays attach per slide.

### 5. Inspect screen is capture-focused; Build screen owns measurements, materials, labor, other

- **Item:** Inspect / Build separation
- **Where in wireframe:** [docs/screens-imagecap.jsx:67-181](docs/screens-imagecap.jsx:67) (Inspect), [docs/screens-inspection.jsx:144-735](docs/screens-inspection.jsx:144) (Build)
- **Where in PRD:** PRD 6.3 (Inspection and Capture) and 6.6 (Proposal Building) collapse capture, condition, and measurement into Inspection, with measurements consumed downstream by Proposal Building. Specs DST-SUR-06 likewise.
- **Delta type:** Change
- **PRD says:** Inspection captures photos, observations, and measurements against a guided template. Proposal Building consumes pricing data and measurements.
- **Wireframe shows:** Inspect (`ImageCaptureScreen`) is photo-and-condition: photo grid, star-to-include, dictation panel that records a memo and auto-parses into line-item hints, condition selector (Good/Fair/Poor), notes, envelope dismissal with reason codes. Build (`InspectionScreen`) is the take-off surface: per-envelope sections (Measurements, Materials, Labor, Other = Equipment + Disposal), package selector (G/B/B) gating Materials, lock model on every row, copy-from-previous for fresh structures, aerial source integration, pending-dictation badges with Apply/Dismiss.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Split Section 6.3 into 6.3 Inspect (capture, condition, notes per envelope per structure) and 6.4 Build (per-envelope measurements + line items + package selection per structure). Per-structure scoping, lock states, and dismissal reason codes are first-class behaviors in Build.

### 6. Per-row lock model on Build (open / locked / dismissed)

- **Item:** Measurement and line-item lock states
- **Where in wireframe:** [docs/screens-inspection.jsx:280-300](docs/screens-inspection.jsx:280), [docs/screens-inspection.jsx:527-572](docs/screens-inspection.jsx:527), [docs/screens-inspection.jsx:697-733](docs/screens-inspection.jsx:697), ContinueReviewSheet at [docs/screens-inspection.jsx:1025-1112](docs/screens-inspection.jsx:1025)
- **Where in PRD:** Silent. PRD 6.6 / 7.2 describes process adherence as coaching support, not enforcement.
- **Delta type:** Addition
- **PRD says:** Inspection completion is required before proposal. Process adherence is reported, not gated.
- **Wireframe shows:** Each measurement field carries a state of open, locked, or dismissed. Each line-item row carries an open or locked state. When the rep taps Continue with open rows on the active Build section, a ContinueReviewSheet lists every open row with an inline stepper and a "Lock all & continue" CTA. Locked rows render soft green and can be edited (auto-unlocks); dismissed measurements show strikethrough with an Undo affordance. The rep is gated on completing each section before advancing within the Build cascade, but not blocked from skipping a step entirely.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.4 (Build): "Every measurement and line item carries a lock state (open / locked / dismissed). The rep locks rows individually or in bulk via a continue-review sheet at section boundaries. Locked rows are editable in place (auto-unlock on change); dismissed rows are recoverable via Undo. Locks are coaching support, not hard enforcement: the rep can advance with open rows but the surface surfaces what is incomplete."

### 7. Package selector (Good/Better/Best) gates Materials

- **Item:** Per-envelope package pre-gate on Materials
- **Where in wireframe:** [docs/screens-inspection.jsx:438-479](docs/screens-inspection.jsx:438), PackageSelector at [docs/screens-inspection.jsx:1122-1230](docs/screens-inspection.jsx:1122)
- **Where in PRD:** PRD 6.6 (DST-PRO-02, DST-PRO-03) describes packages on the proposal surface; not on the inspection / build surface.
- **Delta type:** Change
- **PRD says:** Package interchange happens in one tap on the proposal surface, swapping G/B/B preserving valid add-ons.
- **Wireframe shows:** On `PACKAGE_FACETS` (roofing, siding), the Materials tab is gated until all three tiers (Good/Better/Best) are committed: each tier either picks a product from the catalog OR is dismissed with a reason code (spec'd by customer, insurance match, out of budget, customer declined, not offered). Tier dismissal reasons persist on `env.packageDismissals[tier]` and surface downstream on the Proposal screen.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.4: "For trades that support tiered packages (roofing, siding), the rep selects a product for Good/Better/Best on the Build surface before line-item Materials are unlocked. Tiers may also be dismissed with a reason code; dismissed tiers carry forward to the Proposal with the reason visible."

### 8. GP-markup slider with per-scope thresholds replaces named-discount catalog

- **Item:** Discount / GP markup model
- **Where in wireframe:** [docs/screens-build.jsx:914-987](docs/screens-build.jsx:914), [docs/screens-build.jsx:1015-1080](docs/screens-build.jsx:1015)
- **Where in PRD:** PRD 6.7 DST-PRICE-16, DST-PRICE-17, DST-PRICE-18, DST-PRICE-19 (named discount list, role/brand thresholds, real-time manager approval, audit trail).
- **Delta type:** Change
- **PRD says:** Discounts selectable from approved lists (military, teacher, first responder, senior, referral, neighborhood, promotional). Over-threshold discounts trigger inline manager approval.
- **Wireframe shows:** No named discount catalog. The Proposal surface exposes a GP-markup slider per tier per scope. Per-scope thresholds: roofing 40% approval / 50% overcharge, siding 40% / 50%, windoors 40% / 55%, default 40% / 60%. Below the approval threshold a `PillarSliderStatus` displays "Approval needed · below X% markup"; above the overcharge threshold it warns about pricing above list. There is no UI to actually route the approval to a manager.
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Is the named-discount catalog (military, teacher, referral, etc.) deferred in favor of a markup-driven model, or should we keep the catalog as a labeling layer on top of the slider?

### 9. Real-time manager approval surface absent

- **Item:** Manager approval route
- **Where in wireframe:** No surface routes a discount or scope approval to a manager. The Proposal slider shows "Approval needed" but the request never leaves the rep's device.
- **Where in PRD:** PRD DST-PRICE-17, DST-ROL-03, DST-EXC-02, Specs DST-SUR-09 AC-5 ("Over-threshold discount triggers an in-app approval flow").
- **Delta type:** Removal (vs. PRD intent)
- **PRD says:** Over-threshold discounts trigger inline manager approval that persists across screens until resolved.
- **Wireframe shows:** Approval status is a self-flag only; no manager routing, no persistent banner across screens, no approval queue surface.
- **Recommended bucket:** Open question
- **One-line question:** Is real-time manager discount approval still in v1, or is the GP-slider self-flagging model the v1 stand-in until approvals land?

### 10. Care Plan removed from Proposal

- **Item:** Care Plan toggle
- **Where in wireframe:** [docs/screens-build.jsx:143](docs/screens-build.jsx:143) ("Care Plan removed per Craig until cross-IHS rollout decision."); slide content still present in [docs/data.jsx:509-511](docs/data.jsx:509).
- **Where in PRD:** PRD 6.7 DST-PRICE-13 / DST-PRICE-14 (MUST).
- **Delta type:** Removal
- **PRD says:** Configurable Care Plan / value-add closing mechanism, brand-toggleable per appointment, rep-toggleable per appointment, logged. Follows the same governance and audit-trail rules as discounts.
- **Wireframe shows:** Care Plan is explicitly removed from the Proposal screen pending a cross-IHS rollout decision. Pitch deck slide content for Care Plan still exists in the data layer.
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Should Care Plan stay listed as a MUST in the PRD with an MVP note that surfacing is deferred until cross-IHS rollout, or should the PRD drop it from v1 entirely?

### 11. Walk-through Video Capture screen unrouted

- **Item:** Walk-through Video
- **Where in wireframe:** [docs/screens-close.jsx:7-115](docs/screens-close.jsx:7) (component fully built with viewfinder, topics checklist, REC timer, Skip + Continue handlers). Not in `FLOW_VIEWS` at [docs/app.jsx:33](docs/app.jsx:33); never rendered in the app shell. HandoffScreen consumes a `walkthrough` payload at [docs/screens-close.jsx:520-537](docs/screens-close.jsx:520) but it never arrives.
- **Where in PRD:** PRD 6.10 DST-CON-04 (MUST), Specs DST-SUR-13 (full surface spec).
- **Delta type:** Change (incomplete wiring)
- **PRD says:** Required walk-through video at close documenting what is and is not being replaced. Required before signature.
- **Wireframe shows:** Screen exists, flow position would be after Contracting / before Signature, but no caller invokes it. Today the rep goes Proposal → Present → Sign without a walkthrough step.
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Should I wire the Walkthrough screen between Sign and Deposit (or between Present and Sign) before the next review, or is it deliberately deferred?

### 12. Financing screen unrouted

- **Item:** Financing application
- **Where in wireframe:** [docs/screens-financing.jsx:6-265](docs/screens-financing.jsx:6) (full screen: term selector, monthly estimate, homeowner-only SSN/DOB/income fields, decision states Approved / Counter / Declined / Pending). Wired in app.jsx at [docs/app.jsx:927-934](docs/app.jsx:927). No caller invokes `setView('financing')` anywhere in the codebase.
- **Where in PRD:** PRD 6.8 DST-FIN-01 through DST-FIN-12 (all MUST), Specs DST-SUR-11.
- **Delta type:** Change (incomplete wiring)
- **PRD says:** Financing application launches inside the application from the proposal surface.
- **Wireframe shows:** Screen is built and routed in the view-switch but no surface offers an "Apply for financing" CTA. Monthly payment estimates show on the Present comparison slide using a hard-coded 7.99% APR / 120 mo assumption ([docs/screens-pitchdeck.jsx:777](docs/screens-pitchdeck.jsx:777)).
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Should I add the financing CTA on Proposal and Present before the next review, or is the in-app financing application deferred past v1?

### 13. Shareable interactive quote absent

- **Item:** Email Me This Quote / shareable link
- **Where in wireframe:** No surface offers an emailed shareable quote with retained selection state. SignaturePad at [docs/screens-close.jsx](docs/screens-close.jsx) submit is "Sign & email quote", not "Email Me This Quote" for non-signed flows.
- **Where in PRD:** PRD 6.7 DST-PRICE-10 (Secondary CTA "Email Me This Quote"), DST-PRICE-12 (shareable interactive quote), DST-FU-06 (resulting appointment inheritance), Specs DST-SUR-10 AC-6 ("Save and Send creates a shareable interactive quote").
- **Delta type:** Removal (vs. PRD intent)
- **PRD says:** Shareable interactive quote with retained tier / add-on state, surfaced to rep when homeowner interacts.
- **Wireframe shows:** No interactive quote-share surface. Follow-up flow (delta 14) does not surface a homeowner-side artifact.
- **Recommended bucket:** Open question
- **One-line question:** Is the shareable interactive quote still in v1, or is it a deferred capability for the rehash story?

### 14. Deferred-decision branch swaps Welcome ↔ Follow-up in COMMIT

- **Item:** Deferred-sign branch
- **Where in wireframe:** [docs/app.jsx:55-60](docs/app.jsx:55), [docs/app.jsx:292](docs/app.jsx:292)
- **Where in PRD:** PRD 6.13 DST-FU-01 through DST-FU-09. Specs DST-SUR-19.
- **Delta type:** Addition
- **PRD says:** Follow-up flow exists for appointments that did not close.
- **Wireframe shows:** A `deferred` boolean app-state swaps the third COMMIT tab between Welcome (signed-now) and Follow-up (deferred). The COMMIT step bar reflows accordingly.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.13: "When the appointment closes without a signature, COMMIT's third step swaps from Welcome Package to Follow-up. Both branches share scope/findings state; the deferred branch routes to follow-up scheduling instead of Welcome automation."

### 15. Per-structure proposal slice (scopeProducts, scopeDiscount, scopeWarranty)

- **Item:** Per-structure proposal state
- **Where in wireframe:** [docs/app.jsx:279](docs/app.jsx:279) (`proposals` map), [docs/screens-build.jsx:162-273](docs/screens-build.jsx:162)
- **Where in PRD:** Not present.
- **Delta type:** Addition
- **PRD says:** Proposal is built in the single-screen quote build (DST-PRO-01) with package interchange.
- **Wireframe shows:** Each structure carries its own proposal payload: `includedScopes`, `scopeProducts` (product id per tier per scope), `scopeDiscount` (markup-driven, per tier per scope), `scopeWarranty` (per tier per scope). The rep builds the Main House proposal, then the Guest House proposal, etc., each with its own G/B/B selections.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.6: "Each structure on the appointment carries its own proposal slice (included scopes, per-tier product, per-tier warranty, per-tier discount). The rep configures one structure at a time and the Proposal surface tracks which structure is active."

### 16. Pricing mode toggle (All-in vs. By structure)

- **Item:** Pricing presentation mode toggle
- **Where in wireframe:** [docs/app.jsx:281-284](docs/app.jsx:281), Present comparison logic at [docs/screens-pitchdeck.jsx](docs/screens-pitchdeck.jsx)
- **Where in PRD:** Not present.
- **Delta type:** Addition
- **PRD says:** Side-by-side 1, 2, or 3 option presentations.
- **Wireframe shows:** A `pricingMode` toggle (`allin` vs. `by`) lets the rep choose to present one rolled-up comparison slide for the whole job, or one comparison slide per structure each tagged with the structure name. Defaults to `by` on multi-structure jobs.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.7: "On multi-structure jobs the rep selects one of two presentation modes: All-in (single comparison slide covering every structure) or By-structure (one comparison slide per structure). Default is By-structure when more than one structure is present."

### 17. Tier dual-language naming (label vs. name)

- **Item:** Tier naming
- **Where in wireframe:** [docs/data.jsx:179-260](docs/data.jsx:179) - TIERS array with id `good/better/best`, label "Good/Better/Best", name "Standard/Premium/Signature". Customer-facing surfaces use `name`; rep-facing surfaces and analytics keys use `label` or `id`.
- **Where in PRD:** PRD uses "Good/Better/Best" throughout. Specs DST-SUR-09 uses "Standard / Premium / Signature".
- **Delta type:** Change
- **PRD says:** Implicit Good/Better/Best.
- **Wireframe shows:** Both naming systems coexist: rep-facing labels use the conversational Good/Better/Best to keep coaching language consistent, customer-facing presentation uses the more premium Standard/Premium/Signature.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.7 and the Glossary: "Each tier has two names: an internal label (Good / Better / Best) used in rep-facing controls and analytics, and a customer-facing name (Standard / Premium / Signature) shown on Present, the proposal, and the signed contract. Customer-facing tier names are brand-configurable; the internal label is global."

### 18. Coach Mirror manager view in v1

- **Item:** Live rep mirroring for managers
- **Where in wireframe:** [docs/screens-coach.jsx:316-444](docs/screens-coach.jsx:316) (CoachMirror), [docs/screens-coach.jsx:47-166](docs/screens-coach.jsx:47) (CoachLanding)
- **Where in PRD:** Specs DST-SUR-20 AC-4 ("Individual metrics are visible only to the rep (self-view) in v1; manager views are post-MVP").
- **Delta type:** Change
- **PRD says:** Manager views are post-MVP.
- **Wireframe shows:** A `Coach` bottom-nav tab opens a manager landing showing live sessions and recent appointments. Tapping a live session opens `CoachMirror`: read-only live view of the rep's current step, scrubbable across completed SOLVE steps, with a waveform indicator showing the rep's audio. "Watching, not interrupting" reassurance banner.
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Is live manager mirroring (Coach landing + Coach Mirror) actually in v1 now, or is the wireframe ahead of the PRD here?

### 19. Five-tab bottom navigation including a Coach tab

- **Item:** Bottom nav structure
- **Where in wireframe:** [docs/screens-main.jsx:1419-1432](docs/screens-main.jsx:1419) — five tabs: Dashboard, Schedule, Customers, Coach, Settings.
- **Where in PRD:** Specs DST-SUR-01 lists five tabs: Dashboard, Schedule, Customers, Coaching, Settings.
- **Delta type:** Change
- **PRD says:** Tab name is "Coaching."
- **Wireframe shows:** Tab name is "Coach." The tab opens the Coach landing (manager view) rather than the rep's self-view Coaching & Reporting surface.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update Specs DST-SUR-01 to use "Coach" as the tab name. The tab routes to a role-aware surface: rep self-view (Coaching & Reporting per DST-SUR-20) for reps, manager landing (live sessions + recent appointments) for managers.

### 20. AI Toolbag drawer (right-side panel, in-appointment)

- **Item:** Sales Tool Bag drawer
- **Where in wireframe:** [docs/app.jsx:302-306](docs/app.jsx:302), [docs/app.jsx:956-963](docs/app.jsx:956), [docs/screens-main.jsx:741-1107](docs/screens-main.jsx:741)
- **Where in PRD:** Not present in PRD or Specs.
- **Delta type:** Addition
- **PRD says:** Silent.
- **Wireframe shows:** A right-side drawer is mounted on every in-appointment view. Five tabs: Ask AI (chat assistant aware of appointment context), Customer (editable contact + insurance fields), Property (valuation / structure / jurisdiction), Area (aerial map with nearby completed-work pins, filterable by scope / mfr / product / color), Reviews. Inner sheets layer on top of the drawer for editing and filtering.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add a new capability section (suggested 6.5b or appended to 6.3): "Sales Tool Bag drawer is available on every in-appointment surface. Five tabs (Ask AI, Customer, Property, Area, Reviews) give the rep one-tap access to homeowner context, property data, comparable completed work, and reviews without leaving the current appointment surface. The drawer is rep-only and never homeowner-facing."

### 21. Recording controls: pause / resume / end + idle warning + hard cap

- **Item:** Extended recording safeguards
- **Where in wireframe:** [docs/app.jsx:90-95](docs/app.jsx:90), [docs/app.jsx:353-375](docs/app.jsx:353), [docs/app.jsx:404-422](docs/app.jsx:404), [docs/screens-main.jsx:449-526](docs/screens-main.jsx:449)
- **Where in PRD:** PRD DST-ARR-02 (auto-start with visible indicator). Spec 3.4 (recording indicator). No pause/resume/end or safeguard mechanics.
- **Delta type:** Addition
- **PRD says:** Auto-start Rilla recording with a clearly visible but unobtrusive indicator.
- **Wireframe shows:** Tapping the REC pill opens a `RecordingControlSheet` with Pause, Resume, End. After 20 minutes of no interaction during active recording, a `RecordingIdleModal` prompts the rep to pause or continue. At 2 hours of total recording a `RecordingHardCapModal` surfaces with End or Keep Going. Recording timer is paused-aware.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.2 / DST-ARR-02: "Recording controls (pause, resume, end) are accessible from the recording indicator. The platform surfaces a soft pause prompt after 20 minutes of rep inactivity during recording, and a hard-cap prompt at 2 hours of total recording. Reps may dismiss either to keep recording. Pause is also auto-triggered by Save & Exit."

### 22. Save & Exit ambient pill

- **Item:** Saved indicator + Save & Exit popover
- **Where in wireframe:** [docs/app.jsx:90-92](docs/app.jsx:90), [docs/app.jsx:329-347](docs/app.jsx:329), [docs/app.jsx:428-435](docs/app.jsx:428), [docs/screens-main.jsx:345-435](docs/screens-main.jsx:345)
- **Where in PRD:** Specs 3.7 (Save behavior: auto-saved offline locally with deferred sync; explicit-action commitments). No surface treatment.
- **Delta type:** Addition
- **PRD says:** Field-critical actions auto-save offline; discrete commitments require homeowner-visible confirmation.
- **Wireframe shows:** Ambient "Saved · just now" pill in the app header refreshes on every appointment-state mutation. Tap opens a popover with absolute last-saved timestamp and a "Save & Exit" CTA that pauses recording and returns to the appointment list while preserving every in-flight state slice.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Specs 3.7: "The header surfaces an ambient Saved indicator with a tap-to-reveal popover that exposes the last-saved timestamp and a Save & Exit action. Save & Exit pauses recording and returns to the appointment list; re-opening the appointment resumes every in-flight state slice at the exit point."

### 23. Tablet-to-phone handoff for inspection

- **Item:** Mid-appointment inspection handoff
- **Where in wireframe:** [docs/app.jsx:97-103](docs/app.jsx:97), [docs/app.jsx:440-445](docs/app.jsx:440), [docs/screens-main.jsx:538-583](docs/screens-main.jsx:538)
- **Where in PRD:** PRD DST-EXC-09 (rep device fails mid-appointment, recoverable via multi-device continuity), Specs OFF-03 (multi-device continuity).
- **Delta type:** Addition
- **PRD says:** Multi-device continuity for device failure recovery.
- **Wireframe shows:** On tablet during Inspect, the Saved popover exposes a "Hand off Inspection" action. Opens `HandoffSheet` with a previewable SMS to the rep's phone number containing a deeplink to resume Inspect on phone. Intended workflow: rep stays primary on tablet for Build / Proposal / Present, but walks the structure with phone for capture, then returns to tablet.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.18 / DST-EXC-09: "The rep may hand off the Inspect step from tablet to phone via a deeplinked SMS. Hand off is one-directional (tablet → phone) and Inspect-only; the rep returns to tablet for Build, Proposal, and Present. Capture state syncs through the appointment record."

### 24. Structure switcher chip in app header (Inspect + Build)

- **Item:** Active-structure switcher
- **Where in wireframe:** [docs/app.jsx:611-622](docs/app.jsx:611), `StructureSwitchChip` component referenced via `window.StructureSwitchChip`.
- **Where in PRD:** Not present.
- **Delta type:** Addition
- **PRD says:** Silent.
- **Wireframe shows:** A persistent chip in the header on Inspect and Build views displays the active structure name with a dropdown to switch structures or jump back to Scope. Always rendered (even on single-structure jobs) so reps have one consistent place to confirm which building they are on.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.3 / 6.4: "On Inspect and Build, a structure switcher chip is fixed in the app header. The chip displays the active structure name and exposes a menu to switch structures or return to Scope. The chip renders on single-structure jobs as well."

### 25. Multi-topic dictation on Needs Assessment

- **Item:** Multi-topic AI extraction
- **Where in wireframe:** [docs/screens-na.jsx:117-131](docs/screens-na.jsx:117) (Dictate FAB), [docs/screens-na.jsx:391-411](docs/screens-na.jsx:391) (dictation payload review)
- **Where in PRD:** PRD DST-NA-01, DST-NA-03 (capture priorities via voice-to-text; structure unstructured notes in the background, never displayed mid-conversation).
- **Delta type:** Change
- **PRD says:** Voice-to-text is one of four input modes; AI structures notes in the background and is never displayed mid-conversation.
- **Wireframe shows:** A floating Dictate button opens a sheet where the rep speaks the whole conversation. AI parses into per-topic suggested fills (each with a 0-100% confidence pill). The rep cherry-picks which suggestions to apply across Budget, Timeline, Deciders, Insurance, Concerns, Constraints, Source. This is rep-driven and post-conversation, not background mid-conversation.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-NA-03: "The rep may invoke a dictation review after the conversation in which the AI proposes per-topic field values from the captured audio with confidence scores. The rep cherry-picks which suggestions to apply. The proposed values are never shown to the homeowner mid-conversation."

### 26. Handwriting-to-text on Needs Assessment topics

- **Item:** Sketchpad with AI cleanup
- **Where in wireframe:** [docs/screens-na.jsx:218-379](docs/screens-na.jsx:218)
- **Where in PRD:** PRD DST-NA-01 (sketchpad as one of four input modes).
- **Delta type:** Change
- **PRD says:** Sketchpad is a capture mode.
- **Wireframe shows:** Each topic tile opens a sheet with Type / Write tabs. Write is a canvas with stroke capture; on save, a mock AI cleanup pass converts handwriting to text. The cleaned text is what persists.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-NA-01: "Handwritten notes on the sketchpad are converted to text by an AI cleanup pass on save. The cleaned text is what persists to the customer record; the original strokes are not retained."

### 27. CSR / intake summary band on Needs Assessment

- **Item:** Intake context band on Needs
- **Where in wireframe:** [docs/screens-na.jsx:75-91](docs/screens-na.jsx:75)
- **Where in PRD:** PRD DST-PREP-08 (CSR Notes on Appointment Preview).
- **Delta type:** Addition
- **PRD says:** CSR Notes live on the Appointment Preview surface.
- **Wireframe shows:** Needs Assessment top band shows a compact summary of intake (lead source, trade, insurance, estimate) labeled "From the intake call · X days ago." Each topic tile may show a prefill block from that intake. Brings CSR context into the conversation surface as a non-blocking reference.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.2: "Needs Assessment surfaces a compact intake summary at the top and per-topic prefill from intake where available. Intake context is a non-blocking reference; the rep confirms or supersedes per topic."

### 28. Photo annotation / sketching

- **Item:** AnnotateSheet
- **Where in wireframe:** [docs/screens-imagecap.jsx:338-507](docs/screens-imagecap.jsx:338), lifted to app-root at [docs/app.jsx:171-173](docs/app.jsx:171)
- **Where in PRD:** PRD DST-INSP-12 (voice-to-text and touch annotations).
- **Delta type:** Change
- **PRD says:** Touch annotations on photos and notes.
- **Wireframe shows:** Tapping a photo opens a fullscreen annotation canvas: hand-drawn strokes with Undo / Clear / Star, smooth quadratic stroke rendering, dark background with grid. Voice-dictation items render a non-editable placeholder ("Voice dictation / No photo to annotate"). Mounted at app-root so it covers OS, app, and phase headers.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-INSP-12: "Photo annotations are captured on a full-screen canvas overlay (Undo, Clear, Star). Voice-dictation captures appear in the same gallery with a non-annotatable placeholder."

### 29. Aerial-report integration with Apply-all

- **Item:** Aerial measurement source
- **Where in wireframe:** [docs/screens-inspection.jsx:1437-1499](docs/screens-inspection.jsx:1437)
- **Where in PRD:** PRD DST-PREP-03 (order or refresh measurements from providers), DST-INSP-09 (drone capture), DST-INSP-10 (Ray-Ban Meta).
- **Delta type:** Change
- **PRD says:** Measurements come from providers; drone capture and smart-glasses capture are additional sources.
- **Wireframe shows:** A `SourceBanner` on each envelope shows the linked source (aerial / drone / etc.) with an "Apply all" button. Per-field Apply buttons let the rep accept individual aerial values into measurements without committing the entire set. Source pre-fill and rep override coexist.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update Section 6.3: "Each Build envelope carries a measurement source (manual, aerial, drone, etc.). When source values are present, the rep can Apply All, Apply individual fields, or override. Source attribution is preserved per measurement for audit."

### 30. Pending-dictation badge with Apply / Dismiss

- **Item:** Inspect-to-Build measurement bridge
- **Where in wireframe:** [docs/app.jsx:457-475](docs/app.jsx:457), [docs/screens-inspection.jsx:289-300](docs/screens-inspection.jsx:289), [docs/screens-inspection.jsx:556-572](docs/screens-inspection.jsx:556)
- **Where in PRD:** Not present.
- **Delta type:** Addition
- **PRD says:** Silent.
- **Wireframe shows:** When the rep dictates a finding on Inspect with a measurement hint (e.g., "valley flashing about twenty linear feet"), the parsed quantity stages on the matching envelope as a Pending value. On the Build tab the measurement field shows a "Pending · from dictation" badge with Apply and Dismiss buttons. The value does not auto-set; the rep must accept.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.4: "Dictation on Inspect that carries a measurement hint stages the value as a Pending field on the matching envelope. Pending values surface on Build with explicit Apply or Dismiss controls; they never auto-set."

### 31. Copy-from-previous on fresh structure

- **Item:** Structure cloning
- **Where in wireframe:** [docs/screens-inspection.jsx:934-1015](docs/screens-inspection.jsx:934)
- **Where in PRD:** Not present.
- **Delta type:** Addition
- **PRD says:** Silent.
- **Wireframe shows:** When the rep opens Build on a fresh structure and at least one other structure has substantive content (≥ 3 measurements or line items), a banner offers a one-tap deep-clone of that structure's envelope. Cloned measurements and line items auto-lock so the destination starts in a "committed by reference" state. Dismissed rows remain dismissed.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 6.4: "On a fresh structure with another structure already substantively built, Build surfaces a one-tap clone of the source envelope. Cloned rows arrive locked; edits unlock individual rows."

### 32. Envelope and package dismissal with reason codes

- **Item:** Dismissal reason codes
- **Where in wireframe:** Envelope dismissal at [docs/screens-imagecap.jsx:542-572](docs/screens-imagecap.jsx:542), package dismissal at [docs/screens-inspection.jsx:1194-1230](docs/screens-inspection.jsx:1194)
- **Where in PRD:** PRD DST-INSP-03 (mark a trade Not Present), DST-INSP-04 (skip with reason code), DST-PD-04 (skip Core Six with reason).
- **Delta type:** Change
- **PRD says:** Trades can be marked Not Present or skipped with reason codes.
- **Wireframe shows:** Two distinct dismissal mechanics:
  - Envelope dismissal on Inspect collapses a finding card with a reason label (Not Present, Perfect, etc.) and an Undo affordance.
  - Package tier dismissal on Build records a reason (spec'd by customer, insurance match, out of budget, customer declined, not offered) and carries that label to the Proposal surface so the homeowner sees why a tier is intentionally missing.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-INSP-03 / DST-INSP-04 to cover both envelope-level and tier-level dismissal. Add: "Tier-level dismissal on Build (Good / Better / Best) requires a reason code; the dismissal label persists to the Proposal and Present surfaces so the homeowner-visible offering reflects why a tier was intentionally omitted."

### 33. Continue cascade across structures and steps

- **Item:** Continue button cascade
- **Where in wireframe:** [docs/app.jsx:485-516](docs/app.jsx:485), [docs/screens-inspection.jsx:573-686](docs/screens-inspection.jsx:573)
- **Where in PRD:** PRD DST-PD-20 (guided appointment flow; backward navigation always allowed, forward gates).
- **Delta type:** Change
- **PRD says:** Guided flow with backward freedom and forward gates.
- **Wireframe shows:** Continue cascades through three nested loops: (1) within a Build section, advance to the next section; (2) within a structure, advance to the next incomplete envelope; (3) at end-of-structure, advance to the next structure on the same step; (4) at end-of-structures, advance to the next SOLVE step. PhaseTabBar shows a "farthest reached" indicator that lets the rep jump backward freely; forward taps past the farthest step are blocked.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-PD-20: "Continue cascades through section → envelope → structure → step nesting. The platform surfaces what is next at each tap. Backward navigation by step is always allowed; forward navigation past the farthest-reached step is blocked."

### 34. SOLVE → COMMIT gate on Appointment overview

- **Item:** COMMIT card unlock
- **Where in wireframe:** [docs/app.jsx:294-296](docs/app.jsx:294), [docs/app.jsx:378-382](docs/app.jsx:378), [docs/screens-flow.jsx:384-416](docs/screens-flow.jsx:384)
- **Where in PRD:** PRD 7.2 (Process adherence vs. enforcement).
- **Delta type:** Addition
- **PRD says:** Process adherence is coaching support, not a hard blocker.
- **Wireframe shows:** The Appointment overview surfaces three phase cards (CONNECT, SOLVE, COMMIT). The COMMIT card stays disabled until the rep first advances into any COMMIT view; thereafter `solveCompleted` is sticky.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Add to Section 5: "The Appointment overview surfaces CONNECT, SOLVE, COMMIT as three phase cards. COMMIT unlocks once the rep has first entered any COMMIT step; the flag is sticky for the appointment."

### 35. Welcome Package timeline + "Locked in" block

- **Item:** Post-signature anticipation surface
- **Where in wireframe:** [docs/screens-welcome.jsx](docs/screens-welcome.jsx) (full file), and [docs/screens-close.jsx:411-505](docs/screens-close.jsx:411) (alternate variant)
- **Where in PRD:** PRD DST-WP-01 through DST-WP-07, Specs DST-SUR-16.
- **Delta type:** Change
- **PRD says:** Branded email and SMS with project intro, next steps, production process, financing reminders, warranty, production contact, referral intro.
- **Wireframe shows:** Welcome Package surface is the homeowner-anticipation page: "Signed · Deposit · Locked in" hero with tier name and total. "What's locked in" section (scope, color, contract & deposit, warranties). "What happens next" timeline of day-by-day milestones (Today → Final day walk-through) with state pills (done / next / upcoming). SMS notification callout describes the upcoming milestone-driven texts.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update Specs DST-SUR-16 to describe the surface as a homeowner-anticipation page with a "Locked-in" summary block and a "What happens next" timeline of milestone states. The email/SMS automation per DST-WP-01 fires on signature; the Welcome surface is the in-app celebration the homeowner sees on the rep's device.

### 36. Handoff package contents checklist with warnings

- **Item:** Production handoff package preview
- **Where in wireframe:** [docs/screens-close.jsx:506-625](docs/screens-close.jsx:506)
- **Where in PRD:** PRD DST-PH-01, Specs DST-SUR-17.
- **Delta type:** Change
- **PRD says:** Bundle production handoff package: signed contract, scope, color confirmations, walk-through video, photos, measurements, notes, customer profile, risk flags.
- **Wireframe shows:** Handoff surface displays a contents checklist (Walkthrough with duration / topics covered, Photos with count, Flags listing risk-flags like "Deposit deferred" or "Walk-through skipped") with warning state on missing required artifacts. Production acknowledgment state shows pending → acknowledged. Each item is tappable to view the underlying artifact.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** No new language; Specs DST-SUR-17 already matches. Note the wireframe currently shows the walkthrough item with "Not captured" or "Skipped" labels because the walkthrough screen is unrouted (see delta 11). Resolving delta 11 lights up the package.

### 37. Inspection covers all four envelopes regardless of scope

- **Item:** Universal envelope inspection
- **Where in wireframe:** [docs/screens-imagecap.jsx:90-93](docs/screens-imagecap.jsx:90) ("we inspect the entire envelope regardless of selected scopes")
- **Where in PRD:** PRD DST-INSP-02 (condition for every exterior trade present).
- **Delta type:** Change
- **PRD says:** Reps complete a condition assessment for every exterior trade present on the home.
- **Wireframe shows:** Inspect always renders all four envelope cards (Roofing, Siding, Gutters, Windows & Doors) regardless of which scopes were picked on Scope. The Continue gate requires condition + notes on each visible envelope OR an explicit dismissal. Scopes selected on Scope determine which envelopes appear on Build (the measurement / pricing surface), not which appear on Inspect.
- **Recommended bucket:** Adopt
- **Suggested PRD language:** Update DST-INSP-02: "Inspect always presents every primary envelope on the home (roof, siding, gutters, windows / doors). The rep must record a condition + notes on each OR dismiss with a reason code. Scope selections control which envelopes flow into Build and the Proposal, not which appear on Inspect."

### 38. Pitch deck skip reasons are not tier-gated

- **Item:** Senior / General reorder + skip gating
- **Where in wireframe:** [docs/screens-pitchdeck.jsx:63-127](docs/screens-pitchdeck.jsx:63), [docs/screens-main.jsx:1963-1965](docs/screens-main.jsx:1963) (Settings displays "Pitch deck reorder unlocked" for senior reps)
- **Where in PRD:** PRD DST-PD-05, DST-PD-06, DST-PD-07 (General reps follow standard order with bounded supplemental slides; Senior reps may reorder).
- **Delta type:** Change
- **PRD says:** General reps cannot reorder Core Six. Senior reps may reorder and may skip with reason code.
- **Wireframe shows:** Both reps can drag to reorder slides on the Slides (Approach) tab. Both reps see the same Skip-with-reason flow on toggling a Core Six slide off. Settings shows a Senior / General badge but the actual reorder gating in the Pitch Deck screen is not enforced.
- **Recommended bucket:** Confirm with Jay
- **One-line question:** Is Senior / General reorder gating still in v1, or has the rule relaxed to "both can reorder, both can skip with reason"?

## Cross-engine flags

Items in the wireframe that imply dependencies on the Pricing or Commissions engines (or other adjacent engines):

### Pricing Engine

- **Per-structure proposal payloads.** The pricing call must accept and return per-structure breakdowns (one set of G/B/B per scope per structure). Reference: [docs/screens-build.jsx:162-273](docs/screens-build.jsx:162).
- **GP-markup with per-scope thresholds.** The Pricing Engine surface must expose `cost`, `subtotal`, and accept a rep-applied discount that the rep adjusts via a markup slider. Approval and overcharge thresholds are per-scope (roofing 40/50, siding 40/50, windoors 40/55). Reference: [docs/screens-build.jsx:914-947](docs/screens-build.jsx:914).
- **Linked line items.** Materials and labor rows with `linked: true` and a `calc(measurements)` function recompute automatically when measurements change. The Pricing Engine catalog must include this link metadata and the calculation rule. Reference: [docs/data-pricing.jsx:315](docs/data-pricing.jsx:315).
- **Aerial measurement source.** Each envelope expects an `aerial` payload of pre-computed measurements from an external provider, alongside the rep's manual values. Reference: [docs/screens-inspection.jsx:1437-1499](docs/screens-inspection.jsx:1437).
- **Tier dismissal reasons.** The proposal payload must carry dismissed-tier reasons per scope per structure so the Present comparison slide can render the empty tier with its dismissal label. Reference: [docs/screens-inspection.jsx:1194-1230](docs/screens-inspection.jsx:1194).
- **Custom items.** Rep-created custom line items must round-trip with a custom flag so MDM can pick them up for catalog promotion. Reference: PRD DST-PRO-09.
- **Markup-vs-discount language.** The wireframe expresses pricing posture as markup % (gp / cost × 100). The Pricing Engine integration shape should expose markup as a first-class concept alongside discount $.
- **Warranty per tier per scope.** Each pillar carries a `warranties` array, and the proposal stores `scopeWarranty[scopeId][tierId]`. The catalog must expose the available warranties per product. Reference: [docs/screens-build.jsx:36-118](docs/screens-build.jsx:36).

### Commissions Engine

- **MTD / YTD commissions, GP, close rate.** Dashboard hero pulls live commission totals plus a Gross Profit % and trend; Commissions surface drills into pending and paid rows with per-deal commission amount, rate, signed date, pay date. Reference: [docs/screens-main.jsx:1549-1641](docs/screens-main.jsx:1549), [docs/screens-main.jsx:2000-2062](docs/screens-main.jsx:2000).
- **Per-deal commission row.** Each row shows customer, status (pending / paid), job name, signed date, rate %, original sold amount, pay date, computed commission. The Commissions Engine must expose all these fields per deal.

### CRM / Production scheduling

- **Resulting appointment inheritance.** The Follow-up Detail surface advertises that scheduling a re-presentation inherits prior context (findings, proposals shown, walk-through). Reference: [docs/screens-main.jsx:2487-2500](docs/screens-main.jsx:2487). Requires CRM-side support for parent-child appointment linkage.
- **Production acknowledgment.** The Handoff surface waits on production-system acknowledgment (pending → acknowledged). Requires inbound webhook from CRM or production scheduling. Reference: [docs/screens-close.jsx:506-625](docs/screens-close.jsx:506).

### Other

- **Aerial / measurement provider API.** Appointment Preview measurement order tiles (GAF QuickMeasure, EagleView, Hover) are referenced in PRD DST-PREP-03 and consumed by the aerial integration on Build.
- **Manager mirroring (out-of-process).** Coach Mirror implies a live broadcast channel from rep device to manager device (screen + audio waveform). Likely needs a real-time pub-sub layer not covered in the Integration Contract.
