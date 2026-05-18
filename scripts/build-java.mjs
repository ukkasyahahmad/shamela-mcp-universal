#!/usr/bin/env node
/**
 * Cross-platform Java helper build.
 *
 * Compiles src/java/**.java against Lucene artifacts resolved from Maven,
 * then produces helper/shamela-helper.jar containing only our own classes.
 * Runtime Lucene + Shamela-specific jars still come from the user's Shamela
 * install when the MCP server starts.
 *
 * Requires JDK 21+ (javac + jar) and Maven (mvn) unless
 * SHAMELA_JAVA_CLASSPATH is provided explicitly.
 */

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
process.chdir(repoRoot);

const isWin = os.platform() === "win32";
const isMac = os.platform() === "darwin";
const exeSuffix = isWin ? ".exe" : "";

function which(cmd) {
    const r = spawnSync(isWin ? "where.exe" : "which", [cmd], { encoding: "utf8", shell: false });
    if (r.status !== 0) return null;
    return r.stdout.split(/\r?\n/).find((l) => l.trim().length > 0) ?? null;
}

function findJdkBin() {
    if (which(`javac${exeSuffix}`)) return null; // already on PATH
    if (process.env.JAVA_HOME) {
        const candidate = path.join(process.env.JAVA_HOME, "bin", `javac${exeSuffix}`);
        if (fs.existsSync(candidate)) return path.dirname(candidate);
    }
    if (isMac) {
        const r = spawnSync("/usr/libexec/java_home", ["-v", "21"], { encoding: "utf8" });
        if (r.status === 0) {
            const home = r.stdout.trim();
            if (home && fs.existsSync(path.join(home, "bin", "javac"))) {
                return path.join(home, "bin");
            }
        }
    }
    let bases = [];
    if (isWin) {
        bases = [
            "C:\\Program Files\\Eclipse Adoptium",
            "C:\\Program Files\\Microsoft",
            "C:\\Program Files\\Java",
            "C:\\Program Files\\Amazon Corretto",
        ];
    } else {
        bases = ["/usr/lib/jvm", "/opt/java"];
    }
    for (const base of bases) {
        if (!fs.existsSync(base)) continue;
        for (const entry of fs.readdirSync(base)) {
            const candidate = path.join(base, entry, "bin", `javac${exeSuffix}`);
            if (fs.existsSync(candidate)) return path.dirname(candidate);
        }
    }
    throw new Error(
        "javac not found. Install JDK 21+ (e.g. `winget install EclipseAdoptium.Temurin.21.JDK` " +
            "on Windows, `brew install --cask temurin@21` on macOS) or set JAVA_HOME.",
    );
}

function run(cmd, args, opts = {}) {
    const useShell = isWin && /\.(cmd|bat)$/i.test(path.basename(cmd));
    const r = spawnSync(cmd, args, { stdio: "inherit", shell: useShell, ...opts });
    if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (exit ${r.status})`);
}

function resolveCompileClasspath() {
    const envClasspath = process.env.SHAMELA_JAVA_CLASSPATH?.trim();
    if (envClasspath) {
        const jars = envClasspath
            .split(path.delimiter)
            .map((entry) => entry.trim())
            .filter(Boolean);
        if (jars.length === 0) {
            throw new Error("SHAMELA_JAVA_CLASSPATH was provided but is empty.");
        }
        return jars;
    }

    const pomPath = path.join(repoRoot, "src", "java", "pom.xml");
    const depsDir = path.join(repoRoot, ".cache", "java-deps");
    const mvn = which(isWin ? "mvn.cmd" : "mvn") ?? which("mvn");
    if (!mvn) {
        throw new Error(
            "Maven (mvn) not found. Install Maven or set SHAMELA_JAVA_CLASSPATH " +
                "to a path-delimited list of Lucene jars.",
        );
    }

    fs.rmSync(depsDir, { recursive: true, force: true });
    fs.mkdirSync(depsDir, { recursive: true });
    console.log("Resolving Java compile dependencies via Maven...");
    run(mvn, [
        "-q",
        "-f",
        pomPath,
        "dependency:copy-dependencies",
        `-DoutputDirectory=${depsDir}`,
        "-DincludeScope=compile",
    ]);

    const jars = fs
        .readdirSync(depsDir)
        .filter((name) => name.endsWith(".jar"))
        .map((name) => path.join(depsDir, name));
    if (jars.length === 0) {
        throw new Error(`No compile jars were downloaded into ${depsDir}.`);
    }
    return jars;
}

function walk(dir, ext) {
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...walk(full, ext));
        else if (entry.name.endsWith(ext)) out.push(full);
    }
    return out;
}

function copyDir(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dst, entry.name);
        if (entry.isDirectory()) copyDir(s, d);
        else fs.copyFileSync(s, d);
    }
}

// --- Locate JDK + verify javac ---
const jdkBin = findJdkBin();
if (jdkBin) {
    process.env.PATH = `${jdkBin}${path.delimiter}${process.env.PATH ?? ""}`;
    console.log(`Using JDK at ${jdkBin}`);
}
const javacCheck = spawnSync(`javac${exeSuffix}`, ["-version"], {
    encoding: "utf8",
    shell: false,
});
if (javacCheck.status !== 0) {
    throw new Error("javac -version failed even after PATH adjustment.");
}
console.log(`javac: ${(javacCheck.stdout || javacCheck.stderr).trim()}`);

// --- Clean build outputs before resolving compile deps ---
const buildDir = path.join(repoRoot, "src", "java", "build");
const classesDir = path.join(buildDir, "classes");
const mergedDir = path.join(buildDir, "merged");
const helperOut = path.join(repoRoot, "helper");
fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(classesDir, { recursive: true });
fs.mkdirSync(mergedDir, { recursive: true });
fs.mkdirSync(helperOut, { recursive: true });

// --- Compile classpath (Lucene from Maven or explicit env override) ---
const compileJars = resolveCompileClasspath();
const classpath = compileJars.join(path.delimiter);
console.log(`Compile deps: ${compileJars.length} jars`);

// --- Sources ---
const srcRoot = path.join(repoRoot, "src", "java", "src", "main", "java");
const javaFiles = walk(srcRoot, ".java");
if (javaFiles.length === 0) throw new Error(`No .java files found under ${srcRoot}`);

// --- Compile ---
console.log(`Compiling ${javaFiles.length} Java sources...`);
run(`javac${exeSuffix}`, [
    "-encoding",
    "UTF-8",
    "-source",
    "21",
    "-target",
    "21",
    "-d",
    classesDir,
    "-cp",
    classpath,
    ...javaFiles,
]);

// --- Bundle classes (no third-party jars; runtime jars come from Shamela install) ---
copyDir(classesDir, mergedDir);

const manifestPath = path.join(buildDir, "MANIFEST.MF");
fs.writeFileSync(
    manifestPath,
    [
        "Manifest-Version: 1.0",
        "Main-Class: ws.shamela.mcp.Main",
        "Implementation-Title: shamela-mcp helper",
        "Implementation-Version: 0.0.1",
        "",
    ].join("\n"),
    { encoding: "ascii" },
);

const outJar = path.join(helperOut, "shamela-helper.jar");
const cwd = process.cwd();
process.chdir(mergedDir);
try {
    run(`jar${exeSuffix}`, ["cfm", outJar, manifestPath, "."]);
} finally {
    process.chdir(cwd);
}

const size = fs.statSync(outJar).size;
console.log(
    `Built ${outJar} (${size.toLocaleString()} bytes, ${(size / 1024 / 1024).toFixed(2)} MB)`,
);
