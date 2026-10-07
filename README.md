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
npm test
npm run build
```

The production site is in `dist/`. Deploy to Cloudflare Pages with build command `npm run build` and output directory `dist`. Pages also deploys the repository-root `functions/` directory; the contact form needs that backend. The rest of the site remains static.

## Where to edit

- `src/data/site.ts`: contact information, service area, service descriptions, brand list and FAQs.
- `src/pages/index.astro`: the page sections and navigation behavior.
- `src/scripts/faq.ts`: native FAQ panels with animated height and text, keyboard controls and reduced-motion support.
- `src/styles/global.css`: design tokens, section styles and responsive layouts.
- `src/components/ContactForm.astro` and `src/scripts/contact.ts`: form markup and submission states.
- `functions/api/contact.ts`: server-side validation and email delivery through Brevo.
- `src/components/LogoLoop.jsx` and its CSS: the supplied React Bits component, with pause on hover, reduced-motion and hidden-tab handling.
- `public/`: self-hosted images, fonts, favicon and original manufacturer logos.

## Contact form: Brevo setup

The browser posts to `/api/contact`. A Cloudflare Pages Function validates the request and calls `https://api.brevo.com/v3/smtp/email`. The API key stays server-side and must never be added to `src/data/site.ts`, a public environment variable, or GitHub.

For the first setup, both the sender and recipient default to **`balazsoliver.hu@gmail.com`**, preserving the current form's test recipient. This sender has already been verified in Brevo. The public business email remains `gavynappliances@gmail.com`. Replies to a service-request email go to the visitor's submitted email address.

1. In Brevo, open **Settings → SMTP & API → API keys & MCP** and generate a normal API key for this website.
2. In Cloudflare, open **Workers & Pages → Gavyn Appliances project → Settings → Variables and Secrets**. Add the encrypted secret `BREVO_API_KEY` with that key. Configure **Preview** to test the integration branch, and **Production** before enabling it on `main`.
3. Redeploy after saving the secret. Environment changes apply to new deployments.
4. Submit a request you authorize, confirm its delivery in Brevo's transactional logs, and check the recipient's inbox and spam folder. An accepted API request is not proof of inbox delivery.

Cloudflare bindings:

| Name               | Required              | Value                                                      |
| ------------------ | --------------------- | ---------------------------------------------------------- |
| `BREVO_API_KEY`    | Yes, encrypted secret | Your website's Brevo API key                               |
| `BREVO_FROM_EMAIL` | Optional              | A verified sender; defaults to `balazsoliver.hu@gmail.com` |
| `BREVO_TO_EMAIL`   | Optional              | The recipient; defaults to `balazsoliver.hu@gmail.com`     |

To deliver requests to the business later, set `BREVO_TO_EMAIL` to `gavynappliances@gmail.com` and redeploy. Changing `business.email` updates the displayed contact address; it does not change these server-side delivery settings.

If Brevo blocks an unfamiliar Cloudflare IP, inspect **SMTP & API → Authorized IPs** and the Brevo security notification for this integration. Review the matching request before approving that IP.

The server accepts JSON and native URL-encoded form submissions, limits the request size, validates required fields and appliance choices, and checks browser origins. A honeypot provides a basic spam trap. The email recipient and sender come only from server configuration. Brevo errors, missing configuration and timeouts produce an error response; they never produce a successful submission message.

The form prevents duplicate clicks, times out after 20 seconds and retains entered details on an error. The Brevo request times out after 15 seconds. Submitting a form does not confirm an appointment. Native form submission shows a confirmation or error page when JavaScript is disabled.

`npm run dev` previews the static Astro site without the Cloudflare Function. To test the complete form locally, put the secret in an untracked `.dev.vars` file, build the site, and run `npx wrangler pages dev dist`. Automated tests mock Brevo and never send real emails.

## Content and assets

Service calls start at **$80 CAD + HST**; maintenance and cleaning start at **$100 CAD + HST**. Final costs depend on the appliance and work required. G2 certification and the GTA/Barrie coverage were supplied by the client.

The existing Gavyn logo, favicon and fridge photograph came from gavynappliances.ca. The kitchen photograph is by Point3D Commercial Imaging Ltd. on Unsplash: https://unsplash.com/photos/silver-french-door-refrigerator-beside-white-wooden-table-TBAAXtWol_g (Unsplash License).

Logo provenance and trademark notes are recorded in `docs/logo-sources.json`. All manufacturer marks remain the property of their respective owners; their display does not imply affiliation.

Manrope is self-hosted from Google Fonts and distributed under the SIL Open Font License. React Bits LogoLoop source: https://reactbits.dev/animations/logo-loop (MIT license).
