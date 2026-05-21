# DST Design Alignment Brief

Aligns Craig's in-flight Claude Design prototype with DST PRD v7 + locked Surface Specs template + NFR Spec + Integration Contract. Use this to drive the next round of Claude Design iteration.

The old `dst_wireframe_prompts.md` was written against PRD v1.3 and uses outdated requirement IDs. This brief supersedes it. Use the new ID scheme (DST-PREP, DST-INSP, DST-PD, DST-FE, DST-PRICE, DST-FIN, DST-PAY, DST-CON, DST-PH, DST-WP, DST-FU, DST-RPT, DST-ROL, DST-ADM, DST-MT, DST-EXC).

---

## Section 1: What's built and aligned — keep as-is

The current prototype already covers seven capability areas. These read as on-brand for the PRD and should not be re-prompted from scratch.

| Built surface | DST PRD coverage | Notes |
|---|---|---|
| Login | DST-PREP (auth context, IDP-01) | Visible SSO option present. Bypass-by-default is fine for prototyping. |
| Dashboard | DST-PREP-01, DST-RPT-01 through -07 | Hero commissions card, metric grid, Up Next, Later Today. Coaching metrics are correctly framed (not punitive). |
| Schedule | DST-PREP-02 | Date strip with snap-scroll, appt cards with time/customer/trade pills. |
| AppointmentDetail | DST-PREP-04, DST-PREP-06, DST-PREP-07 | Address, contact, insurance, recording state. Inspection progress card is a strong pattern. |
| Inspection + Camera | DST-INSP-01 through DST-INSP-08 | Seven-category model, capture flow with AI categorization, transcript dictation. The AI-classify-then-confirm pattern is exactly the DST PRD intent. |
| Settings | DST-ROL display, recording defaults, sync indicator | Brand picker + dark mode + pricing-engine sync status. |
| SignaturePad | DST-CON-02 partial | Working canvas, audit-trail card after signature is a high-value pattern. |

**Visual language is locked.** Treat the existing token system as canonical for everything that comes next:

- Background `#eeece6` (warm cream) — used everywhere except inside dark surfaces
- Brand-swappable accent (Skywalker blue `oklch(0.72 0.14 230)`, Valentine red `oklch(0.52 0.21 18)`) — applied as `--brand` / `--brand-fg`
- Inter as base typeface, custom display font for prices and hero numbers
- Display type tight (-0.02em to -0.04em letter spacing)
- Tabular nums for everything monetary or numeric
- Heavy use of pills (`border-radius: 999`), 8-14px corner radii on cards
- Pills come in default, `.pill.brand`, `.pill.success` variants
- Section labels are small, uppercase, muted (`--text-3` or `--text-4`)
- `.card` with 1px border + `.card-pad` for internal spacing
- Toasts top-aligned with AI-mark style for AI-generated content

**Any new surface inherits this token system. Do not re-introduce visual styling.**

---

## Section 2: Fixes to apply to existing surfaces

These are corrections to surfaces already in the prototype. Paste the directive into Claude Design and ask it to update the named component.

### 2.1 Brand should not be a runtime toggle

**Current:** Settings has a brand picker (Skywalker / Valentine) that swaps app-wide.
**Issue:** DST PRD models brand as derived from the rep's appointment context (which brand owns this appointment, this lead, this deal). A rep is typically assigned to one brand; multi-brand reps see brand resolved per appointment.
**Fix:** Move the brand swap behind a developer-only Tweaks panel (you already have one). In the production-facing Settings surface, brand should be displayed read-only as "Your brand: Skywalker Roofing" with no swap action. Per-appointment brand override remains possible at the appointment level (DST-PREP-05) but is rare.

### 2.2 Authenticated rep identity, not hardcoded "Cole Jankowicz"

**Current:** Cole Jankowicz is hardcoded into the account label, audit trail, recording author, and commission rep name.
**Issue:** The rep identity must flow from the authenticated session (IT-managed identity provider per Integration Contract IDP-01).
**Fix:** Add a `rep` object to the app's mock state at the top level (name, email, brand, device ID, role). Every surface that names a rep reads from that object. Tweaks panel can swap mock reps.

### 2.3 Offline / sync indicator is missing

**Current:** No offline indicator anywhere. Signature submission references LTE in the audit trail but the UI never surfaces connectivity state.
**Issue:** DST is offline-first per NFR Spec OFF-01 through OFF-08. The rep needs to know sync state without it alarming the homeowner.
**Fix:** Add a sync pill to the AppContextBar (top of every screen): `Synced · 12s ago` in muted text; `Offline · 4 changes queued` in subtle warn color when disconnected. Pill is glanceable, not prominent. When tapped, opens a small sheet listing queued items. The pill should never block any rep action.

### 2.4 Tier price mismatch (data bug)

**Current:** Each tier in `TIERS` has a hardcoded `price` field (`$28,940`, `$36,480`, `$47,820`) but the displayed total is computed from `LINE_ITEMS` via `tierTotal()`, which produces different numbers.
**Fix:** Remove the hardcoded `price` from `TIERS`. Always compute from line items. This matches the PRD principle that the DST consumes pricing live from the Pricing Engine.

### 2.5 Walk-through video is missing from the close flow

**Current:** Signature flow goes directly from "Approve & Sign" to the audit-trail success state.
**Issue:** DST-CON-04 requires a walk-through video to be captured at close, documenting what is and is not being replaced. This is a required step in clean contracting (DST-PH-02 also lists it as part of the production handoff package).
**Fix:** Insert a step between SignaturePad submit and the success state. Surface: "Walk-through video required" with a "Record walk-through" CTA that opens a video capture state (similar to the camera modal, but for video; can be stub-faked with a "Recording... 0:42" indicator and a Stop button). Show captured-thumbnail confirmation, then proceed to success. (The live-vs-prerecorded decision is open — Decision Log DST-DEC-13 — so model it as live recording for now and note that prerecorded is a configurable option.)

### 2.6 Deposit collection step is missing

**Current:** Signature flow has no deposit step.
**Issue:** DST-PAY covers deposit collection at close. Deposit is required for "clean contracting" per DST-PH-02.
**Fix:** Insert a deposit step between walk-through video capture and the success state. Surface: amount field with a brand-configured default (e.g., 10% of deal total), payment method selector (Card / ACH), pass-through to the payment gateway (faked — show a "Processing..." state, then deposit-confirmed). The homeowner enters payment info themselves on the tablet; the rep does not key card numbers.

### 2.7 Welcome Package automation is missing

**Current:** Success state after signature is a static toast.
**Issue:** DST-WP-01 through DST-WP-07 specify the Welcome Package as an automation: branded email + SMS, project introduction packet, next-steps guide, production process overview, financing reminders, warranty info, production team contact, referral introduction. Triggers immediately on signature; deposit confirmation appends as an addendum.
**Fix:** After signature (and deposit, after fix 2.6) — show a "Welcome Package sent" confirmation card. The card shows: what was sent (email + SMS), to whom, when, delivery status (sent → delivered → opened). The rep sees this from the closed appointment record. The 30-minute post-signature hold window (DST-WP-06) is an open decision (Decision Log DST-DEC-16); for now don't render the hold timer.

### 2.8 Customers tab is a placeholder

**Current:** Customers tab shows the first 6 appointments as a "Recent" list.
**Fix:** Build out per the Customers prompt in Section 3.

### 2.9 "New" appointment button stubs to a toast

**Current:** Schedule's "New" button toasts "New appointment — coming soon."
**Decision:** Appointment creation belongs in the CRM, not the DST. The DST receives appointments. Remove the New button entirely from Schedule. (DST is for in-home selling; lead intake is upstream.)

### 2.10 Recording-as-AI framing

**Current:** Recording starts when an appointment opens. Toast says "Recording started · all inspection audio captured."
**Refine:** This is correct, but make the AI relationship explicit. Per DST-NA-03 / DST-ARR-02, recording feeds Rilla (coaching) AND can feed needs-assessment structuring. Add a subtle "Captured for coaching · structuring needs assessment" caption under the recording indicator. Whether the audio is also used for real-time needs-assessment structuring is open (Decision Log DST-DEC-01), so model it as "will be used for needs assessment if your brand has it enabled."

---

## Section 3: New surfaces to add — run-ready prompts

Each prompt below is self-contained. Paste into Claude Design and ask it to add the surface to the existing app, preserving the established visual language. Each prompt names the DST PRD requirements it satisfies.

---

### Prompt A: Needs Assessment surface (DST-NA, DST-ARR)

```
Add a Needs Assessment surface to the IHS Selling Way DST. This surface sits between AppointmentDetail and InspectionScreen in the linear flow: AppointmentDetail → ARR (Arrival) → NA (Needs Assessment) → Inspection → Quote → Present → Sign → Walk-through → Deposit → Welcome.

PURPOSE
The rep uses this surface in the homeowner's living room (NOT on the roof). It captures the homeowner's stated concerns, goals, decision-making structure, and constraints in a structured way. The AI assists by transcribing the conversation in real time (recording is already on) and proposing structured fields that the rep confirms.

ROUTE
view === 'needs' (between 'apt' and 'inspect'). Add a button on AppointmentDetail labeled "Begin Conversation" (replacing "Start Appointment" if recording is already started, or chaining after it).

LAYOUT (PHONE-FIRST, tablet inherits with wider card grid)
Top: AppContextBar with "Needs Assessment" title and back arrow. Recording indicator persistent.
Live transcript card (collapsible): scrollable text of the conversation transcript with auto-scroll. AI confidence dot on lines the AI is structuring.
Structured fields, AI-proposed: each field is a card with the AI's proposed value, a confidence pill, and Confirm / Edit actions. Tap Confirm to lock the value. Tap Edit to override.
Fields:
- Primary concern (free text, AI extracts from "what's been going on with your roof")
- Project type (multi-select from trade list: roofing / siding / windows / gutters / etc.)
- Decision makers (names + role; AI extracts from "my wife handles the finances")
- Timeline (drop-down: immediate / 30 days / 60-90 days / longer / exploring)
- Budget signal (optional; rep marks as "shared" / "didn't share" / "asked us to recommend")
- Insurance involved (yes / no / unknown, with carrier field if yes)
- Constraints / sensitivities (free text)
- Other concerns observed during walkthrough (free text, rep-only — homeowner doesn't see)
Bottom CTA: "Begin Inspection →" (advances to inspect view).

BEHAVIORS
- Fields populate progressively as the AI extracts. A field appears with an "AI suggested" badge and stays in suggested state until the rep confirms.
- Unconfirmed fields do not block advancing to Inspection. The rep can confirm during or after inspection.
- All confirmed fields write to the audit trail.
- The structured fields feed forward into the proposal (the rep doesn't re-enter "your concern was X").

STYLE
Use the established token system. Cream background, brand pills, Inter + display font, tabular nums where numbers appear. AI-suggested cards use the `.ai-mark` styling already in the app.

CROSS-REFERENCES
- DST-NA-01 through DST-NA-08 (Needs Assessment capability)
- DST-ARR-01 through DST-ARR-04 (Arrival / Connect phase)
- Decision Log DST-DEC-01 (real-time audio use for needs assessment is open)

Acknowledge and build.
```

---

### Prompt B: Findings & Education surface (DST-FE)

```
Add a Findings & Education surface to the IHS Selling Way DST. This surface sits between InspectionScreen and the Quote flow. The rep walks the homeowner through what was found, in plain language, with education overlays, BEFORE any prices appear.

PURPOSE
This is where the DST earns trust. Homeowners see findings first, with photos, plain-language headlines, and short education explainers. No prices on this screen. The Over-the-Shoulder Test fully applies: this is the most homeowner-facing surface in the entire app.

ROUTE
view === 'findings' (between 'inspect' and 'quoteLoading'). Triggered by a primary CTA on the Inspection screen: "Review Findings with Homeowner →" (replaces or sits alongside "Generate Quote").

LAYOUT (TABLET-PRIMARY — this is the surface the rep hands the tablet to the homeowner for, or holds it side-by-side)
Top: AppContextBar with "Findings" title.
Hero: "Here's what we found on your roof" with the homeowner's last name ("Whittakers").
Findings stack: each finding is a large card. Card contents:
- Photo from inspection (large, prominent).
- Plain-language headline (NOT contractor jargon). Example: "Hail bruising on the north field" not "Asphalt granule loss class 2, slope 1."
- One-paragraph explanation in plain language (3-4 lines).
- Education overlay button: "How this affects your home" — opens a sheet with a short education explainer (diagram, install video, or text).
- Severity pill: Routine / Notable / Action recommended.
Cards are scrollable vertically. Tap a card to expand to full-screen for closer photo viewing.
Bottom: a summary card showing "X findings reviewed of Y" and a CTA "Continue to Solution →" (advances to quoteLoading then quote).

BEHAVIORS
- The rep can mark each finding as "Discussed with homeowner" (subtle checkmark) so they don't forget to mention anything.
- The Education overlay is brand-configurable content; show a placeholder slot for the video / diagram.
- No prices, no proposals, no add-ons. Pricing is the next step, not this one.

STYLE
Use the established token system. Cream background. Findings cards are large, generous whitespace, photo-forward. Display font for the headline; Inter for body. No pills with prices.

CROSS-REFERENCES
- DST-FE-01 through DST-FE-06 (Findings and Education capability)
- DST-INSP-08 (Inspection findings feed this surface)

Acknowledge and build.
```

---

### Prompt C: Pitch Deck / Core Six surface (DST-PD)

```
Add a Pitch Deck surface to the IHS Selling Way DST. This is the structured presentation flow that runs between Findings & Education (DST-FE) and the Proposal Builder. The rep walks the homeowner through the Core Six slides.

PURPOSE
The Pitch Deck is the IHS Selling Way presentation: a structured set of slides covering Company, Approach, Process, Products, Warranty, and a brand-configurable sixth slide (often Care Plan). General Reps see the Core Six in a fixed order. Senior Reps can reorder. Skipping a slide requires a reason code.

ROUTE
view === 'pitchdeck' (between 'findings' and 'quote'). Trigger from Findings & Education: "Show our approach →" or similar.

LAYOUT (TABLET-PRIMARY)
Top: AppContextBar with "Our Approach" title (no "Pitch Deck" label — that's internal language).
Slide stage: full-bleed, one slide at a time. Slides advance by tap or swipe.
Slide indicator: small dots at the bottom showing position. 6 dots for Core Six.
Slide content (different per slide type):
- Company: brand origin story, photo, license, regional coverage.
- Approach: the IHS Selling Way principles, plain language.
- Process: visual timeline of the project lifecycle (Inspection → Proposal → Approval → Production → Warranty).
- Products: the manufacturer partnerships, product line highlights.
- Warranty: warranty coverage with shield icon, plain-language coverage explanation.
- Care Plan (or brand-specific 6th slide): post-installation care, follow-up.
Each slide has a brand-themed accent and uses the display font for headlines.
Rep-only controls (small, edge of screen, NOT homeowner-visible):
- Reorder mode (Senior Rep only): drag-and-drop to reorder. General Reps see a lock icon and a "Reorder" button that prompts "Reordering is a Senior Rep capability."
- Skip slide: requires reason code (drop-down: "Customer not interested in this topic" / "Out of time" / "Customer specifically said they don't care about X" / "Other").

BEHAVIORS
- Each slide view is logged (which slide, how long viewed, was it skipped, what reason).
- Slide content is brand-configurable; show placeholder content per slide with brand color theming.
- The rep can navigate forward and back. Forward to the proposal builder is gated only if a skip reason was not provided for any skipped slide.

STYLE
Tablet-first, generous, presentation-grade. Use the cream background as the slide background by default. Display font for slide titles. Embedded SVG-style line art for the Process timeline. Pill badges where appropriate.

CROSS-REFERENCES
- DST-PD-01 through DST-PD-22 (Pitch Deck capability, including Core Six slide management)
- Decision Log DST-DEC-02 (Warranty as a Core Six slide for trades without warranties — open)
- Decision Log DST-DEC-04 (Care Plan brand coverage — open)
- Decision Log DST-DEC-07 (Reason code list — open)
- Decision Log DST-DEC-12 (Senior Rep definition — open)
- Decision Log DST-DEC-15 (General Rep Core Six skip allowance — open)

Acknowledge and build.
```

---

### Prompt D: Proposal Builder surface (DST-PRICE)

```
Replace the current Quote screen with a Proposal Builder. The current Quote screen shows three pre-built tiers; the PRD requires a builder where the rep constructs and adjusts the proposal on a single screen.

PURPOSE
Single-screen proposal building. The rep adjusts options, swaps materials, adds add-ons, and watches the price update live. The three-tier (Good / Better / Best) presentation is a downstream view (Present Mode), not the build view.

ROUTE
Replace view === 'quote' with view === 'build'. Present Mode (view === 'present') stays as the homeowner-facing presentation.

LAYOUT (TABLET-PRIMARY, phone falls back to a stacked single-tier-at-a-time)
Top: AppContextBar with "Build Proposal" title.
Left rail (tablet): three tier columns side-by-side. Each column header: tier name (Standard / Premium / Signature), a recommended pill on one, a price (live computed) in display font.
Per column:
- Materials section: list of material rows (line items from Pricing Engine). Each row: material name, quantity, swap affordance (tap to choose from materials catalog).
- Labor section: pulled from Pricing Engine governed labor rates.
- Add-ons section: checkboxes for add-ons (gutter guards, ridge vent upgrade, etc.).
- Discount section: rep-applied discount within authorized range. Above the range triggers an approval-required state.
Right rail: summary card showing Material / Labor / Equipment / Waste sub-totals and total per tier. The four sub-totals come from the Pricing Engine assembly cost roll-up (MDM Surface Specs MDM-SUR-02 spec — Materials / Labor / Equipment / Waste).

BEHAVIORS
- All prices computed live from Pricing Engine (faked in mock). Material swaps update tier total immediately.
- Tier swap: rep can promote a row from Standard → Premium → Signature by dragging or by tapping a "Move up" affordance. Promotions never demote the source tier (Standard always has the swapped-in option). Demotions are explicit.
- Discount over threshold: surface a banner "This discount needs manager approval" and route via the real-time approval flow (DST-DEC-03; for now, show a "Sending..." → "Approved" stub).
- The single-screen principle holds. Rep does not navigate away to swap materials. Material picker is a sheet or popover, never a separate route.

STYLE
Tablet-primary. Generous whitespace, tabular nums for all prices. Cream background. Display font for tier prices. Materials/labor rows use mono font for codes and tabular nums for quantities.

CROSS-REFERENCES
- DST-PRICE-01 through DST-PRICE-22 (Proposal building and pricing)
- DST-PRICE-13, DST-PRICE-14 (Care Plan / value-add closing — Decision Log DST-DEC-04)
- DST-PRICE-17 (Discount approval — Decision Log DST-DEC-03)
- DST-PRICE-20 (Single-screen build principle)
- MDM Surface Specs MDM-SUR-02 (Assembly cost roll-up source)

Acknowledge and build.
```

---

### Prompt E: Financing application surface (DST-FIN)

```
Add a Financing application surface to the IHS Selling Way DST. The homeowner applies for financing directly in the app, embedded.

PURPOSE
If the homeowner wants to finance, the rep hands them the tablet and the homeowner applies through an embedded financing experience (provider TBD; treat as Greensky-shaped in mock). The rep never enters the homeowner's financial information.

ROUTE
Reachable from the Proposal Builder ("Apply for financing") and from Present Mode. view === 'financing'.

LAYOUT (TABLET-PRIMARY — homeowner-facing)
Top: minimal chrome. Brand logo only. No rep dashboard, no recording indicator visible.
Hero: "Apply for financing" with the loan amount pre-filled from the selected tier.
Form (homeowner enters):
- Name, address (pre-filled from appointment), DOB, SSN (masked), income, housing payment.
- Loan amount, loan term selector (24 / 36 / 60 / 84 / 120 months).
- Estimated monthly payment recomputes live with each term change.
Pre-approval CTA: "Get my pre-approval" — submits to provider (faked).
Decision states:
- Approved: green check, approval amount, terms, "Continue with this option →"
- Counter-offered: amber, "Approved for $X with these terms" — homeowner can accept or decline.
- Declined: muted, "We can explore other options" — return to proposal builder with financing option grayed.
- Pending review: "We need a few more minutes" — graceful pending state, NEVER blocks rep flow.
Homeowner cancel option: "Cancel and return to rep" — clears the form, returns to rep-facing flow.

BEHAVIORS
- The rep cannot enter homeowner SSN / income fields. Those fields are accessible only to the homeowner on tablet. Visually distinguish the homeowner-facing fields with a "Homeowner enters this" badge.
- Pending state can persist across navigation. The rep can move on to other parts of the appointment; financing decision returns as a toast when it resolves.
- All decision states feed the audit trail.

STYLE
Tablet-primary, homeowner-facing, restrained. Larger touch targets. Generous spacing. The brand-themed elements are reduced; this should feel like a financial form, not a sales surface. Cream background, display font for monthly payment headline.

CROSS-REFERENCES
- DST-FIN-01 through DST-FIN-10 (Financing capability)
- Decision Log STR-04 (financing embedded vs. hand-off — recommended embedded)
- Decision Log PRT-02 (financing provider selection — open)

Acknowledge and build.
```

---

### Prompt F: Walk-through Video capture surface (DST-CON-04)

```
Add a Walk-through Video capture surface to the IHS Selling Way DST. This is a required step in clean contracting at close.

PURPOSE
Before signature is finalized, the rep records a short walk-through video documenting what is and is not being replaced. This is for production handoff and dispute prevention.

ROUTE
Inserted between SignaturePad submit and the success state. view === 'walkthrough'.

LAYOUT (PHONE-PRIMARY — the rep is walking around outside)
Top: AppContextBar with "Walk-through" title.
Camera viewfinder (similar treatment to the existing camera modal): dark gradient, faux roof grid SVG.
Recording controls: large round Record button (red dot when recording). Stop button when recording.
Recording indicator: "RECORDING · 0:42" with a red pulsing dot.
Below the viewfinder:
- Suggested topics card (collapsible): "Walk through these areas: front of house, both sides, back of house, roof perimeter from ground, scope boundaries." Rep checks off as they cover each.
- After recording: thumbnail preview, duration ("1:32"), "Retake" / "Continue with this video" actions.
Bottom CTA: "Continue with this video →" (advances to deposit collection).

BEHAVIORS
- Recording is live (in mock, fake the recording with a timer).
- Live-vs-prerecorded is an open decision (Decision Log DST-DEC-13). Model as live for now.
- The captured video attaches to the deal record and to the production handoff package.
- If the rep tries to skip this step, surface a confirmation: "Walk-through video is required for production handoff. Skip anyway? (Skipping requires a reason code.)" Reason codes per the standard skip-reason list.

STYLE
Phone-primary, recording-focused. Reuse the existing camera modal's visual language for the viewfinder and recording chrome.

CROSS-REFERENCES
- DST-CON-04 (Walk-through video required at close)
- DST-PH-01 (Walk-through video part of production handoff package)
- DST-PH-02 (Required clean-contracting steps)
- Decision Log DST-DEC-13 (Live vs. prerecorded — open)

Acknowledge and build.
```

---

### Prompt G: Deposit collection surface (DST-PAY)

```
Add a Deposit collection surface to the IHS Selling Way DST. This is a step in clean contracting at close, between Walk-through Video and Welcome Package.

PURPOSE
The homeowner pays the deposit on the tablet. The rep does not key card numbers. Deposit is required for the production handoff package per DST-PH-02.

ROUTE
Inserted between walk-through video capture and the Welcome Package confirmation. view === 'deposit'.

LAYOUT (TABLET-PRIMARY — homeowner-facing)
Top: minimal chrome. Brand logo. No recording indicator visible.
Hero: "Deposit" with the deposit amount (default 10% of deal total, brand-configurable).
Payment method tabs: Card / ACH.
Card form (homeowner enters): card number, exp, CVV, ZIP. Fields are masked.
ACH form (homeowner enters): routing, account, name on account.
Authorization checkbox: "I authorize this charge for the deposit on my project."
Submit CTA: "Pay deposit →"
Processing state: "Processing..." (faked).
Confirmation: green check, "Deposit confirmed · $4,400 charged to card ending in 4242."
Audit elements added to the audit trail: deposit amount, method, last four, timestamp.

BEHAVIORS
- Rep cannot enter card / ACH fields. Visually distinguish homeowner-only fields.
- Failed deposit (card declined): graceful state, "This card was declined. Try another card or ACH?" — NEVER blocks the rep from completing the appointment. The deal moves to "Signed, deposit pending" and the rep can collect the deposit later.
- Brand-configurable deposit defaults (some brands collect 10%, others 20%, others a flat fee).
- All deposit attempts and outcomes feed the audit trail.

STYLE
Tablet-primary, homeowner-facing, restrained. Display font for deposit amount. Cream background. Same form treatment as the financing application.

CROSS-REFERENCES
- DST-PAY-01 through DST-PAY-08 (Deposit collection)
- DST-PH-02 (Deposit logged is a clean-contracting requirement)
- Integration Contract: payment gateway integration (provider TBD; Decision Log PRT-03)

Acknowledge and build.
```

---

### Prompt H: Welcome Package confirmation surface (DST-WP)

```
Add a Welcome Package confirmation surface to the IHS Selling Way DST. This replaces the current static "Quote signed & sent" success state.

PURPOSE
Immediately after signature (and deposit), the DST triggers the Welcome Package automation: branded email + SMS to the homeowner, project intro packet, next-steps guide, production team intro, financing reminders, warranty info, referral introduction. This surface is the rep's confirmation that the package was sent and is tracking.

ROUTE
view === 'welcome' (after deposit). This is the final surface in the appointment flow before returning to the dashboard.

LAYOUT (PHONE OR TABLET, rep-facing)
Top: AppContextBar with "Welcome Package" title and a celebratory accent (green checkmark in the title area).
Hero: "Welcome Package sent to the Whittakers" (uses real homeowner name from appointment).
What was sent card:
- Email: "Sent to marcus.whittaker@example.com · 2 minutes ago" with status dot (sent / delivered / opened).
- SMS: "Sent to (512) 555-2284 · 2 minutes ago" with status dot.
- Contents preview (collapsible): "Includes: project introduction, next steps, production team contact, warranty info, financing reminder."
Audit trail card: shows the signature audit elements (existing) plus deposit elements plus welcome package send timestamp.
Bottom CTAs:
- "Back to schedule →" (returns to view === 'list' on schedule tab)
- "Open deal record" (opens the deal in a closed-deal detail view — future)

BEHAVIORS
- Send happens automatically on signature (and deposit complete).
- The surface refreshes status dots: sent → delivered (within seconds in mock) → opened (homeowner opens the email, also faked).
- Manual override / resend: "Resend Welcome Package" affordance (rep-only) in case of bad email or delivery failure.
- The 30-minute post-signature hold window (DST-WP-06) is an open decision; for now do not render a hold timer.

STYLE
Celebratory but restrained. Cream background. Green success accents. Display font for the hero. Same audit-trail card pattern as the existing post-signature state.

CROSS-REFERENCES
- DST-WP-01 through DST-WP-07 (Welcome Package automation)
- DST-EXC-04 (Cancellation within hold window — Decision Log DST-DEC-16)
- Decision Log DST-DEC-16 (30-min hold window purpose / duration — open)

Acknowledge and build.
```

---

### Prompt I: Production Handoff confirmation surface (DST-PH)

```
Add a Production Handoff confirmation surface to the IHS Selling Way DST. This is the rep's confirmation that the deal has been packaged for production.

PURPOSE
After signature, deposit, walk-through video, and Welcome Package, the DST bundles a complete production handoff package: signed contract, scope, color confirmations, walk-through video, photos, measurements, notes, customer profile, risk flags. The handoff happens automatically; this surface is the rep's confirmation.

ROUTE
view === 'handoff'. Accessible from the closed appointment record, or as a brief intermediate state between Welcome Package and Schedule return.

LAYOUT (PHONE OR TABLET)
Top: AppContextBar with "Production Handoff" title.
Hero: "Handed off to production · Skywalker Roofing operations" with the deal name.
Package contents card: a checklist of what's included, with checkmarks:
- Signed contract (PDF link)
- Scope confirmation
- Color confirmations
- Walk-through video (thumbnail)
- Inspection photos (X count)
- Measurements
- CSR notes + appointment notes
- Customer profile (concerns, goals, likes, dislikes from Needs Assessment)
- Risk flags (insurance pending / deposit pending / etc.)
Receipt acknowledgment: "Production team will acknowledge receipt within 1 business day." Once acknowledged (faked, ~10 seconds later), the receipt indicator turns green.
Bottom: "Back to schedule →"

BEHAVIORS
- Handoff happens automatically on the prior step (Welcome Package). This surface is observational, not an action.
- The package contents are computed from the deal record; the rep can tap each item to view the underlying artifact.
- If a required item is missing (e.g., walk-through video was skipped with a reason code), surface a warning: "Walk-through video skipped — production has been notified."

STYLE
Phone or tablet, rep-facing. Cream background. Checklist pattern with subtle green checks. Display font for the hero.

CROSS-REFERENCES
- DST-PH-01 through DST-PH-04 (Production Handoff)
- Decision Log DST-DEC-17 (Production purchase-order review surface — open)

Acknowledge and build.
```

---

### Prompt J: Customers tab (DST-PREP, customer record)

```
Replace the current Customers tab placeholder with a proper customer surface.

PURPOSE
The Customers tab is the rep's lens into their customer relationships across time, not just upcoming appointments. Customers are not deal-scoped; one customer may have multiple deals across years.

ROUTE
Tab 'customers' on the bottom nav (replace the existing placeholder).

LAYOUT (PHONE-PRIMARY)
Top: AppContextBar with "Customers" title. Search affordance (existing global search applies).
Filter row: All / Active deals / Open follow-ups / Past customers / Insurance pending.
Customer list: each row is a customer (not a deal). Row shows:
- Avatar (initials in a brand-tinted square)
- Customer name(s)
- Address
- "Status pills": active deal / signed / past customer / follow-up due
- Last interaction date and type ("Signed Apr 17" / "Estimate sent Mar 22" / "Inspection only Feb 8")
- Right edge: drill arrow
Tap a customer row opens a Customer Detail view (separate component):
- Header: customer names, address, contact info (phone / email).
- Deals & estimates list: every deal or estimate associated with this customer, chronological. Each item shows date, type, trade, status, amount.
- Notes: rep notes + CSR notes (read).
- Quick actions: Schedule follow-up / Send referral request / Create new appointment (the last item links to scheduling in the CRM — not in DST).

BEHAVIORS
- The Customers tab is read-only for create/edit operations. New customers come from CRM intake.
- Tap a deal in the customer detail view → opens that deal's record (read-only if past, the active appointment if it's today).
- Follow-up scheduling triggers DST-FU surfaces (see Prompt K).

STYLE
Phone-primary. Cream background. Brand-tinted avatar squares matching the brand initial chip pattern. Status pills follow the established pattern.

CROSS-REFERENCES
- DST-PREP-04 (Customer record)
- DST-FU-01 through DST-FU-09 (Follow-up surfaces — see Prompt K)

Acknowledge and build.
```

---

### Prompt K: Follow-up and Rehash surface (DST-FU)

```
Add a Follow-up surface to the IHS Selling Way DST. This is the rep's re-engagement surface for appointments that didn't close, and the surface that links a follow-up appointment to its source appointment.

PURPOSE
Many appointments don't close on the first visit. The DST tracks follow-up commitments, surfaces missed/upcoming follow-ups, and inherits prior context (findings, proposals shown, objections, photos, walk-through video) into resulting follow-up appointments.

ROUTE
Surfaces in two places:
1. A Follow-ups section on the Dashboard, showing missed and upcoming follow-ups with priority.
2. A Follow-up Detail view when a follow-up is opened. view === 'followup'.

LAYOUT (Dashboard Follow-ups section)
Above the existing "Up Next" or below it: "Follow-ups (3)" with a count.
Each follow-up card: customer name, original appointment date, follow-up reason ("Wants to think about it" / "Discussed with spouse" / "Waiting on insurance"), follow-up due date, brand-themed accent if overdue.
Tap a card opens the Follow-up Detail view.

LAYOUT (Follow-up Detail view, view === 'followup')
Top: AppContextBar with "Follow-up · [Customer Name]" title.
Original appointment card: link back to the original deal/appointment record (preserved findings, proposals shown, objections, photos, walk-through if captured).
Follow-up plan card:
- Reason for follow-up (selectable: customer thinking it over / spouse needs to weigh in / insurance pending / financing reconsidering / other)
- Follow-up date and time
- Method (call / SMS / re-presentation / in-person)
- Notes (free text)
Schedule actions:
- Set date/time (drop-down)
- "Schedule re-presentation appointment" CTA — creates a new appointment linked to this one; the new appointment inherits prior context.
- "Send rehash communication" (call / SMS templates, brand-themed).
Resulting appointment view (when one is scheduled): banner on the appointment "This appointment continues a prior follow-up. Prior findings, proposals, and walk-through video are available."

BEHAVIORS
- Re-presentation appointments inherit prior context automatically.
- Rehash close rate is tracked as a first-class metric on the dashboard.
- Follow-up scheduling does not block the DST workflow; it complements it.

STYLE
Phone-primary, rep-facing. Cream background. Brand-tinted accents for overdue follow-ups.

CROSS-REFERENCES
- DST-FU-01 through DST-FU-09 (Follow-up capability)
- DST-RPT-04 (rehash close rate metric)

Acknowledge and build.
```

---

### Prompt L: Step-progress indicator in the linear flow (cross-cutting)

```
Add a step-progress indicator to the linear in-appointment flow. The current navigation between AppointmentDetail → Needs Assessment → Inspection → Findings → Pitch Deck → Build → Present → Sign → Walk-through → Deposit → Welcome relies only on the back button. Reps need a glanceable sense of where they are in the flow.

PURPOSE
A subtle, persistent indicator that shows which phase of the IHS Selling Way the rep is in (CONNECT / SOLVE / COMMIT) and which step within it.

ROUTE
Renders inside the AppContextBar (replacing the current page title or supplementing it) for any view in the in-appointment linear flow. Hidden on Dashboard, Schedule, Customers, Settings, Commissions.

LAYOUT
Three large phase markers across the AppContextBar: CONNECT · SOLVE · COMMIT. The current phase is brand-themed, others are muted.
Below the phase row: a smaller pill showing the current step within the phase. Example: "SOLVE · Inspection · 4 of 7 captured" or "COMMIT · Walk-through video."
The step pill is tappable to surface a sheet showing all steps in the current phase, with check marks for completed and a current-step indicator.

BEHAVIORS
- The indicator does NOT gate navigation. Reps can move forward and backward as before.
- The phase markers update when the user crosses a phase boundary. Crossing into COMMIT (at signature) is a visible moment — small animation.

STYLE
Subtle. Should not look like a wizard or a forced progress bar. Use the existing pill and section-label patterns. Cream background. Brand color for current phase.

CROSS-REFERENCES
- The IHS Selling Way framework (CONNECT / SOLVE / COMMIT phases, twelve pillars)

Acknowledge and build.
```

---

## Section 4: Deferred or post-MVP — do not build yet

These are intentionally deferred per MVP Scope or are out of scope for the DST:

- Manager / RVP / C-Suite dashboards (in DST-RPT but post-MVP)
- Brand admin / content management UI (DST-ADM — admin surface, separate audience, post-MVP)
- Real-time manager approval surface beyond the inline approval stub (DST-EXC-02 — partially in scope via discount approval; full manager-override surface post-MVP)
- Multi-trade routing UI (DST-MT — bundled exterior projects use the same surfaces; no separate UI in v1)
- Coaching dashboard for the rep's own self-review (DST-RPT-06 — post-MVP)
- Refunds and disputes (DST-EXC-05 — post-MVP)
- Production purchase-order review (DST-PH-03 — open decision DST-DEC-17)
- Shareable interactive quote for between-appointment homeowner exploration (DST-FU-06 — likely post-MVP)

---

## Section 5: How to drive the next round

1. Apply the fixes in Section 2 one at a time to the existing prototype. Each fix is a small, scoped change.
2. Add new surfaces from Section 3 in the order they appear in the user flow:
   - First: A (Needs Assessment), B (Findings), C (Pitch Deck) — fills the CONNECT/SOLVE gap.
   - Then: D (Proposal Builder, replacing current Quote) — the critical sales surface.
   - Then: E (Financing), F (Walk-through Video), G (Deposit), H (Welcome Package) — fills the COMMIT phase.
   - Then: I (Production Handoff), J (Customers), K (Follow-up), L (Step-progress) — supporting surfaces.
3. Each Section 3 prompt is self-contained. Paste verbatim into Claude Design.
4. As surfaces stabilize, the prototype becomes the visual source of truth that maps directly to the DST Surface Specs document.

When you're ready, the DST Surface Specs document can be built against this prototype using the same template as MDM and Commissions Surface Specs. The prototype gives us the live-prototype-link half of each surface section; this brief gives us the written-description half.
