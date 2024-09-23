/* eslint-disable no-undef */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldName,
  findOneByFieldNames,
  findOneById,
  findOneByOrCase,
  queryhandler,
  updateById,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { DMO } from './schema/dmo.schema';
import { CreateDMODto, FilterQuery, UpdateDMODto } from './dto';
import { UsersService } from 'src/modules/users/users.services';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class DMOService {
  constructor(
    @InjectModel('DMO') private DMOModel: Model<DMO>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private readonly gcpBucketServices: GcpBucketService,
  ) {}

  async createDMO(
    dto: CreateDMODto,
    userId: string,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const dmo = await findOneByFieldName<DMO>(
        this.DMOModel,
        'name',
        dto.name,
      );
      if (dmo) {
        throw new BadRequestException(ServerErrors.DMO_EXISTS);
      }
      if (dto.userId) {
        await this.userService.findDMOUser(dto.userId);
      }

      if (!files?.length) {
        throw new BadRequestException('Please upload file');
      }

      let imageCount: number = 0;

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        files.map(file => {
          if (file.fieldname === 'logoPath' || file.fieldname === 'imagePath') {
            imageCount += 1;
          }
        }),
      );

      if (imageCount !== 2) {
        throw new BadRequestException('Please upload logo and dmo image');
      }

      let imagePath: string;
      let logoPath: string;
      await Promise.all(
        files.map(async file => {
          if (file.fieldname === 'logoPath') {
            logoPath = await this.gcpBucketServices.upload(file);
          }

          if (file.fieldname === 'imagePath') {
            imagePath = await this.gcpBucketServices.upload(file);
          }
        }),
      );

      const newDMO = new this.DMOModel({
        ...dto,
        adminIds: [dto.userId],
        _id: new mongoose.Types.ObjectId(),
        createdBy: userId,
        createdAt: new Date(),
        imagePath,
        logoPath,
      });
      return newDMO.save();
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getAllDMO(queries: FilterQuery) {
    const { page, limit, search } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: {};
    let populate: string;
    let populate1: string;
    const select = `${disSelect}`;

    if (search) {
      findQuery = {
        $text: {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        },
      };
    }
    const dmoList = await queryhandler<DMO>(this.DMOModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return dmoList;
  }

  async updateDMO(id: string, dto: UpdateDMODto) {
    try {
      const dmo = await updateById<DMO>(this.DMOModel, id, dto);

      if (!dmo) {
        throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
      }
      return dmo;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async addCollaborators(dmoId: string, collaboratedUserId: string) {
    const dmo = await updateOneByManyFields<DMO>(
      this.DMOModel,
      {
        _id: new mongoose.Types.ObjectId(dmoId),
      },
      {
        $push: { collaboratorsUser: { $each: [collaboratedUserId] } },
      },
    );

    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async addAdmin(dmoId: string, userId: string) {
    const dmo = await updateOneByManyFields<DMO>(
      this.DMOModel,
      {
        _id: new mongoose.Types.ObjectId(dmoId),
      },
      {
        $push: { adminIds: { $each: [userId] } },
      },
    );

    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async softDeleteDMO(id: string): Promise<DMO> {
    const updateField = { isDeleted: true, deleteAt: new Date() };
    const dmo = await updateById<DMO>(this.DMOModel, id, updateField);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async findDMO(id: string) {
    const dmo = await findOneById<DMO>(this.DMOModel, id);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return true;
  }

  async findDMOByUserID(id: string) {
    const findQuery = {
      $or: [{ adminIds: { $in: [id] } }, { collaboratorsUser: { $in: [id] } }],
    };
    const dmo = await findOneByOrCase<DMO>(this.DMOModel, findQuery);
    if (!dmo) {
      throw new NotFoundException(ServerErrors.DMO_NOT_FOUND);
    }
    return dmo;
  }

  async getAllDMOById(userId: string) {
    const items = await this.DMOModel.find({
      adminIds: { $in: [userId] },
    });

    return items.map(item => item._id);
  }

  async getById(id: ObjectId) {
    const items = await findOneByFieldNames<DMO>(this.DMOModel, {
      _id: id,
    });

    return items;
  }
}
