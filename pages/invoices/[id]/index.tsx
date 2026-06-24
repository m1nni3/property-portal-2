import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Invoice } from '../../../src/types';

const InvoiceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // Invoice ID from the route

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) {
          const errData = await response.json() as any;
          throw new Error(errData.error || `HTTP ${response.status}`);
        }
        const data = await response.json() as Invoice;
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
        console.error('Error fetching invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Invoice Details">
        <div className="text-center py-10">Loading invoice details...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Invoice Details">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout title="Invoice Details">
        <div className="text-center py-10">Invoice not found.</div>
      </Layout>
    );
  }

  // Construct a URL for the attached document if doc_url exists
  const documentUrl = invoice.doc_url ? `/cdn-assets/${invoice.doc_url}` : null;

  return (
    <Layout title={`Invoice ${invoice.id.substring(0, 8)}...`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
        <p className="text-gray-700 mb-1"><strong>Invoice ID:</strong> {invoice.id}</p>
        <p className="text-gray-700 mb-1"><strong>Property ID:</strong> {invoice.property_id}</p>
        <p className="text-gray-700 mb-1"><strong>Vendor ID:</strong> {invoice.vendor_id}</p>
        <p className="text-gray-700 mb-1"><strong>Amount:</strong> {invoice.amount.toFixed(2)} {invoice.currency}</p>
        <p className="text-gray-700 mb-1"><strong>Status:</strong> {invoice.status}</p>
        <p className="text-gray-700 mb-1"><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
        {invoice.description && (
          <p className="text-gray-700 mb-1"><strong>Description:</strong> {invoice.description}</p>
        )}
        {documentUrl ? (
          <p className="text-gray-700 mb-1">
            <strong>Document:</strong> <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Document</a>
          </p>
        ) : (
          <p className="text-gray-500">No document attached.</p>
        )}
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(invoice.created_at).toLocaleString()}</p>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Edit Invoice
          </button>
          <button
            onClick={() => router.push('/invoices')}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
