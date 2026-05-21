# IHS Selling Way — DST Prototype

An interactive wireframe / clickable prototype of the **Direct Sales Tool (DST)** for Infinity Home Services. The DST is the in-home selling app reps use during a homeowner appointment: dashboard, schedule, appointment flow (Connect → Solve → Commit), inspection, proposal building, presentation, signature, deposit, and welcome package.

This is **not a live application.** There is no backend, no data store, no real authentication, and no integration with any third-party service. Everything is mocked in-browser to drive design conversations and rep workflow validation.

## Live prototype

> _Live URL goes here after GitHub Pages is enabled. Will be `https://<github-username>.github.io/<repo-name>/`._

## Running locally

The prototype is a static site with **no build step.** React 18 is loaded from a CDN; JSX is compiled in the browser via `@babel/standalone`.

```bash
cd docs
python3 -m http.server 8000
```

Then open <http://localhost:8000/> in a browser. First load takes 1–2 seconds while Babel compiles the JSX.

## Editing

1. Open any `docs/*.jsx` file in your editor.
2. Save.
3. Refresh the browser.

That's it. No bundler, no hot reload, no install step. If you change `styles.css`, bump the cache-bust query param in `docs/index.html` (`styles.css?v=16` → `?v=17`) to force the browser to pick up the new file.

## Project layout

```
docs/                          # GitHub Pages serves from here
  index.html                   # Entry point (loads React, Babel, and the JSX files in order)
  styles.css                   # Design tokens + component CSS
  app.jsx                      # Root component, routing, app state
  data.jsx                     # Mock data: brands, appointments, customers, reps
  data-pricing.jsx             # Mock pricing engine: materials, labor, tier line items
  screens-*.jsx                # One file per surface or surface family
  tweaks-panel.jsx             # Developer-only panel (rep switcher, device toggle, theme)

src-archive/                   # Iteration work not yet integrated into the live app
  build-redesign-*.jsx         # Proposed Build/Proposal/Present redesigns (artboards)
  Build redesign canvas.html   # Side-by-side artboard viewer for the redesign
  design-canvas.jsx            # Artboard container component
  IHS Selling Way (standalone).html  # Bundled snapshot from Claude Design (backup)

reference/                     # Background material
  uploads/
    DST_Design_Alignment_Brief.md   # The canonical directive list — fixes and new surfaces
    *.pdf, *.csv                    # Source pricing sheets and measurement docs
  screens-iteration-history/        # PNG snapshots from earlier design rounds
```

## Design source of truth

[reference/uploads/DST_Design_Alignment_Brief.md](reference/uploads/DST_Design_Alignment_Brief.md) is the canonical directive list. When making changes, reference the brief by section number (e.g. "Section 2.4: tier prices should compute from line items"). The brief defines:

- **Section 1** — visual language (locked). Don't reintroduce styling.
- **Section 2** — fixes to apply to existing surfaces.
- **Section 3** — new surfaces to add, with self-contained prompts per surface.

## Workflow

Small, narrow changes. One screen per session. Commit before each screen-level edit so you can `git reset --hard HEAD` if a change goes sideways. Diff every change before accepting. Run the click-through (Dashboard → Welcome) after every change on both phone and tablet device tweaks.
