export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: number;
}

export async function listFiles(userId: string, query?: string): Promise<DriveFile[]> {
  // TODO: load OAuth tokens from user_integrations table, use Google Drive API v3
  // GET https://www.googleapis.com/drive/v3/files?q=...&fields=files(id,name,mimeType,modifiedTime,webViewLink,size)
  return [];
}

export async function getFile(userId: string, fileId: string): Promise<DriveFile | null> {
  // TODO: GET https://www.googleapis.com/drive/v3/files/{fileId}
  return null;
}

export async function createDocument(userId: string, title: string, content: string): Promise<DriveFile> {
  // TODO: POST to Google Docs API to create a document with the given content
  return {
    id: `placeholder-${Date.now()}`,
    name: title,
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: undefined,
  };
}
