import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import PropertyForm from '../../../components/PropertyForm';
import { Property } from '../../../src/types';
import { api, ApiError } from '../../../lib/api';

const EditPropertyPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [property, setProperty] = useState<Partial<Property> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Property>(`/api/properties/${id}`)
      .then(setProperty)
      .catch((err: ApiError) => setError(err.message));
  }, [id]);

  const handleUpdate = async (data: { name: string; address?: string | null }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.put(`/api/properties/${id}`, data);
      router.push('/properties');
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !property) return <Layout title="Edit Property"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;
  if (!property) return <Layout title="Edit Property"><div className="text-center py-10">Loading...</div></Layout>;

  return (
    <Layout title={`Edit Property: ${property.name ?? ''}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Property</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <PropertyForm initialData={property} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default EditPropertyPage;
