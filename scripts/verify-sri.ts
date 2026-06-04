#!/usr/bin/env node
import https from "https";
import http from "http";
import crypto from "crypto";
import { URL } from "url";

function usage(): never {
  console.error("Usage: node scripts/verify-sri.js --url <url>");
  process.exit(2);
}

const argv = process.argv.slice(2);
let url: string | undefined;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--url" || argv[i] === "-u") url = argv[++i];
}
if (!url) usage();

function fetchBuffer(urlStr: string): Promise<Buffer> {
  const urlObj = new URL(urlStr);
  const lib = urlObj.protocol === "http:" ? http : https;
  return new Promise((resolve, reject) => {
    const req = lib.get(
      urlStr,
      { headers: { "User-Agent": "sri-verifier" } },
      (res: any) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirect = new URL(res.headers.location, urlStr).toString();
          resolve(fetchBuffer(redirect));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} when fetching ${urlStr}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (d: Buffer) => chunks.push(d));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
  });
}

(async () => {
  try {
    console.log("Fetching page:", url);
    const htmlBuf = await fetchBuffer(url as string);
    const html = htmlBuf.toString("utf8");

    const scriptTagRegex = /<script\b[^>]*>/gi;
    const tags = html.match(scriptTagRegex) || [];
    const scripts: { tag: string; src: string; integrity: string }[] = [];
    for (const tag of tags) {
      const integrityMatch = /integrity\s*=\s*["']([^"']+)["']/i.exec(tag);
      const srcMatch = /src\s*=\s*["']([^"']+)["']/i.exec(tag);
      if (integrityMatch && srcMatch) {
        scripts.push({ tag, src: srcMatch[1], integrity: integrityMatch[1] });
      }
    }

    if (!scripts.length) {
      console.log("No script tags with integrity attributes found on page.");
      process.exit(0);
    }

    let failed = false;
    for (const s of scripts) {
      const srcUrl = new URL(s.src, url).toString();
      console.log("Checking", srcUrl);
      const buf = await fetchBuffer(srcUrl);

      const parts = s.integrity.split(/\s+/);
      let ok = false;
      for (const p of parts) {
        const idx = p.indexOf("-");
        if (idx === -1) continue;
        const alg = p.slice(0, idx);
        const b64 = p.slice(idx + 1);
        const nodeAlg = alg.toLowerCase();
        if (!["sha256", "sha384", "sha512"].includes(nodeAlg)) continue;
        const computed = crypto
          .createHash(nodeAlg)
          .update(buf)
          .digest("base64");
        if (computed === b64) {
          ok = true;
          break;
        }
      }
      if (!ok) {
        const computed384 =
          "sha384-" + crypto.createHash("sha384").update(buf).digest("base64");
        console.error(
          `Mismatch for ${srcUrl}\n  declared: ${s.integrity}\n  computed: ${computed384}`,
        );
        failed = true;
      } else {
        console.log(" OK");
      }
    }

    if (failed) {
      console.error("SRI verification failed.");
      process.exit(1);
    }

    console.log("All integrity checks passed.");
    process.exit(0);
  } catch (err: any) {
    console.error("Error:", err && err.message ? err.message : err);
    process.exit(2);
  }
})();
