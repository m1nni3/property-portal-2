import React from 'react';
import { Invoice } from '../workers/src/types'; // Assuming types are shared or accessible

interface InvoiceCardProps {
  invoice: Invoice;
  onViewDetails?: (invoiceId: string) => void;
  onEdit?: (invoiceId: string) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onViewDetails, onEdit }) => {
  const formattedDueDate = new Date(invoice.due_date).toLocaleDateString();
  const statusColorClass = {
    pending: 'bg-yellow-200 text-yellow-800',
    paid: 'bg-green-200 text-green-800',
    overdue: 'bg-red-200 text-red-800',
    cancelled: 'bg-gray-200 text-gray-800',
  };

  // Construct the full R2 URL if doc_url is a key
  // This assumes your R2 bucket is configured for public access OR you have a way to serve files
  // For Cloudflare R2, you might need to construct the URL based on your bucket's domain or access pattern
  // Example: 'https://<your-bucket-name>.<your-account-id>.r2.cloudflarestorage.com/<fileKey>'
  // Or if using Cloudflare Pages/Workers redirects: '/cdn-assets/' + invoice.doc_url
  // For now, assuming doc_url is a key within an accessible R2 bucket.
  const documentUrl = invoice.doc_url ? `/cdn-assets/${invoice.doc_url}` : null; // Placeholder for how R2 URLs might be served

  return (
    <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-blue-700 truncate" title={`Invoice ID: ${invoice.id}`}>
            {invoice.id.substring(0, 8)}... {/* Short invoice ID */}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorClass[invoice.status]}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-1">
          Property ID: {invoice.property_id.substring(0, 6)}...
        </p>
        <p className="text-gray-600 text-sm mb-1">
          Vendor ID: {invoice.vendor_id.substring(0, 6)}...
        </p>
        <p className="text-blue-600 font-bold text-lg mb-2">
          {invoice.amount.toFixed(2)} {invoice.currency}
        </p>
        <p className="text-gray-500 text-xs">
          Due: {formattedDueDate}
        </p>
        {documentUrl ? (
          <p className="text-xs text-blue-500 truncate" title={invoice.doc_url}>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer">View Document</a>
          </p>
        ) : (
          <p className="text-xs text-gray-400">No document attached</p>
        )}
      </div>
      <div className="mt-4 flex space-x-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => window.location.href = `/invoices/${invoice.id}`}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => window.location.href = `/invoices/${invoice.id}/edit`}
          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;
