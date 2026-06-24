import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import InvoiceForm from '../../components/InvoiceForm';
import { Invoice } from '../../src/types';
import { api, ApiError } from '../../lib/api';

const NewInvoicePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: Omit<Invoice, 'id' | 'created_at' | 'doc_url'> & { doc_url?: string | null }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post<Invoice>('/api/invoices', data);
      router.push('/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Add New Invoice">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Invoice</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <InvoiceForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
