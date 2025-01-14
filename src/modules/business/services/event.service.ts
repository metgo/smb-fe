/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { disSelect } from 'src/common/utils/select.handling';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  findOneByFieldNameIncludingDeleted,
} from 'src/core/helper/query-helper';

import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
} from 'src/modules/business/business.type';
import { Business } from 'src/modules/business/schema/business.schema';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
  ) {}

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
}
