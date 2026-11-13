import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from 'src/services/config/config.module';
import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';
import { Business, BusinessSchema } from 'src/modules/business/shared/schema/business.schema';
import { BussCategory, BussCategorySchema } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Accessibility, AccessibilitySchema } from 'src/modules/accessibility/schema/accessibility.schema';
import { GroupType, GroupTypeSchema } from 'src/modules/group-type/schema/group-type.schema';
import { Tags, TagsSchema } from 'src/modules/tags/schema/tags.schema';
import { Authority, AuthoritySchema } from 'src/modules/authority/schema/authority.schema';
import { VendorOnboardingController } from './vendor-onboarding.controller';
import { VendorOnboardingService } from './vendor-onboarding.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: Accessibility.name, schema: AccessibilitySchema },
      { name: GroupType.name, schema: GroupTypeSchema },
      { name: Tags.name, schema: TagsSchema },
      { name: Authority.name, schema: AuthoritySchema },
    ]),
    // Needed by JwtAuthGuard.
    forwardRef(() => AuthorityModule),
    forwardRef(() => DMOModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [VendorOnboardingController],
  providers: [VendorOnboardingService],
})
export class VendorOnboardingModule {}
