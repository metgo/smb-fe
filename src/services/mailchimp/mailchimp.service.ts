// mailchimp.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

import { ConfigService } from 'src/services/config/config.service';

@Injectable()
export class MailChimpService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async subscribe(email: string): Promise<AxiosResponse> {
    const baseUrl = this.configService.email.MAILCHIMP_BASE_URL;
    const audience = this.configService.email.MAILCHIMP_AUDIENCE;
    const apiKey = this.configService.email.MAILCHIMP_API_KEY;

    const url = `${baseUrl}/lists/${audience}/members`;
    const data = {
      email_address: email,
      status: 'subscribed',
    };

    return this.httpService.post(url, data, {
      headers: {
        Authorization: `Basic ${Buffer.from(`apikey:${apiKey}`).toString('base64')}`,
      },
    }).toPromise();
  }
}
