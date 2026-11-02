# Gapwise site assets

- `style.css`: all styling. A designer can restyle the page by editing only this file.
- `attribution.js`: tags the booking and payment links with where a visitor came from. Sends nothing anywhere.

## Replacing the placeholders (Build register step)

1. In `attribution.js`, set `BOOKING_URL` and `PAYMENT_URL` in the config block at the top.
2. In `../index.html`, the buttons carry the same placeholder address as a fallback for visitors without JavaScript. Replace the address part (before `?utm_button=`) in each button. Keep `?utm_button=...` exactly as written.
3. Run `node --test demo/gapwise/site/attribution.test.mjs`.

## Buttons

Each button has `data-cta="book"` (booking link) or `data-cta="pay"` (payment link) and an `id`:

| id | utm_button |
|---|---|
| cta-nav-book | nav |
| cta-hero-book, cta-hero-pay | hero |
| cta-how-book | how |
| cta-price-pay, cta-price-book | price |
| cta-final-book, cta-final-pay | final_cta |
| cta-footer-book | footer |

## Direct visits

To tag visits that arrive with no tracking tags, add this before the script in `index.html`:
`<script>window.GAPWISE_ATTR_DEFAULTS = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'gapwise_direct' };</script>`
