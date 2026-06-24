import { Router, Route } from 'itty-router';
import { Env, getDb, fetchProperties, createProperty, fetchPropertyById, updateProperty, deleteProperty, fetchVendors } from '../db';
import { Property } from '../types';

const router = Router();

// --- Property Routes ---

// GET /api/properties - Fetch all properties
router.get('/api/properties', async (request: any, env: Env) => {
  try {
    const db = getDb(env);
    const properties = await fetchProperties(db);
    return new Response(JSON.stringify(properties), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to fetch properties:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch properties' }), { status: 500 });
  }
});

// GET /api/properties/:id - Fetch a single property by ID
router.get('/api/properties/:id', async (request: any, env: Env) => {
  const { id } = request.params;
  try {
    const db = getDb(env);
    const property = await fetchPropertyById(db, id as string);
    if (!property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(property), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Failed to fetch property ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch property' }), { status: 500 });
  }
});

// POST /api/properties - Create a new property
router.post('/api/properties', async (request: any, env: Env) => {
  const db = getDb(env);
  try {
    const body = await request.json() as { name: string; address?: string | null };
    if (!body.name || body.name.trim() === '') {
      return new Response(JSON.stringify({ error: 'Property name is required' }), { status: 400 });
    }
    const newPropertyData: Omit<Property, 'id' | 'created_at'> = {
      name: body.name.trim(),
      address: body.address?.trim() || null,
    };
    const createdProperty = await createProperty(db, newPropertyData);
    return new Response(JSON.stringify(createdProperty), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to create property:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create property' }), { status: 500 });
  }
});

// PUT /api/properties/:id - Update an existing property
router.put('/api/properties/:id', async (request: any, env: Env) => {
  const { id } = request.params;
  const db = getDb(env);
  try {
    const body = await request.json() as Partial<Omit<Property, 'id' | 'created_at'>>;
    // Basic validation for update (e.g., if name is provided, it shouldn't be empty)
    if (body.name !== undefined && body.name.trim() === '') {
        return new Response(JSON.stringify({ error: 'Property name cannot be empty' }), { status: 400 });
    }

    await updateProperty(db, id as string, body);
    
    // Return updated property or just success status
    const updatedProperty = await fetchPropertyById(db, id as string); // Fetch again to return updated state
    return new Response(JSON.stringify(updatedProperty), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Failed to update property ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to update property' }), { status: 500 });
  }
});

// DELETE /api/properties/:id - Delete a property
router.delete('/api/properties/:id', async (request: any, env: Env) => {
  const { id } = request.params;
  const db = getDb(env);
  try {
    await deleteProperty(db, id as string);
    return new Response(null, { status: 204 }); // No Content
  } catch (error: any) {
    console.error(`Failed to delete property ${id}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete property' }), { status: 500 });
  }
});


// GET /api/vendors
router.get('/api/vendors', async (request: any, env: Env) => {
    try {
        const db = getDb(env);
        const vendors = await fetchVendors(db);
        return new Response(JSON.stringify(vendors), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Failed to fetch vendors:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch vendors' }), { status: 500 });
    }
});


// Fallback for any other routes
router.all('*', () => new Response('Not Found', { status: 404 }));

export const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
