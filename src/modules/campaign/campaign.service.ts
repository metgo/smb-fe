/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { ServerErrors } from 'src/common/constant';
import { CampaignStatus } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  findOneByFieldNames,
  findOneByIDPopulate,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { FilterQuery } from './dto/query.dto';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { UserType } from 'src/modules/users/users.type';
import { Campaign } from './schema/campaign.schema';
import { ConfigService } from 'src/services/config/config.service';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel('Campaign')
    private CampaignModel: Model<Campaign>,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    private readonly gcpBucketServices: GcpBucketService,
    private readonly rewardService: RewardsService,
  ) {}

  async create(
    dto: CreateCampaignDto,
    files: Array<Express.Multer.File>,
    userId: string,
  ): Promise<Campaign> {
    await Promise.all([
      this.findByFieldName('name', dto.name),
      this.findByFieldName('code', dto.code),
    ]);

    if (!files?.length) {
      throw new BadRequestException('Please upload file');
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
      throw new BadRequestException('Please upload logo and campaignImage');
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

    let campaign: any = {
      ...body,
      imagePath: campImage,
      logoPath,
      createdBy: userId,
    };

    if (rewardAmount) {
      // create reward;
      const reward = await this.rewardService.create({
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
    return newCampaign;
  }

  async getAll(loggedInUser: LoggedInUserInterface, queries: FilterQuery) {
    const {
      page, limit, search, dmoId,
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = {};
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
      page: queryPage,
      limit: queryLimit,
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

  // async update(
  //   id: string,
  //   dto: updateCampaignDto,
  //   newImage: Express.Multer.File,
  //   userId: string,
  // ): Promise<Campaign> {
  //   const updateDto = async () => {
  //     const existingImage = await findOneById<Campaign>(this.CampaignModel, id);

  //     const newUrl = await this.gcpBucketServices.update(
  //       existingImage.imagePath,
  //       newImage,
  //     );

  //     return {
  //       ...dto,
  //       imagePath: newUrl,
  //       updatedBy: userId,
  //       updatedAt: new Date(),
  //     };
  //   };

  //   const updatedDTO = newImage
  //     ? await updateDto()
  //     : { ...dto, updatedBy: userId, updatedAt: new Date() };

  //   const updateCampaign = await updateById<Campaign>(
  //     this.CampaignModel,
  //     id,
  //     updatedDTO,
  //   );

  //   if (!updateCampaign) {
  //     throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
  //   }
  //   return updateCampaign;
  // }

  async softDelete(id: string) {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const campaign = await updateById<Campaign>(
      this.CampaignModel,
      id,
      updateField,
    );
    if (!campaign) {
      throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
    }
    return campaign;
  }

  async findRewardByCampId(campId: string) {
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
  }

  async findAndReturn(
    fieldName: keyof Campaign,
    items: string,
  ): Promise<Campaign> {
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
  }

  async findByFieldName(
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

  async findByFieldNameExcludeId(
    fieldName: keyof Campaign,
    items: string,
    id: string,
  ): Promise<boolean> {
    const campaign = await findOneByFieldNameExcludeId<Campaign>(
      this.CampaignModel,
      fieldName,
      items,
      id,
    );
    if (campaign) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
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
}
