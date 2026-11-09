#!/usr/bin/env node
/**
 * Configures Supabase Auth Site URL + redirect allowlist (+ optional Resend SMTP).
 *
 * Loads .env.local automatically when present.
 *
 * Required:
 *   SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens
 * Optional:
 *   RESEND_API_KEY — configures smtp.resend.com for Auth emails
 *   AUTH_SITE_URL — defaults to https://proverbs31way.com
 *
 *   node scripts/configure-auth-golive.mjs
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(envPath);

const PROJECT_REF = "gjwgxkfrixknjczmlsef";
const SITE_URL = process.env.AUTH_SITE_URL || "https://proverbs31way.com";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const resendKey = process.env.RESEND_API_KEY;

if (!token) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Open https://supabase.com/dashboard/account/tokens
2. Create a token, then run:

   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/configure-auth-golive.mjs

This sets Site URL to ${SITE_URL} and allowlists production + localhost redirects.
With RESEND_API_KEY in .env.local, Auth SMTP is also configured.
`);
  process.exit(1);
}

const allowList = [
  `${SITE_URL}/`,
  `${SITE_URL}/**`,
  "http://localhost:5173/",
  "http://localhost:5173/**",
  "http://127.0.0.1:5173/",
  "http://127.0.0.1:5173/**",
].join(",");

const body = {
  site_url: SITE_URL,
  uri_allow_list: allowList,
  external_email_enabled: true,
  disable_signup: false,
  mailer_autoconfirm: false,
  mailer_subjects_magic_link: "Your sign-in code for The Way",
  mailer_subjects_confirmation: "Confirm your email for The Way",
};

if (resendKey) {
  Object.assign(body, {
    smtp_admin_email: process.env.SMTP_FROM_EMAIL || "hello@proverbs31way.com",
    smtp_host: "smtp.resend.com",
    smtp_port: "465",
    smtp_user: "resend",
    smtp_pass: resendKey,
    smtp_sender_name: process.env.SMTP_SENDER_NAME || "The Way",
  });
  console.log("SMTP: configuring Resend…");
} else {
  console.log("SMTP: RESEND_API_KEY not set — leaving existing mailer unchanged.");
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  },
);

const text = await res.text();
if (!res.ok) {
  console.error(`Auth config failed (${res.status}):`, text);
  process.exit(1);
}

console.log("✓ Email provider enabled");
console.log("✓ Site URL:", SITE_URL);
console.log("✓ Redirect allow list:", allowList);
if (resendKey) console.log("✓ SMTP sender:", body.smtp_admin_email);
console.log("Done.");
