import { GaMeasurementModule } from 'src/modules/ga-measurement/ga-measurement.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { SessionBookingsModule } from 'src/modules/session-bookings/session-bookings.module';
import { OrdersController } from 'src/modules/orders/orders.controller';
import { OrdersPublicController } from 'src/modules/orders/controllers/orders-public.controller';
import { Order, OrderSchema } from 'src/modules/orders/schema/orders.schema';
import {
  QrVerificationToken,
  QrVerificationTokenSchema,
} from 'src/modules/orders/schema/qr-verification-token.schema';
import {
  OrderProduct,
  OrderProductSchema,
} from 'src/modules/order-product/schema/order-product.schema';
import {
  EventTicketAnswer,
  EventTicketAnswerSchema,
} from 'src/modules/event-ticket-answers/schema/event-ticket-answer.schema';
import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { OrdersService } from 'src/modules/orders/orders.services';
import { ExpireOrderService } from 'src/modules/orders/expire-orders.services';
import { OrderProductModule } from 'src/modules/order-product/order-product.modules';
import { ProductsModule } from 'src/modules/products/products.module';
import { TicketModule } from 'src/modules/tickets/tickets.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { CartModule } from 'src/modules/cart/cart.modules';
import { PromotionOrdersModule } from 'src/modules/promotion-orders/promotion-orders.module';
import { ConfigModule } from 'src/services/config/config.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { QRCodeModule } from 'src/services/qr-code/qr-code.module';
import { QrTokenModule } from 'src/services/qr-token/qr-token.module';
import { SmsModule } from 'src/services/sms/sms.module';
import { GoogleWalletModule } from 'src/services/google-wallet/google-wallet.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateMiniSiteOrderHandler } from './commands/handler/create-mini-site-order.handler';
import { DocUploadModule } from '../doc-upload/doc-upload.module';
import { PunchPassesModule } from '../punch-passes/punch-passes.module';
import { PunchCardsModule } from '../punch-cards/punch-cards.module';
import { PromotionOrder, PromotionOrderSchema } from '../promotion-orders/schema/promotion-order.schema';

@Module({
  imports: [
    GaMeasurementModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: QrVerificationToken.name, schema: QrVerificationTokenSchema },
      { name: OrderProduct.name, schema: OrderProductSchema },
      { name: EventTicketAnswer.name, schema: EventTicketAnswerSchema },
      { name: User.name, schema: UserSchema },
      { name: PromotionOrder.name, schema: PromotionOrderSchema },
    ]),
    forwardRef(() => AuthorityModule),
    BusinessModule,
    forwardRef(() => ExternalApiModule),
    forwardRef(() => PaymentsModule),
    ProductsModule,
    TicketModule,
    forwardRef(() => UsersModule),
    forwardRef(() => VoucherModule),
    ConfigModule,
    forwardRef(() => DMOModule),
    MailChimpModule,
    DocUploadModule,
    OrderProductModule,
    CartModule,
    PromotionOrdersModule,
    QRCodeModule,
    QrTokenModule,
    SmsModule,
    forwardRef(() => CampaignModule),
    SessionBookingsModule,
    PunchPassesModule,
    PunchCardsModule,
    GoogleWalletModule,
  ],
  controllers: [OrdersController, OrdersPublicController],
  providers: [OrdersService, ExpireOrderService, CreateMiniSiteOrderHandler],
  exports: [OrdersService],
})
export class OrdersModule {}
