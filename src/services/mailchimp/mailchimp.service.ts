import mailchimp from '@mailchimp/mailchimp_marketing';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from 'src/services/config/config.service';

@Injectable()
export class MailChimpService {
  constructor(private readonly configService: ConfigService) {}

  async subscribe(firstName: string, lastName: string, email: string): Promise<string> {
    const { MAILCHIMP_AUDIENCE, MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX } = this.configService.email;

    mailchimp.setConfig({
      apiKey: MAILCHIMP_API_KEY,
      server: MAILCHIMP_SERVER_PREFIX,
    });

    try {
      await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE, {
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

      throw new InternalServerErrorException('Couldn\'t send email');
    }
  }

  async sendTransactionalEmail() {
    const { MAILCHIMP_API_KEY } = this.configService.email;

    // eslint-disable-next-line global-require
    const mailchimpTransaction = require('@mailchimp/mailchimp_transactional')(MAILCHIMP_API_KEY);

    const message = {
      from_email: 'prism@pacecode.com.np',
      subject: 'Hello world',
      text: 'Welcome to Mailchimp Transactional!',
      to: [
        {
          email: 'pc.prism.np@gmail.com',
          type: 'to',
        },
      ],
    };

    try {
      const response = await mailchimpTransaction.messages.send({ message });
      console.log('Email sent successfully:', response);
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}
