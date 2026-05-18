# shamela-mcp — Repository Context

This repo ships a universal MCP stdio server for reading a local Maktabah al-Shamela 4 install.

## Core commands

```bash
npm install
npm run test:unit
npm run build
npm run release:stage
```

## Build model

- `build:server` bundles the Node MCP server into `dist/index.js`
- `build:java` compiles the Java helper into `helper/shamela-helper.jar`
- Java compile dependencies come from Maven via `src/java/pom.xml`
- Runtime Lucene jars still come from the user's Shamela installation

## Release model

- Releases are created by GitHub Actions, not by a local release script
- The workflow produces universal artifacts for MCP clients
- Version is read from `package.json`

## Runtime path resolution

The server resolves Shamela in this order:

1. `SHAMELA_INSTALL_ROOT`
2. Windows Registry
3. common install locations

JRE resolution:

1. `SHAMELA_JRE`
2. bundled Shamela JRE inside the detected install

## Hard rules

1. Read Shamela data only. Never write to the user's Shamela install.
2. Keep the helper jar lean. Do not bundle Shamela's own runtime jars into it.
3. Any new logic must ship with tests at the right layer.
4. Prefer user-facing wording that is host-client neutral, not tied to a specific MCP app.
