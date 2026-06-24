import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Invoice } from '../../../src/types';
import { api, ApiError } from '../../../lib/api';

const InvoiceDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Invoice>(`/api/invoices/${id}`)
      .then(setInvoice)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Invoice Details"><div className="text-center py-10">Loading...</div></Layout>;
  if (error) return <Layout title="Invoice Details"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;
  if (!invoice) return <Layout title="Invoice Details"><div className="text-center py-10">Invoice not found.</div></Layout>;

  const documentUrl = invoice.doc_url ? `/cdn-assets/${invoice.doc_url}` : null;

  return (
    <Layout title={`Invoice ${invoice.id.substring(0, 8)}…`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Invoice Details</h2>
        <dl className="space-y-2 text-sm text-gray-700">
          <div><dt className="font-semibold inline">Invoice ID: </dt><dd className="inline">{invoice.id}</dd></div>
          <div><dt className="font-semibold inline">Property ID: </dt><dd className="inline">{invoice.property_id}</dd></div>
          <div><dt className="font-semibold inline">Vendor ID: </dt><dd className="inline">{invoice.vendor_id}</dd></div>
          <div><dt className="font-semibold inline">Amount: </dt><dd className="inline font-bold text-blue-600">{invoice.amount.toFixed(2)} {invoice.currency}</dd></div>
          <div><dt className="font-semibold inline">Status: </dt><dd className="inline">{invoice.status}</dd></div>
          <div><dt className="font-semibold inline">Due Date: </dt><dd className="inline">{new Date(invoice.due_date).toLocaleDateString()}</dd></div>
          {invoice.description && <div><dt className="font-semibold inline">Description: </dt><dd className="inline">{invoice.description}</dd></div>}
          <div>
            <dt className="font-semibold inline">Document: </dt>
            {documentUrl
              ? <dd className="inline"><a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Document</a></dd>
              : <dd className="inline text-gray-400">None attached</dd>}
          </div>
          <div><dt className="font-semibold inline">Created: </dt><dd className="inline">{new Date(invoice.created_at).toLocaleString()}</dd></div>
        </dl>
        <div className="mt-6 flex space-x-4">
          <button onClick={() => router.push(`/invoices/${invoice.id}/edit`)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Edit Invoice
          </button>
          <button onClick={() => router.push('/invoices')} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300">
            Back to List
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetailPage;
