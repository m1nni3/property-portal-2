export interface Property {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface VendorContact {
  id: string;
  property_id: string;
  name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface Invoice {
  id: string;
  property_id: string;
  vendor_id: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  doc_url: string | null;
  created_at: string;
}

export interface MaintenanceTask {
  id: string;
  property_id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed' | 'cancelled';
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
}

export interface FinancialJournalEntry {
  id: string;
  property_id: string;
  entry_date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  created_at: string;
}

// Extend this with other types as needed, e.g., User, etc.
