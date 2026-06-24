import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import InvoiceForm from '../../../components/InvoiceForm';
import { Invoice } from '../../../src/types';
import { api, ApiError } from '../../../lib/api';

const EditInvoicePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Invoice>(`/api/invoices/${id}`)
      .then(setInvoice)
      .catch((err: ApiError) => setError(err.message));
  }, [id]);

  const handleUpdate = async (data: Omit<Invoice, 'id' | 'created_at' | 'doc_url'> & { doc_url?: string | null }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.put(`/api/invoices/${id}`, data);
      router.push(`/invoices/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !invoice) return <Layout title="Edit Invoice"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;
  if (!invoice) return <Layout title="Edit Invoice"><div className="text-center py-10">Loading...</div></Layout>;

  return (
    <Layout title={`Edit Invoice ${invoice.id?.substring(0, 8) ?? ''}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Invoice</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <InvoiceForm initialData={invoice} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default EditInvoicePage;
