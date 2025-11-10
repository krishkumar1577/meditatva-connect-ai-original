import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  FileImage, FileText, Download, Eye, AlertTriangle
} from 'lucide-react';

interface PrescriptionViewerProps {
  requestId: string;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

interface PrescriptionData {
  prescriptionUrl: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({ 
  requestId, 
  trigger,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescription = async () => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/medicine-requests/${requestId}/prescription`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        setPrescription(result.data);
      } else {
        if (response.status === 404) {
          setError('No prescription uploaded for this request');
        } else if (response.status === 403) {
          setError('You are not authorized to view this prescription');
        } else {
          setError(result.message || 'Failed to load prescription');
        }
      }
    } catch (err) {
      console.error('Prescription fetch error:', err);
      setError('Failed to load prescription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && requestId) {
      fetchPrescription();
    }
  }, [isOpen, requestId]);

  const handleDownload = () => {
    if (!prescription) return;

    try {
      // Create a download link
      const link = document.createElement('a');
      link.href = prescription.prescriptionUrl;
      link.download = prescription.originalName || 'prescription';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Prescription download started');
    } catch (err) {
      toast.error('Failed to download prescription');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const isPdf = prescription?.mimeType === 'application/pdf';
  const isImage = prescription?.mimeType.startsWith('image/');

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Eye className="h-4 w-4" />
      View Prescription
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="h-5 w-5" />
            ) : (
              <FileImage className="h-5 w-5" />
            )}
            Prescription Document
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading prescription...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={fetchPrescription}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : prescription ? (
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {isPdf ? (
                    <FileText className="h-4 w-4 text-red-600" />
                  ) : (
                    <FileImage className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium">{prescription.originalName}</span>
                </div>
                <Badge variant="outline">
                  {isPdf ? 'PDF' : 'Image'}
                </Badge>
                <Badge variant="secondary">
                  {formatFileSize(prescription.fileSize)}
                </Badge>
                <span className="text-sm text-gray-500 ml-auto">
                  Uploaded: {formatDate(prescription.uploadedAt)}
                </span>
              </div>

              {/* Document Viewer */}
              <div className="border rounded-lg overflow-hidden bg-white">
                {isPdf ? (
                  <div className="h-96 flex flex-col">
                    <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                      <span className="text-sm font-medium">PDF Document</span>
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <iframe
                        src={prescription.prescriptionUrl}
                        className="w-full h-full border-0"
                        title="Prescription PDF"
                      />
                    </div>
                  </div>
                ) : isImage ? (
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-2 bg-white/90 hover:bg-white text-gray-700"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <img
                      src={prescription.prescriptionUrl}
                      alt="Prescription"
                      className="w-full h-auto max-h-[600px] object-contain"
                      onError={(e) => {
                        console.error('Image load error');
                        setError('Failed to load prescription image');
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-4">File type not supported for preview</p>
                    <Button
                      onClick={handleDownload}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download File
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
                {!isPdf && isImage && (
                  <Button
                    onClick={() => window.open(prescription.prescriptionUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionViewer;