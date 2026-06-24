import { D1Database } from "@cloudflare/workers-types";
import { Property, VendorContact, Invoice, MaintenanceTask, FinancialJournalEntry } from "./types";

export interface Env {
  DB: D1Database;
  R2: R2Bucket; // For R2 storage
}

export const getDb = (env: Env): D1Database => {
  return env.DB;
};

// --- Property Functions ---
export const fetchProperties = async (db: D1Database): Promise<Property[]> => {
  const { results } = await db.prepare("SELECT * FROM property ORDER BY created_at DESC").all<Property>();
  return results || [];
};

export const fetchPropertyById = async (db: D1Database, id: string): Promise<Property | null> => {
  const { results } = await db.prepare("SELECT * FROM property WHERE id = ?").bind(id).first<Property>();
  return results || null;
};

export const createProperty = async (db: D1Database, propertyData: Omit<Property, 'id' | 'created_at'>): Promise<Property> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO property (id, name, address, created_at) VALUES (?, ?, ?, ?)")
    .bind(id, propertyData.name, propertyData.address, now)
    .run();
  return { id, ...propertyData, created_at: now };
};

export const updateProperty = async (db: D1Database, id: string, propertyData: Partial<Omit<Property, 'id' | 'created_at'>>): Promise<void> => {
  const updates = [];
  const params = [];
  if (propertyData.name !== undefined) {
    updates.push("name = ?");
    params.push(propertyData.name);
  }
  if (propertyData.address !== undefined) {
    updates.push("address = ?");
    params.push(propertyData.address);
  }
  
  if (updates.length === 0) {
    return; // No fields to update
  }

  params.push(id); // Add ID for the WHERE clause
  const sql = `UPDATE property SET ${updates.join(', ')} WHERE id = ?`;
  await db.prepare(sql).bind(...params).run();
};

export const deleteProperty = async (db: D1Database, id: string): Promise<void> => {
  await db.prepare("DELETE FROM property WHERE id = ?").bind(id).run();
};

// --- Invoice Functions ---
export const fetchInvoices = async (db: D1Database): Promise<Invoice[]> => {
  const { results } = await db.prepare("SELECT * FROM invoice ORDER BY due_date ASC").all<Invoice>();
  return results || [];
};

export const fetchInvoiceById = async (db: D1Database, id: string): Promise<Invoice | null> => {
  const { results } = await db.prepare("SELECT * FROM invoice WHERE id = ?").bind(id).first<Invoice>();
  return results || null;
};

export const createInvoice = async (db: D1Database, invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO invoice (id, property_id, vendor_id, amount, currency, due_date, status, description, doc_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, invoiceData.property_id, invoiceData.vendor_id, invoiceData.amount, invoiceData.currency, invoiceData.due_date, invoiceData.status, invoiceData.description, invoiceData.doc_url, now)
    .run();
  return { id, ...invoiceData, created_at: now };
};

export const updateInvoice = async (db: D1Database, id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'created_at'>>): Promise<void> => {
  const updates = [];
  const params = [];
  if (invoiceData.property_id !== undefined) { updates.push("property_id = ?"); params.push(invoiceData.property_id); }
  if (invoiceData.vendor_id !== undefined) { updates.push("vendor_id = ?"); params.push(invoiceData.vendor_id); }
  if (invoiceData.amount !== undefined) { updates.push("amount = ?"); params.push(invoiceData.amount); }
  if (invoiceData.currency !== undefined) { updates.push("currency = ?"); params.push(invoiceData.currency); }
  if (invoiceData.due_date !== undefined) { updates.push("due_date = ?"); params.push(invoiceData.due_date); }
  if (invoiceData.status !== undefined) { updates.push("status = ?"); params.push(invoiceData.status); }
  if (invoiceData.description !== undefined) { updates.push("description = ?"); params.push(invoiceData.description); }
  if (invoiceData.doc_url !== undefined) { updates.push("doc_url = ?"); params.push(invoiceData.doc_url); }

  if (updates.length === 0) {
    return;
  }

  params.push(id);
  const sql = `UPDATE invoice SET ${updates.join(', ')} WHERE id = ?`;
  await db.prepare(sql).bind(...params).run();
};

export const deleteInvoice = async (db: D1Database, id: string): Promise<void> => {
  await db.prepare("DELETE FROM invoice WHERE id = ?").bind(id).run();
};

// --- Maintenance Task Functions ---
export const fetchMaintenanceTasks = async (db: D1Database): Promise<MaintenanceTask[]> => {
  const { results } = await db.prepare("SELECT * FROM maintenance_task ORDER BY created_at DESC").all<MaintenanceTask>();
  return results || [];
};

export const fetchMaintenanceTaskById = async (db: D1Database, id: string): Promise<MaintenanceTask | null> => {
  const { results } = await db.prepare("SELECT * FROM maintenance_task WHERE id = ?").bind(id).first<MaintenanceTask>();
  return results || null;
};

export const createMaintenanceTask = async (db: D1Database, taskData: Omit<MaintenanceTask, 'id' | 'created_at'>): Promise<MaintenanceTask> => {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO maintenance_task (id, property_id, description, priority, status, assigned_to, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(id, taskData.property_id, taskData.description, taskData.priority, taskData.status, taskData.assigned_to, taskData.due_date, now)
    .run();
  return { id, ...taskData, created_at: now };
};

export const updateMaintenanceTask = async (db: D1Database, id: string, taskData: Partial<Omit<MaintenanceTask, 'id' | 'created_at'>>): Promise<void> => {
  const updates = [];
  const params = [];
  if (taskData.property_id !== undefined) { updates.push("property_id = ?"); params.push(taskData.property_id); }
  if (taskData.description !== undefined) { updates.push("description = ?"); params.push(taskData.description); }
  if (taskData.priority !== undefined) { updates.push("priority = ?"); params.push(taskData.priority); }
  if (taskData.status !== undefined) { updates.push("status = ?"); params.push(taskData.status); }
  if (taskData.assigned_to !== undefined) { updates.push("assigned_to = ?"); params.push(taskData.assigned_to); }
  if (taskData.due_date !== undefined) { updates.push("due_date = ?"); params.push(taskData.due_date); }

  if (updates.length === 0) {
    return;
  }

  params.push(id);
  const sql = `UPDATE maintenance_task SET ${updates.join(', ')} WHERE id = ?`;
  await db.prepare(sql).bind(...params).run();
};

export const deleteMaintenanceTask = async (db: D1Database, id: string): Promise<void> => {
  await db.prepare("DELETE FROM maintenance_task WHERE id = ?").bind(id).run();
};

// --- Vendor Functions ---
// Assuming VendorContact type is used for vendors as well, or a separate Vendor type
export const fetchVendors = async (db: D1Database): Promise<VendorContact[]> => {
  const { results } = await db.prepare("SELECT * FROM vendor_contact").all<VendorContact>();
  return results || [];
};

// Placeholder for scheduled jobs
// export async function scheduled(event: FetchEvent, env: Env, ctx: ExecutionContext): Promise<void> { ... }
