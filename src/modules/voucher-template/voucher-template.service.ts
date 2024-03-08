/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import { VoucherTemplate } from './schema/voucher-template.schema';
import {
  FilterQuery,
  createVoucherTemplateDto,
  updateVoucherTemplateDto,
} from './dto';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  findOneById,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class VoucherTemplateService {
  constructor(
    @InjectModel('VoucherTemplate')
    private readonly VoucherTemplateModel: Model<VoucherTemplate>,

    private gcpBucketServices: GcpBucketService,
  ) {}

  async create(
    dto: createVoucherTemplateDto,
    userId: string,
    file: Express.Multer.File,
  ): Promise<VoucherTemplate> {
    if (!file) {
      throw new BadRequestException('Please upload file');
    }

    const imagePath = await this.gcpBucketServices.upload(file);
    const imageAlt = dto.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '_');

    const newVoucherTemplate = new this.VoucherTemplateModel({
      ...dto,
      createdBy: userId,
      imagePath,
      imageAlt,
    });
    return newVoucherTemplate.save();
  }

  async getAll(queries: FilterQuery): Promise<VoucherTemplate & any> {
    const { page, limit, search } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = disSelect;

    let findQuery: {};
    let populate: any;
    let populate1: {};

    if (search) {
      findQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const voucherTemplate = await queryhandler<VoucherTemplate>(
      this.VoucherTemplateModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return voucherTemplate;
  }

  async getOne(id: string) {
    const select = `${disSelect}`;
    const voucherTemplate = await this.VoucherTemplateModel.findById(id)
      .select(select)
      .exec();
    return voucherTemplate;
  }

  async update(
    id: string,
    dto: updateVoucherTemplateDto,
    userId: string,
    newImage: Express.Multer.File,
  ): Promise<VoucherTemplate> {
    const updateDto = async () => {
      const existingImage = await findOneById<VoucherTemplate>(
        this.VoucherTemplateModel,
        id,
      );

      const newUrl = await this.gcpBucketServices.update(
        existingImage.imagePath,
        newImage,
      );

      return {
        ...dto,
        imagePath: newUrl,
        updatedBy: userId,
        updatedAt: new Date(),
      };
    };

    const updatedDTO = newImage
      ? await updateDto()
      : { ...dto, updatedBy: userId, updatedAt: new Date() };

    const voucherTemplate = await updateById<VoucherTemplate>(
      this.VoucherTemplateModel,
      id,
      updatedDTO,
    );

    if (!voucherTemplate) {
      throw new NotFoundException(ServerErrors.VOUCHER_TEMPLATE.NOT_FOUND);
    }
    return voucherTemplate;
  }

  async softDelete(id: string, userId: string): Promise<VoucherTemplate> {
    const updateField = {
      isDeleted: true,
      deleteAt: new Date(),
      updatedBy: userId,
      deletedBy: userId,
    };
    const voucherTemplate = await updateById<VoucherTemplate>(
      this.VoucherTemplateModel,
      id,
      updateField,
    );
    if (!voucherTemplate) {
      throw new NotFoundException(ServerErrors.VOUCHER_TEMPLATE.NOT_FOUND);
    }
    return voucherTemplate;
  }

  async findByFieldName(
    fieldName: keyof VoucherTemplate,
    items: string,
  ): Promise<boolean> {
    const voucherTemplate = await findOneByFieldName<VoucherTemplate>(
      this.VoucherTemplateModel,
      fieldName,
      items,
    );
    if (voucherTemplate) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof VoucherTemplate,
    items: string,
    id: string,
  ): Promise<boolean> {
    const voucherTemplate = await findOneByFieldNameExcludeId<VoucherTemplate>(
      this.VoucherTemplateModel,
      fieldName,
      items,
      id,
    );
    if (voucherTemplate) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
