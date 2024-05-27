import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';

import { AppModule } from 'src/app.module';
import { JwtStrategyProvider } from 'src/modules/jwt-auth/providers/jwt-strategy.provider';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentsService } from 'src/services/payments/payments.service';
import { AuthorityFactory } from 'test/factories/authority.factory';
import { BusinessesFactory } from 'test/factories/business.factory';
import { CampaignFactory } from 'test/factories/campaign.factory';
import { DMOFactory } from 'test/factories/dmo.factory';
import { UsersFactory } from 'test/factories/users.factory';
import { VouchersFactory } from 'test/factories/voucher.factory';
import { JwtAuthStrategyStub } from 'test/stubs/jwt/jwt-strategy.stub';
import { MailerStub } from 'test/stubs/mailer/mailer.stub';
import { StorageStub } from 'test/stubs/storage/storage.stub';
import { PaymentsStub } from 'test/stubs/payments/payments.stub';

export const appFactory = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
  await mongoose.connection.db.dropDatabase();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [MongooseModule.forRoot(mongoUri), AppModule],
    providers: [
      AuthorityFactory,
      BusinessesFactory,
      CampaignFactory,
      DMOFactory,
      UsersFactory,
      VouchersFactory,
    ],
  })
    .overrideProvider(JwtStrategyProvider)
    .useClass(JwtAuthStrategyStub)
    .overrideProvider(MailChimpService)
    .useClass(MailerStub)
    .overrideProvider('Storage')
    .useClass(StorageStub)
    .overrideProvider(PaymentsService)
    .useClass(PaymentsStub)
    .compile();
  const app = moduleRef.createNestApplication();

  await app.init();

  return app;
};
