# Iconsax CTF

## Mission

Identify how the Iconsax frontend decrypts “free tier” icon downloads and document the exact the `key`

## Rules Of Engagement

- Stay within traffic you generate yourself.
- Capture enough evidence to show how the download pipeline works.
- Deliver decrypted SVGs plus a short field report.

## Objectives

1. Locate where the site stores the manifest of icons.
2. Identify how the frontend requests individual icon payloads.
3. Reverse the client-side step that turns the opaque payload into a usable SVG.
4. Capture proof of the hard-coded key and briefly explain how the decryption step works.

## Hints ✅

Check boxes as you consume each hint.

- [ ] Inspect a browser network trace while downloading a free icon.
- [ ] Find the DOM hook (button or event) that initiates the download routine.
- [ ] Follow the associated bundle code until you discover the transformation applied to the payload.
- [ ] Reproduce that transformation outside the browser.

## Deliverables

- Summary identifying **the AES key** (startswith `123`) and where it is defined.
- Screenshots or code snippets showing the relevant bundle logic (optional but encouraged).

## Start [here](https://app.iconsax.io/)
