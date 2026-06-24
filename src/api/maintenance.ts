import { Router } from 'itty-router';
import { Env, getDb, fetchMaintenanceTasks, createMaintenanceTask, fetchMaintenanceTaskById, updateMaintenanceTask, deleteMaintenanceTask } from '../db';
import { MaintenanceTask } from '../types';

const router = Router();

// GET /api/maintenance - Fetch all maintenance tasks from D1
router.get('/api/maintenance', async (request: Request, env: Env) => {
  try {
    const db = getDb(env);
    const tasks = await fetchMaintenanceTasks(db);
    return new Response(JSON.stringify(tasks), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to fetch maintenance tasks:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to fetch maintenance tasks' }), { status: 500 });
  }
});

// POST /api/maintenance - Create a new maintenance task in D1
router.post('/api/maintenance', async (request: Request, env: Env) => {
  const db = getDb(env);
  try {
    const body = await request.json<any>();

    if (!body.property_id || !body.description) {
      return new Response(JSON.stringify({ error: 'Missing required fields: property_id, description' }), { status: 400 });
    }

    const newTaskData: Omit<MaintenanceTask, 'id' | 'created_at'> = {
      property_id: body.property_id,
      description: body.description,
      priority: body.priority || 'medium',
      status: body.status || 'open',
      assigned_to: body.assigned_to || null,
      due_date: body.due_date || null,
    };
    
    const createdTask = await createMaintenanceTask(db, newTaskData);
    return new Response(JSON.stringify(createdTask), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Failed to create maintenance task:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to create maintenance task' }), { status: 500 });
  }
});

// GET /api/maintenance/:id - Fetch a single maintenance task by ID
router.get('/api/maintenance/:id', async (request: Request, env: Env) => {
    const { id } = request.params;
    try {
        const db = getDb(env);
        const task = await fetchMaintenanceTaskById(db, id as string);
        if (!task) {
            return new Response(JSON.stringify({ error: 'Maintenance task not found' }), { status: 404 });
        }
        return new Response(JSON.stringify(task), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error(`Failed to fetch maintenance task ${id}:`, error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch maintenance task' }), { status: 500 });
    }
});

// PUT /api/maintenance/:id - Update an existing maintenance task
router.put('/api/maintenance/:id', async (request: Request, env: Env) => {
    const { id } = request.params;
    const db = getDb(env);
    try {
        const body = await request.json<Partial<Omit<MaintenanceTask, 'id' | 'created_at'>>>();
        await updateMaintenanceTask(db, id as string, body);
        
        const updatedTask = await fetchMaintenanceTaskById(db, id as string);
        return new Response(JSON.stringify(updatedTask), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error(`Failed to update maintenance task ${id}:`, error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to update maintenance task' }), { status: 500 });
    }
});

// DELETE /api/maintenance/:id - Delete a maintenance task
router.delete('/api/maintenance/:id', async (request: Request, env: Env) => {
    const { id } = request.params;
    const db = getDb(env);
    try {
        await deleteMaintenanceTask(db, id as string);
        return new Response(null, { status: 204 }); // No Content
    } catch (error: any) {
        console.error(`Failed to delete maintenance task ${id}:`, error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to delete maintenance task' }), { status: 500 });
    }
});


router.all('*', () => new Response('Not Found', { status: 404 }));

export const handler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
