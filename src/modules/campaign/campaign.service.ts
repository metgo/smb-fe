/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './schema/campaign.schema';
import { paginationConfig } from 'src/common/pagination.config';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, findOneByFieldNames, findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { createCampaignDto } from './dto/createCampaign.dto';
import { FilterQuery } from './dto/query.dto';
import { disSelect } from 'src/common/utils/select.handling';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { ConfigService } from 'src/services/config/config.service';
import { updateCampaignDto } from './dto/updateCampaign.dto';
import { ServerErrors } from 'src/common/constant';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { CampaignStatus } from 'src/common/enum';

@Injectable()
export class CampaignService {
  constructor(
        @InjectModel('Campaign')
    private CampaignModel: Model<Campaign>,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
    private readonly gcpBucketServices: GcpBucketService,
  ) {

  }

  async create(
    dto: createCampaignDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<Campaign> {
    if (!file) {
      throw new BadRequestException('Please upload file');
    }
    const campImage = await this.gcpBucketServices.upload(file);
    const newCampaign = new this.CampaignModel({
      ...dto,
      imagePath: campImage,
      createdBy: userId,
    });
    await newCampaign.save();
    return newCampaign;
  }

  async getAll(queries: FilterQuery) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = query;
    let select: {};
    let populate: any;
    let populate1: {};
    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allCampaign = await queryhandler<Campaign>(
      this.CampaignModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
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
      createdBy: { $in: [userId] },
    };
    let select: {};
    let populate: any;
    let populate1: {};
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
        dmoId: { $in: [query.dmoId] },
      };
      delete findQuery?.createdBy;
    }

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allCampaign = await queryhandler<Campaign>(
      this.CampaignModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return allCampaign;
  }

  async getOne(id: string) {
    const select = disSelect;
    const campaign = await this.CampaignModel.findById(id).select(select).exec();
    if (campaign) {
      delete campaign.code;
      campaign.code = this.encryptionService.decrypt(campaign.code, this.configService.dataBaseEncriptionKey);
    }
    return campaign;
  }

  async update(
    id: string,
    dto: updateCampaignDto,
    newImage: Express.Multer.File,
    userId: string,
  ): Promise<Campaign> {
    const updateDto = async () => {
      const existingImage = await findOneById<Campaign>(this.CampaignModel, id);

      const newUrl = await this.gcpBucketServices.update(existingImage.imagePath, newImage);

      return {
        ...dto, imagePath: newUrl, updatedBy: userId, updatedAt: new Date(),
      };
    };

    const updatedDTO = newImage ? await updateDto() : { ...dto, updatedBy: userId, updatedAt: new Date() };

    const updateCampaign = await updateById<Campaign>(this.CampaignModel, id, updatedDTO);

    if (!updateCampaign) {
      throw new NotFoundException(ServerErrors.CAMPAIGN.NOT_FOUND);
    }
    return updateCampaign;
  }

  async softDelete(id:string) {
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

  async findAndReturn(fieldName: keyof Campaign, items: string): Promise<Campaign> {
    const fieldNames = {
      [fieldName]: items,
      status: CampaignStatus.ACTIVE,
    };
    const campaign = await findOneByFieldNames<Campaign>(this.CampaignModel, fieldNames);
    if (!campaign) {
      throw new NotFoundException(`${fieldName} not found`);
    }
    return campaign;
  }

  async findByFieldName(fieldName: keyof Campaign, items: string): Promise<boolean> {
    const campaign = await findOneByFieldName<Campaign>(this.CampaignModel, fieldName, items);
    if (campaign) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof Campaign, items: string, id:string): Promise<boolean> {
    const campaign = await findOneByFieldNameExcludeId<Campaign>(this.CampaignModel, fieldName, items, id);
    if (campaign) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
