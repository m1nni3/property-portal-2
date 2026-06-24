import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../src/types';
import { api, ApiError } from '../lib/api';

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Property[]>('/api/properties')
      .then(setProperties)
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Properties"><div className="text-center py-10">Loading properties...</div></Layout>;
  if (error) return <Layout title="Properties"><div className="text-center py-10 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout title="Properties">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Properties</h2>
          <Link href="/properties/new" className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
            + Add New Property
          </Link>
        </div>
        {properties.length === 0 ? (
          <p>No properties found. Add your first property!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => <PropertyCard key={prop.id} property={prop} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertiesPage;
