# shamela-mcp

This guide is written for **non-technical users**, especially people who already use **Maktabah al-Shamela** and want to connect their local Shamela library to an AI app that supports MCP.

## What is this?

`shamela-mcp` is a local MCP server that connects your AI app to your local **Shamela 4** installation.

That lets the app:

- search inside downloaded Shamela books
- search authors, titles, and Qur'an verses
- open book pages
- read TOCs and sections
- generate citations from Shamela pages

Everything runs **locally on your machine**. The server does not write to Shamela's database.

## Who is this for?

This is a good fit if:

- you already use Shamela 4
- you have downloaded at least one book in Shamela
- you want your AI app to answer questions using your own local Shamela library

## What do you need?

- Shamela 4 installed on your computer
- at least one downloaded book inside Shamela
- an AI app that supports **local MCP over stdio**
- Node.js 20 or newer

## How a beginner should use it

### 1. Download a release

Download the latest release from this repository's GitHub Releases page.

Choose one of:

- `shamela-mcp-<version>.zip`
- `shamela-mcp-<version>.tgz`

If you are a normal Windows user, use the `.zip` file.

### 2. Extract it

Extract the release into a folder you can find easily.

For example:

- `C:\tools\shamela-mcp`
- `/Users/yourname/tools/shamela-mcp`

After extracting, you should see:

- `dist/index.js`
- `helper/shamela-helper.jar`
- `examples/`
- `docs/`

### 3. Add MCP config to your AI app

Use a minimal config like this:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/shamela-mcp/dist/index.js"]
    }
  }
}
```

Replace the path with the real path on your computer.

Example on Windows:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["C:\\tools\\shamela-mcp\\dist\\index.js"]
    }
  }
}
```

Ready-made example: [../examples/universal-mcp.json](../examples/universal-mcp.json)

### 4. Restart your AI app

After saving the MCP config, fully close the app and open it again.

### 5. Try a first question

For example:

- `Search my Shamela library for the word "الكلام"`
- `Open the page that explains تعريف الكلام`
- `Show me the books by ابن عثيمين in my Shamela library`

If setup is correct, the AI app should start using the `shamela_*` tools.

## Do I need to enter Shamela and Java paths manually?

Usually **no**.

The server tries to auto-detect:

- your Shamela installation
- the bundled Java runtime inside Shamela

Only use manual `env` settings if auto-detection fails.

Example: [../examples/universal-mcp-with-env.json](../examples/universal-mcp-with-env.json)

## If auto-detection fails

Use a config like this:

```json
{
  "mcpServers": {
    "shamela": {
      "command": "node",
      "args": ["C:\\tools\\shamela-mcp\\dist\\index.js"],
      "env": {
        "SHAMELA_INSTALL_ROOT": "C:\\path\\to\\Shamela",
        "SHAMELA_JRE": "C:\\path\\to\\java.exe"
      }
    }
  }
}
```

`SHAMELA_INSTALL_ROOT` should point to the main Shamela folder that contains:

- `database`
- `app`

## Real examples

You can ask things like:

- `Search for الاستصناع in the fiqh books I downloaded`
- `Open the page that explains القياس`
- `Show tafsir for Ayat al-Kursi from the tafsir books in my Shamela library`
- `Create a citation from this page`

## Common problems

### The tools do not appear

Usually this means:

- the MCP config is wrong
- the `dist/index.js` path is wrong
- the AI app has not been fully restarted

### Shamela was not found

Usually this means:

- your Shamela install is in a non-standard location

Fix:

- set `SHAMELA_INSTALL_ROOT` manually

### Java was not found

Fix:

- set `SHAMELA_JRE` manually

### Search returns nothing

Check:

- did you actually download the book in Shamela?
- is the search phrase correct?
- is your search scope too narrow?

## For technical users

If you want to build from source:

```bash
npm install
npm run build
node dist/index.js
```

But for non-technical users, the **GitHub release** is the recommended path.
