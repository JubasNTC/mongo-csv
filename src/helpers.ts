import * as fs from 'fs';

import { google, drive_v2 } from 'googleapis';

interface IDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
  refreshToken: string;
}

const driveFactory = ({
  clientId,
  clientSecret,
  redirectUri,
  accessToken,
  refreshToken,
}: IDriveConfig): drive_v2.Drive => {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const drive: drive_v2.Drive = google.drive({
    version: 'v2',
    auth: oauth2Client,
  });

  return drive;
};

interface IDownloadOptions {
  drive: drive_v2.Drive;
  fileId: string;
  destination: string;
}

const downloadFile = async ({
  drive,
  fileId,
  destination,
}: IDownloadOptions): Promise<void> => {
  const dest = fs.createWriteStream(destination);

  return new Promise((resolve, reject) => {
    drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
      (err: Error | null, res: any) => {
        if (err) {
          reject(err);
        }

        res.data.on('finish', resolve).on('error', reject).pipe(dest);
      }
    );
  });
};

export { downloadFile, driveFactory, IDriveConfig };
