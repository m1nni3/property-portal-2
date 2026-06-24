import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import InvoiceCard from '../components/InvoiceCard';
import { Invoice } from '../src/types';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // In a real app, you'd fetch from your deployed worker API endpoint
        // For local development: http://localhost:8787/api/invoices
        // For deployed: https://your-worker-domain.workers.dev/api/invoices
        const response = await fetch('/api/invoices'); // Assuming API is proxied or relative path works
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as Invoice[];
        setInvoices(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleViewDetails = (invoiceId: string) => {
    // Navigate to a detail page or open a modal
    console.log(`View details for invoice: ${invoiceId}`);
    // router.push(`/invoices/${invoiceId}`); // Example routing
  };

  const handleEditInvoice = (invoiceId: string) => {
    // Navigate to an edit form page or open a modal
    console.log(`Edit invoice: ${invoiceId}`);
    // router.push(`/invoices/${invoiceId}/edit`); // Example routing
  };

  if (loading) {
    return (
      <Layout title="Invoices">
        <div className="text-center py-10">Loading invoices...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Invoices">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Invoices">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
          <span>Invoices</span>
          {/* Button to add new invoice - linking to a form page */}
          <button className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
            + Add New Invoice
          </button>
        </h2>
        {invoices.length === 0 ? (
          <p>No invoices found. Add your first invoice!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onViewDetails={handleViewDetails}
                onEdit={handleEditInvoice}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoicesPage;
