import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { Property } from '../../../src/types';
import { api, ApiError } from '../../../lib/api';

const PropertyDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Property>(`/api/properties/${id}`)
      .then(setProperty)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Property Details"><div className="text-center py-10">Loading...</div></Layout>;
  if (error) return <Layout title="Property Details"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;
  if (!property) return <Layout title="Property Details"><div className="text-center py-10">Property not found.</div></Layout>;

  return (
    <Layout title={`Property: ${property.name}`}>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{property.name}</h2>
        <p className="text-gray-700 mb-2"><strong>Address:</strong> {property.address ?? 'N/A'}</p>
        <p className="text-gray-700"><strong>Created:</strong> {new Date(property.created_at).toLocaleString()}</p>
        <div className="mt-6 flex space-x-4">
          <button onClick={() => router.push(`/properties/${property.id}/edit`)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            Edit Property
          </button>
          <button onClick={() => router.push('/properties')} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300">
            Back to List
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetailPage;
