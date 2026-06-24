import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import InvoiceForm from '../../../components/InvoiceForm';
import { useRouter } from 'next/router';
import { Invoice } from '../../../types';

const EditInvoicePage = () => {
  const router = useRouter();
  const { id } = router.query; // Invoice ID from route

  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || `HTTP ${response.status}`);
        }
        const data = await response.json<Invoice>();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load invoice');
        console.error('Error fetching invoice:', err);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleUpdateInvoice = async (data: Omit<Invoice, 'id' | 'created_at' | 'doc_url' | 'status'> & { id?: string; created_at?: string; doc_url?: string | null; status?: string }) => {
    if (!id) {
      setError('Invoice ID missing');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/invoices/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const errData = await response.json<{ error: string }>();
        throw new Error(errData.error || `HTTP ${response.status}`);
      }
      // On success, go back to invoices list or detail page
      router.push(`/invoices/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice');
      console.error('Error updating invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <Layout title="Edit Invoice">
        <div className="text-center py-10">Loading invoice...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Edit Invoice">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout title="Edit Invoice">
        <div className="text-center py-10">Invoice not found or still loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Invoice ${invoice.id?.substring(0, 8) ?? ''}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Invoice</h2>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <InvoiceForm
          initialData={invoice}
          onSubmit={handleUpdateInvoice}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default EditInvoicePage;
