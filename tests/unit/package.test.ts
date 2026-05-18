import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const packageJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"),
) as {
    bin?: Record<string, string>;
    files?: string[];
    scripts?: Record<string, string>;
};

describe("package metadata", () => {
    it("exposes a stable CLI entry point for generic MCP clients", () => {
        expect(packageJson.bin).toEqual({
            "shamela-mcp": "dist/index.js",
        });
        expect(packageJson.scripts?.start).toBe("node dist/index.js");
        expect(packageJson.scripts?.["start:stdio"]).toBe("node dist/index.js");
    });

    it("includes the runtime artifacts needed for universal MCP releases", () => {
        expect(packageJson.files).toEqual(
            expect.arrayContaining(["dist", "helper", "docs", "examples", "README.md", "LICENSE"]),
        );
    });
});
