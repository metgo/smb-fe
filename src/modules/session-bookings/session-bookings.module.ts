import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { SessionBookingsController } from './session-bookings.controller';
import { SessionBookingsService } from './session-bookings.service';
import { SessionBookingsGateway } from './session-bookings.gateway';
import { SessionBooking, SessionBookingSchema } from './schema/session-booking.schema';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { ConfigModule } from 'src/services/config/config.module';
import { QRCodeModule } from 'src/services/qr-code/qr-code.module';
import { DocUploadModule } from '../doc-upload/doc-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SessionBooking.name, schema: SessionBookingSchema },
    ]),
    JwtModule,
    MailChimpModule,
    ConfigModule,
    DocUploadModule,
    QRCodeModule,
    forwardRef(() => ExternalApiModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthorityModule),
    forwardRef(() => DMOModule),
  ],
  controllers: [SessionBookingsController],
  providers: [SessionBookingsService, SessionBookingsGateway],
  exports: [SessionBookingsService, SessionBookingsGateway],
})
export class SessionBookingsModule {}
