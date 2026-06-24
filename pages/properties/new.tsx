import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import PropertyForm from '../../components/PropertyForm';
import { api, ApiError } from '../../lib/api';
import { Property } from '../../src/types';

const NewPropertyPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProperty = async (data: { name: string; address?: string | null }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post<Property>('/api/properties', data);
      router.push('/properties');
    } catch (err: any) {
      setError(err.message || 'Failed to add property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Add New Property">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Property</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <PropertyForm onSubmit={handleCreateProperty} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default NewPropertyPage;
