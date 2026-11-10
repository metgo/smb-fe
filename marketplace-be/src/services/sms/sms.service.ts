import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ConfigService } from 'src/services/config/config.service';
import { SmsPayload, SmsResponse } from 'src/services/sms/sms.type';

@Injectable()
export class SmsService {
  private readonly apiUrl = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

  constructor(private readonly configService: ConfigService) {}

  async sendSms(command: SmsPayload): Promise<SmsResponse> {
    const token = this.configService.get('SMS_CONFIRM_PURCHASE_TOKEN');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };

    const payload = {
      Message: command.message,
      Recipients: [
        {
          FirstName: command.firstName,
          LastName: command.lastName,
          Phone: command.phone,
        },
      ],
      Settings: {
        Sender: command.sender,
        CampaignName: command.subject,
        ShortenUrlEnable: true,
        TimeToSend: this.getFormattedTime(),
      },
    };

    try {
      const response = await axios.post(
        this.apiUrl,
        { Data: payload },
        { headers },
      );

      console.log('>>>>>>>sms repsonse');

      console.log(response?.data);

      console.log('>>>>>>>sms repsonse');

      if (response && response?.data?.StatusId === 1) {
        console.log('test here response');
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  private getFormattedTime(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 19); // Format TimeToSend
  }
}
