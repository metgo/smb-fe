/* eslint-disable prefer-const */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { SortOrder } from 'src/common/enum';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  queryhandler,
  updateById,
} from 'src/core/helper/query-helper';
import { SocialMedia } from './schema/socialMedia.schema';
import { createSocialMediaDto } from './dto/createSocialMedia.dto';
import { updateSocialMediaDto } from './dto/updateSocialMedia.dto';
import { FilterQuery } from './dto/query.dto';

@Injectable()
export class SocialMediaService {
  constructor(
    @InjectModel('SocialMedia')
    private SocialMediaModel: Model<SocialMedia>,
  ) {}

  async create(dto: createSocialMediaDto) {
    const newSocialMedia = new this.SocialMediaModel({
      ...dto,
      createdAt: new Date(),
    });

    return await newSocialMedia.save();
  }

  async getAll(queries: FilterQuery) {
    const { page, limit, search } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let select: string;
    let populate: {};
    let populate1: string;

    if (search) {
      findQuery = {
        name: { $regex: search, $options: 'i' },
      };
    }
    populate = {
      path: 'icon',
      select: `${disSelect}`,
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const socialMedia = await queryhandler<SocialMedia>(this.SocialMediaModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      sort: 'createdAt',
      sortOrder: SortOrder.DESC,
      populate,
      populate1,
    });
    return socialMedia;
  }

  async update(id: string, dto: updateSocialMediaDto) {
    const socialMedia = await updateById<SocialMedia>(
      this.SocialMediaModel,
      id,
      dto,
    );
    if (!socialMedia) {
      throw new NotFoundException(ServerErrors.SOCIAL_MEDIA_NOT_FOUND);
    }
    return socialMedia;
  }

  async softDelete(id: string) {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const socialMedia = await updateById<SocialMedia>(
      this.SocialMediaModel,
      id,
      updateField,
    );
    if (!socialMedia) {
      throw new NotFoundException(ServerErrors.SOCIAL_MEDIA_NOT_FOUND);
    }
    return socialMedia;
  }

  async findByFieldName(
    fieldName: keyof SocialMedia,
    items: string,
  ): Promise<boolean> {
    const socialMedia = await findOneByFieldName<SocialMedia>(
      this.SocialMediaModel,
      fieldName,
      items,
    );
    if (socialMedia) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof SocialMedia,
    items: string,
    id: string,
  ): Promise<boolean> {
    const socialMedia = await findOneByFieldNameExcludeId<SocialMedia>(
      this.SocialMediaModel,
      fieldName,
      items,
      id,
    );
    if (socialMedia) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
