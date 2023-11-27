import {
  BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { RegisterRequest } from 'src/modules/auth/requests/register.request';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { User } from 'src/modules/users/schema/users.schema';
import { createUserByAdminDto } from './requests/create-user-ByAdmin.dto';
import { findOneByFieldName, findOneById, updateById } from 'src/core/helper/query-helper';
import { ServerErrors } from 'src/common/constant';
import { passwordGenerator } from 'src/common/utils/randomPassword.genetator';
import { UpdateLastLoginRequest } from 'src/modules/users/requests/update-last-logins.request';
import { ConfigService } from 'src/services/config/config.service';
import { UserType } from './users.type';
import { MailService } from 'src/services/mail/mail.service';

@Injectable()
export class UsersService {
  private email: string;
  private password: string;
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
    private readonly mailService: MailService,
  ) {
    const configService = new ConfigService();

    this.email = configService.superAdminEmail;
    this.password = configService.superAdminPassword;
  }

  async seedSuperadmin() {
    const superadmin = {
      fullName: 'Super Admin',
      email: this.email,
      password: this.password,
      role: UserType.SUPERADMIN,
    };

    // Check if superadmin already exists
    const existingSuperadmin = await this.UserModel.findOne({ email: superadmin.email }).exec();

    if (!existingSuperadmin) {
      await this.UserModel.create(superadmin);
      console.log('Superadmin seeded successfully.');
    } else {
      console.log('Superadmin already exists.');
    }
  }

  async getMyInformation(userId: string): Promise<GetUserDetailsResponse> {
    try {
      const user = await findOneById<User>(this.UserModel, userId);

      if (!user) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: user.id,
        fullName: user.fullName,
        phoneDetails: {
          countryCode: user.countryCode,
          phoneNumber: user.phoneNumber,
        },
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

  async create(registerDto: RegisterRequest): Promise<GetUserDetailsResponse> {
    try {
      const userExists = await findOneByFieldName<User>(
        this.UserModel,
        'email',
        registerDto.email,
      );

      if (userExists) {
        throw new ConflictException(ServerErrors.USER.EXISTS);
      }
      const newUser = await (new this.UserModel(registerDto)).save();

      await this.mailService.sendWelcome(newUser);
      return {
        id: newUser.id,
        fullName: newUser.fullName,
        phoneDetails: {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        },
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

  async update(userId: string, updateUserDto: UpdateUserRequest | UpdateLastLoginRequest): Promise<GetUserDetailsResponse> {
    try {
      const updatedUser = await updateById<User>(
        this.UserModel,
        userId,
        updateUserDto,
      );

      if (!updatedUser) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phoneDetails: {
          countryCode: updatedUser.countryCode,
          phoneNumber: updatedUser.phoneNumber,
        },
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
      const deletedUser = await updateById<User>(
        this.UserModel,
        userId,
        { deletedAt: new Date() },
      );

      if (!deletedUser) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: deletedUser.id,
        fullName: deletedUser.fullName,
        phoneDetails: {
          countryCode: deletedUser.countryCode,
          phoneNumber: deletedUser.phoneNumber,
        },
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

  async findByEmail(email: string): Promise<any> {
    try {
      const user = await findOneByFieldName<User>(
        this.UserModel,
        'email',
        email,
      );

      if (!user) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return user;
    } catch (error) {
      exceptionHandling(error);
      throw new InternalServerErrorException('Couldn\'t find user with given email');
    }
  }

  async findByEmailOrNull(email: string): Promise<User | null> {
    const user = await findOneByFieldName<User>(
      this.UserModel,
      'email',
      email,
    );

    if (!user) {
      return null;
    }

    return user;
  }

  // admin create users

  async adminCreateUser(dto: createUserByAdminDto) {
    const user = await findOneByFieldName<User>(this.UserModel, 'email', dto.email);
    if (user) {
      throw new BadRequestException(ServerErrors.USER.EXISTS);
    }
    const password = await passwordGenerator();
    const newUser = new this.UserModel({ ...dto, password });

    return newUser;
  }

  async findDMOUser(id: string) {
    const dmoUser = await findOneById<User>(this.UserModel, id);

    if (!dmoUser) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }
    if (dmoUser.role !== 'dmo') {
      throw new NotFoundException(ServerErrors.NOT_DMO_USER);
    }

    return true;
  }
}
