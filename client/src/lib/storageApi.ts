/**
 * Storage API Client
 * Frontend utilities for interacting with the enterprise storage system
 */

export interface StorageFile {
  id: number;
  companyId: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  objectStoragePath: string;
  objectStorageUrl: string | null;
  driveFileId: string | null;
  driveUrl: string | null;
  entityType: string;
  entityId: number;
  retentionUntil: string;
  isArchived: boolean;
  uploadedBy: number;
  uploadedAt: string;
  lastAccessedAt: string | null;
  accessCount: number;
}

export interface UploadFileParams {
  companyId: number;
  entityType: 'INSPECTION' | 'FUEL' | 'DEFECT' | 'DOCUMENT' | 'COLLISION';
  entityId: number;
  file: File;
  uploadedBy: number;
}

export interface ComplianceReport {
  totalFiles: number;
  totalSizeBytes: number;
  filesByType: Record<string, number>;
  oldestFile: string | null;
  newestFile: string | null;
}

/**
 * Convert File to base64 string for API upload
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file to Object Storage
 */
export async function uploadFile(params: UploadFileParams): Promise<StorageFile> {
  const fileData = await fileToBase64(params.file);

  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyId: params.companyId,
      entityType: params.entityType,
      entityId: params.entityId,
      filename: params.file.name,
      mimeType: params.file.type,
      uploadedBy: params.uploadedBy,
      fileData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }

  return response.json();
}

/**
 * Upload inspection photo (convenience method)
 */
export async function uploadInspectionPhoto(params: {
  companyId: number;
  inspectionId: number;
  file: File;
  uploadedBy: number;
}): Promise<StorageFile> {
  const fileData = await fileToBase64(params.file);

  const response = await fetch('/api/inspections/upload-photo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyId: params.companyId,
      inspectionId: params.inspectionId,
      filename: params.file.name,
      mimeType: params.file.type,
      uploadedBy: params.uploadedBy,
      fileData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload photo');
  }

  return response.json();
}

/**
 * Get signed URL for file access
 */
export async function getFileUrl(params: {
  fileId: number;
  userId: number;
  companyId: number;
}): Promise<string> {
  const response = await fetch(
    `/api/storage/file/${params.fileId}?userId=${params.userId}&companyId=${params.companyId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get file URL');
  }

  const data = await response.json();
  return data.url;
}

/**
 * List all files for an entity
 */
export async function listFiles(params: {
  entityType: string;
  entityId: number;
  companyId: number;
}): Promise<StorageFile[]> {
  const response = await fetch(
    `/api/storage/list/${params.entityType}/${params.entityId}?companyId=${params.companyId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to list files');
  }

  return response.json();
}

/**
 * Get DVSA compliance report
 */
export async function getComplianceReport(params: {
  companyId: number;
  startDate: Date;
  endDate: Date;
}): Promise<ComplianceReport> {
  const response = await fetch(
    `/api/storage/compliance-report/${params.companyId}?startDate=${params.startDate.toISOString()}&endDate=${params.endDate.toISOString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get compliance report');
  }

  return response.json();
}

/**
 * Download file directly
 */
export async function downloadFile(params: {
  fileId: number;
  userId: number;
  companyId: number;
  filename: string;
}): Promise<void> {
  const url = await getFileUrl({
    fileId: params.fileId,
    userId: params.userId,
    companyId: params.companyId,
  });

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = params.filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format date for display
 */
export function formatUploadDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Get file icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (isImageFile(mimeType)) return '🖼️';
  if (isPdfFile(mimeType)) return '📄';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  return '📁';
}
