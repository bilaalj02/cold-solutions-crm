'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LeadImportModalProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export default function LeadImportModal({ onClose, onImportComplete }: LeadImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/business-intelligence/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        alert('Import failed: ' + data.error);
      } else {
        setResult(data);
        if (data.imported > 0) {
          setTimeout(() => {
            onImportComplete();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Import Leads from CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
          <div className="bg-gray-50 p-4 rounded text-sm">
            <p className="mb-2">Required columns:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>business_name</strong> - Name of the business</li>
              <li><strong>city</strong> - City location</li>
              <li><strong>country</strong> - Country</li>
            </ul>
            <p className="mt-3 mb-2">Optional columns:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>industry, website, state, address, zip_code, phone, google_maps_url</li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Select CSV File:</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {result && (
          <div className="mb-6 p-4 rounded bg-green-50 border border-green-200">
            <h3 className="font-semibold mb-2 text-green-800">Import Results:</h3>
            <div className="space-y-1 text-sm">
              <p>✅ Imported: <strong>{result.imported}</strong> leads</p>
              <p>⏭️ Duplicates skipped: <strong>{result.duplicates}</strong></p>
              <p>❌ Errors: <strong>{result.errors}</strong></p>
            </div>

            {result.errorDetails && result.errorDetails.length > 0 && (
              <div className="mt-3">
                <p className="font-medium text-red-600 mb-1">Error Details:</p>
                <div className="max-h-32 overflow-y-auto text-xs">
                  {result.errorDetails.map((error: any, idx: number) => (
                    <p key={idx} className="text-red-600">
                      Row {error.row}: {error.errors.join(', ')}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {importing ? '⏳ Importing...' : '📥 Import CSV'}
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
