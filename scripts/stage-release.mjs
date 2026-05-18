#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const version = pkg.version;

if (!version) {
    throw new Error("package.json has no version field");
}

const releaseRoot = path.join(repoRoot, "release");
const bundleRoot = path.join(releaseRoot, "shamela-mcp");

fs.rmSync(releaseRoot, { recursive: true, force: true });
fs.mkdirSync(bundleRoot, { recursive: true });

for (const rel of ["dist", "helper", "docs", "examples", "README.md", "LICENSE", "package.json"]) {
    const src = path.join(repoRoot, rel);
    const dst = path.join(bundleRoot, rel);
    if (!fs.existsSync(src)) {
        throw new Error(`Missing release input: ${rel}`);
    }
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.cpSync(src, dst, { recursive: true });
    } else {
        fs.copyFileSync(src, dst);
    }
}

fs.writeFileSync(path.join(releaseRoot, "VERSION.txt"), `${version}\n`, "utf8");
console.log(`Staged universal release at ${bundleRoot}`);
