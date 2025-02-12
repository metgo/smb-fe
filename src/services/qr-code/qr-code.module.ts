import { Module } from '@nestjs/common';
import { QRCodeService } from 'src/services/qr-code/qr-code.service';
import { MediaModule } from 'src/modules/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [QRCodeService],
  exports: [QRCodeService],
})
export class QRCodeModule {}
