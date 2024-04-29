import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors, milesConfig } from 'src/common/constant';
import { maxDistanceInRadius } from 'src/common/max-distance-in-radius';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { getNearestBusiness } from 'src/common/sort-by-nearest';
import { getRandomNumberBetween } from 'src/common/utils/random-number-range';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { disSelect } from 'src/common/utils/select.handling';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { deleteItem, queryhandler } from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { AuthorityService } from 'src/modules/authority/authority.service';
import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import {
  CreateMapPointsDto,
  UpdateMapPointsDto,
} from 'src/modules/business/dto';
import { Business } from 'src/modules/business/schema/business.schema';
import { GetUsersBusinessesQuery } from 'src/modules/business/queries';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class MapPointsService {
  constructor(
    private readonly authorityService: AuthorityService,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel(BussCategory.name)
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
  ) {}

  async createMapPoints(
    dto: CreateMapPointsDto,
    userId: string,
  ): Promise<Business> {
    const impact = getRandomNumberBetween(17, 93);
    let newDto: any = {
      ...dto,
      serviceType: GeoServicesTypes.POINT_OF_INTEREST,
      userId,
      createdBy: userId,
      impact,
    };

    // find dmoId by authority
    if (dto.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      newDto = {
        ...newDto,
        dmoId: dmo._id,
      };
    }

    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [
          parseFloat(dto.geoLocation.long),
          parseFloat(dto.geoLocation.lat),
        ],
      };
      newDto = {
        ...newDto,
        location,
      };
    }
    try {
      const slug = this.generateSlug(dto?.name);
      const newMapPoints = new this.BusinessModel({
        ...newDto,
        slug,
      });
      await newMapPoints.save();

      return newMapPoints;
    } catch (error) {
      if (this.isDuplicateKeyError(error, 'slug')) {
        const slug = this.generateSlug(dto?.name);
        const newMapPoints = new this.BusinessModel({
          ...newDto,
          slug,
        });
        await newMapPoints.save();

        return newMapPoints;
      }
      exceptionHandling(error);
    }
  }

  async getAllMapPoints(
    queries: GetUsersBusinessesQuery,
    authenticatedUser?: LoggedInUserInterface,
  ) {
    const {
      page, limit, search, long, lat, miles, ...query
    } = queries;

    const queryPage = Number(page) || paginationConfig.page;
    const queryLimit = Number(limit) || paginationConfig.limit;

    let findQuery: any = {
      ...query,
      serviceType: GeoServicesTypes.POINT_OF_INTEREST,
    };

    if (!authenticatedUser) {
      findQuery = { ...findQuery, status: BusinessStatus.APPROVED };
    }

    if (authenticatedUser) {
      if (
        authenticatedUser?.role === UserType.DMOADMIN
        || authenticatedUser?.role === UserType.DMO
      ) {
        const dmoId = authenticatedUser.dmo.id;
        findQuery = {
          ...findQuery,
          dmoId,
        };
      }

      if (authenticatedUser.role === UserType.TRAVELLER) {
        findQuery = {
          ...findQuery,
          userId: authenticatedUser.id,
        };
      }
    }

    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const populate1 = {
      path: 'dmoId authorityId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const select = `${disSelect}`;

    if (search) {
      const [matchingCategoryIds, matchingSubCategoryIds] = await Promise.all([
        this.BussCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
        this.BussSubCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
      ]);

      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { bussCategoriesId: { $in: matchingCategoryIds } },
          { bussSubCategoriesId: { $in: matchingSubCategoryIds } },
        ],
      };

      if (!(matchingCategoryIds?.length || matchingSubCategoryIds?.length)) {
        findQuery.$text = {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        };
      }
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
      findQuery = {
        ...findQuery,
        location: {
          $geoWithin: {
            $centerSphere: [
              [long, lat],
              maxDistanceInRadius(miles || milesConfig),
            ],
          },
        },
      };

      const allMapPoints = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        populate,
        populate1,
        sort: 'createdAt',
      });

      const sortEvents = getNearestBusiness(
        parseFloat(lat),
        parseFloat(long),
        allMapPoints.data,
      );

      const allPaginatedMapPoints = paginateData(
        queryPage,
        queryLimit,
        sortEvents,
      );

      return allPaginatedMapPoints;
    }

    const allMapPoints = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
      sort: 'createdAt',
    });

    return allMapPoints;
  }

  async getMapPoints(command: GetBusinessByIdOrSlug) {
    try {
      const { id, loggedInUser } = command;

      const populate = {
        path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      };

      const populate1 = {
        path: 'dmoId authorityId',
        select: `${disSelect} -userId -collaboratorsUser`,
      };
      const select = `${disSelect}`;

      const mapPoint = await this.BusinessModel.findById(id)
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!mapPoint) {
        throw new NotFoundException(`Map-Point ${ServerErrors.NOT_FOUND}`);
      }

      if (
        !loggedInUser
        && mapPoint.status === BusinessStatus.APPROVED
        && !mapPoint.isDeleted
      ) {
        return mapPoint;
      }

      if (loggedInUser) {
        if (
          loggedInUser.role === UserType.SUPERADMIN
          || mapPoint.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
        ) {
          return mapPoint;
        }

        if (loggedInUser.role === UserType.DMOADMIN && mapPoint?.dmoId) {
          const dmoId = loggedInUser.dmo.id;
          if (mapPoint.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
            return mapPoint;
          }
        }
      }

      throw new NotFoundException(`Map Point ${ServerErrors.NOT_FOUND}`);
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateMapPoint(
    id: string,
    loggedInUser: LoggedInUserInterface,
    dto: UpdateMapPointsDto,
  ): Promise<Business> {
    let updatedField: any = {
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUser.id,
    };

    let findQuery: any = {
      _id: id,
      isDeleted: false,
      serviceType: GeoServicesTypes.POINT_OF_INTEREST,
    };

    // find dmoId by authority
    if (dto.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      updatedField = {
        ...updatedField,
        dmoId: dmo._id,
      };
    }

    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [
          parseFloat(dto.geoLocation.long),
          parseFloat(dto.geoLocation.lat),
        ],
      };
      updatedField = {
        ...updatedField,
        location,
      };
    }

    if (
      loggedInUser.role === UserType.DMO
      || loggedInUser.role === UserType.DMOADMIN
    ) {
      const dmoId = loggedInUser.dmo.id;

      findQuery = {
        ...findQuery,
        dmoId,
      };
    }
    if (loggedInUser.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        userId: loggedInUser.id,
      };
    }

    const updatedMapPoint = await this.BusinessModel.findOneAndUpdate(
      findQuery,
      updatedField,
      { new: true },
    );
    if (!updatedMapPoint) {
      throw new NotFoundException(ServerErrors.MAP_POINT.NOT_FOUND);
    }
    return updatedMapPoint;
  }

  async deleteMapPoint(id: string, loggedInUserId: string): Promise<Business> {
    try {
      const updateField = { deletedBy: loggedInUserId };
      const mapPoint = await deleteItem<Business>(
        this.BusinessModel,
        {
          _id: id,
          serviceType: GeoServicesTypes.POINT_OF_INTEREST,
          createdBy: loggedInUserId,
          isDeleted: false,
        },
        updateField,
      );

      if (!mapPoint) {
        throw new NotFoundException(ServerErrors.MAP_POINT.NOT_FOUND);
      }

      return mapPoint;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private generateSlug(name: string | null): string {
    return name
      ? `${name.replace(/ /g, '-').toLowerCase()}-${generateRandomCode(3)}`
      : `${generateRandomCode(3).toLowerCase()}-${generateRandomCode(
        4,
      ).toLowerCase()}`;
  }

  private isDuplicateKeyError(error: any, fieldName: string): boolean {
    return (
      error.code === 11000
      && error?.keyPattern
      && error?.keyPattern[fieldName] === 1
    );
  }
}
