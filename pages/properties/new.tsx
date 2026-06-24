import React, { useState } from 'react';
import Layout from '../../components/Layout';
import PropertyForm from '../../components/PropertyForm';
import { useRouter } from 'next/router'; // For client-side routing

const NewPropertyPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateProperty = async (data: { name: string; address?: string | null }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/properties', { // Fetch from our worker API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json<{ error: string }>();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // On successful creation, redirect to the properties list
      router.push('/properties');
    } catch (err: any) {
      setError(err.message || 'Failed to add property');
      console.error('Error adding property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Add New Property">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add New Property</h2>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <PropertyForm onSubmit={handleCreateProperty} isSubmitting={isSubmitting} />
      </div>
    </Layout>
  );
};

export default NewPropertyPage;
