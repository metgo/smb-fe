import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { SendInquiryFundayCommand } from '../send-inquiry-funday.command';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { getCommonEmailFields } from 'src/common/utils/email/common-fields';
import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { DocUploadService } from 'src/modules/doc-upload/doc-upload.service';

@CommandHandler(SendInquiryFundayCommand)
export class SendInquiryFundayHandler
implements ICommandHandler<SendInquiryFundayCommand> {
  constructor(
    private readonly externalApiService: ExternalApiServices,
    private readonly mailchimpService: MailChimpService,
    private readonly docUploadService: DocUploadService,
  ) {}

  async execute(command: SendInquiryFundayCommand): Promise<any> {
    const { body } = command;
    const externalApi = await this.externalApiService.findByIdentifierId(
      body.identifierId,
    );

    const { emailFields } = await getCommonEmailFields(
      externalApi,
      this.docUploadService,
    );

    // send to website email
    await this.mailchimpService.sendTransactionalEmail({
      to: body.websiteEmail,
      templatedId: DynamicEmailTemplate.InquiryFundayToOwner,
      mergeVars: {
        ...emailFields,
        USER_NAME: body.name,
        USER_PHONE: body.phone,
        USER_EMAIL: body.email,
        INQUIRY_DETAILS: body.message,
      },
    });

    // send to user
    await this.mailchimpService.sendTransactionalEmail({
      to: body.email,
      templatedId: DynamicEmailTemplate.InquiryFundayToUser,
      from_email: externalApi?.email,
      from_name: externalApi?.name,
      mergeVars: {
        ...emailFields,
        USER_NAME: body.name,
        INQUIRY_DETAILS: body.message,
      },
    });
  }
}
