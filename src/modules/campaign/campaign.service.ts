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
import { DeleteMediaDTO } from './dto/delete-media.dto';
import { FilterQuery } from './dto/query.dto';
import { updateCampaignDto } from './dto/updateCampaign.dto';
import { RewardsService } from 'src/modules/rewards/rewards.service';
import { UserType } from 'src/modules/users/users.type';
import { Campaign } from './schema/campaign.schema';
import { ConfigService } from 'src/services/config/config.service';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class CampaignService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
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
    try {
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
      this.logger.info('[CAMPAIGN]: CREATED', { message: newCampaign });
      return newCampaign;
    } catch (err) {
      this.logger.error('[CAMPAIGN]: FAILED TO CREATE', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async getAll(loggedInUser: LoggedInUserInterface, queries: FilterQuery) {
    const {
      page, limit, search, dmoId,
    } = queries;

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

  async update(
    id: string,
    dto: updateCampaignDto,
    user: LoggedInUserInterface,
  ): Promise<Campaign> {
    try {
      const updatedDTO = { ...dto, updatedBy: user.id, updatedAt: new Date() };

      const updateCampaign = await updateById<Campaign>(
        this.CampaignModel,
        id,
        updatedDTO,
      );

      if (!updateCampaign) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }

      this.logger.info('[CAMPAIGN]: UPDATED', { message: updateCampaign });

      if (dto.rewardAmount || dto.rewardVoucherLimit) {
        if (updateCampaign?.rewardId) {
          await this.rewardService.update(
            updateCampaign?.rewardId.toString(),
            { amount: dto.rewardAmount, voucherLimit: dto.rewardVoucherLimit },
            user,
          );
        }

        if (!updateCampaign?.rewardId) {
          const reward = await this.rewardService.create({
            createdBy: user.id,
            amount: dto?.rewardAmount,
            voucherLimit: dto?.rewardVoucherLimit,
          });

          await updateById<Campaign>(this.CampaignModel, id, {
            rewardId: reward._id,
          });
        }
      }
      return updateCampaign;
    } catch (err) {
      this.logger.error('[CAMPAIGN]: FAILED TO UPDATE', {
        err: err.message,
      });
      if (err.errors?.amount) {
        throw new BadRequestException('Please enter valid reward amount');
      }
      exceptionHandling(err);
    }
  }

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

  async deleteMedia(
    campaignId: string,
    body: DeleteMediaDTO,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      let updatedDTO: any = {
        updatedBy: loggedInUser.id,
        updatedAt: new Date(),
      };

      if (body.mediaType === 'logo') {
        updatedDTO = { ...updatedDTO, logoPath: null };
      }
      if (body.mediaType === 'image') {
        updatedDTO = { ...updatedDTO, imagePath: null };
      }

      const updateCampaign = await updateById<Campaign>(
        this.CampaignModel,
        campaignId,
        updatedDTO,
      );

      if (!updateCampaign) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }

      // delete from gcp
      await this.gcpBucketServices.delete(body.mediaUrl);

      this.logger.info('[CAMPAIGN]: DELETE MEDIA', { message: updateCampaign });

      return updateCampaign;
    } catch (err) {
      this.logger.error('[CAMPAIGN]: FAILED TO DELETE MEDIA', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async addMedia(
    campaignId: string,
    files: Array<Express.Multer.File>,
    loggedInUser: LoggedInUserInterface,
  ) {
    try {
      if (!files?.length) {
        throw new BadRequestException('Please upload file');
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

      if (!campImage && !logoPath) {
        throw new BadRequestException('Please upload file');
      }

      let updatedDTO: any = {
        updatedBy: loggedInUser.id,
        updatedAt: new Date(),
        createdBy: loggedInUser.id,
      };

      if (campImage) {
        updatedDTO = {
          ...updatedDTO,
          imagePath: campImage,
        };
      }

      if (logoPath) {
        updatedDTO = {
          ...updatedDTO,
          logoPath,
        };
      }

      // add to url
      const updateCampaign = await updateById<Campaign>(
        this.CampaignModel,
        campaignId,
        updatedDTO,
      );

      if (!updateCampaign) {
        throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
      }

      this.logger.info('[CAMPAIGN]: UPLOAD MEDIA', { message: updateCampaign });

      return updateCampaign;
    } catch (err) {
      this.logger.error('[CAMPAIGN]: FAILED TO UPLOAD MEDIA', {
        err: err.message,
      });
      exceptionHandling(err);
    }
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
