import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GoogleSheetsService } from 'src/services/google-sheets/google-sheets.service';
import { SubmitBusinessRegistrationCommand } from '../submit-business-registration.command';

const SPREADSHEET_ID = '1MtXzz8Kpf9fZAGWPq-DTyB27tjK-8Y_Ldc-bRY3N6BU';
const SHEET_RANGE = 'Sheet1';

function formatProducts(
  products: SubmitBusinessRegistrationCommand['products'],
): string {
  if (products.length === 0) return '';
  return products
    .map(
      (p, i) => `#${i + 1} | שירות: ${p.service} | מחיר קופה: ${
        p.cashPrice
      } | מחיר אונליין: ${p.onlinePrice} | מחיר וואוצ'ר: ${p.voucherPrice}`,
    )
    .join('\n');
}

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
        cluster,
        address,
        email,
        contactName,
        contactPhone,
        isPrimaryIncome,
        categories,
        marketingDescription,
        targetAudience,
        operatingHours,
        hasImmediateAvailability,
        interestedInOnlineSales,
        revenueImpact,
        revenueImpactOther,
        declarationReadDocs,
        declarationNoRestrictions,
        declarationHasPermits,
        declarationHasFirstAid,
        declarationNoLegalProceedings,
        declarationTaxCompliant,
        declarationAcceptsTerms,
        products,
      } = command;

      const yesNo = (val: boolean) => (val ? 'כן' : 'לא');

      const row = [
        businessName,
        idNumber,
        businessDescription,
        cluster,
        address,
        email,
        contactName,
        contactPhone,
        yesNo(isPrimaryIncome),
        categories.join(', '),
        marketingDescription,
        targetAudience.join(', '),
        operatingHours,
        yesNo(hasImmediateAvailability),
        yesNo(interestedInOnlineSales),
        revenueImpact,
        revenueImpactOther ?? '',
        yesNo(declarationReadDocs),
        yesNo(declarationNoRestrictions),
        yesNo(declarationHasPermits),
        yesNo(declarationHasFirstAid),
        yesNo(declarationNoLegalProceedings),
        yesNo(declarationTaxCompliant),
        yesNo(declarationAcceptsTerms),
        formatProducts(products),
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
