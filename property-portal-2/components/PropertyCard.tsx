import React from 'react';
import { Property } from '../types'; // Assuming types are shared or accessible

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <h3 className="text-lg font-semibold text-blue-700 mb-2">{property.name}</h3>
      <p className="text-gray-600 text-sm mb-1">
        {property.address || 'Address not available'}
      </p>
      <p className="text-gray-500 text-xs">
        Added: {new Date(property.created_at).toLocaleDateString()}
      </p>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={() => window.location.href = `/properties/${property.id}`}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => window.location.href = `/properties/${property.id}/edit`}
          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default PropertyCard;
