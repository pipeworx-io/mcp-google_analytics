interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Google Analytics MCP Pack
 *
 * Requires OAuth connection — gateway injects credentials via _context.google_analytics.
 * Tools: run report, list properties, get realtime data, get metadata.
 *
 * Uses the Google Analytics Data API (v1beta) for reports and the
 * Google Analytics Admin API (v1beta) for property listing.
 */


interface AnalyticsContext {
  google_analytics?: { accessToken: string };
}

const DATA_API = 'https://analyticsdata.googleapis.com/v1beta';
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta';

async function gFetch(ctx: AnalyticsContext, url: string, options: RequestInit = {}) {
  if (!ctx.google_analytics) {
    return { error: 'connection_required', message: 'Connect your Google account at https://pipeworx.io/account' };
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${ctx.google_analytics.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Analytics API error (${res.status}): ${text}`);
  }
  return res.json();
}

const tools: McpToolExport['tools'] = [
  {
    name: 'ga_run_report',
    description: 'Run a report on a Google Analytics 4 property. Specify dimensions (e.g., "city", "pagePath"), metrics (e.g., "activeUsers", "sessions"), and date ranges to retrieve analytics data.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: { type: 'string', description: 'GA4 property ID (numeric, e.g., "123456789")' },
        dimensions: {
          type: 'array',
          description: 'List of dimension names (e.g., ["city", "pagePath", "date"])',
          items: { type: 'string' },
        },
        metrics: {
          type: 'array',
          description: 'List of metric names (e.g., ["activeUsers", "sessions", "screenPageViews"])',
          items: { type: 'string' },
        },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD or relative: "today", "yesterday", "7daysAgo", "30daysAgo")' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD or relative: "today", "yesterday")' },
        limit: { type: 'number', description: 'Maximum number of rows to return (default 100, max 10000)' },
        dimension_filter: {
          type: 'object',
          description: 'Optional dimension filter object (GA4 FilterExpression format)',
        },
        order_bys: {
          type: 'array',
          description: 'Optional ordering. Each item: { dimension: { dimensionName, orderType? } } or { metric: { metricName }, desc? }',
          items: { type: 'object' },
        },
      },
      required: ['property_id', 'metrics', 'start_date', 'end_date'],
    },
  },
  {
    name: 'ga_list_properties',
    description: 'List all Google Analytics 4 properties accessible by the authenticated user. Uses the Admin API to fetch account summaries with property details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        page_size: { type: 'number', description: 'Maximum number of account summaries to return (default 50)' },
        page_token: { type: 'string', description: 'Token for fetching the next page of results' },
      },
      required: [],
    },
  },
  {
    name: 'ga_get_realtime',
    description: 'Get a realtime report for a Google Analytics 4 property. Shows currently active users and realtime metrics.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: { type: 'string', description: 'GA4 property ID (numeric)' },
        dimensions: {
          type: 'array',
          description: 'Realtime dimensions (e.g., ["city", "unifiedScreenName", "platform"])',
          items: { type: 'string' },
        },
        metrics: {
          type: 'array',
          description: 'Realtime metrics (e.g., ["activeUsers", "screenPageViews"]). Defaults to ["activeUsers"].',
          items: { type: 'string' },
        },
        limit: { type: 'number', description: 'Maximum number of rows (default 100)' },
      },
      required: ['property_id'],
    },
  },
  {
    name: 'ga_get_metadata',
    description: 'List all available dimensions and metrics for a Google Analytics 4 property. Useful for discovering what fields can be used in reports.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: { type: 'string', description: 'GA4 property ID (numeric)' },
      },
      required: ['property_id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const context = (args._context ?? {}) as AnalyticsContext;
  delete args._context;

  switch (name) {
    case 'ga_run_report': {
      const propertyId = args.property_id as string;
      const metrics = (args.metrics as string[]).map((m) => ({ name: m }));
      const dimensions = args.dimensions
        ? (args.dimensions as string[]).map((d) => ({ name: d }))
        : undefined;
      const startDate = args.start_date as string;
      const endDate = args.end_date as string;
      const limit = Math.min(10000, Math.max(1, (args.limit as number) ?? 100));

      const body: Record<string, unknown> = {
        metrics,
        dateRanges: [{ startDate, endDate }],
        limit,
      };
      if (dimensions) body.dimensions = dimensions;
      if (args.dimension_filter) body.dimensionFilter = args.dimension_filter;
      if (args.order_bys) body.orderBys = args.order_bys;

      return gFetch(context, `${DATA_API}/properties/${propertyId}:runReport`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
    case 'ga_list_properties': {
      const pageSize = Math.min(200, Math.max(1, (args.page_size as number) ?? 50));
      const params = new URLSearchParams({ pageSize: String(pageSize) });
      if (args.page_token) params.set('pageToken', args.page_token as string);
      return gFetch(context, `${ADMIN_API}/accountSummaries?${params}`);
    }
    case 'ga_get_realtime': {
      const propertyId = args.property_id as string;
      const metrics = args.metrics
        ? (args.metrics as string[]).map((m) => ({ name: m }))
        : [{ name: 'activeUsers' }];
      const dimensions = args.dimensions
        ? (args.dimensions as string[]).map((d) => ({ name: d }))
        : undefined;
      const limit = Math.min(10000, Math.max(1, (args.limit as number) ?? 100));

      const body: Record<string, unknown> = { metrics, limit };
      if (dimensions) body.dimensions = dimensions;

      return gFetch(context, `${DATA_API}/properties/${propertyId}:runRealtimeReport`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
    case 'ga_get_metadata': {
      const propertyId = args.property_id as string;
      return gFetch(context, `${DATA_API}/properties/${propertyId}/metadata`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 15 }, provider: 'google_analytics' } satisfies McpToolExport;
