import { Router } from "itty-router";
import {
  Env,
  getDb,
  fetchInvoices,
  fetchInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../db";

const router = Router();

// GET /api/invoices
router.get("/api/invoices", async (req: any, env: Env) => {
  try {
    const db = getDb(env);
    const invoices = await fetchInvoices(db);
    return new Response(JSON.stringify(invoices), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

// GET /api/invoices/:id
router.get("/api/invoices/:id", async (req: any, env: Env) => {
  const { id } = req.params;
  try {
    const db = getDb(env);
    const invoice = await fetchInvoiceById(db, id);
    if (!invoice) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    return new Response(JSON.stringify(invoice), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

// POST /api/invoices
router.post("/api/invoices", async (req: any, env: Env) => {
  try {
    const db = getDb(env);
    const body = await req.json();
    if (!body.property_id || !body.vendor_id || !body.amount || !body.due_date) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const created = await createInvoice(db, body);
    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

// PUT /api/invoices/:id
router.put("/api/invoices/:id", async (req: any, env: Env) => {
  const { id } = req.params;
  try {
    const db = getDb(env);
    const body = await req.json();
    await updateInvoice(db, id, body);
    const updated = await fetchInvoiceById(db, id);
    return new Response(JSON.stringify(updated), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

// DELETE /api/invoices/:id
router.delete("/api/invoices/:id", async (req: any, env: Env) => {
  const { id } = req.params;
  try {
    const db = getDb(env);
    await deleteInvoice(db, id);
    return new Response(null, { status: 204 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});

router.all("*", () => new Response("Not Found", { status: 404 }));

export const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.handle(request, env, ctx);
  },
};
