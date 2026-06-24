import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Layout from '../../components/Layout';
import InvoiceForm from '../../components/InvoiceForm';
import { useRouter } from 'next/router';
import { Invoice } from '../../src/types';

const NewInvoicePage = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateInvoice = async (data: Omit<Invoice, 'id' | 'created_at' | 'doc_url' | 'status'> & { id?: string; created_at?: string; doc_url?: string | null; status?: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/invoices', { // Fetch from our worker API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // On successful creation, redirect to the invoices list page
      router.push('/invoices');
    } catch (err: any) {
      setError(err.message || 'Failed to add invoice');
      console.error('Error adding invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Add New Invoice">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Invoice</h2>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <InvoiceForm onSubmit={handleCreateInvoice} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default NewInvoicePage;
