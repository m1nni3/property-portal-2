-- Migration 01: Create core tables
-- Run with `wrangler d1 migrations apply 1` after adding this file

-- Properties
CREATE TABLE IF NOT EXISTS property (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendor contacts (acts as vendors and their contacts)
CREATE TABLE IF NOT EXISTS vendor_contact (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES property(id),
  name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoice (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES property(id),
  vendor_id TEXT NOT NULL,
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  due_date DATE,
  status TEXT DEFAULT 'pending',
  doc_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance tasks
CREATE TABLE IF NOT EXISTS maintenance_task (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES property(id),
  description TEXT,
  priority TEXT,
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Financial journal for P&L
CREATE TABLE IF NOT EXISTS financial_journal (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES property(id),
  entry_date DATE,
  description TEXT,
  debit DECIMAL(12,2) DEFAULT 0,
  credit DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

