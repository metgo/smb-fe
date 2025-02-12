import { Injectable } from '@nestjs/common';
import { MediaServices } from 'src/modules/media/media.service';
import { UploadDTO } from 'src/modules/media/dto/upload.dto';
import { ReferenceType } from 'src/modules/media/media.type';
import { Express } from 'express';

import * as QRCode from 'qrcode'; // Import qrcode package
import { LoggedInUserInterface } from '../../modules/auth/interface/login.interface';

@Injectable()
export class QRCodeService {
  constructor(private readonly mediaServices: MediaServices) {}

  async generateQRCode(
    redirectUrl: string,
    id: string,
    loggedInUser: LoggedInUserInterface,
  ): Promise<string> {
    try {
      // Generate the QR code image buffer
      const qrCodeBuffer = await QRCode.toBuffer(redirectUrl, {
        type: 'png',
        width: 500,
        margin: 1,
      });

      const QrCodeFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: `qr-code-${id}.png`,
        encoding: '7bit',
        mimetype: 'image/png',
        size: qrCodeBuffer.length,
        buffer: qrCodeBuffer,
        destination: '',
        filename: '',
        path: '',
        stream: null,
      };

      // Upload the QR code image
      const uploadResult = await this.mediaServices.create(
        loggedInUser,
        [QrCodeFile],
        {
          refId: id,
          reference: ReferenceType.Order, // need to update if other
        } as UploadDTO,
      );

      const qrCodeUrl = uploadResult[0]?.image;
      if (!qrCodeUrl) {
        throw new Error('QR code upload failed');
      }

      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating and uploading QR Code:', error);
      throw new Error('Error generating QR code');
    }
  }
}
