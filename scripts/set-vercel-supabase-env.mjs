#!/usr/bin/env node
/**
 * Sets VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY on the linked Vercel project.
 * Requires: logged-in Vercel CLI (`npx vercel login`) and a linked project.
 *
 *   node scripts/set-vercel-supabase-env.mjs
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

function loadEnvFile(path) {
  const env = {};
  if (!existsSync(path)) return env;
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
    env[key] = val;
  }
  return env;
}

const fileEnv = loadEnvFile(envPath);
const url =
  process.env.VITE_SUPABASE_URL ||
  fileEnv.VITE_SUPABASE_URL ||
  "https://gjwgxkfrixknjczmlsef.supabase.co";
const anon =
  process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY;

if (!anon) {
  console.error("Missing VITE_SUPABASE_ANON_KEY in env or .env.local");
  process.exit(1);
}

function setEnv(key, value) {
  console.log(`Setting ${key} on Vercel (production, preview, development)…`);
  const result = spawnSync(
    "npx",
    [
      "--yes",
      "vercel@latest",
      "env",
      "add",
      key,
      "--environment",
      "production,preview,development",
      "--value",
      value,
      "--force",
      "--yes",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    console.error(result.stdout || "");
    console.error(result.stderr || "");
    console.error(`
Could not set ${key} via CLI.
Set it manually in Vercel → Project → Settings → Environment Variables, then Redeploy.
`);
    return false;
  }
  console.log(result.stdout || "ok");
  return true;
}

const okUrl = setEnv("VITE_SUPABASE_URL", url);
const okAnon = setEnv("VITE_SUPABASE_ANON_KEY", anon);

if (okUrl && okAnon) {
  console.log("✓ Vercel env set. Trigger a Production redeploy for Vite to pick them up.");
} else {
  process.exit(1);
}
