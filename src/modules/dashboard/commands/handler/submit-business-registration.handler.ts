import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { SubmitBusinessRegistrationCommand } from '../submit-business-registration.command';

const SPREADSHEET_ID = '1MtXzz8Kpf9fZAGWPq-DTyB27tjK-8Y_Ldc-bRY3N6BU';
const SHEET_RANGE = 'Sheet1';

@CommandHandler(SubmitBusinessRegistrationCommand)
export class SubmitBusinessRegistrationHandler
implements ICommandHandler<SubmitBusinessRegistrationCommand> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async execute(command: SubmitBusinessRegistrationCommand) {
    try {
      const {
        businessName,
        idNumber,
        businessDescription,
        address,
        landlinePhone,
        fax,
        email,
        contactName,
        contactPhone,
        isPrimaryIncome,
        categories,
      } = command;

      const row = [
        businessName,
        idNumber,
        businessDescription,
        address,
        landlinePhone,
        fax,
        email,
        contactName,
        contactPhone,
        isPrimaryIncome ? 'כן' : 'לא',
        categories.join(', '),
        new Date().toLocaleString('he-IL'),
      ];

      await this.googleSheetsService.appendRow(
        SPREADSHEET_ID,
        SHEET_RANGE,
        row,
      );

      this.logger.info(
        '[BUSINESS REGISTRATION]: Row appended to Google Sheet',
        {
          businessName,
        },
      );

      return { success: true };
    } catch (error) {
      this.logger.error('[BUSINESS REGISTRATION]: FAILED TO APPEND ROW', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }
}
