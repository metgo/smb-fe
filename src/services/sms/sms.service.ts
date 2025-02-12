import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { ConfigService } from 'src/services/config/config.service';
import { SmsPayload, SmsResponse } from 'src/services/sms/sms.type';
import { SendSmsDto } from 'src/services/sms/dto/sms.dto';
import { BirthdaySmsDto } from 'src/services/sms/dto/sms.birthday.dto';

@Injectable()
export class SmsService {
  private readonly apiUrl = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

  constructor(private readonly configService: ConfigService) {}

  private async sendSms(
    payload: SmsPayload,
    token: string,
  ): Promise<SmsResponse> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: token,
    };

    try {
      const response = await axios.post(
        this.apiUrl,
        { Data: payload },
        { headers },
      );
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

  async sendConfirmPurchaseSms(body: SendSmsDto): Promise<SmsResponse> {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      orderNumber,
      businessName,
      productName,
      price,
    } = body;
    const token = this.configService.get('SMS_CONFIRM_PURCHASE_TOKEN');

    const payload: SmsPayload = {
      Message: `Hello ${firstName} ${lastName}, your purchase of ${productName} from ${businessName} has been confirmed. Order Number: ${orderNumber}, Price: ${price}. Thank you!`,
      Recipients: [
        {
          FirstName: firstName,
          LastName: lastName,
          Phone: `${countryCode}${phone}`,
        },
      ],
      Settings: {
        Sender: 'Business',
        CampaignName: 'Purchase Confirmation',
        TimeToSend: this.getFormattedTime(),
      },
    };

    return await this.sendSms(payload, token);
  }

  async sendStatusDeliverySms(body: SendSmsDto): Promise<SmsResponse> {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      orderNumber,
      businessName,
      productName,
      price,
    } = body;
    const token = this.configService.get('SMS_STATUS_DELIVERY_TOKEN');

    const payload: SmsPayload = {
      Message: `Hello ${firstName} ${lastName}, your order ${orderNumber} for ${productName} from ${businessName} is now. Price: ${price}. Thank you for shopping with us!`,
      Recipients: [
        {
          FirstName: firstName,
          LastName: lastName,
          Phone: `${countryCode}${phone}`,
        },
      ],
      Settings: {
        Sender: 'Business',
        CampaignName: 'Order Status Update',
        TimeToSend: this.getFormattedTime(),
      },
    };

    return await this.sendSms(payload, token);
  }

  async sendCancellationSms(body: SendSmsDto): Promise<SmsResponse> {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      orderNumber,
      businessName,
      productName,
      price,
    } = body;
    const token = this.configService.get('SMS_CANCELLATION_TOKEN');

    const payload: SmsPayload = {
      Message: `Hello ${firstName} ${lastName}, we regret to inform you that your order ${orderNumber} for ${productName} from ${businessName} has been canceled. Price: ${price}. We apologize for the inconvenience.`,
      Recipients: [
        {
          FirstName: firstName,
          LastName: lastName,
          Phone: `${countryCode}${phone}`,
        },
      ],
      Settings: {
        Sender: 'Business',
        CampaignName: 'Order Cancellation',
        TimeToSend: this.getFormattedTime(),
      },
    };

    return await this.sendSms(payload, token);
  }

  async sendBirthdayGiftSms(body: BirthdaySmsDto): Promise<SmsResponse> {
    const {
      firstName,
      lastName,
      countryCode,
      phone,
      birthMonth,
      price,
      link,
      supportCountryCode,
      supportPhone,
      senderName,
      senderPosition,
      additionalSenderName,
      additionalSenderPosition,
      voucherCode,
      language,
      message, // New optional message parameter
    } = body;

    const token = this.configService.get('SMS_CONFIRM_PURCHASE_TOKEN');

    const formattedSupportPhone = `${supportCountryCode}${supportPhone}`;

    const hebrewMessage = `${firstName} ${lastName}
${
  message ? `${message}\n` : ''
}לרגל יום הולדתך שחל בחודש ${birthMonth}, אנו מצטרפים לשמחתך ומאחלים לך שנה מלאה באושר, בריאות והצלחה!
ושמחים להעניק לך תו מתנה של תו-8 בסך ${price} ₪.
קוד השובר שלך: ${voucherCode}
לכניסה לאתר תו 8 ומימוש התו יש להיכנס לכאן>> ${link}
*תוקף השובר הוא שנתיים מהיום.
לתמיכה טכנית ${formattedSupportPhone}
יום הולדת שמח!
בברכה
${senderName}, ${senderPosition}
${
  additionalSenderName
    ? `${additionalSenderName}, ${additionalSenderPosition}`
    : ''
}`;

    const englishMessage = `${firstName} ${lastName}
${
  message ? `${message}\n` : ''
}On the occasion of your birthday in ${birthMonth}, we join in your joy and wish you a year full of happiness, health, and success!
We are pleased to offer you a TAV-8 gift card worth ${price} NIS.
Your voucher code: ${voucherCode}
To enter the TAV-8 website and redeem your voucher, click here >> ${link}
*The voucher is valid for two years from today.
For technical support ${formattedSupportPhone}
Happy Birthday!
Best regards,
${senderName}, ${senderPosition}
${
  additionalSenderName
    ? `${additionalSenderName}, ${additionalSenderPosition}`
    : ''
}`;

    const messageLang = language === 'he' ? hebrewMessage : englishMessage;

    const payload: SmsPayload = {
      Message: messageLang,
      Recipients: [
        {
          FirstName: firstName,
          LastName: lastName,
          Phone: `${countryCode}${phone}`,
        },
      ],
      Settings: {
        Sender: 'TAV-8',
        CampaignName: 'Birthday Gift',
        TimeToSend: this.getFormattedTime(),
      },
    };

    return await this.sendSms(payload, token);
  }
}
