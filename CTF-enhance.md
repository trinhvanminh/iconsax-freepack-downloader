# Iconsax Downloader CTF

## Scenario

You have intercepted partial docs from Iconsax. Their frontend decrypts “free” icon downloads on the fly, so the only way to exfiltrate the SVG catalog is to replicate that client logic. Assemble enough intel to rebuild the download/decrypt pipeline locally and dump the decrypted SVGs into `icons/`.

## Objective

Write a script (or reuse `main.js`) that mirrors every free Iconsax icon by:

- Enumerating all manifest shards.
- Filtering entries where `tier === "free"`.
- Downloading the encrypted blobs and decrypting them with the correct AES key.
- Persisting the cleartext SVGs with deterministic filenames.

Provide a short report describing how you derived the key and validated the decrypted output.

## Ground Rules

- No brute-force against production services; only analyze traffic you initiate.
- Do not share or monetize paid Iconsax assets.
- Keep detailed notes so another analyst can reproduce your steps.

## Deliverables

1. `icons/` folder populated with the decrypted SVGs.
2. Narrative summary covering reconnaissance, key discovery, and tooling.
3. Any helper scripts or modified configs committed to the repo.

## Hints ✅

Mark hints as you use them.

- [ ] Capture a fresh download request in DevTools and confirm the payload looks like `U2FsdGVk...` instead of raw SVG.
- [ ] Grep the Nuxt bundles for `btn-download` to find the click handler that triggers the encrypted download flow.
- [ ] Trace the `handleDownloadIcon` logic until you reach the internal `DOWNLOAD` helper that performs AES decryption.
- [ ] Extract the hard-coded key (`123qwe`) from that helper and reuse the exact decrypt routine in `main.js`.

## Extra Credit

- Automate retries for flaky downloads and log failures.
- Add checksum verification so you can detect corrupted SVG outputs.
- Build a lightweight UI that previews decrypted icons as they stream in.
