import {
  BadRequestException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CreateUserRequest } from 'src/modules/users/requests/create-user.request';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { User } from 'src/modules/users/schema/users.schema';
import { createUserByAdminDto } from './requests/create-user-ByAdmin.dto';
import { findOneByFieldName, findOneById } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { passwordGenerator } from 'src/common/utils/randomPassword.genetator';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
  ) {}

  async getMyInformation(userId: string): Promise<GetUserDetailsResponse> {
    try {
      const user = await this.UserModel.findById(userId);

      if (!user) {
        throw new NotFoundException('User Not Found');
      }

      return {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        email: user.email,
        isPhoneVerify: user.isPhoneVerify,
        isEmailVerify: user.isEmailVerify,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      exceptionHandling(error);
      throw new InternalServerErrorException('Couldn\'t find user');
    }
  }

  async create(createUserDto: CreateUserRequest): Promise<GetUserDetailsResponse> {
    try {
      const newUser = await (new this.UserModel(createUserDto)).save();

      return {
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        address: newUser.address,
        email: newUser.email,
        isPhoneVerify: newUser.isPhoneVerify,
        isEmailVerify: newUser.isEmailVerify,
        role: newUser.role,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };
    } catch (error) {
      exceptionHandling(error);
      throw new InternalServerErrorException('Couldn\'t save user');
    }
  }

  async update(userId: string, updateUserDto: UpdateUserRequest): Promise<GetUserDetailsResponse> {
    try {
      const updatedUser = await this.UserModel
        .findOneAndUpdate({ _id: userId }, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException('User Not Found');
      }

      return {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        email: updatedUser.email,
        isPhoneVerify: updatedUser.isPhoneVerify,
        isEmailVerify: updatedUser.isEmailVerify,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      exceptionHandling(error);
      throw new InternalServerErrorException('Couldn\'t update user');
    }
  }

  async softDelete(userId: string): Promise<GetUserDetailsResponse> {
    try {
      const deletedUser = await this.UserModel.findOneAndUpdate(
        { _id: userId, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      );

      if (!deletedUser) {
        throw new NotFoundException('User Not Found');
      }

      return {
        id: deletedUser.id,
        fullName: deletedUser.fullName,
        phone: deletedUser.phone,
        address: deletedUser.address,
        email: deletedUser.email,
        isPhoneVerify: deletedUser.isPhoneVerify,
        isEmailVerify: deletedUser.isEmailVerify,
        role: deletedUser.role,
        createdAt: deletedUser.createdAt,
        updatedAt: deletedUser.updatedAt,
        deletedAt: deletedUser.deletedAt,
      };
    } catch (error) {
      exceptionHandling(error);
      throw new InternalServerErrorException('Couldn\'t delete user');
    }
  }

  // admin create users

  async adminCreateUser(dto: createUserByAdminDto) {
    const user = await findOneByFieldName<User>(this.UserModel, 'email', dto.email);
    if (user) {
      throw new BadRequestException(ServerErrors.USER_EXISTS);
    }
    const password = await passwordGenerator();
    const newUser = new this.UserModel({ ...dto, password });

    return newUser;
  }

  async findDMOUser(id: string) {
    const dmoUser = await findOneById<User>(this.UserModel, id);

    if (!dmoUser) {
      throw new NotFoundException(ServerErrors.USER_NOT_FOUND);
    }
    if (dmoUser.role !== 'dmo') {
      throw new NotFoundException(ServerErrors.NOT_DMO_USER);
    }

    return true;
  }
}
