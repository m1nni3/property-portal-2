import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import InvoiceCard from '../components/InvoiceCard';
import { Invoice } from '../src/types';
import { api, ApiError } from '../lib/api';

const InvoicesPage = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Invoice[]>('/api/invoices')
      .then(setInvoices)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Invoices"><div className="text-center py-10">Loading invoices...</div></Layout>;
  if (error) return <Layout title="Invoices"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout title="Invoices">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Invoices</h2>
          <Link href="/invoices/new" className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
            + Add New Invoice
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p>No invoices found. Add your first invoice!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onViewDetails={(id) => router.push(`/invoices/${id}`)}
                onEdit={(id) => router.push(`/invoices/${id}/edit`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoicesPage;
