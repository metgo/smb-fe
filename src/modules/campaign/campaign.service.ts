/* eslint-disable no-undef */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  findOneByFieldNames,
  findOneByIDPopulate,
  queryhandler,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { FilterQuery } from './dto/query.dto';
import { UserType } from 'src/modules/users/users.type';
import { Campaign } from './schema/campaign.schema';
import { ConfigService } from 'src/services/config/config.service';
import { EncryptionService } from 'src/services/encryption/encryption.service';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Campaign')
    private CampaignModel: Model<Campaign>,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

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
}
