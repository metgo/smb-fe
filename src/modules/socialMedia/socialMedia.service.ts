import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SocialMedia } from './schema/socialMedia.schema';
import { createSocialMediaDto } from './dto/createSocialMedia.dto';
import { Model } from 'mongoose';
import { queryhandler, updateById } from 'src/core/helper/query-helper';
import { updateSocialMediaDto } from './dto/updateSocialMedia.dto';
import { ServerErrors } from 'src/common/constant';

@Injectable()
export class SocialMediaService {
  constructor(@InjectModel('SocialMedia') private SocialMediaModel: Model<SocialMedia>) { }

  async create(dto: createSocialMediaDto) {
    const newSocialMedia = new this.SocialMediaModel(dto);

    return await newSocialMedia.save();
  }

  async getAll() {
    let findQuery: {};
    let select: string;
    let page: number;
    let limit: number;
    let populate: string;
    let populate1: string;

    // eslint-disable-next-line prefer-const
    select = '-createdAt -updatedAt -createdBy -updatedBy -deletedBy -deletedAt -isDeleted';
    const socialMedia = await queryhandler<SocialMedia>(
      this.SocialMediaModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
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
}
