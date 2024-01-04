/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { maxDistanceInRadius } from 'src/common/max-distance-in-radius';
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
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { WebCreateBusiness } from './dto/web-create-business.dto';
import { Media } from '../media/schema/media.schema';
import { updateWebBusinessDto } from './dto/web.update.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    private readonly gcpBucketServices: GcpBucketService,
    @InjectModel('Media')
    private MediaModel: Model<Media>,
  ) {}

  async createBusiness(dto: createBusinessDto, userId: string): Promise<Business> {
    let newDto:any = dto;
    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
      };
      newDto = {
        ...newDto,
        location,
      };
    }
    const newBusiness = new this.BusinessModel({
      ...newDto,
      userId,
      createdBy: userId,
    });
    await newBusiness.save();
    return newBusiness;
  }

  async createBusinesForWeb(
    dto: WebCreateBusiness,
    loggedInUserId: string,
    image: Array<Express.Multer.File>,
  ): Promise<Business> {
    let newDto: any = dto;
    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
      };
      newDto = {
        ...newDto,
        location,
      };
    }
    const images = [];
    await Promise.all(
      image.map(async (file: Express.Multer.File) => {
        // store in gcp
        const imageUrl = await this.gcpBucketServices.upload(file);

        const imageObject = {

          image: imageUrl || null,
          caption: file?.originalname || null,
          alt: file?.originalname || null,

        };
        console.log(imageObject);
        images.push(imageObject);
      }),
    );

    // const businessImageUrl = image ? await this.gcpBucketServices.upload(image) : null;

    // const images = [{
    //   image: businessImageUrl || null,
    //   caption: image?.originalname || null,
    //   alt: image?.originalname || null,
    // }];
    console.log({ images });
    const newBusiness = new this.BusinessModel({
      ...newDto,
      images,
      createdBy: loggedInUserId,
    });
    console.log({ newBusiness });
    // await newBusiness.save();

    // newBusiness.images.map(async (img: any) => {
    //   const newMedia = new this.MediaModel({
    //     reference: {
    //       refId: newBusiness.id,
    //       schema: 'Business',
    //     },
    //     createdBy: loggedInUserId,
    //     url: img.image,
    //     originalName: img?.caption || null,
    //     mimetype: img?.mimetype || null,
    //   });
    //   await newMedia.save();
    // });

    return newBusiness;
  }

  async getAllBusiness(queries: FilterQuery) {
    const {
      page, limit, search, long, lat, ...query
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
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
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

    if (long && lat) {
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
              [long, lat],
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
    }

    // eslint-disable-next-line prefer-const
    populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;

    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async getBusiness(id: string) {
    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    const populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    // eslint-disable-next-line prefer-const
    const select = `${disSelect}`;
    const business = await this.BusinessModel.findById(id).select(select).populate(populate).populate(populate1);

    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async getAllMyBusiness(queries: FilterQuery, userId: string) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = { ...query, userId };
    let select: {};
    let populate: any;
    let populate1: {};
    if (search) {
      findQuery = {
        ...query,
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async updateBusiness(
    id: string,
    loggedInUserId: string,
    dto: updateBusinessDto | Image[] | UpdateBusinessByAdminDto | updateWebBusinessDto,
  ): Promise<Business> {
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
    updatedField = {
      ...updatedField,
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUserId,
    };
    if (!(
      dto instanceof updateBusinessDto || dto instanceof UpdateBusinessByAdminDto || dto instanceof updateWebBusinessDto)) {
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
