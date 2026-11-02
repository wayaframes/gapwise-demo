# Gapwise landing page: design notes

Gapwise is a simulated product. These notes record the research and the decisions. Nothing is copied from any site: text, images, logos and exact layouts were not reused, only general patterns.

## What I looked at

- Landing pages of two well-known patient messaging and communication vendors for dental and medical offices (page fetches), plus Capterra, SelectHub and similar listings for small-practice scheduling and reminder tools.
- Several 2026 write-ups on small-business software landing pages (hero, single call to action, proof placement, pricing, trust cues). Most are vendor blogs, so numbers in them are directional only.

## Patterns found

1. Hero: a text-led, single-column headline with one supporting paragraph, then two buttons side by side. One is a solid filled button; the other is a quieter outline or text style. The demo or booking action is the most dominant and is repeated after most sections and in a header that stays visible.
2. Colour: the category leans on calm blues and teals on white or very light grey, with one strong accent for the main button. Clinical, not playful. Dark text on light panels.
3. Layout rhythm: alternating white and light-grey bands, generous vertical spacing, short sections, a numbered or three-card "how it works", and a closing call to action band.
4. Proof: vendors place a testimonial or a statistics band right under the hero or mid-page, and badges and privacy or compliance links in the footer. Guides say trust cues work best near pricing and forms.
5. Pricing: the big vendors hide price behind a plans page or a quote form. Small-business guides suggest that a visible, simple price with its terms next to the buttons reads as honest and lowers friction.
6. Copy level: plain, short sentences convert better than professional jargon.

## Decisions

- Palette: deep teal accent (kept from the base, about 6:1 against white) on white and a pale cool-grey band. A warm amber is used only for focus rings. Dark mode uses a near-black blue-grey background with a lighter teal accent, and the primary button uses dark text on the light teal so it still passes AA.
- Type: system font stack only. Mobile scale: h1 2rem, h2 1.5rem, body 1.0625rem; desktop h1 about 3rem. Body line height 1.6, line length capped near 65 characters.
- Spacing: 8px-based steps, 3.5rem section padding on mobile growing to 5rem on desktop, 1rem side gutter (works at 320px).
- Hero: one column, left aligned, on a soft teal-to-white gradient band, with no photos or stock imagery. One primary call to action (book a call), a clearly different secondary (outlined, lighter) beside it, and the price line directly beneath. On phones the buttons stack full width.
- Buttons: primary is solid and large (48px tall); secondary is outlined with a visible border so it is distinct but not hidden. Same treatment everywhere on the page.
- Price: a centred, bordered card with a very large figure, the terms listed with ticks, and the two buttons inside it, so the price reads in a glance without hunting.
- Trust and consent: no invented testimonials, logos or statistics (the page says it has no results yet). Instead, the "does not do" list and the consent questions are styled as calm, bordered panels with a tick or shield icon in teal, never red, so they feel reassuring. FAQ uses native details elements with a plus and minus marker.
- Accessibility: visible 3px focus ring, skip link, 44px touch targets, reduced motion respected, no colour-only signals.
- No external fonts, scripts, images or trackers. Icons are drawn with CSS only, no new markup.
