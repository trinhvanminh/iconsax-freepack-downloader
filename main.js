// High-level pipeline for mirroring Iconsax freebies locally:
// 1. Fetch every manifest part (1→10) from
//    https://cdn.iconsax.io/icons_parts/icons_part_${part_number}.json
// 2. Chunk payload looks like:
//    [
//      {
//        "url": "/icons/free/rounded/ai/bold/ai-ac_artificial-intelligence-analytics-computation-machine-learning-data.svg",
//        "name": "ai-ac",
//        "tier": "free",
//        "term": "rounded",
//        "category": "ai",
//        "style": "bold",
//        "id": "a9z01ysy"
//      }
//    ]
// 3. Keep only entries whose `"tier"` equals `"free"`.
// 4. For each free icon, download its encrypted blob via
//    GET https://cdn.iconsax.io${icon.url}
//    ⮕ Response body is an AES-encrypted Base64 string like "U2FsdGVkX194dJmg4lj...".
// 5. Decrypt the blob with the shared key and persist the plain SVG, using
//    `${icon.name}.svg` for the filename so it matches the manifest metadata.

const fs = require("fs");
const path = require("path");
const https = require("https");
const CryptoJS = require("crypto-js");

const ICON_PART_COUNT = 10;
const MANIFEST_URL = (part) =>
  `https://cdn.iconsax.io/icons_parts/icons_part_${part}.json`;
const ICON_BASE_URL = "https://cdn.iconsax.io";
const OUTPUT_DIR = path.join(__dirname, "icons");
const AES_KEY = "123qwe";

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`Request failed ${url} (${res.statusCode || "n/a"})`)
          );
          res.resume();
          return;
        }

        const chunks = [];
        res.setEncoding("utf8");
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(chunks.join("")));
      })
      .on("error", reject);
  });
}

async function fetchManifest(part) {
  const url = MANIFEST_URL(part);
  const text = await fetchText(url);
  return JSON.parse(text);
}

async function downloadEncryptedIcon(iconUrl) {
  const fullUrl = `${ICON_BASE_URL}${iconUrl}`;
  return fetchText(fullUrl);
}

function decryptSvg(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, AES_KEY);
  const svg = bytes.toString(CryptoJS.enc.Utf8);
  if (!svg) {
    throw new Error("Failed to decrypt SVG");
  }
  return svg;
}

function uniqueFilePath(baseName) {
  const basePath = path.join(OUTPUT_DIR, `${baseName}.svg`);
  if (!fs.existsSync(basePath)) {
    return basePath;
  }

  let idx = 1;
  while (true) {
    const candidate = path.join(OUTPUT_DIR, `${baseName}-${idx}.svg`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
    idx += 1;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const manifests = [];
  for (let part = 1; part <= ICON_PART_COUNT; part += 1) {
    try {
      const data = await fetchManifest(part);
      manifests.push(...data);
      console.log(`Fetched manifest part ${part} (${data.length} items)`);
    } catch (err) {
      console.warn(`Failed to fetch manifest part ${part}: ${err.message}`);
    }
  }

  const freeIcons = manifests.filter((icon) => icon.tier === "free");
  console.log(`Found ${freeIcons.length} free icons`);

  let successCount = 0;
  for (const icon of freeIcons) {
    try {
      const encrypted = await downloadEncryptedIcon(icon.url);
      const svg = decryptSvg(encrypted);
      const filePath = uniqueFilePath(icon.name);
      fs.writeFileSync(filePath, svg, "utf8");
      successCount += 1;
      console.log(`Saved ${icon.name} -> ${path.basename(filePath)}`);
    } catch (err) {
      console.warn(`Failed to process ${icon.name}: ${err.message}`);
    }
  }

  console.log(`Finished. Saved ${successCount} SVG files to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
