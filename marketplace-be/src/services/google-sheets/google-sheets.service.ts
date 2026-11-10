// google-sheets.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { sheets_v4 } from 'googleapis';
import { exceptionHandling } from 'src/common/utils/exception-handling';

@Injectable()
export class GoogleSheetsService {
  constructor(
    @Inject('GoogleSheets') private readonly sheets: sheets_v4.Sheets,
  ) {}

  async batchGetValues(spreadsheetId: string, ranges: string[]) {
    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    return response.data;
  }

  async appendRow(spreadsheetId: string, range: string, values: any[]) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });

      return response.data;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
