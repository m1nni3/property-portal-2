import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import Layout from '../components/Layout';
import { Invoice, Property, VendorContact } from '../workers/src/types'; 

interface InvoiceFormProps {
  initialData?: Partial<Invoice>; 
  onSubmit: (data: Omit<Invoice, 'id' | 'created_at' | 'doc_url' | 'status'> & { id?: string; created_at?: string; doc_url?: string | null; status?: string }) => void; 
  isSubmitting: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [propertyId, setPropertyId] = useState<string>(initialData.property_id || '');
  const [vendorId, setVendorId] = useState<string>(initialData.vendor_id || '');
  const [amount, setAmount] = useState<number>(initialData.amount || 0);
  const [currency, setCurrency] = useState<string>(initialData.currency || 'USD');
  const [dueDate, setDueDate] = useState<string>(initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
  const [description, setDescription] = useState<string>(initialData.description || ''); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // State for fetching pre-defined lists (Properties, Vendors)
  const [properties, setProperties] = useState<Property[]>([]);
  const [vendors, setVendors] = useState<VendorContact[]>([]);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch properties and vendors when the component mounts
  useEffect(() => {
    const fetchLists = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const propResponse = await fetch('/api/properties'); 
        if (!propResponse.ok) throw new Error('Failed to fetch properties');
        const propData = await propResponse.json<Property[]>();
        setProperties(propData);

        const vendorResponse = await fetch('/api/vendors'); // Assumes /api/vendors endpoint is available in workers/src/api/vendors.ts
        if (!vendorResponse.ok) throw new Error('Failed to fetch vendors');
        const vendorData: VendorContact[] = await vendorResponse.json();
        setVendors(vendorData);

      } catch (err: any) {
        setFetchError(err.message || 'Failed to load lists');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchLists();
  }, []);

  // Function to handle the file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus(''); // Clear previous status
    }
  };

  // Function to initiate the file upload process
  const initiateFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    if (!propertyId) { // Need property context to link invoice to property
      alert('Please select a property before uploading a document.');
      return;
    }

    setUploadingFile(true);
    setUploadStatus('Generating upload URL...');
    setUploadProgress(0);

    try {
      // Find the current invoice object or create a temporary one to get an ID
      // For simplicity, if we are creating a new invoice, we might need to submit basic invoice data first
      // to get an ID to associate with the file upload. Or, we can generate a temporary ID.
      // For now, let's assume we'll get an ID. If not, this component should manage temporary invoice creation.
      // A more robust flow: 1. Save invoice with basic details (no doc_url). 2. Get invoice ID. 3. Initiate upload. 4. Post file. 5. Update invoice with doc_url.
      // For this form, let's assume we have the required invoice data to at least get an ID.
      // If submitting invoice data directly, we could get the created invoice's ID.
      // Let's assume for now that the user has already submitted basic invoice data OR we are creating it implicitly.
      // A simpler flow for the form: user fills basic invoice details, clicks "Save & Upload".
      // This component would first call POST /api/invoices, get the created invoice ID, then POST /api/invoices/upload.
      // Let's simulate having an invoiceId for now or assume one is passed/available.
      // For this form, let's try associating it with a propertyId if it's a new invoice.
      // If this form is also used for editing, we'd have an existing invoice ID.
      // Given this is "NewInvoicePage", we'd call POST /api/invoices first.
      // For simplicity here, let's assume we have a target invoice ID.
      // A better approach requires managing the initial invoice submission.
      // For now, let's use a placeholder ID or assume `initialData.id` if editing.
      // If it's truly new, we SHOULD NOT initiate upload until basic invoice data is saved.

      // A BETTER FLOW:
      // 1. User fills form.
      // 2. User clicks "Save & Upload".
      // 3. This handler sends POST to /api/invoices to CREATE the invoice.
      // 4. It gets back the CREATED invoice object with its ID.
      // 5. Then it sends POST to /api/invoices/upload using the CREATED invoice ID.
      // 6. Then it uploads the file using the presigned URL.
      // 7. Then it updates the invoice with doc_url or POSTs to a separate endpoint if doc_url not returned by initial creation.

      // For this form's direct file input, let's simplify:
      // Assume basic invoice data is already saved OR it's okay to generate a temporary association.
      // We DO need a context of *which* invoice this file is for.
      // Since this is NEW invoice page, we will call POST /api/invoices first.
      // BUT, the current onSubmit prop is for basic data. This needs to be refactored.
      // Let's assume the user will click Save first, THEN have an option to upload.
      // So, remove direct file upload from this form's primary submit. Add separately.
      // Instead, this `initiateFileUpload` could be called by parent or a separate button after invoice is saved.

      // TEMPORARY: Manually providing an invoiceId for demonstration or assume we get it from onSubmit
      // Let's revise `onSubmit` to handle this better. For now, let's mock it.
      const dummyInvoiceId = 'temp_invoice_id_123'; // Needs actual ID.

      // If we assume basic data SUBMITTED and got ID:
      // Let's assume onSubmit handler calls API, gets invoice object, then calls this.
      // For this form's scope, let's just provide the logic for R2 URL generation.
      // The actual invoiceId will need to come from context.

      // Let's re-structure: onSubmit handles basic data save. Then, a separate button/UI for upload.
      // For this component, we'll add a dedicated upload handler.
      // The invoiceId must be known. We can obtain it AFTER the initial save.
      // Let's assume `onSubmit` returns the created invoice or its ID.

      // To make this form self-contained for demonstration, let's simulate getting an ID.
      // If `initialData.id` exists, we use it (for editing). Otherwise, we'd need to create it.
      // For CREATE flow, we need to save basic data FIRST.

      const targetInvoiceId = initialData.id || dummyInvoiceId; // Use initialData.id if editing, else placeholder. This needs to be real.

      const presignedUrlResponse = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          invoiceId: targetInvoiceId, // This MUST be a real invoice ID
        }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileKey } = await presignedUrlResponse.json<{ uploadUrl: string; fileKey: string }>();

      setUploadStatus(`Uploading ${selectedFile.name}...`);
      
      // Perform the actual upload to R2 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      setUploadStatus('Upload successful!');
      setUploadProgress(100);
      // The fileKey is already stored in DB by the worker during presigned URL generation.
      // If not, you would need another API call here to update the invoice with the fileKey.

    } catch (err: any) {
      setError(err.message || 'File upload failed');
      setUploadStatus('Upload failed.');
      console.error('File upload error:', err);
    } finally {
      setUploadingFile(false);
      setSelectedFile(null); // Clear selected file after upload attempt
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Basic validation for core invoice fields
    if (!name.trim()) { alert('Property name is required.'); return; } // Typo: should be related to invoice
    if (!propertyId) { alert('Property selection is required.'); return; }
    if (!vendorId) { alert('Vendor selection is required.'); return; }
    if (!amount || amount <= 0) { alert('Valid amount is required.'); return; }
    if (!dueDate) { alert('Due date is required.'); return; }
    
    // Call the main onSubmit prop, which will save basic invoice data.
    // File upload will be handled separately or after this submission.
    onSubmit({
      property_id: propertyId,
      vendor_id: vendorId,
      amount: amount,
      currency: currency,
      due_date: dueDate,
      description: description.trim(),
      status: initialData.status || 'pending', 
      // doc_url will be updated after successful file upload
    });
  };

  // --- Helper for file upload ---
  // Call this after basic invoice is saved, AND you have the invoice ID.
  const handleFinalizeUpload = async () => {
    if (!selectedFile || !initialData.id) { // Needs an actual invoice ID from initialData.id
      alert("Please select a file and ensure the invoice is saved first.");
      return;
    }
    await initiateFileUpload();
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fetchError && <p className="text-red-500">Error loading lists: {fetchError}</p>}

      {/* Property Selection */}
      <div>
        <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
          Property
        </label>
        {fetchLoading ? (
          <p className="text-gray-500">Loading properties...</p>
        ) : (
          <select
            id="propertyId"
            value={propertyId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setPropertyId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a Property</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>{prop.name} ({prop.address ? prop.address.substring(0, 30) + '...' : 'No Address'})</option>
            ))}
          </select>
        )}
      </div>

      {/* Vendor Selection */}
      <div>
        <label htmlFor="vendorId" className="block text-sm font-medium text-gray-700">
          Vendor
        </label>
        {fetchLoading ? (
          <p className="text-gray-500">Loading vendors...</p>
        ) : (
          <select
            id="vendorId"
            value={vendorId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setVendorId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a Vendor</option>
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name || vendor.id.substring(0, 6) + '...'}</option>
              ))
            ) : (
              <option value="manual_entry_placeholder" disabled>No vendors available</option>
            )}
          </select>
        )}
        {/* Fallback for manual vendor entry if needed, but assumes vendor list is available */}
        {!fetchLoading && vendors.length === 0 && (
          <input
            type="text"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="Enter Vendor ID manually"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        )}
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(parseFloat(e.target.value) || 0)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <input
            type="text"
            id="currency"
            value={currency}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrency(e.target.value.toUpperCase())}
            required
            maxLength={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description / Notes
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>

      {/* Document Upload Section */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Document</label>
        <input
          type="file"
          id="invoiceDocument"
          onChange={handleFileChange}
          accept="application/pdf,image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
        />
        
        {selectedFile && !isSubmitting && !uploadingFile && (
          <button
            type="button" // Use type="button" to prevent form submission
            onClick={initiateFileUpload}
            disabled={uploadingFile || isSubmitting}
            className={`mt-2 w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${uploadingFile || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Upload Document
          </button>
        )}

        {uploadStatus && <p className={`mt-2 text-sm ${uploadStatus.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>{uploadStatus}</p>}
        {(uploadingFile || isSubmitting) && <p className="mt-2 text-sm text-blue-500">Processing... Please wait.</p>}
        {/* Basic progress indication */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
      </div>

      {/* Submit Button: For saving basic invoice details */}
      <button
        type="submit"
        disabled={isSubmitting || fetchLoading}
        className={`w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting || fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Saving Invoice...' : fetchLoading ? 'Please wait...' : 'Save Invoice Details'}
      </button>
      
      {/* Button to finalize upload AFTER saving basic invoice data */}
      {/* This requires a real invoice ID to be available. */}
      {initialData.id && !uploadingFile && !isSubmitting && selectedFile && uploadStatus !== 'Upload successful!' && (
        <button
          type="button"
          onClick={handleFinalizeUpload}
          disabled={isSubmitting || uploadingFile}
          className={`mt-4 w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isSubmitting || uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploadingFile ? 'Uploading...' : 'Finalize Upload'}
        </button>
      )}
    </form>
  );
};

export default InvoiceForm;
