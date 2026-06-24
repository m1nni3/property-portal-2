// src/api/invoices.ts
import { Router } from "itty-router";
import { Env } from "../db";
import { listInvoices, getInvoice, createInvoice, updateInvoice } from "../notion";

const router = Router();

// 1. List all invoices
router.get("/api/invoices", async (_req: Request, _env: Env) => {
  const invoices = await listInvoices();
  return new Response(JSON.stringify(invoices), { headers: { "Content-Type": "application/json" } });
});

// 2. Get a specific invoice
router.get("/api/invoices/:id", async (req: any, _env: Env) => {
  const { id } = req.params;
  const invoice = await getInvoice(id);
  return new Response(JSON.stringify(invoice), { headers: { "Content-Type": "application/json" } });
});

// 3. Create a new invoice
router.post("/api/invoices", async (req: Request, _env: Env) => {
  const body = await req.json();
  const created = await createInvoice(body);
  return new Response(JSON.stringify(created), { status: 201 });
});

// 4. Update an existing invoice
router.put("/api/invoices/:id", async (req: Request, _env: Env) => {
  const { id } = req.params;
  const body = await req.json();
  const updated = await updateInvoice(id, body);
  return new Response(JSON.stringify(updated), { headers: { "Content-Type": "application/json" } });
});

// 5. Delete an invoice (archives it in Notion)
router.delete("/api/invoices/:id", async (req: any, _env: Env) => {
  const { id } = req.params;
  // We need to add a deleteInvoice function to notion.ts
  // For now, we'll inline the call
  const NOTION_API = "https://api.notion.com/v1";
  const NOTION_VERSION = "2022-06-28";
  
  const token = await (async () => {
    try {
      const key = Deno.readTextFileSync(`${process.env.HOME}/.easyclaw/linkapp/notion_api_key`).trim();
      return key;
    } catch {
      return process.env.NOTION_API_KEY;
    }
  })();
  
  const res = await fetch(`${NOTION_API}/pages/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ archived: true }),
  });
  
  if (!res.ok) {
    return new Response(JSON.stringify({ error: `Failed to delete invoice` }), { status: 500 });
  }
  
  return new Response(null, { status: 204 });
});

router.all("*", () => new Response("Not Found", { status: 404 }));

export const handler = {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext) {
    return router.handle(request, _env, _ctx);
  },
};