import { Provider } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';
import { ConfigService } from 'src/services/config/config.service';

export const GoogleSheetsProvider: Provider = {
  provide: 'GoogleSheets',
  useFactory: async (): Promise<sheets_v4.Sheets> => {
    const configService = new ConfigService();

    const auth = new google.auth.GoogleAuth({
      keyFile: configService.get('GCS_FILE_PATH'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = (await auth.getClient()) as any;

    const sheets = google.sheets({
      version: 'v4',
      auth: authClient,
    });

    return sheets;
  },
};
