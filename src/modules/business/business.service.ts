/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from './schema/business.schema';
import { createBusinessDto, FilterQuery, updateBusinessDto } from './dto';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';
import { Image } from 'src/modules/business/business.type';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
  ) {}

  async createBusiness(dto: createBusinessDto, userId: string): Promise<Business> {
    const newBusiness = new this.BusinessModel({ ...dto, userId });
    await newBusiness.save();
    return newBusiness;
  }

  async getAllBusiness(query: FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};
    if (query.search) {
      findQuery = {
        ...query,
        $text: { $search: query.search, $caseSensitive: false, $diacriticSensitive: false },
      };

      delete findQuery?.search;
    } else if (query) {
      findQuery = {
        ...query,
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async getBusiness(id: string) {
    const populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    const populate1 = {
      path: 'socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };
    // eslint-disable-next-line prefer-const
    const select = `${disSelect}`;
    const business = await this.BusinessModel.findById(id).select(select).populate(populate).populate(populate1);

    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async getAllMyBusiness(query: FilterQuery, userId: string) {
    let findQuery: any = {};
    let select: {};
    let page: number;
    let limit: number;
    let populate: any;
    let populate1: {};
    if (query.search) {
      findQuery = {
        ...query,
        $text: { $search: query.search, $caseSensitive: false, $diacriticSensitive: false },
      };

      delete findQuery?.search;
    } else if (query) {
      findQuery = {
        ...query,
      };
    }
    findQuery = {
      ...findQuery,
      userId,
    };
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'mapPointId mapPointCategoriesId mapPointSubCategoriesId',
      select: `${disSelect}`,
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      findQuery,
      select,
      page,
      limit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async updateBusiness(id: string, dto: updateBusinessDto | Image[]): Promise<Business> {
    let updatedField:any = dto;
    if (!(dto instanceof updateBusinessDto)) {
      const existingBusiness = await this.getBusiness(id);

      const images = [...existingBusiness.images, ...dto];

      updatedField = { images };
    }

    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, updatedField, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async deleteImage(id: string, imageUrl: any): Promise<Business> {
    const existingBusiness = await this.getBusiness(id);

    const images = existingBusiness.images.filter(image => image.image !== imageUrl);

    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, { images }, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async deleteBusiness(id: string): Promise<Business> {
    const updateField = { isDeleted: true, deletedAt: new Date() };
    const business = await updateById<Business>(this.BusinessModel, id, updateField);
    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async findByFieldName(fieldName: keyof Business, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(this.BusinessModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof Business, items: string, id:string): Promise<boolean> {
    const bussEmail = await findOneByFieldNameExcludeId<Business>(this.BusinessModel, fieldName, items, id);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }
}
