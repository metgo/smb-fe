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
  findOneByFieldName, findOneByFieldNameExcludeId, findOneByFieldNames, queryhandler, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { Image } from 'src/common/interface/image.interface';
import { disSelect } from 'src/common/utils/select.handling';
import { UpdateBusinessByAdminDto } from 'src/modules/business/dto/update-business-status.dto';
import { paginationConfig } from 'src/common/pagination.config';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
  ) {}

  async createBusiness(dto: createBusinessDto, userId: string): Promise<Business> {
    const cordinates = {
      location: {
        coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
      },
    };

    const newBusiness = new this.BusinessModel({
      ...dto,
      userId,
      createdBy: userId,
      location: cordinates.location,
    });
    await newBusiness.save();
    return newBusiness;
  }

  async getAllBusiness(query: FilterQuery) {
    let findQuery: any = {};
    let select: {};
    let { page } = paginationConfig;
    let { limit } = paginationConfig;
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
    if (query.bussCategoriesId) {
      const bussCategoriesId = JSON.parse(query.bussCategoriesId);
      findQuery = {
        ...findQuery,
        bussCategoriesId: { $in: bussCategoriesId },
      };
    }

    if (query.bussSubCategoriesId) {
      const bussSubCategoriesId = JSON.parse(query.bussSubCategoriesId);
      findQuery = {
        ...findQuery,
        bussSubCategoriesId: { $in: bussSubCategoriesId },
      };
    }

    if (query.accessibilitiesId) {
      const accessibilitiesId = JSON.parse(query.accessibilitiesId);
      findQuery = {
        ...findQuery,
        accessibilitiesId: { $in: accessibilitiesId },
      };
    }

    if (query.groupTypesId) {
      const groupTypesId = JSON.parse(query.groupTypesId);
      findQuery = {
        ...findQuery,
        groupTypesId: { $in: groupTypesId },
      };
    }

    const METERS_PER_MILE = 1609.34;
    const maxDistanceInRadius = 5 / 3963;
    if (query.lat && query.long) {
      // findQuery = {
      //   ...findQuery, // Filter out businesses without longitude data
      //   location: {
      //     $nearSphere: {
      //       $geometry: {
      //         type: 'Point',
      //         coordinates: [query.long, query.lat],
      //       },
      //       $minDistance: 1000,
      //       $maxDistance: 5000,
      //     },
      //   },
      // };

      findQuery = {
        ...findQuery, // Filter out businesses without longitude data
        location: {
          $geoWithin: {
            $centerSphere: [
              [query.long, query.lat],
              maxDistanceInRadius,
            ],
          },
        },
      };
      // findQuery = {
      //   ...findQuery,
      //   location: {
      //     $near: {
      //       $geometry: {
      //         type: 'Point',
      //         coordinates: [query.long, query.lat],
      //       },
      //       $minDistance: 1000,
      //       $maxDistance: 5000,
      //     },
      //   },
      // };
      delete findQuery?.lat;
      delete findQuery?.long;
    }

    if (query.page) {
      page = Number(query.page);
      delete findQuery.page;
    }
    if (query.limit) {
      limit = Number(query.limit);
      delete findQuery.limit;
    }
    console.log(findQuery);
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId',
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
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId',
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
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId',
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

  async updateBusiness(
    id: string,
    loggedInUserId: string,
    dto: updateBusinessDto | Image[] | UpdateBusinessByAdminDto,
  ): Promise<Business> {
    console.log(dto);
    let updatedField: any;
    let cordinates:any;
    if (dto instanceof updateBusinessDto && dto.geoLocation) {
      cordinates = {
        location: {
          coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
        },
      };
      updatedField = {
        ...dto,
        location: {
          type: 'Point',
          coordinates: cordinates.location.coordinates,
        },
      };
    }
    console.log(cordinates);
    updatedField = {
      ...updatedField,
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUserId,
    };
    console.log(updatedField);
    if (!(dto instanceof updateBusinessDto || dto instanceof UpdateBusinessByAdminDto)) {
      const existingBusiness = await this.getBusiness(id);

      const images = [...existingBusiness.images, ...dto];

      updatedField = { ...updatedField, images };
    }

    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, updatedField, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async deleteImage(loggedInUserId: string, id: string, imageUrl: any): Promise<Business> {
    const existingBusiness = await this.getBusiness(id);

    const images = existingBusiness.images.filter(image => image.image !== imageUrl);

    const updateBusiness = await this.BusinessModel.findOneAndUpdate(
      { _id: id },
      { images, updatedAt: new Date(), updatedBy: loggedInUserId },
      { new: true },
    );
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async deleteBusiness(id: string, loggedInUserId: string): Promise<Business> {
    const updateField = { isDeleted: true, deletedAt: new Date(), deletedBy: loggedInUserId };
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

  async findByFieldItems(fieldNames: object): Promise<Business> {
    const business = await findOneByFieldNames<Business>(this.BusinessModel, fieldNames);

    return business;
  }
}
