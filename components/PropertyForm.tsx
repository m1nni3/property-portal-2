import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Property } from '../src/types';

interface PropertyFormProps {
  initialData?: Partial<Property>; // For editing, not used now but good practice
  onSubmit: (data: { name: string; address?: string | null }) => void;
  isSubmitting: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [name, setName] = useState<string>(initialData.name || '');
  const [address, setAddress] = useState<string | null>(initialData.address || null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!name.trim()) {
      alert('Property name is required.');
      return;
    }
    onSubmit({ name: name.trim(), address: address?.trim() || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
          Property Name
        </label>
        <input
          type="text"
          id="propertyName"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="propertyAddress"
          value={address || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Saving...' : 'Save Property'}
      </button>
    </form>
  );
};

export default PropertyForm;
