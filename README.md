# mcp-google_analytics

Google Analytics MCP Pack

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Google_analytics data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
