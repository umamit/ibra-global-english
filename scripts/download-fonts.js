#!/usr/bin/env node
/**
 * Download Montserrat static TTF fonts from Google Fonts
 * Uses old User-Agent to force Google Fonts API to return TTF (not WOFF2)
 */
const https = require("https");
const fs   = require("fs");
const path = require("path");

function fetchBuffer(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  const fontsDir = path.join(__dirname, "..", "public", "fonts");
  fs.mkdirSync(fontsDir, { recursive: true });

  // Old IE User-Agent → Google Fonts returns TTF instead of WOFF2
  const OLD_UA = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)";

  const cssUrl = "https://fonts.googleapis.com/css?family=Montserrat:400,600,700&subset=latin";
  console.log("Fetching Google Fonts CSS...");
  const cssBuf = await fetchBuffer(cssUrl, { "User-Agent": OLD_UA });
  const css    = cssBuf.toString("utf-8");

  // Extract TTF URLs
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/g;
  const fontUrls = [];
  let match;
  while ((match = urlRegex.exec(css)) !== null) {
    fontUrls.push(match[1]);
  }

  if (fontUrls.length === 0) {
    console.error("No TTF URLs found. CSS response:\n", css.slice(0, 1000));
    process.exit(1);
  }

  console.log(`Found ${fontUrls.length} TTF URL(s):`);
  fontUrls.forEach((u) => console.log(" ", u));

  // Map known weight suffixes to output filenames
  const weightMap = { "400": "Regular", "600": "SemiBold", "700": "Bold" };

  for (const url of fontUrls) {
    // Extract weight from URL or CSS context
    const weightMatch = css.match(new RegExp(`font-weight:\\s*(\\d+)[^}]*url\\(${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`));
    const weight = weightMatch ? weightMatch[1] : "400";
    const label  = weightMap[weight] || `w${weight}`;
    const dest   = path.join(fontsDir, `Montserrat-${label}.ttf`);

    console.log(`Downloading ${label} (weight ${weight})...`);
    const buf = await fetchBuffer(url);

    // Validate: TTF starts with 0x00010000 or 'true' or 'OTTO'
    const magic = buf.slice(0, 4).toString("hex");
    if (!["00010000", "74727565", "4f54544f"].includes(magic)) {
      console.error(`❌ Invalid TTF file for ${label}! Magic bytes: ${magic}`);
      process.exit(1);
    }

    fs.writeFileSync(dest, buf);
    console.log(`✅ Saved: ${dest} (${(buf.length / 1024).toFixed(0)} KB)`);
  }

  console.log("\nDone! All Montserrat TTF fonts downloaded.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
