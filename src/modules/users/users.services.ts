import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  findOneByFieldNameIncludingDeleted,
  findOneById,
  update,
  updateById,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { RegisterRequest } from 'src/modules/auth/requests/register.request';
import { BusinessService } from 'src/modules/business/services/business.service';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { User } from 'src/modules/users/schema/users.schema';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { createUserByAdminDto } from './requests/create-user-ByAdmin.dto';
import { ConfigService } from 'src/services/config/config.service';
import {
  OTPPurpose,
  UpdateLastLogin,
  UserType,
} from 'src/modules/users/users.type';
import { HashService } from 'src/services/hash/hash.service';
import { ChangePasswordDto } from '../auth/requests/change-password.dto';
import { OTP } from './schema/otp.schema';
import { generateOTP } from 'src/common/otpGenerate';
import { JwtAuthService } from '../jwt-auth/services/jwt-auth.service';
import { checkExpireDate, oneHrsExpireDate } from 'src/common/expireDate';
import { VerifyOtpDto } from '../auth/requests/verify-otp.dto';
import { UpdatePasswordDto } from '../auth/requests/forget-password.dto';
import { ExternalApiRegisterRequest } from 'src/modules/external-api/dto/register-user.dto';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';

@Injectable()
export class UsersService {
  private email: string;
  private password: string;
  constructor(
    @InjectModel(User.name)
    private UserModel: Model<User>,
    @InjectModel(OTP.name)
    private OtpModel: Model<OTP>,
    private readonly businessService: BusinessService,
    private readonly dmoService: DMOService,
    private readonly hashService: HashService,
    private readonly jwtAuthService: JwtAuthService,
    private mailchimpService: MailChimpService,
    @Inject(forwardRef(() => VoucherService))
    private voucherService: VoucherService,
  ) {
    const configService = new ConfigService();

    this.email = configService.superAdminEmail;
    this.password = configService.superAdminPassword;
  }

  async seedSuperadmin() {
    const superadmin = {
      firstName: 'Super',
      lastName: 'Admin',
      email: this.email,
      password: this.password,
      role: UserType.SUPERADMIN,
    };

    // Check if superadmin already exists
    const existingSuperadmin = await this.UserModel.findOne({
      email: superadmin.email,
    }).exec();

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
        firstName: user.firstName,
        lastName: user.lastName,
        phoneDetails: {
          countryCode: user.countryCode,
          phoneNumber: user.phoneNumber,
        },
        languagePreference: user.languagePreference,
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
      throw new InternalServerErrorException("Couldn't find user");
    }
  }

  async create(
    registerDto: RegisterRequest | ExternalApiRegisterRequest,
  ): Promise<GetUserDetailsResponse> {
    try {
      await this.validateUserIfNeedToRecover(registerDto.email);

      const hashedPassword = await this.hashService.create(
        registerDto.password,
      );

      const newUser = await new this.UserModel({
        ...registerDto,
        password: hashedPassword,
      }).save();

      await Promise.all([
        this.voucherService.updateVoucherCreatedDetails(
          registerDto.email,
          newUser.id,
        ),
        this.voucherService.updateVoucherAssignedDetails(
          registerDto.email,
          newUser.id,
        ),
        this.mailchimpService.subscribe(
          newUser.firstName,
          newUser.lastName,
          newUser.email,
        ),
        this.mailchimpService.sendTransactionalEmail({
          to: newUser.email,
          templatedId: EnglishTemplate.UserRegistrationBySelf,
          mergeVars: {
            FNAME: newUser.firstName,
          },
        }),
      ]);

      // await this.mailService.sendWelcome(newUser);

      return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneDetails: {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        },
        languagePreference: newUser.languagePreference,
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
      if (error.code === 11000) {
        throw new ConflictException(ServerErrors.USER.EXISTS);
      }
      exceptionHandling(error);
    }
  }

  async generateOtp(user: User, purpose: OTPPurpose): Promise<string> {
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
      purpose,
    };
    const { otpToken } = this.jwtAuthService.otpToken(otpBody);

    await this.mailchimpService.sendTransactionalEmail({
      to: user.email,
      templatedId:
        user.languagePreference === Locale.HEBREW
          ? HebrewTemplate.ForgotPassword
          : EnglishTemplate.ForgotPassword,
      mergeVars: {
        FNAME: user.firstName,
        OTP: code,
      },
    });

    if (purpose === OTPPurpose.UNBLOCK_ACCOUNT) {
      const password = nanoid(10);
      const hashedPassword = await this.hashService.create(password);

      await updateById<User>(this.UserModel, user._id, {
        password: hashedPassword,
        updatedAt: new Date(),
      });

      await this.mailchimpService.sendTransactionalEmail({
        to: user.email,
        templatedId:
          user.languagePreference === Locale.HEBREW
            ? HebrewTemplate.PasswordChangeConfirmation
            : EnglishTemplate.PasswordChangeConfirmation,
        mergeVars: {
          FNAME: user.firstName,
          NEWPASSWORD: `New Password: ${password}`,
        },
      });
    }

    return otpToken;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<object> {
    const decode = this.jwtAuthService.otpDecode(dto.token);

    const otp = await this.OtpModel.findById(decode.id).exec();

    if (otp.code === dto.code) {
      if (checkExpireDate(otp.expireDate)) {
        if (!otp.isVerify) {
          await updateById<OTP>(this.OtpModel, otp._id, {
            isVerify: true,
            updatedAt: new Date(),
          });
          return {
            response: ServerSuccess.OTP.VERIFY,
            purpose: decode.purpose,
          };
        }
        throw new BadRequestException(ServerErrors.OTP.EXPIRE);
      }
      throw new BadRequestException(ServerErrors.OTP.EXPIRE);
    }
    throw new BadRequestException(ServerErrors.OTP.NOT_MATCH);
  }

  async updatePassword(dto: UpdatePasswordDto) {
    const decode = this.jwtAuthService.otpDecode(dto.token);

    const otp = await this.OtpModel.findById(decode.id).exec();

    if (!otp.isVerify) {
      throw new BadRequestException(ServerErrors.OTP.NOT_VERIFY);
    }
    const hashedPassword = await this.hashService.create(dto.password);

    const updateUser = await updateById<User>(this.UserModel, otp.userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    if (!updateUser) {
      throw new BadRequestException(ServerErrors.USER.NOT_FOUND);
    }
    return true;
  }

  async update(
    userId: string,
    loggedInUserId: string,
    updateUserDto: UpdateUserRequest,
  ): Promise<GetUserDetailsResponse> {
    try {
      const updatedData = { ...updateUserDto, updatedBy: loggedInUserId };
      const updatedUser = await updateById<User>(
        this.UserModel,
        userId,
        updatedData,
      );

      if (!updatedUser) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneDetails: {
          countryCode: updatedUser.countryCode,
          phoneNumber: updatedUser.phoneNumber,
        },
        languagePreference: updatedUser.languagePreference,
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
      throw new InternalServerErrorException("Couldn't update user");
    }
  }

  async updateLastLogin(userId: string, updateUserDto: UpdateLastLogin) {
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
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneDetails: {
          countryCode: updatedUser.countryCode,
          phoneNumber: updatedUser.phoneNumber,
        },
        languagePreference: updatedUser.languagePreference,
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
      throw new InternalServerErrorException("Couldn't update user");
    }
  }

  async changePassword(user: string, dto: ChangePasswordDto): Promise<User> {
    const hashedPassword = await this.hashService.create(dto.password);

    const userWithChangedPwd = await update<User>(
      this.UserModel,
      'email',
      user,
      { password: hashedPassword },
    );
    if (!userWithChangedPwd) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }

    await this.mailchimpService.sendTransactionalEmail({
      to: userWithChangedPwd.email,
      templatedId:
        userWithChangedPwd.languagePreference === Locale.HEBREW
          ? HebrewTemplate.PasswordChangeConfirmation
          : EnglishTemplate.PasswordChangeConfirmation,
      mergeVars: {
        FNAME: userWithChangedPwd.firstName,
      },
    });

    return userWithChangedPwd;
  }

  async handleDelete() {
    const today = new Date();
    const thirtyDaysAgo = today.setDate(today.getDate() - 30);

    const deletedUsers = await this.UserModel.find({
      deletedAt: { $lte: thirtyDaysAgo },
      isDeleted: false,
    });

    return await Promise.all(
      deletedUsers.map(async user => await this.softDeleteByCron(user.id)),
    );
  }

  async softDeleteByCron(userId: string): Promise<GetUserDetailsResponse> {
    try {
      const currentDate = new Date();
      const timestamp = Math.floor(currentDate.getTime() / 1000);

      const email = `${nanoid(5)}__${timestamp}@metgo.app`;
      const newPassword = 'MetGo@023';

      const password = await this.hashService.create(newPassword);

      const updateField = {
        phoneNumber: '1111111111',
        countryCode: '+1',
        email,
        password,
        isDeleted: true,
        updatedAt: new Date(),
      };

      const deletedUser = await this.UserModel.findOneAndUpdate(
        { _id: userId },
        updateField,
        { new: true },
      );

      if (!deletedUser) {
        return;
      }

      return {
        id: deletedUser.id,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        phoneDetails: {
          countryCode: deletedUser.countryCode,
          phoneNumber: deletedUser.phoneNumber,
        },
        languagePreference: deletedUser.languagePreference,
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
    }
  }

  async softDeleteAllowRecovery(
    userId: string,
    loggedInUserId: string,
  ): Promise<GetUserDetailsResponse> {
    try {
      const deletedUser = await updateById<User>(this.UserModel, userId, {
        deletedAt: new Date(),
        deletedBy: loggedInUserId,
      });

      if (!deletedUser) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: deletedUser.id,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        phoneDetails: {
          countryCode: deletedUser.countryCode,
          phoneNumber: deletedUser.phoneNumber,
        },
        languagePreference: deletedUser.languagePreference,
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
      throw new InternalServerErrorException("Couldn't delete user");
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
      throw new InternalServerErrorException(
        "Couldn't find user with given email",
      );
    }
  }

  async findOne(email: string): Promise<User> {
    try {
      const user = await findOneByFieldNameIncludingDeleted<User>(
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
      throw new InternalServerErrorException(
        "Couldn't find user with given email",
      );
    }
  }

  async findByEmailOrNull(email: string): Promise<User | null> {
    const user = await findOneByFieldName<User>(this.UserModel, 'email', email);

    if (!user) {
      return null;
    }

    return user;
  }

  // admin create users

  async adminCreateUser(dto: createUserByAdminDto, loggedInUser: LoggedInUserInterface) {
    const user = await this.validateUserIfNeedToRecover(dto.email);

    if (user) {
      throw new BadRequestException(ServerErrors.USER.EXISTS);
    }

    const password = nanoid(8);
    const hashedPassword = await this.hashService.create(password);

    let body:any = {
      ...dto,
      password: hashedPassword,
    };

    let newUser;

    if (loggedInUser.role === UserType.DMO) {
      body = {
        ...body,
        role: UserType.DMOADMIN,
      };

      newUser = await this.UserModel.create(body);
      await this.dmoService.addCollaborators(loggedInUser.id, newUser.id);
    } else if (loggedInUser.role === UserType.SUPERADMIN && body.role === UserType.TRAVELLER && body.businessesId?.length) {
      body = {
        ...body,
        hasBusiness: true,
      };

      newUser = await this.UserModel.create(body);
      await this.businessService.assignUsertoBusinesses(body.businessesId, newUser.id);
    } else {
      newUser = await this.UserModel.create(body);
    }

    await Promise.all([
      this.voucherService.updateVoucherCreatedDetails(
        body.email,
        newUser.id,
      ),
      this.voucherService.updateVoucherAssignedDetails(
        body.email,
        newUser.id,
      ),
      this.mailchimpService.subscribe(
        newUser.firstName,
        newUser.lastName,
        newUser.email,
      ),
      this.mailchimpService.sendTransactionalEmail({
        to: newUser.email,
        templatedId: EnglishTemplate.UserRegistrationByAdmin,
        mergeVars: {
          FNAME: newUser.firstName,
          USERNAME: newUser.email,
          PASSWORD: password,
        },
      }),
    ]);

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

  async findByFieldNameExcludeId(
    fieldName: keyof User,
    items: string,
    id: string,
  ): Promise<boolean> {
    try {
      const user = await findOneByFieldNameExcludeId<User>(
        this.UserModel,
        fieldName,
        items,
        id,
      );
      if (user) {
        throw new BadRequestException(
          `${fieldName.toUpperCase()} already exists`,
        );
      }
      return false;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
          throw new BadRequestException(
            `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
          );
        }
        throw new InternalServerErrorException("Couldn't update user");
      }
    }
  }

  async createByExternalApi(
    registerDto: RegisterRequest,
  ): Promise<GetUserDetailsResponse> {
    try {
      const user = await findOneByFieldName<User>(
        this.UserModel,
        'email',
        registerDto.email,
      );

      if (user) {
        return;
      }

      const hashedPassword = await this.hashService.create(
        registerDto.password,
      );

      const newUser = await new this.UserModel({
        ...registerDto,
        password: hashedPassword,
      }).save();

      await Promise.all([
        this.mailchimpService.subscribe(
          newUser.firstName,
          newUser.lastName,
          newUser.email,
        ),
        this.mailchimpService.sendTransactionalEmail({
          to: newUser.email,
          templatedId: EnglishTemplate.UserRegistrationByAdmin,
          mergeVars: {
            FNAME: newUser.firstName,
            USERNAME: newUser.email,
            PASSWORD: registerDto.password,
          },
        }),
      ]);

      // await this.mailService.sendWelcomeWithPwd(newUser);

      return {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneDetails: {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        },
        languagePreference: newUser.languagePreference,
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
      throw new InternalServerErrorException("Couldn't save user");
    }
  }

  async validateUserIfNeedToRecover(email: string) {
    try {
      const user = await this.UserModel.findOne({ email });

      if (user && !user?.isDeleted && user?.deletedAt) {
        throw new ConflictException(ServerErrors.USER.DELETED_BUT_RECOVERABLE);
      }

      if (!user) {
        return null;
      }

      return user;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async recoverUserAccount(email: string): Promise<GetUserDetailsResponse> {
    try {
      const recoveredUser = await this.UserModel.findOneAndUpdate(
        { email },
        {
          $set: {
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
          },
        },
      );

      if (!recoveredUser) {
        throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
      }

      return {
        id: recoveredUser.id,
        firstName: recoveredUser.firstName,
        lastName: recoveredUser.lastName,
        phoneDetails: {
          countryCode: recoveredUser.countryCode,
          phoneNumber: recoveredUser.phoneNumber,
        },
        languagePreference: recoveredUser.languagePreference,
        address: recoveredUser.address,
        dob: recoveredUser.dob,
        email: recoveredUser.email,
        isPhoneVerify: recoveredUser.isPhoneVerify,
        isEmailVerify: recoveredUser.isEmailVerify,
        role: recoveredUser.role,
        createdAt: recoveredUser.createdAt,
        updatedAt: recoveredUser.updatedAt,
        deletedAt: recoveredUser.deletedAt,
      };
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async unblockUserAccount(email: string): Promise<GetUserDetailsResponse> {
    const unblockedUser = await this.UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          loginAttempts: 0,
        },
      },
    );

    if (!unblockedUser) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }

    return {
      id: unblockedUser.id,
      firstName: unblockedUser.firstName,
      lastName: unblockedUser.lastName,
      phoneDetails: {
        countryCode: unblockedUser.countryCode,
        phoneNumber: unblockedUser.phoneNumber,
      },
      languagePreference: unblockedUser.languagePreference,
      address: unblockedUser.address,
      dob: unblockedUser.dob,
      email: unblockedUser.email,
      isPhoneVerify: unblockedUser.isPhoneVerify,
      isEmailVerify: unblockedUser.isEmailVerify,
      role: unblockedUser.role,
      createdAt: unblockedUser.createdAt,
      updatedAt: unblockedUser.updatedAt,
      deletedAt: unblockedUser.deletedAt,
    };
  }
}
