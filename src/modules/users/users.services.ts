/* eslint-disable no-underscore-dangle */
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
import {
  findOneByFieldName, findOneByFieldNameExcludeId, findOneById, update, updateById,
} from 'src/core/helper/query-helper';
import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { passwordGenerator } from 'src/common/utils/randomPassword.genetator';
import { UpdateLastLoginRequest } from 'src/modules/users/requests/update-last-logins.request';
import { ConfigService } from 'src/services/config/config.service';
import { UserType } from './users.type';
import { HashService } from 'src/services/hash/hash.service';
import { MailService } from 'src/services/mail/mail.service';
import { ChangePasswordDto } from '../auth/requests/change-password.dto';
import { OTP } from './schema/otp.schema';
import { generateOTP } from 'src/common/otpGenerate';
import { JwtAuthService } from '../jwt-auth/services/jwt-auth.service';
import { checkExpireDate, oneHrsExpireDate } from 'src/common/expireDate';
import { VerifyOtpDto } from '../auth/requests/verify-otp.dto';
import { UpdatePasswordDto } from '../auth/requests/forget-password.dto';

@Injectable()
export class UsersService {
  private email: string;
  private password: string;
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
    @InjectModel(OTP.name)
    private OtpModel: Model<OTP>,
    private readonly mailService: MailService,
    private readonly hashService: HashService,
    private readonly jwtAuthService: JwtAuthService,
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

      const [splittedfirstName, splittedlastName] = (user.fullName || '').split(' ');

      return {
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName || splittedfirstName,
        lastName: user.lastName || splittedlastName,
        phoneDetails: {
          countryCode: user.countryCode,
          phoneNumber: user.phoneNumber,
        },
        address: user.address,
        dob: user.dob,
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

      const hashedPassword = await this.hashService.create(registerDto.password);

      const newUser = await (new this.UserModel({ ...registerDto, password: hashedPassword })).save();

      await this.mailService.sendWelcome(newUser);
      return {
        id: newUser.id,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneDetails: {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        },
        address: newUser.address,
        dob: newUser.dob,
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

  async generateOtp(user: User): Promise<string> {
    const code = await generateOTP();

    const otp = await this.OtpModel.create({
      code,
      expireDate: oneHrsExpireDate(),
      userId: user._id,
    });

    const otpBody = {
      id: `${otp._id}`,
      code: otp.code,
      email: user.email,
    };
    const { otpToken } = this.jwtAuthService.otpToken(otpBody);

    await this.mailService.sendForgetPasswordOtp(user, code);
    return otpToken;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<string> {
    const decode = this.jwtAuthService.otpDecode(dto.token);

    const otp = await this.OtpModel.findById(decode.id).exec();

    if (otp.code === dto.code) {
      if (checkExpireDate(otp.expireDate)) {
        if (!otp.isVerify) {
          await updateById<OTP>(this.OtpModel, otp._id, { isVerify: true, updatedAt: new Date() });
          return ServerSuccess.OTP.VERIFY;
        }
        throw new BadRequestException(ServerErrors.OTP.EXPIRE);
      } else {
        throw new BadRequestException(ServerErrors.OTP.EXPIRE);
      }
    } else {
      throw new BadRequestException(ServerErrors.OTP.NOT_MATCH);
    }
  }

  async updatePassword(dto: UpdatePasswordDto) {
    const decode = this.jwtAuthService.otpDecode(dto.token);

    const otp = await this.OtpModel.findById(decode.id).exec();

    if (!otp.isVerify) {
      throw new BadRequestException(ServerErrors.OTP.NOT_VERIFY);
    }
    const hashedPassword = await this.hashService.create(dto.password);

    const updateUser = await updateById<User>(
      this.UserModel,
      otp.userId,
      { password: hashedPassword, updatedAt: new Date() },
    );

    if (!updateUser) {
      throw new BadRequestException(ServerErrors.USER.NOT_FOUND);
    }
    return true;
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
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneDetails: {
          countryCode: updatedUser.countryCode,
          phoneNumber: updatedUser.phoneNumber,
        },
        address: updatedUser.address,
        dob: updatedUser.dob,
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

  async changePassword(user: string, dto: ChangePasswordDto): Promise<User> {
    const hashedPassword = await this.hashService.create(dto.password);

    const userWithChangedPwd = await update<User>(this.UserModel, 'email', user, { password: hashedPassword });
    if (!userWithChangedPwd) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }
    return userWithChangedPwd;
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
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        phoneDetails: {
          countryCode: deletedUser.countryCode,
          phoneNumber: deletedUser.phoneNumber,
        },
        address: deletedUser.address,
        dob: deletedUser.dob,
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

  async findByFieldNameExcludeId(fieldName: keyof User, items: string, id:string): Promise<boolean> {
    const user = await findOneByFieldNameExcludeId<User>(
      this.UserModel,
      fieldName,
      items,
      id,
    );
    if (user) {
      throw new BadRequestException(`${fieldName.toUpperCase()} already exists`);
    }
    return false;
  }

  async createByExternalApi(registerDto: RegisterRequest): Promise<GetUserDetailsResponse> {
    try {
      const user = await findOneByFieldName<User>(
        this.UserModel,
        'email',
        registerDto.email,
      );

      if (user) {
        return {
          id: user.id,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneDetails: {
            countryCode: user.countryCode,
            phoneNumber: user.phoneNumber,
          },
          address: user.address,
          dob: user.dob,
          email: user.email,
          isPhoneVerify: user.isPhoneVerify,
          isEmailVerify: user.isEmailVerify,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }
      const newUser = await (new this.UserModel(registerDto)).save();

      await this.mailService.sendWelcomeWithPwd(newUser);
      return {
        id: newUser.id,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneDetails: {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        },
        address: newUser.address,
        dob: newUser.dob,
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
}
