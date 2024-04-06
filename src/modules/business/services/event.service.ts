/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors, milesConfig } from 'src/common/constant';
import { maxDistanceInRadius } from 'src/common/max-distance-in-radius';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { getNearestBusiness } from 'src/common/sort-by-nearest';
import { disSelect } from 'src/common/utils/select.handling';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  deleteItem,
  findOneByFieldNameIncludingDeleted,
  queryhandler,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { AuthorityService } from 'src/modules/authority/authority.service';
import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import { CreateEventsDto, UpdateEventDto } from 'src/modules/business/dto';
import { Business } from 'src/modules/business/schema/business.schema';
import { GetAllBusinessesForGuestQuery } from 'src/modules/business/queries';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UserType } from 'src/modules/users/users.type';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { Media } from 'src/modules/media/schema/media.schema';
import { Image } from 'src/common/interface/image.interface';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { nanoid } from 'nanoid';

@Injectable()
export class EventsService {
  constructor(
    private readonly authorityService: AuthorityService,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel(BussCategory.name)
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
    private readonly dmoService: DMOService,
    private readonly gcpBucketServices: GcpBucketService,
    @InjectModel('Media')
    private MediaModel: Model<Media>,
  ) {}

  async createEvents(
    dto: CreateEventsDto,
    userId: LoggedInUserInterface,
    image: Array<Express.Multer.File>,
  ): Promise<Business> {
    let newDto: any = {
      ...dto,
      serviceType: GeoServicesTypes.EVENT,
      userId,
      createdBy: userId,
    };

    // find dmoId by authority
    if (dto.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      newDto = {
        ...newDto,
        dmoId: dmo._id,
      };
    }

    if (
      dto.geoLocation.long !== 'undefined'
      && dto.geoLocation.lat !== 'undefined'
    ) {
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
    const images = [];
    // add to GCP
    await Promise.all(
      image.map(async (file: Express.Multer.File) => {
        const imageUrl = await this.gcpBucketServices.upload(file);

        const imageObject = {
          image: imageUrl || null,
          caption: file?.originalname || null,
          alt: file?.originalname || null,
        };
        images.push(imageObject);
      }),
    );
    newDto = {
      ...newDto,
      images,
    };
    try {
      const slug = this.generateSlug(dto?.name);
      newDto = {
        ...newDto,
        slug,
      };
      const newEvent = new this.BusinessModel(newDto);
      await newEvent.save();

      // add to Media Table
      await Promise.all(
        newEvent.images.map(async (img: any) => {
          const newMedia = new this.MediaModel({
            reference: {
              refId: newEvent.id,
              schema: 'Event',
            },
            createdBy: newEvent.id,
            url: img.image,
            originalName: img?.caption || null,
            mimetype: img?.mimetype || null,
          });
          await newMedia.save();
        }),
      );

      return newEvent;
    } catch (error) {
      if (this.isDuplicateKeyError(error, 'slug')) {
        const slug = this.generateSlug(`${dto?.name}${nanoid(2)}`);

        let data = {
          ...newDto,
          images,
          createdBy: userId.id,
          slug,
        };
        if (userId.role === UserType.DMOADMIN) {
          const dmoId = (await this.dmoService.findDMOByUserID(userId.id))._id;

          data = {
            ...data,
            dmoId,
          };
        }
        const newBusiness = new this.BusinessModel(data);
        await newBusiness.save();

        // add to Media Table
        await Promise.all(
          newBusiness.images.map(async (img: any) => {
            const newMedia = new this.MediaModel({
              reference: {
                refId: newBusiness.id,
                schema: 'Event',
              },
              createdBy: userId.id,
              url: img.image,
              originalName: img?.caption || null,
              mimetype: img?.mimetype || null,
            });
            await newMedia.save();
          }),
        );

        return newBusiness;
      }
      exceptionHandling(error);
    }
  }

  async getAllEvents(
    queries: GetAllBusinessesForGuestQuery,
    authenticatedUser?: LoggedInUserInterface,
  ) {
    const {
      page, limit, search, long, lat, miles, ...query
    } = queries;

    const queryPage = Number(page) || paginationConfig.page;
    const queryLimit = Number(limit) || paginationConfig.limit;
    let findQuery: any = { ...query, serviceType: GeoServicesTypes.EVENT };

    if (!('status' in query) && !authenticatedUser) {
      findQuery = { ...findQuery, status: BusinessStatus.APPROVED };
    }

    if (authenticatedUser && authenticatedUser?.role === UserType.DMOADMIN) {
      const dmoId = (
        await this.dmoService.findDMOByUserID(authenticatedUser.id)
      )._id;
      findQuery = {
        ...findQuery,
        dmoId,
      };
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

      const allEvents = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        populate,
        populate1,
        sort: 'createdAt',
      });

      const sortEvents = getNearestBusiness(
        parseFloat(lat),
        parseFloat(long),
        allEvents.data,
      );

      const allPaginatedEvents = paginateData(
        queryPage,
        queryLimit,
        sortEvents,
      );

      return allPaginatedEvents;
    }
    console.log(findQuery);
    const allEvents = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
      sort: 'createdAt',
    });

    return allEvents;
  }

  async getEvents(command: GetBusinessByIdOrSlug) {
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

      const event = await this.BusinessModel.findById(id)
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!event) {
        throw new NotFoundException(`Events ${ServerErrors.NOT_FOUND}`);
      }

      if (
        !loggedInUser
        && event.status === BusinessStatus.APPROVED
        && !event.isDeleted
      ) {
        return event;
      }

      if (loggedInUser) {
        if (
          loggedInUser.role === UserType.SUPERADMIN
          || event.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
        ) {
          return event;
        }

        if (loggedInUser.role === UserType.DMOADMIN && event?.dmoId) {
          const dmoId = (await this.dmoService.findDMOByUserID(loggedInUser.id))
            ._id;
          if (event.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
            return event;
          }
        }
      }

      throw new NotFoundException(`Events ${ServerErrors.NOT_FOUND}`);
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async updateEvent(
    id: string,
    loggedInUser: LoggedInUserInterface,
    dto: UpdateEventDto,
  ): Promise<Business> {
    let updatedField: any = {
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUser.id,
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

    const updatedEvent = await this.BusinessModel.findOneAndUpdate(
      {
        _id: id,
        isDeleted: false,
        serviceType: GeoServicesTypes.EVENT,
        createdBy: loggedInUser.id,
      },
      updatedField,
      { new: true },
    );
    if (!updatedEvent) {
      throw new NotFoundException(ServerErrors.EVENT.NOT_FOUND);
    }
    return updatedEvent;
  }

  async deleteEvent(id: string, loggedInUserId: string): Promise<Business> {
    try {
      const updateField = { deletedBy: loggedInUserId };
      const event = await deleteItem<Business>(
        this.BusinessModel,
        {
          _id: id,
          serviceType: GeoServicesTypes.EVENT,
          createdBy: loggedInUserId,
          isDeleted: false,
        },
        updateField,
      );

      if (!event) {
        throw new NotFoundException(ServerErrors.EVENT.NOT_FOUND);
      }

      return event;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async uploadMedia(
    id: string,
    loggedInUserId: string,
    dto: Image[],
    role: string,
  ) {
    const updatedField = {
      updatedBy: loggedInUserId,
      updatedAt: new Date(),
    };

    let updatedEvents: mongoose.Document<unknown, {}, Business> &
      Business & {
        _id: mongoose.Types.ObjectId;
      };
    if (role === UserType.SUPERADMIN) {
      updatedEvents = await updateOneByManyFields<Business>(
        this.BusinessModel,
        {
          _id: id,
        },
        {
          $push: { images: { $each: dto } },
          $set: updatedField,
        },
      );
    } else {
      updatedEvents = await updateOneByManyFields<Business>(
        this.BusinessModel,
        {
          _id: id,
          userId: loggedInUserId,
        },
        {
          $push: { images: { $each: dto } },
          $set: updatedField,
        },
      );
    }

    if (!updatedEvents) {
      throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
    }
    return updatedEvents;
  }

  async getEvent(command: GetBusinessByIdOrSlug) {
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
      path: 'dmoId authorityId productsId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    const select = `${disSelect}`;

    try {
      const event = await this.BusinessModel.findById(id)
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!event) {
        throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
      }

      if (
        !loggedInUser
        && event.status === BusinessStatus.APPROVED
        && !event.isDeleted
      ) {
        return event;
      }

      if (loggedInUser) {
        if (
          loggedInUser.role === UserType.SUPERADMIN
          || event.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
        ) {
          return event;
        }

        if (loggedInUser.role === UserType.DMOADMIN && event?.dmoId) {
          const dmoId = (await this.dmoService.findDMOByUserID(loggedInUser.id))
            ._id;
          if (event.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
            return event;
          }
        }
      }

      throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        if (error?.model?.modelName === Business.name) {
          const event = await findOneByFieldNameIncludingDeleted<Business>(
            this.BusinessModel,
            'slug',
            id,
          );
          if (!event) {
            throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
          }

          if (
            !loggedInUser
            && event.status === BusinessStatus.APPROVED
            && !event.isDeleted
          ) {
            return event;
          }

          if (loggedInUser) {
            if (
              loggedInUser.role === UserType.SUPERADMIN
              || event.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
            ) {
              return event;
            }

            if (loggedInUser.role === UserType.DMOADMIN && event.dmoId) {
              const dmoId = (
                await this.dmoService.findDMOByUserID(loggedInUser.id)
              )._id;
              if (event.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
                return event;
              }
            }
          }

          throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
        }
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async deleteImage(
    loggedInUser: any,
    id: string,
    imageUrl: any,
  ): Promise<Business> {
    const existingEvents = await this.getEvent({
      id,
      loggedInUser,
    });

    const images = existingEvents.images.filter(
      image => image.image !== imageUrl,
    );

    const updateEvents = await this.BusinessModel.findOneAndUpdate(
      { _id: id },
      { images, updatedAt: new Date(), updatedBy: loggedInUser.id },
      { new: true },
    );
    if (!updateEvents) {
      throw new NotFoundException(ServerErrors.EVENTS_NOT_FOUND);
    }
    return updateEvents;
  }

  private generateSlug(name: string | null): string {
    return name
      ? `${name.replace(/ /g, '-').toLowerCase()}`
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
