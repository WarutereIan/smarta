# Smarta marketing site

Static landing page for the Smarta prepaid smart water platform. No build step and no dependencies.

```
website/
  index.html         page markup and copy (analog dial meter)
  digital.html       variant with the digital box meter and in-house keypad unit (CIU)
  assets/digital.css styles for the digital meter, keypad unit and their drawings
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
  tamper alerts (cover opened, magnet), sealed enclosure and 5+ year battery on the chosen model,
  low-credit SMS, settlement of M-Pesa top-ups to the landlord's account, and that our team installs
  meters and briefs tenants.
- **Messaging and segments** live in `.agents/product-marketing.md`; open `[NEED: ...]` items there
  (meter cost model, free site visit, emergency credit, proof points) change what the page can promise.
- All dashboard figures, names and network data on the page are labelled examples.
