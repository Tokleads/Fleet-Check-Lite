import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileIcon, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageFile {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  objectStoragePath: string;
  entityType: string;
  entityId: number;
  uploadedAt: string;
  uploadedBy: number;
}

interface FileViewerProps {
  entityType: string;
  entityId: number;
  companyId: number;
  userId: number;
  className?: string;
}

export function FileViewer({ entityType, entityId, companyId, userId, className }: FileViewerProps) {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFiles();
  }, [entityType, entityId, companyId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/storage/list/${entityType}/${entityId}?companyId=${companyId}`
      );

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: StorageFile) => {
    try {
      setDownloadingFiles(prev => new Set(prev).add(file.id));

      // Get signed URL
      const response = await fetch(
        `/api/storage/file/${file.id}?userId=${userId}&companyId=${companyId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get file URL');
      }

      const { url } = await response.json();

      // Download file
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download file');
    } finally {
      setDownloadingFiles(prev => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
    }
  };

  const viewFile = async (file: StorageFile) => {
    try {
      // Get signed URL
      const response = await fetch(
        `/api/storage/file/${file.id}?userId=${userId}&companyId=${companyId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get file URL');
      }

      const { url } = await response.json();

      // Open in new tab
      window.open(url, '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to view file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  };

  if (loading) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading files...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="text-center text-destructive">
          <p className="font-semibold">Error loading files</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" onClick={loadFiles} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="text-center text-muted-foreground">
          <FileIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No files uploaded yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Files ({files.length})
        </h3>
        <Button variant="outline" size="sm" onClick={loadFiles}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            {/* File Preview */}
            <div className="aspect-video bg-muted flex items-center justify-center relative group">
              {isImage(file.mimeType) ? (
                <>
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => viewFile(file)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </>
              ) : (
                <FileIcon className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {/* File Info */}
            <div className="p-4">
              <p className="text-sm font-medium truncate mb-1" title={file.filename}>
                {file.filename}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{formatFileSize(file.sizeBytes)}</span>
                <span>{formatDate(file.uploadedAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {isImage(file.mimeType) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => viewFile(file)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => downloadFile(file)}
                  disabled={downloadingFiles.has(file.id)}
                >
                  {downloadingFiles.has(file.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
