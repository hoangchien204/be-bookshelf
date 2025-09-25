import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {
    sgMail.setApiKey(this.config.getOrThrow<string>('SENDGRID_API_KEY'));
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const msg = {
      to,
      from: this.config.getOrThrow<string>('EMAIL_FROM'),
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw error;
    }
  }
}
