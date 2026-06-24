export interface Invoice {
  id: string;
  property_id: string;
  vendor_id: string;

  amount: number;
  currency: string;

  due_date: string;

  status:
    | 'pending'
    | 'paid'
    | 'overdue'
    | 'cancelled';

  description?: string;
  doc_url?: string | null;

  created_at?: string;
  updated_at?: string;
}
