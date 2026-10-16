# Smarta marketing site (digital meter edition)

This branch serves the digital-meter variant at `/`: a box-bodied meter with an interactive in-house
keypad unit. `main` serves the analog-dial version.

Landing page for the Smarta prepaid smart water platform, served at `/` by the same Vite build as the tenant app.

```
index.html                 landing page markup and copy, served at /
public/landing/styles.css  design tokens (light and dark) and layout
public/landing/main.js     scroll scenes, live demo meter, network map, charts, calculator, form
public/landing/digital.css digital box meter, in-house keypad unit and their drawings
tenant/index.html          entry for the tenant app, served at /tenant/
docs/landing/DESIGN.md     design system and the patterns refused on purpose
```

The landing page's CSS and JS live in `public/` so Vite serves them untouched. The tenant app is the
React app in `src/`, mounted with `basename="/tenant"`.

## Run locally

```
npm install
npm run dev        # landing at http://localhost:5173/, tenant app at /tenant/
npm run build      # outputs both pages to dist/
```

Hosting needs one rewrite so deep links inside the tenant app load it: `/tenant/*` to
`/tenant/index.html`. `public/_redirects` already does this on Netlify; add the equivalent rule on
other hosts.

## Before launch

- **Pilot form:** set `data-endpoint` on `#pilotForm` to a URL that accepts a JSON `POST`
  (`{ name, phone, units, role }`), for example a Supabase edge function. Until then the form
  validates input and tells the visitor that nothing was sent.
- **Claims to confirm with Stron and operations** before the page goes public: keypad token entry,
  tamper alerts (cover opened, magnet), sealed enclosure and 5+ year battery on the chosen model,
  low-credit SMS, settlement of M-Pesa top-ups to the landlord's account, and that our team installs
  meters and briefs tenants.
- **Messaging and segments** live in `.agents/product-marketing.md`; open `[NEED: ...]` items there
  (meter cost model, free site visit, emergency credit, proof points) change what the page can promise.
- All dashboard figures, names and network data on the page are labelled examples.
