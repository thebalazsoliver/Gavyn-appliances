# Gavyn Appliances

An English, responsive Astro website for appliance repairs, installations and maintenance across the Greater Toronto Area and Barrie. Astro renders the site as static HTML; only the supplied React Bits LogoLoop component hydrates on the client.

## Run locally

```sh
npm ci
npm run dev
```

## Check and build

```sh
npm run check
npm run build
```

The production site is in `dist/`. It can be hosted on any static host, including Cloudflare Pages, with build command `npm run build` and output directory `dist`.

## Where to edit

- `src/data/site.ts`: contact information, service area, service descriptions, brand list and FAQs.
- `src/pages/index.astro`: the page sections and navigation behavior.
- `src/scripts/faq.ts`: native FAQ panels with animated height and text, keyboard controls and reduced-motion support.
- `src/styles/global.css`: design tokens, section styles and responsive layouts.
- `src/components/ContactForm.astro` and `src/scripts/contact.ts`: form markup and submission states.
- `src/components/LogoLoop.jsx` and its CSS: the supplied React Bits component, with pause on hover, reduced-motion and hidden-tab handling.
- `public/`: self-hosted images, fonts, favicon and original manufacturer logos.

## Contact form activation

The form posts to FormSubmit for `gavyn.robinson@gmail.com`. No email API key is needed. The first real submission triggers a confirmation email to that address. Gavyn must confirm the address before email delivery is active. Check spam/junk if the confirmation email does not appear. Do not claim production email delivery has been tested before the owner confirms activation and verifies a real submission.

The form validates required details, prevents duplicate clicks, times out after 20 seconds and retains entered details on an error. It does not confirm an appointment. A honeypot provides a basic spam trap. Native form submission is retained when JavaScript is disabled.

## Content and assets

Service calls start at **$70 CAD + HST**; maintenance and cleaning start at **$100 CAD + HST**. Final costs depend on the appliance and work required. G2 certification and the GTA/Barrie coverage were supplied by the client.

The existing Gavyn logo, favicon and fridge photograph came from gavynappliances.ca. The kitchen photograph is by Point3D Commercial Imaging Ltd. on Unsplash: https://unsplash.com/photos/silver-french-door-refrigerator-beside-white-wooden-table-TBAAXtWol_g (Unsplash License).

Logo provenance and trademark notes are recorded in `docs/logo-sources.json`. All manufacturer marks remain the property of their respective owners; their display does not imply affiliation.

Manrope is self-hosted from Google Fonts and distributed under the SIL Open Font License. React Bits LogoLoop source: https://reactbits.dev/animations/logo-loop (MIT license).
