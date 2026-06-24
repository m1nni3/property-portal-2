/**
 * property-portal-worker — main entry point
 *
 * Routes:
 *   /api/properties       → CRUD for properties
 *   /api/invoices         → CRUD for invoices
 *   /api/maintenance      → CRUD for maintenance tasks
 *   /api/vendors          → list vendor contacts
 *
 * Scheduled cron jobs are handled by the `scheduled` export.
 */

import { Router } from 'itty-router';
import { Env } from './db';
import { scheduled } from './scheduled';

// --- Sub-routers (each file exports a `handler` with its own Router) ---
import { handler as propertiesHandler } from './api/properties';
import { handler as invoicesHandler } from './api/invoices';
import { handler as maintenanceHandler } from './api/maintenance';

// ── CORS helpers ──────────────────────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function withCors(response: Response): Response {
  const res = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

// ── Health check ──────────────────────────────────────────────────────────────
const router = Router();

router.get('/api/health', () =>
  new Response(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' },
  })
);

// ── Delegate to sub-routers ───────────────────────────────────────────────────
// Properties
router.get('/api/properties', (req, env) => propertiesHandler.fetch(req as Request, env));
router.get('/api/properties/:id', (req, env) => propertiesHandler.fetch(req as Request, env));
router.post('/api/properties', (req, env) => propertiesHandler.fetch(req as Request, env));
router.put('/api/properties/:id', (req, env) => propertiesHandler.fetch(req as Request, env));
router.delete('/api/properties/:id', (req, env) => propertiesHandler.fetch(req as Request, env));

// Invoices
router.get('/api/invoices', (req, env) => invoicesHandler.fetch(req as Request, env));
router.get('/api/invoices/:id', (req, env) => invoicesHandler.fetch(req as Request, env));
router.post('/api/invoices', (req, env) => invoicesHandler.fetch(req as Request, env));
router.put('/api/invoices/:id', (req, env) => invoicesHandler.fetch(req as Request, env));
router.delete('/api/invoices/:id', (req, env) => invoicesHandler.fetch(req as Request, env));

// Maintenance
router.get('/api/maintenance', (req, env) => maintenanceHandler.fetch(req as Request, env));
router.get('/api/maintenance/:id', (req, env) => maintenanceHandler.fetch(req as Request, env));
router.post('/api/maintenance', (req, env) => maintenanceHandler.fetch(req as Request, env));
router.put('/api/maintenance/:id', (req, env) => maintenanceHandler.fetch(req as Request, env));
router.delete('/api/maintenance/:id', (req, env) => maintenanceHandler.fetch(req as Request, env));

// Vendors (read-only for now)
router.get('/api/vendors', (req, env) => propertiesHandler.fetch(req as Request, env));

// ── Catch-all ─────────────────────────────────────────────────────────────────
router.all('*', () => new Response('Not Found', { status: 404 }));

// ── Worker export ─────────────────────────────────────────────────────────────
export default {
  /**
   * Handle inbound HTTP requests.
   * Preflight OPTIONS requests are answered immediately with CORS headers.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const response = await router.handle(request, env, ctx);
    return withCors(response ?? new Response('Not Found', { status: 404 }));
  },

  /**
   * Handle Cloudflare cron triggers.
   * Configure triggers in wrangler.toml under [[triggers.crons]].
   */
  scheduled,
};
