# mcp-google_analytics

Google Analytics MCP Pack

Part of the [Pipeworx](https://pipeworx.io) open MCP gateway.

## Tools

| Tool | Description |
|------|-------------|
| `ga_run_report` | Run a report on a Google Analytics 4 property. Specify dimensions (e.g., "city", "pagePath"), metrics (e.g., "activeUsers", "sessions"), and date ranges to retrieve analytics data. |
| `ga_list_properties` | List all Google Analytics 4 properties accessible by the authenticated user. Uses the Admin API to fetch account summaries with property details. |
| `ga_get_realtime` | Get a realtime report for a Google Analytics 4 property. Shows currently active users and realtime metrics. |
| `ga_get_metadata` | List all available dimensions and metrics for a Google Analytics 4 property. Useful for discovering what fields can be used in reports. |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "google_analytics": {
      "url": "https://gateway.pipeworx.io/google_analytics/mcp"
    }
  }
}
```

Or use the CLI:

```bash
npx pipeworx use google_analytics
```

## License

MIT
