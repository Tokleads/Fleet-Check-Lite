import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  maxSizeMB = 10,
  multiple = false,
  disabled = false,
  label = 'Upload Files',
  description = 'Drag and drop files here, or click to select'
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        newFiles.push({
          file,
          status: 'error',
          error: `File size exceeds ${maxSizeMB}MB`
        });
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        file,
        preview,
        status: 'pending'
      });
    }

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);

    // Auto-upload files
    for (const uploadFile of newFiles) {
      if (uploadFile.status === 'pending') {
        await uploadFile_(uploadFile);
      }
    }
  };

  const uploadFile_ = async (uploadFile: UploadedFile) => {
    setFiles(prev =>
      prev.map(f => f.file === uploadFile.file ? { ...f, status: 'uploading' } : f)
    );

    try {
      await onUpload(uploadFile.file);
      setFiles(prev =>
        prev.map(f => f.file === uploadFile.file ? { ...f, status: 'success' } : f)
      );
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.file === uploadFile.file
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
    }
  };

  const removeFile = (file: File) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.file !== file);
      // Revoke object URL to prevent memory leaks
      const removed = prev.find(f => f.file === file);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <Button type="button" variant="outline" disabled={disabled}>
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: {maxSizeMB}MB
          </p>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt={uploadFile.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.error && (
                    <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {uploadFile.status === 'success' && (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {uploadFile.status === 'error' && (
                    <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                      <X className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(uploadFile.file);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
