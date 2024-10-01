/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  deleteItem,
  findOneByFieldNameIncludingDeleted,
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
import { UserType } from 'src/modules/users/users.type';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { ReferenceType } from 'src/modules/media/media.type';
import { MediaServices } from 'src/modules/media/media.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly authorityService: AuthorityService,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    private readonly mediaServices: MediaServices,
  ) {}

  async createEvents(
    dto: CreateEventsDto,
    user: LoggedInUserInterface,
    images: Array<Express.Multer.File>,
  ) {
    let newDto: any = {
      ...dto,
      serviceType: GeoServicesTypes.EVENT,
      userId: user.id,
      createdBy: user.id,
      createdAt: new Date(),
    };

    // find dmoId by authority
    if (dto.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      newDto = {
        ...newDto,
        dmoId: dmo._id,
      };
    }

    if (user.role === UserType.DMOADMIN || user.role === UserType.DMO) {
      const dmoId = user.dmo.id;

      newDto = {
        ...newDto,
        dmoId,
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

    try {
      const slug = this.generateSlug(dto?.name);
      newDto = {
        ...newDto,
        slug,
      };
      const newEvent = new this.BusinessModel(newDto);
      await newEvent.save();

      // add to Media Table
      if (images?.length) {
        const body = {
          refId: newEvent._id?.toString(),
          reference: ReferenceType.EVENT,
          businessId: null,
        };
        const updatedEvent = await this.mediaServices.create(
          user,
          images,
          body,
        );

        return updatedEvent;
      }
      return newEvent;
    } catch (error) {
      if (this.isDuplicateKeyError(error, 'slug')) {
        const slug = this.generateSlug(`${dto?.name}${nanoid(2)}`);

        newDto = {
          ...newDto,
          slug,
        };

        const newEvent = new this.BusinessModel(newDto);
        await newEvent.save();

        // add to Media Table
        if (images?.length) {
          const body = {
            refId: newEvent._id?.toString(),
            reference: ReferenceType.EVENT,
            businessId: null,
          };
          const updatedEvent = await this.mediaServices.create(
            user,
            images,
            body,
          );
          return updatedEvent;
        }
        return newEvent;
      }
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

    let findQuery: any = {
      _id: id,
      isDeleted: false,
      serviceType: GeoServicesTypes.EVENT,
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

    const updatedEvent = await this.BusinessModel.findOneAndUpdate(
      findQuery,
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
          const dmoId = loggedInUser.dmo.id;
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
              const dmoId = loggedInUser.dmo.id;
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
