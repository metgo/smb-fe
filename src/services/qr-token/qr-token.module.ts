import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { QrTokenService } from './qr-token.service';
import { QrVerificationToken, QrVerificationTokenSchema } from 'src/modules/orders/schema/qr-verification-token.schema';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QrVerificationToken.name, schema: QrVerificationTokenSchema },
    ]),
    JwtModule,
    ConfigModule,
  ],
  providers: [QrTokenService],
  exports: [QrTokenService],
})
export class QrTokenModule {}
