import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PropertyCard from '../components/PropertyCard';
import { Property } from '../src/types';

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // In a real app, you'd fetch from your deployed worker API endpoint
        // For local development: http://localhost:8787/api/properties
        // For deployed: https://your-worker-domain.workers.dev/api/properties
        const response = await fetch('/api/properties'); // Assuming API is proxied or relative path works
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as Property[];
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <Layout title="Properties">
        <div className="text-center py-10">Loading properties...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Properties">
        <div className="text-center py-10 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout title="Properties">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
          <span>Properties</span>
          {/* Button to add new property - linking to a form page */}
          <button className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
            + Add New Property
          </button>
        </h2>
        {properties.length === 0 ? (
          <p>No properties found. Add your first property!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertiesPage;
