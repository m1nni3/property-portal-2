import { Router } from 'itty-router';
import { Env, getDb, fetchInvoices, createInvoice, updateInvoice, deleteInvoice, fetchInvoiceById } from '../db';
import { Invoice } from '../types';

const router = Router();

router.get('/api/invoices', async (_request: Request, env: Env) => {
  try {
    const db = getDb(env);
    const invoices = await fetchInvoices(db);
    return new Response(JSON.stringify(invoices), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch invoices' }), { status: 500 });
  }
});

router.post('/api/invoices', async (request: Request, env: Env) => {
  const db = getDb(env);
  try {
    const body = await request.json<any>();

    if (!body.property_id || !body.vendor_id || body.amount === undefined || !body.due_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const createdInvoice = await createInvoice(db, {
      property_id: body.property_id,
      vendor_id: body.vendor_id,
      amount: Number(body.amount),
      currency: body.currency || 'USD',
      due_date: body.due_date,
      status: body.status || 'pending',
      description: body.description || '',
      doc_url: body.doc_url || null,
    } as any);

    return new Response(JSON.stringify(createdInvoice), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to create invoice' }), { status: 500 });
  }
});

router.get('/api/invoices/:id', async (request: any, env: Env) => {
  const id = request.params?.id;
  const db = getDb(env);
  const invoice = await fetchInvoiceById(db, id);

  if (!invoice) {
    return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
  }

  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.put('/api/invoices/:id', async (request: any, env: Env) => {
  const id = request.params?.id;
  const db = getDb(env);

  const body = await request.json();
  await updateInvoice(db, id, body);

  const updated = await fetchInvoiceById(db, id);

  return new Response(JSON.stringify(updated), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.delete('/api/invoices/:id', async (request: any, env: Env) => {
  const id = request.params?.id;
  const db = getDb(env);
  await deleteInvoice(db, id);
  return new Response(null, { status: 204 });
});

router.all('*', () => new Response('Not Found', { status: 404 }));

export const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};