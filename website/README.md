# Smarta marketing site

Static landing page for the Smarta prepaid smart water platform. No build step and no dependencies.

```
website/
  index.html         page markup and copy
  assets/styles.css  design tokens (light and dark) and layout
  assets/main.js     scroll scenes, live demo meter, network map, charts, calculator, form
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve website
```

## Before launch

- **Pilot form:** set `data-endpoint` on `#pilotForm` to a URL that accepts a JSON `POST`
  (`{ name, phone, units, role }`), for example a Supabase edge function. Until then the form
  validates input and tells the visitor that nothing was sent.
- **Claims to confirm with Stron and operations** before the page goes public: keypad token entry,
  tamper types (magnet, cover open, reverse flow), IP67 and 5+ year battery on the chosen model,
  low-credit SMS, tiered tariffs, and the pilot scope (survey, install, onboarding, one month of reporting).
- All dashboard figures, names and network data on the page are labelled examples.
