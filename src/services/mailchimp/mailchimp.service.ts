/* eslint-disable global-require */
import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { Injectable } from '@nestjs/common';
import { HebrewTemplate } from 'src/common/mailchimp/templateId';

import { ConfigService } from 'src/services/config/config.service';
import { sendEmail } from 'src/services/mailchimp/mailchimp.type';

@Injectable()
export class MailChimpService {
  constructor(private readonly configService: ConfigService) {
    const { MARKETING_API_KEY, SERVER_PREFIX } = this.configService.mailchimp;
    mailchimp.setConfig({
      apiKey: MARKETING_API_KEY,
      server: SERVER_PREFIX,
    });
  }

  async subscribe(
    firstName: string,
    lastName: string,
    email: string,
  ): Promise<string> {
    const { AUDIENCE, TAV8_SUPPORT_EMAIL } = this.configService.mailchimp;

    try {
      await mailchimp.lists.addListMember(AUDIENCE, {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          MMERGE5: 'MetGo', // business name
          MMERGE3: '1234', // business address
        },
      });

      return 'Email sent successfully';
    } catch (error) {
      if (error.response && error.response.text) {
        const parsedError = JSON.parse(error.response.text);

        if (parsedError?.title === 'Member Exists') {
          return 'Email already subscribed';
        }
      }

      await this.sendTransactionalEmail({
        to: TAV8_SUPPORT_EMAIL,
        templatedId: HebrewTemplate.FailedToSendEmail,
        mergeVars: {
          EMAIL: email,
        },
        text: `Dear MetGo, We are unable to add this user email: ${email} to audience. Please proceed to add it manually.`,
      });
    }
  }

  async sendTransactionalEmail(body: sendEmail) {
    try {
      const { TRANSACTIONAL_API_KEY, FROM_EMAIL }
        = this.configService.mailchimp;
      const mailchimpTransaction
        = require('@mailchimp/mailchimp_transactional')(TRANSACTIONAL_API_KEY);

      const message: any = {
        from_email: body.from_email || FROM_EMAIL,
        from_name: body.from_name || 'MetGo',
        template: {
          name: body.templatedId,
        },
        to: [{ email: body.to }],
        merge_vars: [
          {
            rcpt: body.to,
            vars: Object.entries(body.mergeVars).map(([name, content]) => ({
              name,
              content,
            })),
          },
        ],
      };

      const response = await mailchimpTransaction.messages.sendTemplate({
        template_name: body.templatedId,
        template_content: [],
        message,
      });

      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
