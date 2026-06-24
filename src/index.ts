/**
 * property-portal-2 — Cloudflare Worker entry point
 */

import { Router } from 'itty-router';
import { Env, getDb,
  fetchProperties, fetchPropertyById, createProperty, updateProperty, deleteProperty,
  fetchInvoices, fetchInvoiceById, createInvoice, updateInvoice, deleteInvoice,
  fetchMaintenanceTasks, fetchMaintenanceTaskById, createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask,
  fetchVendors,
} from './db';
import { scheduled } from './scheduled';

// ── CORS ──────────────────────────────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function err(message: string, status = 500): Response {
  return json({ error: message }, status);
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = Router();

// Health
router.get('/api/health', () => json({ status: 'ok', ts: new Date().toISOString() }));

// ── Properties ────────────────────────────────────────────────────────────────
router.get('/api/properties', async (req: any, env: Env) => {
  try {
    return json(await fetchProperties(getDb(env)));
  } catch (e: any) { return err(e.message); }
});

router.get('/api/properties/:id', async (req: any, env: Env) => {
  try {
    const item = await fetchPropertyById(getDb(env), req.params.id);
    return item ? json(item) : err('Not found', 404);
  } catch (e: any) { return err(e.message); }
});

router.post('/api/properties', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    if (!body.name?.trim()) return err('name is required', 400);
    return json(await createProperty(getDb(env), { name: body.name.trim(), address: body.address ?? null }), 201);
  } catch (e: any) { return err(e.message); }
});

router.put('/api/properties/:id', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    await updateProperty(getDb(env), req.params.id, body);
    return json(await fetchPropertyById(getDb(env), req.params.id));
  } catch (e: any) { return err(e.message); }
});

router.delete('/api/properties/:id', async (req: any, env: Env) => {
  try {
    await deleteProperty(getDb(env), req.params.id);
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  } catch (e: any) { return err(e.message); }
});

// ── Invoices ──────────────────────────────────────────────────────────────────
router.get('/api/invoices', async (req: any, env: Env) => {
  try {
    return json(await fetchInvoices(getDb(env)));
  } catch (e: any) { return err(e.message); }
});

router.get('/api/invoices/:id', async (req: any, env: Env) => {
  try {
    const item = await fetchInvoiceById(getDb(env), req.params.id);
    return item ? json(item) : err('Not found', 404);
  } catch (e: any) { return err(e.message); }
});

router.post('/api/invoices', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    if (!body.property_id || !body.vendor_id || !body.amount || !body.due_date)
      return err('Missing required fields: property_id, vendor_id, amount, due_date', 400);
    return json(await createInvoice(getDb(env), body), 201);
  } catch (e: any) { return err(e.message); }
});

router.put('/api/invoices/:id', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    await updateInvoice(getDb(env), req.params.id, body);
    return json(await fetchInvoiceById(getDb(env), req.params.id));
  } catch (e: any) { return err(e.message); }
});

router.delete('/api/invoices/:id', async (req: any, env: Env) => {
  try {
    await deleteInvoice(getDb(env), req.params.id);
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  } catch (e: any) { return err(e.message); }
});

// ── Maintenance ───────────────────────────────────────────────────────────────
router.get('/api/maintenance', async (req: any, env: Env) => {
  try {
    return json(await fetchMaintenanceTasks(getDb(env)));
  } catch (e: any) { return err(e.message); }
});

router.get('/api/maintenance/:id', async (req: any, env: Env) => {
  try {
    const item = await fetchMaintenanceTaskById(getDb(env), req.params.id);
    return item ? json(item) : err('Not found', 404);
  } catch (e: any) { return err(e.message); }
});

router.post('/api/maintenance', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    if (!body.property_id || !body.description) return err('Missing required fields', 400);
    return json(await createMaintenanceTask(getDb(env), body), 201);
  } catch (e: any) { return err(e.message); }
});

router.put('/api/maintenance/:id', async (req: any, env: Env) => {
  try {
    const body = await req.json();
    await updateMaintenanceTask(getDb(env), req.params.id, body);
    return json(await fetchMaintenanceTaskById(getDb(env), req.params.id));
  } catch (e: any) { return err(e.message); }
});

router.delete('/api/maintenance/:id', async (req: any, env: Env) => {
  try {
    await deleteMaintenanceTask(getDb(env), req.params.id);
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  } catch (e: any) { return err(e.message); }
});

// ── Vendors ───────────────────────────────────────────────────────────────────
router.get('/api/vendors', async (req: any, env: Env) => {
  try {
    return json(await fetchVendors(getDb(env)));
  } catch (e: any) { return err(e.message); }
});

// ── Catch-all ─────────────────────────────────────────────────────────────────
router.all('*', () => err('Not found', 404));

// ── Worker export ─────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    return router.fetch(request, env, ctx);
  },
  scheduled,
};
