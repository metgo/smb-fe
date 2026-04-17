import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { BusinessStatus } from 'src/modules/business/business.type';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { CreateBusinessCommand } from '../create-business.command';
import { UsersService } from 'src/modules/users/users.services';
import { Locale } from 'src/common/enum';

@CommandHandler(CreateBusinessCommand)
export class CreateBusinessHandler
implements ICommandHandler<CreateBusinessCommand> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<Business>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Campaign.name)
    private readonly CampaignModel: Model<Campaign>,
    private readonly userService: UsersService,
  ) {}

  async execute(
    command: CreateBusinessCommand,
  ): Promise<mongoose.Types.ObjectId> {
    const { body } = command;
    const {
      nameHe,
      contactName,
      shortDescriptionHe,
      phoneNumber,
      busiEmail,
      primaryCategoryId,
      identifierId,
    } = body;

    try {
      // 1. Find the website (ExternalApi) by identifierId
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).lean();
      if (!externalApi) {
        throw new NotFoundException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      // 2. Get the primary campaign from the website
      const primaryCampId = externalApi.primaryCampIds?.[0];
      if (!primaryCampId) {
        throw new BadRequestException(
          'No primary campaign configured for this website',
        );
      }

      const campaign = await this.CampaignModel.findById(primaryCampId).lean();
      if (!campaign) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }

      const dmoId = campaign.dmoIds?.[0] ?? null;
      const authorityId = campaign.authorityIds?.[0] ?? null;

      // 3. Resolve or create the business owner user
      const siteName
        = externalApi.name ?? externalApi.companyDetails?.name ?? 'MetGo';
      const user = await this.userService.createUserThroughWebsite({
        firstName: contactName,
        email: busiEmail,
        countryCode: '+972',
        phoneNumber,
        lastName: '',
        address: null,
        languagePreference: Locale.HEBREW,
        siteName,
        businessName: nameHe,
      });

      // 4. Create the business with DRAFT status
      const newBusiness = new this.BusinessModel({
        nameHe,
        ...(shortDescriptionHe && { shortDescriptionHe }),
        ...(phoneNumber && { phoneNumber }),
        busiEmail,
        ...(contactName && {
          contactDetails: {
            name: contactName,
            phone: phoneNumber,
            countryCode: '+972',
          },
        }),
        primaryCategoryId: new mongoose.Types.ObjectId(primaryCategoryId),
        userId: new mongoose.Types.ObjectId(user._id),
        ...(dmoId && { dmoId: new mongoose.Types.ObjectId(dmoId) }),
        ...(authorityId && {
          authorityId: new mongoose.Types.ObjectId(authorityId),
        }),
        status: BusinessStatus.DRAFT,
        createdAt: new Date(),
      });

      const savedBusiness = await newBusiness.save();

      this.logger.info('[BUSINESS]: Business created with DRAFT status', {
        businessId: savedBusiness._id,
        userId: user._id,
      });

      return savedBusiness._id;
    } catch (err) {
      this.logger.error(
        `[BUSINESS]: Failed to create business - ${err.message}`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
