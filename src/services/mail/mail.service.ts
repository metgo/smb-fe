import { Injectable } from '@nestjs/common';
import * as nodeMailer from 'nodemailer';
import { ConfigService } from '../config/config.service';
import { SendMailOptions } from 'nodemailer';
import { User } from 'src/modules/users/schema/users.schema';
import * as pug from 'pug';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: any;
  constructor(private readonly configSerivce: ConfigService) {
    this.transporter = nodeMailer.createTransport({
      host: this.configSerivce.emailDetails.EMAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: this.configSerivce.emailDetails.USER,
        pass: this.configSerivce.emailDetails.PASSWORD,
        // type: 'OAuth2',
        // user: this.configSerivce.emailDetails.FROM_EMAIL, // Your email address
        // serviceClient: this.configSerivce.emailDetails.SERVICE_CLIENT,
        // privateKey: this.configSerivce.emailDetails.PRIVATE_KEY,
        // accessUrl: this.configSerivce.emailDetails.ACCESS_URL,
      },
    });
  }

  private async renderTemplate(template: string, context: any): Promise<any> {
    try {
      const compiledTemplate = pug.compileFile(
        path.join(__dirname, '..', '..', '..', 'src/templates', template),
      ); // Compile the Pug template

      return compiledTemplate(context);
    } catch (error) {
      return 'error';
    }
  }

  private async sendMail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    const html = await this.renderTemplate(template, context);
    const mailOptions: SendMailOptions = {
      from: `${this.configSerivce.emailDetails.FROM_NAME} <${this.configSerivce.emailDetails.FROM_EMAIL}>`,
      to,
      subject,
      html,
    };

    // Send email
    try {
      this.transporter.sendMail(mailOptions);
      console.log('email is send');
    } catch (error) {
      console.log(error);
    }
  }

  sendWelcome(to: User) {
    return this.sendMail(to.email, 'Welcome to Metgo', 'welcome-email.pug', {
      guestName: to.firstName ? to.firstName : 'User',
    });
  }

  sendForgetPasswordOtp(to: User, otp: string) {
    const name = to.firstName;
    return this.sendMail(
      to.email,
      'Forget Password - MetGo',
      'forget-password.pug',
      {
        guestName: name || 'User',
        otp,
      },
    );
  }

  sendWelcomeWithPwd(to: User) {
    return this.sendMail(
      to.email,
      'Welcome to MetGo',
      'welcome-email-with-pwd.pug',
      {
        guestName: to.firstName ? to.firstName : 'Sitanshu',
        email: to.email,
        password: to.password,
      },
    );
  }

  sendVoucherList(to: User) {
    return this.sendMail(to.email, 'Voucher  Metgo', '', {});
  }
}
