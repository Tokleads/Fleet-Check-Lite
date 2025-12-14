import { PassThrough } from 'stream';

interface GoogleDriveConfig {
  refreshToken: string;
  folderId?: string;
}

interface UploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  error?: string;
}

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

export class GoogleDriveService {
  private async getAccessToken(refreshToken: string): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async uploadPDF(
    pdfStream: PassThrough,
    filename: string,
    config: GoogleDriveConfig
  ): Promise<UploadResult> {
    try {
      const accessToken = await this.getAccessToken(config.refreshToken);

      const chunks: Buffer[] = [];
      for await (const chunk of pdfStream) {
        chunks.push(Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);

      const metadata = {
        name: filename,
        mimeType: 'application/pdf',
        ...(config.folderId && { parents: [config.folderId] }),
      };

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartBody = Buffer.concat([
        Buffer.from(delimiter),
        Buffer.from('Content-Type: application/json; charset=UTF-8\r\n\r\n'),
        Buffer.from(JSON.stringify(metadata)),
        Buffer.from(delimiter),
        Buffer.from('Content-Type: application/pdf\r\n\r\n'),
        pdfBuffer,
        Buffer.from(closeDelimiter),
      ]);

      const uploadResponse = await fetch(
        `${GOOGLE_DRIVE_UPLOAD_URL}?uploadType=multipart&fields=id,webViewLink`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        return { success: false, error: `Upload failed: ${error}` };
      }

      const result = await uploadResponse.json();
      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testConnection(refreshToken: string): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const accessToken = await this.getAccessToken(refreshToken);
      
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to connect to Google Drive' };
      }

      const data = await response.json();
      return { success: true, email: data.user?.emailAddress };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async createFolder(
    refreshToken: string,
    folderName: string,
    parentFolderId?: string
  ): Promise<{ success: boolean; folderId?: string; error?: string }> {
    try {
      const accessToken = await this.getAccessToken(refreshToken);

      const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] }),
      };

      const response = await fetch(`${GOOGLE_DRIVE_API_URL}?fields=id`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed to create folder: ${error}` };
      }

      const result = await response.json();
      return { success: true, folderId: result.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
