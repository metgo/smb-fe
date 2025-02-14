/* eslint-disable no-undef */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ObjectId } from 'typeorm';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { CampaignStatus, CampaignType } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNames,
  findOneByIDPopulate,
  queryhandler,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateCampaignDto } from 'src/modules/campaign/dto/create-campaign.dto';
import { FilterQuery } from 'src/modules/campaign/dto/query.dto';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { UserType } from 'src/modules/users/users.type';
import { ConfigService } from 'src/services/config/config.service';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Campaign.name)
    private CampaignModel: Model<Campaign>,
    private readonly encryptionService: EncryptionService,
    private readonly externalApiService: ExternalApiServices,
    private readonly configService: ConfigService,
    private readonly gcpBucketServices: GcpBucketService,
    private readonly rewardServices: RewardsService,
  ) {}

  async createCampaigns(
    dto: CreateCampaignDto,
    files: Array<Express.Multer.File>,
    userId: string,
    identifierId: string,
  ): Promise<Campaign> {
    try {
      await Promise.all([
        this.findCampaignByFieldName('name', dto.name),
        this.findCampaignByFieldName('code', dto.code),
      ]);

      if (!files?.length) {
        throw new BadRequestException('Please upload logo and campaign image');
      }

      let imageCount: number = 0;

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        files.map(file => {
          if (file.fieldname === 'logoPath' || file.fieldname === 'campImage') {
            imageCount += 1;
          }
        }),
      );

      if (imageCount !== 2) {
        throw new BadRequestException('Please upload logo and campaign image');
      }

      let campImage: string;
      let logoPath: string;
      await Promise.all(
        files.map(async file => {
          if (file.fieldname === 'logoPath') {
            logoPath = await this.gcpBucketServices.upload(file);
          }

          if (file.fieldname === 'campImage') {
            campImage = await this.gcpBucketServices.upload(file);
          }
        }),
      );

      const { rewardAmount, rewardVoucherLimit, ...body } = dto;

      const externalApiId = (
        await this.externalApiService.findByFieldName(
          'identifierId',
          identifierId,
        )
      )._id;

      let campaign: any = {
        ...body,
        imagePath: campImage,
        logoPath,
        createdBy: userId,
        createdAt: new Date(),
        externalApiId,
      };

      if (rewardAmount) {
        // create reward;
        const reward = await this.rewardServices.create({
          createdBy: userId,
          amount: rewardAmount,
          voucherLimit: rewardVoucherLimit,
        });

        campaign = {
          ...campaign,
          rewardId: reward._id,
        };
      }

      const newCampaign = new this.CampaignModel(campaign);
      await newCampaign.save();
      this.logger.info('[EXTERNAL_API_CAMPAIGN]: CREATED', {
        message: newCampaign,
      });

      return newCampaign;
    } catch (err) {
      this.logger.error('[EXTERNAL_API_CAMPAIGN]: FAILED TO CREATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async getAll(loggedInUser: LoggedInUserInterface, queries: FilterQuery) {
    const {
      page, limit, search, dmoId, type,
    } = queries;

    let findQuery: any = { type };
    if (search) {
      findQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (dmoId) {
      findQuery = {
        ...findQuery,
        dmoIds: { $in: [dmoId] },
      };
    }

    if (
      loggedInUser.role === UserType.DMO
      || loggedInUser.role === UserType.DMOADMIN
      || loggedInUser.role === UserType.AUTHORITY
      || loggedInUser.role === UserType.AUTHORITY_ADMIN
    ) {
      findQuery = {
        ...findQuery,
        dmoIds: { $in: [loggedInUser.dmo.id] },
      };
    }

    const populate = {
      path: 'dmoIds rewardId',
      select: `${disSelect}`,
    };

    const allCampaign = await queryhandler<Campaign>(this.CampaignModel, {
      findQuery,
      select: disSelect,
      page: Number(page),
      limit: Number(limit),
      sort: 'createdAt',
      populate,
    });

    return allCampaign;
  }

  async getMy(queries: FilterQuery, userId: string) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = {
      ...query,
      createdBy: userId,
    };
    const populate = {
      path: 'dmoIds rewardId',
      select: `${disSelect}`,
    };

    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (query.dmoId) {
      findQuery = {
        ...findQuery,
        dmoIds: { $in: [query.dmoId] },
      };
    }

    const select = `${disSelect}`;
    const allCampaign = await queryhandler<Campaign>(this.CampaignModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      sort: 'createdAt',
      populate,
    });

    return allCampaign;
  }

  async getOne(id: string) {
    const select = disSelect;
    const populate = {
      path: 'dmoIds rewardId',
      select: `${disSelect}`,
    };

    const campaign = await this.CampaignModel.findById(id)
      .select(select)
      .populate(populate)
      .exec();
    if (campaign) {
      delete campaign.code;
      campaign.code = this.encryptionService.decrypt(
        campaign.code,
        this.configService.dataBaseEncriptionKey,
      );
    }
    return campaign;
  }

  async findRewardByCampId(campId: string) {
    try {
      const findQuery = {
        endDate: { $gte: new Date() },
        status: CampaignStatus.ACTIVE,
        _id: campId,
      };

      const populate = {
        path: 'rewardId',
        select: `${disSelect}`,
      };

      const campaignRewardDetail = await findOneByIDPopulate<Campaign>(
        this.CampaignModel,
        findQuery,
        populate,
      );

      return campaignRewardDetail;
    } catch (err) {
      this.logger.error(
        '[CAMPAIGN]: FAILED TO GET REWARD DETAILS OF CAMPAIGN',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async findAndReturn(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<Campaign> {
    try {
      const fieldNames = {
        [fieldName]: items,
        status: CampaignStatus.ACTIVE,
      };
      const campaign = await findOneByFieldNames<Campaign>(
        this.CampaignModel,
        fieldNames,
      );
      if (!campaign) {
        throw new NotFoundException(
          `${ServerErrors.CAMPAIGN.NOT_FOUND} ${fieldName}.`,
        );
      }
      return campaign;
    } catch (err) {
      this.logger.error('[CAMPAIGN]: FAILED TO GET CAMPAIGN DETAILS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async getCampaignAssociatedToIds(id: string | ObjectId, key: keyof Campaign) {
    try {
      const campaigns = await this.CampaignModel.find({
        [key]: { $in: [id] },
      });

      const campaignIds = campaigns.map(obj => obj._id);

      return campaignIds;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getStatsVoucher(
    id: string | ObjectId,
    key: keyof Campaign,
    type: CampaignType,
  ) {
    try {
      let findQuery: any = {
        [key]: { $in: [id] },
      };

      if (type) {
        findQuery = {
          ...findQuery,
          type,
        };
      }

      const campaigns = await this.CampaignModel.find(findQuery);

      const campaignIds = campaigns.map(obj => obj._id);

      return campaignIds;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getIdsByType(type: CampaignType) {
    try {
      const campaigns = await this.CampaignModel.find({ type });

      const campaignIds = campaigns.map(obj => obj._id);

      return campaignIds;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getOneCampaignDetailAssociatedToIds(
    id: string | ObjectId,
    key: keyof Campaign,
  ) {
    try {
      const campaigns = await this.CampaignModel.find({
        [key]: { $in: [id] },
      });

      const campaignDetail
        = campaigns.find(obj => obj.logoPath && obj.imagePath)
        || campaigns.find(obj => obj.logoPath)
        || campaigns.find(obj => obj.imagePath);

      return campaignDetail;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findCampaignAndReturn(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<Campaign> {
    try {
      const fieldNames = {
        [fieldName]: items,
        status: CampaignStatus.ACTIVE,
      };
      const campaign = await findOneByFieldNames<Campaign>(
        this.CampaignModel,
        fieldNames,
      );
      if (!campaign) {
        throw new NotFoundException(
          `${ServerErrors.CAMPAIGN.NOT_FOUND} ${fieldName}.`,
        );
      }
      return campaign;
    } catch (err) {
      this.logger.error(
        '[EXTERNAL_API_CAMPAIGN]: FAILED TO GET CAMPAIGN DETAILS',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  private async findCampaignByFieldName(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<boolean> {
    const campaign = await findOneByFieldName<Campaign>(
      this.CampaignModel,
      fieldName,
      items,
    );
    if (campaign) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
