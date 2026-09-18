# mcp-google_analytics

Google Analytics MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `ga_run_report` | Query GA4 analytics data by dimensions (e.g., "city", "pagePath") and metrics (e.g., "activeUsers", "sessions") for a date range. Returns aggregated data rows with dimension and metric values. |
| `ga_list_properties` | List all GA4 properties you can access. Returns property IDs, names, creation dates, and account info. Use to find the property ID for ga_run_report queries. |
| `ga_get_realtime` | Check live user activity in a GA4 property right now. Returns current active user count and real-time engagement metrics. Specify property ID (e.g., "123456789"). |
| `ga_get_metadata` | Discover available dimensions and metrics for a GA4 property. Returns field names, descriptions, and data types to build accurate ga_run_report queries. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "google_analytics": {
      "url": "https://gateway.pipeworx.io/google_analytics/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/google_analytics/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Google_analytics data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

This pack runs against a connected google_analytics account, so it needs a Pipeworx key: sign in at https://pipeworx.io/account, connect google_analytics, then call `POST https://gateway.pipeworx.io/v1/tools/ga_run_report` with `Authorization: Bearer <your Pipeworx key>`. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/ga_run_report`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
