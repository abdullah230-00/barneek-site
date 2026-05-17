# Render MCP Server (render-oss/render-mcp-server)

This repo uses BlackboxAI MCP configuration via `blackbox_mcp_settings.json`.

## 1) Install the MCP server

Follow the official Render docs (setup + credentials):
- https://render.com/docs/mcp-server

Clone the server locally:
- https://github.com/render-oss/render-mcp-server

Then run its install/build steps (typically `npm install` / `npm run build`).

## 2) Configure `blackbox_mcp_settings.json`

- Server name must be exactly: `github.com/render-oss/render-mcp-server`
- Transport is typically `stdio`.
- Update the `command.args` to point to the built/server entrypoint or the package binary.

## 3) Demonstrate capabilities

After configuration, list workspaces using the MCP tool `list_workspaces`.

> Note: The actual demo requires Render credentials and network access.

