import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import PropertyForm from '../../components/PropertyForm';
import { useRouter } from 'next/router';
import { Property } from '../../types'; // Assuming types are accessible

const EditPropertyPage = () => {
  const router = useRouter();
  const { id } = router.query; // Get property ID from URL parameters

  const [property, setProperty] = useState<Partial<Property> | null>(null); // Use Partial for potentially incomplete data
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return; // Wait until ID is available

      try {
        // Fetch property details from the API
        // Assuming an endpoint like /api/properties/[id] exists or can be created
        const response = await fetch(`/api/properties/${id}`); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json<Property>();
        setProperty(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch property details');
        console.error('Error fetching property:', err);
      }
    };

    fetchProperty();
  }, [id]); // Re-run effect if ID changes

  const handleUpdateProperty = async (data: { name: string; address?: string | null }) => {
    if (!id || !property) {
      setError('Property ID not found or property data is missing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/properties/${id}`, { // Target the specific property for update
        method: 'PUT', // Assuming a PUT method for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json<{ error: string }>();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // On successful update, redirect to the properties list or detail page
      router.push('/properties');
    } catch (err: any) {
      setError(err.message || 'Failed to update property');
      console.error('Error updating property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return (
      <Layout title="Edit Property">
        <div className="text-center py-10">Loading property...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Edit Property">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout title="Edit Property">
        <div className="text-center py-10">Property not found or still loading...</div>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit Property: ${property.name || 'Untitled'}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Property</h2>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <PropertyForm
          initialData={property} // Pass fetched data to pre-fill form
          onSubmit={handleUpdateProperty}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default EditPropertyPage;
