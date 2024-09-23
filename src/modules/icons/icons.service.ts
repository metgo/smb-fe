/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
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
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  findOneById,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { CreateIconDto, FilterQuery, UpdateIconDto } from './dto';
import { Icons } from './schema/icon.schema';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class IconsService {
  constructor(
    @InjectModel('Icons')
    private IconModel: Model<Icons>,
    private gcpBucketServices: GcpBucketService,
  ) {}

  // icons actions
  async createIcon(dto: CreateIconDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Please upload file');
    }

    const iconPath = await this.gcpBucketServices.upload(file);

    const iconAlt = dto.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric characters
      .replace(/\s+/g, '_');

    const newIconCategory = new this.IconModel({
      ...dto,
      iconAlt,
      iconPath,
      createdAt: new Date(),
    });
    return newIconCategory.save();
  }

  async getIcons(queries: FilterQuery) {
    const { page, limit, ...query } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;
    const select = `${disSelect}`;

    let findQuery: {};

    let populate: string;
    let populate1: string;
    if (query.search) {
      // findQuery = { $text: { $search: query.search, $caseSensitive: false, $diacriticSensitive: false } };
      findQuery = {
        name: { $regex: query.search, $options: 'i' },
      };
    }

    const iconList = await queryhandler<Icons>(this.IconModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return iconList;
  }

  async getIcon(id: string) {
    const select = `${disSelect}`;
    const iconCategory = await this.IconModel.findById(id).select(select);
    return iconCategory;
  }

  async updateIcon(
    id: string,
    dto: UpdateIconDto,
    newIcon: Express.Multer.File,
  ) {
    const updateDto = async () => {
      const existingIcon = await findOneById<Icons>(this.IconModel, id);

      const newUrl = await this.gcpBucketServices.update(
        existingIcon.iconPath,
        newIcon,
      );

      return { ...dto, iconPath: newUrl };
    };

    const updatedDTO = newIcon ? await updateDto() : dto;

    const updatedIcon = await updateById<Icons>(this.IconModel, id, updatedDTO);

    if (!updatedIcon) {
      throw new NotFoundException(ServerErrors.ICON_NOT_FOUND);
    }
    return updatedIcon;
  }

  async softDeleteIcon(id: string) {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const iconCategory = await updateById<Icons>(
      this.IconModel,
      id,
      updateField,
    );
    if (!iconCategory) {
      throw new NotFoundException(ServerErrors.ICON_NOT_FOUND);
    }
    return iconCategory;
  }

  // find icon by field name

  async findByFieldName(
    fieldName: keyof Icons,
    items: string,
  ): Promise<boolean> {
    const icon = await findOneByFieldName<Icons>(
      this.IconModel,
      fieldName,
      items,
    );
    if (icon) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof Icons,
    items: string,
    id: string,
  ): Promise<boolean> {
    const icon = await findOneByFieldNameExcludeId<Icons>(
      this.IconModel,
      fieldName,
      items,
      id,
    );
    if (icon) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
