import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Property } from '../../../src/types';

const PropertyDetailPage = () => {
  const router = useRouter();
  const { id } = router.query; // The dynamic route parameter

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Wait for id to be available
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) {
          const errData = await response.json() as any;
          throw new Error(errData.error || `HTTP ${response.status}`);
        }
        const data = await response.json() as Property;
        setProperty(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load property');
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Property Details">
        <div className="text-center py-10">Loading property details...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Property Details">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout title="Property Details">
        <div className="text-center py-10">Property not found.</div>
      </Layout>
    );
  }

  return (
    <Layout title={`Property: ${property.name}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{property.name}</h2>
        <p className="text-gray-700 mb-2"><strong>Address:</strong> {property.address ?? 'N/A'}</p>
        <p className="text-gray-700"><strong>Created At:</strong> {new Date(property.created_at).toLocaleString()}</p>
        {/* Add more property details as needed, e.g., related invoices, maintenance tasks */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => router.push(`/properties/${property.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Edit Property
          </button>
          <button
            onClick={() => router.push('/properties')}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
          >
            Back to List
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetailPage;
