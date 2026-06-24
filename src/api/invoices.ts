import { Router } from 'itty-router';
import { Env, getDb, fetchInvoices, createInvoice, updateInvoice, deleteInvoice, fetchInvoiceById, fetchProperties, fetchVendors } from '../db'; // Import all necessary functions and Env interface
import { Invoice, Property, VendorContact } from '../types'; // Import types

const router = Router();

// --- Invoice Document Upload ---
// POST /api/invoices/upload - Get a presigned URL for uploading an invoice document to R2
router.post('/api/invoices/upload', async (request: Request, env: Env) => {
  try {
    // Parse request to get necessary info for upload
    // Assuming the client sends { filename: string, contentType: string, invoiceId: string }
    const body = await request.json<{ filename: string; contentType: string; invoiceId: string }>();
    
    if (!body.filename || !body.contentType || !body.invoiceId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: filename, contentType, invoiceId' }), { status: 400 });
    }

    // Basic validation for invoiceId before proceeding
    // In a real app, you might want to fetch the invoice from DB first to ensure it exists and belongs to the user
    // For now, we trust the provided ID and assume it's valid.

    // Generate a unique key for the R2 object
    // Structure: invoices/{invoiceId}/{uuid}-{originalFilename}
    const fileKey = `invoices/${body.invoiceId}/${crypto.randomUUID()}-${body.filename}`;
    
    // Get a presigned PUT URL from R2.
    // The env.R2 binding must be configured in wrangler.toml.
    // The `put` method on R2Binding returns a Promise<string> which is the presigned URL.
    // We can set an expiration for the presigned URL, e.g., 15 minutes.
    const presignedUrl = await env.R2.put(fileKey, {
      httpMetadata: {
        contentType: body.contentType,
      },
      expiration: Math.floor(Date.now() / 1000) + (60 * 15), // URL expires in 15 minutes
    });

    // Update the invoice record in the database with the file key
    // The frontend will use this key to construct the final URL or store it as is.
    // We are storing the key for R2 object, not the full public URL.
    const db = getDb(env);
    await updateInvoice(db, body.invoiceId, { doc_url: fileKey });

    return new Response(JSON.stringify({
      uploadUrl: presignedUrl, // The URL the client will use to upload the file
      fileKey: fileKey,        // The key to store in DB (useful for retrieving later)
      message: 'Presigned URL generated successfully',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Failed to generate presigned URL for R2 upload:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate upload URL' }), { status: 500 });
  }
});
// --- End Invoice Document Upload ---


// --- Invoice Routes (Existing - Ensure GET, POST, PUT, DELETE are functional) ---

// GET /api/invoices - Fetch all invoices from D1
router.get('/api/invoices', async (request: Request, env: Env) => {
  try {
    const db = getDb(env);
    const invoices = await fetchInvoices(db);
    return new Response(JSON.JSON.stringify(invoices), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to fetch invoices:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch invoices' }), { status: 500 });
  }
});

// POST /api/invoices - Create a new invoice in D1
router.post('/api/invoices', async (request: Request, env: Env) => {
  const db = getDb(env);
  try {
    const body = await request.json<any>();
    
    if (!body.property_id || !body.vendor_id || body.amount === undefined || !body.due_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields: property_id, vendor_id, amount, due_date' }), { status: 400 });
    }
    
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive number' }), { status: 400 });
    }

    const newInvoiceData: Omit<Invoice, 'id' | 'created_at'> = {
      property_id: body.property_id,
      vendor_id: body.vendor_id,
      amount: amount,
      currency: body.currency || 'USD',
      due_date: body.due_date,
      status: body.status || 'pending',
      description: body.description || '',
      doc_url: body.doc_url || null, // Initial doc_url will be null if not provided on creation
    };
    
    const createdInvoice = await createInvoice(db, newInvoiceData);
    return new Response(JSON.JSON.stringify(createdInvoice), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to create invoice:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create invoice' }), { status: 500 });
  }
});

// GET /api/invoices/:id - Fetch a single invoice by ID
router.get('/api/invoices/:id', async (request: Request, env: Env) => {
  const { id } = request.params;
  try {
    const db = getDb(env);
    const invoice = await fetchInvoiceById(db, id as string);
    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(invoice), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Failed to fetch invoice ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch invoice' }), { status: 500 });
  }
});

// PUT /api/invoices/:id - Update an existing invoice
router.put('/api/invoices/:id', async (request: Request, env: Env) => {
  const { id } = request.params;
  const db = getDb(env);
  try {
    const body = await request.json<Partial<Omit<Invoice, 'id' | 'created_at'>>>();
    await updateInvoice(db, id as string, body);
    
    const updatedInvoice = await fetchInvoiceById(db, id as string);
    return new Response(JSON.JSON.stringify(updatedInvoice), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Failed to update invoice ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update invoice' }), { status: 500 });
  }
});

// DELETE /api/invoices/:id - Delete an invoice
router.delete('/api/invoices/:id', async (request: Request, env: Env) => {
  const { id } = request.params;
  const db = getDb(env);
  try {
    await deleteInvoice(db, id as string);
    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error(`Failed to delete invoice ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete invoice' }), { status: 500 });
  }
});

// --- Other routes (Properties, Maintenance, Vendors) ---
// These should also be implemented or already exist from previous steps.
// Example: Properties routes are in workers/src/api/properties.ts

// Fallback for any other routes
router.all('*', () => new Response('Not Found', { status: 404 }));

export const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
