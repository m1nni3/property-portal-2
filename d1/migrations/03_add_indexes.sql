-- Migration 03: Add indexes for common query patterns

-- Invoices: most queries filter by property, status, or due date
CREATE INDEX IF NOT EXISTS idx_invoice_property_id ON invoice(property_id);
CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoice(status);
CREATE INDEX IF NOT EXISTS idx_invoice_due_date ON invoice(due_date);

-- Maintenance tasks: filter by property and status
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_task(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_task(status);

-- Vendor contacts: always looked up by property
CREATE INDEX IF NOT EXISTS idx_vendor_property_id ON vendor_contact(property_id);
