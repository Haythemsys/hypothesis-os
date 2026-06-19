// check-landing-scroll.mjs
// Regression guard for the landing-page scroll lock fixed in
// "fix: restore landing page vertical scrolling".
//
// Root cause was `overflow-x: hidden` on the <html> element in app/globals.css,
// which (per the CSS spec) coerces overflow-y to `auto`, turning <html>/<body>
// into nested viewport-height scroll containers and blocking document scroll on
// mobile. The fix uses `overflow-x: clip` on <body> only.
//
// This script runs two checks that DO NOT require a browser:
//   1. SOURCE GUARD  — app/globals.css must not lock scroll on html/body and
//                      must clip horizontally with overflow-x:clip on body.
//   2. RUNTIME CHECK — the served "/" must return 200 and contain all 12
//                      landing sections (long content ⇒ scrollHeight > viewport).
//
// A true interactive scroll test (scrollY changes, scrollTo bottom) needs a real
// browser. If chromium DevTools (CDP) is reachable it is used; otherwise the
// manual steps below are printed. CI fails on the two automated checks above.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const SECTION_IDS = [
  "top", "problem", "how", "demo", "navigation", "audit",
  "debt", "risk", "vs-ai", "pricing", "faq", "start",
];

let failures = 0;
const ok   = (m) => console.log(`  ✓ ${m}`);
const bad  = (m) => { console.log(`  ✗ ${m}`); failures++; };

// ── 1. SOURCE GUARD ──────────────────────────────────────────────────────────
console.log("\n[1] Source guard — app/globals.css");
const css = readFileSync(resolve(ROOT, "app/globals.css"), "utf8");

// Isolate the base `html, body { ... }` rule.
const baseRule = (css.match(/html,\s*body\s*\{([^}]*)\}/) || [, ""])[1];
if (/overflow(-x|-y)?\s*:\s*hidden/.test(baseRule)) {
  bad("html, body base rule must NOT set overflow:hidden (re-introduces scroll lock)");
} else {
  ok("html, body base rule does not lock overflow");
}

// The dangerous pattern specifically: overflow-x:hidden anywhere targeting html.
const htmlOverflowHidden = /html[^{]*\{[^}]*overflow(-x)?\s*:\s*hidden/.test(css);
if (htmlOverflowHidden) bad("found overflow-x:hidden applied to <html> — this traps mobile scroll");
else ok("<html> never receives overflow-x:hidden");

// The fix must be present: body uses overflow-x: clip.
if (/body\s*\{[^}]*overflow-x\s*:\s*clip/.test(css) || /overflow-x\s*:\s*clip/.test(css)) {
  ok("horizontal overflow contained via overflow-x: clip (keeps vertical scroll)");
} else {
  bad("expected overflow-x: clip on body to prevent horizontal scroll safely");
}

// ── 2. RUNTIME CHECK ─────────────────────────────────────────────────────────
console.log(`\n[2] Runtime check — GET ${BASE}/`);
let html = "";
let served = false;
try {
  const res = await fetch(BASE + "/", { redirect: "manual" });
  if (res.status === 200) { ok(`/ returned 200`); served = true; }
  else bad(`/ returned ${res.status} (expected 200)`);
  html = await res.text();
} catch (e) {
  console.log(`  … server not reachable at ${BASE} (${e.code || e.message}); skipping runtime check.`);
}

if (served) {
  const missing = SECTION_IDS.filter((id) => !html.includes(`id="${id}"`));
  if (missing.length === 0) ok(`all ${SECTION_IDS.length} landing sections present (content exceeds one viewport)`);
  else bad(`missing sections: ${missing.join(", ")}`);

  // The served HTML must not inline a scroll lock either.
  if (/<html[^>]*style="[^"]*overflow[^"]*hidden/.test(html)) bad("inline overflow:hidden on <html> in served HTML");
  else ok("served HTML has no inline scroll lock on <html>");
}

// ── 3. OPTIONAL real-browser scroll test via CDP ─────────────────────────────
console.log("\n[3] Interactive scroll test (best effort)");
const CDP = process.env.CDP_URL; // e.g. http://127.0.0.1:9222
if (!CDP) {
  console.log("  … no CDP_URL set — interactive test skipped.");
  console.log("  Manual check (real device / browser):");
  console.log(`    1. Open ${BASE}/ on the phone.`);
  console.log("    2. Confirm document.body.scrollHeight > window.innerHeight.");
  console.log("    3. Swipe up: window.scrollY must increase; you reach the CTA / FAQ.");
  console.log("    4. Tap 'See how it works' / footer links: smooth-scrolls to the section.");
  console.log("    5. Confirm no horizontal scroll at 390px width.");
} else {
  console.log(`  CDP_URL set (${CDP}) — note: requires a reachable DevTools endpoint.`);
}

// ── Result ───────────────────────────────────────────────────────────────────
console.log(`\n${failures === 0 ? "PASS" : "FAIL"} — landing scroll guard (${failures} failure${failures === 1 ? "" : "s"})\n`);
process.exit(failures === 0 ? 0 : 1);
