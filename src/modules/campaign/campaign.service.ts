/* eslint-disable no-undef */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Campaign } from './schema/campaign.schema';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, findOneById, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { createCampaignDto } from './dto/createCampaign.dto';
import { FilterQuery } from './dto/query.dto';
import { disSelect } from 'src/common/utils/select.handling';
import { EncryptionService } from 'src/services/encryption/encryption.service';
import { ConfigService } from 'src/services/config/config.service';
import { updateCampaignDto } from './dto/updateCampaign.dto';
import { ServerErrors } from 'src/common/constant';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

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
    dmoId: mongoose.Types.ObjectId,
  ): Promise<Campaign> {
    if (!file) {
      throw new BadRequestException('Please upload file');
    }
    const campImage = await this.gcpBucketServices.upload(file);
    const newCampaign = new this.CampaignModel({
      ...dto,
      code: this.encryptionService.encrypt(dto.code, this.configService.dataBaseEncriptionKey),
      imagePath: campImage,
      createdBy: userId,
      dmoId,
    });
    await newCampaign.save();
    return newCampaign;
  }

  async getAll(query: FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};
    if (query.search) {
      findQuery = {
        $or: [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
        ],
      };

      delete findQuery?.search;
    }

    if (query.page) {
      page = Number(query.page);
    }
    if (query.size) {
      limit = Number(query.size);
    }

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allCampaign = await queryhandler<Campaign>(
      this.CampaignModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return allCampaign;
  }

  async getMy(query: FilterQuery, userId: string) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};
    if (query.search) {
      findQuery = {
        $or: [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } },
        ],
      };

      delete findQuery?.search;
    }
    findQuery = {
      ...findQuery,
      createdBy: { $in: [userId] },
    };
    if (query.dmoId) {
      findQuery = {
        ...findQuery,
        dmoId: { $in: [query.dmoId] },
      };
      delete findQuery?.createdBy;
    }

    if (query.page) {
      page = Number(query.page);
    }
    if (query.size) {
      limit = Number(query.size);
    }

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allCampaign = await queryhandler<Campaign>(
      this.CampaignModel,
      findQuery,
      select,
      page,
      limit,
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
