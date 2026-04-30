import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ServerErrors } from 'src/common/constant';
import { authConfig } from 'src/core/authConfig';
import { LoginInterface } from 'src/modules/auth/interface/login.interface';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { IGoogleUser } from 'src/modules/auth/auth.types';
import { AuthorityService } from 'src/modules/authority/authority.service';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';
import { UsersService } from 'src/modules/users/users.services';
import { UserType } from 'src/modules/users/users.type';
import { ConfigService } from 'src/services/config/config.service';
import { HashService } from 'src/services/hash/hash.service';
import { ExternalApiServices } from '../external-api/external-api.service';
import { RegisterRequest } from './requests/register.request';
import { exceptionHandling } from 'src/common/utils/exception-handling';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AuthClient')
    private authClient,
    private httpService: HttpService,
    private authorityService: AuthorityService,
    private dmoService: DMOService,
    private usersService: UsersService,
    private jwtAuthService: JwtAuthService,
    private externalApiServices: ExternalApiServices,
    private readonly hashService: HashService,
    private readonly configService: ConfigService,
  ) {}

  // async login(body: SignInRequest): Promise<LoginInterface> {
  //   const user = await this.usersService.validateUserIfNeedToRecover(
  //     body.email,
  //   );

  //   if (!user) {
  //     throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
  //   }
  //   const isPasswordValid = await this.hashService.validate(
  //     user.password,
  //     body.password,
  //   );

  //   if (user.loginAttempts > 4) {
  //     throw new UnauthorizedException(ServerErrors.USER.BLOCKED);
  //   }

  //   if (!isPasswordValid) {
  //     await this.usersService.updateLastLogin(user.id, {
  //       loginAttempts: user.loginAttempts + 1,
  //     });

  //     // take action if login attempts is greater than 5
  //     throw new ForbiddenException(ServerErrors.USER.INVALID_CREDENTIALS);
  //   }
  //   const userBody = {
  //     id: user.id,
  //     email: user.email,
  //     role: user.role,
  //     hasBusiness: user.hasBusiness,
  //   };
  //   const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);

  //   let dmo;
  //   let authority;
  //   if (user.role === UserType.DMO || user.role === UserType.DMOADMIN) {
  //     dmo = await this.dmoService.findDMOByUserID(user.id);
  //   }

  //   if (
  //     user.role === UserType.AUTHORITY
  //     || user.role === UserType.AUTHORITY_ADMIN
  //   ) {
  //     authority = await this.authorityService.findAuthorityByUserID(user.id);
  //     dmo = authority.dmoId;
  //   }
  //   await this.usersService.updateLastLogin(user.id, {
  //     lastLogin: new Date(),
  //     loginAttempts: 0,
  //   });

  //   return {
  //     accessToken,
  //     refreshToken,
  //     user: {
  //       id: user.id,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       phoneDetails: {
  //         countryCode: user.countryCode || null,
  //         phoneNumber: user.phoneNumber,
  //       },
  //       languagePreference: user.languagePreference,
  //       address: user.address,
  //       dob: user.dob,
  //       email: user.email,
  //       isPhoneVerify: user.isPhoneVerify,
  //       isEmailVerify: user.isEmailVerify,
  //       role: user.role,
  //       hasBusiness: user.hasBusiness,
  //       dmo: dmo ? { id: dmo._id, name: dmo.name } : null,
  //       authority: authority
  //         ? { id: authority._id, name: authority.name }
  //         : null,
  //     },
  //   };
  // }

  // OAUTH
  getGoogleAuthURL(): string {
    return this.authClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: authConfig.google.scopes,
    });
  }

  async login(body: SignInRequest): Promise<LoginInterface> {
    const user = await this.usersService.validateUserIfNeedToRecover(
      body.email,
    );

    if (!user) {
      throw new NotFoundException(ServerErrors.USER.NOT_FOUND);
    }

    if (!user.externalApiIds) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }

    const validExternalApi = await this.externalApiServices.getById(
      user.externalApiIds?.toString(),
    );

    if (!validExternalApi) {
      throw new NotFoundException(ServerErrors.EXTERNAL_API.NOT_FOUND);
    }

    const isPasswordValid = await this.hashService.validate(
      user.password,
      body.password,
    );

    if (user.loginAttempts > 4) {
      throw new UnauthorizedException(ServerErrors.USER.BLOCKED);
    }

    if (!isPasswordValid) {
      await this.usersService.updateLastLogin(user.id, {
        loginAttempts: user.loginAttempts + 1,
      });

      // take action if login attempts is greater than 5
      throw new ForbiddenException(ServerErrors.USER.INVALID_CREDENTIALS);
    }
    const userBody = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasBusiness: user.hasBusiness,
      externalApiId: user.externalApiIds,
    };
    const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);

    await this.usersService.updateLastLogin(user.id, {
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneDetails: {
          countryCode: user.countryCode || null,
          phoneNumber: user.phoneNumber,
        },
        languagePreference: user.languagePreference,
        address: user.address,
        dob: user.dob,
        email: user.email,
        isPhoneVerify: user.isPhoneVerify,
        isEmailVerify: user.isEmailVerify,
        role: user.role,
        hasBusiness: user.hasBusiness,
        externalApi: {
          id: validExternalApi._id.toString(),
          identifierId: validExternalApi.identifierId,
        },
      },
    };
  }

  async registerUser(body: RegisterRequest) {
    try {
      const externalApi = await this.externalApiServices.findByFieldName(
        'identifierId',
        body.identifierId,
      );
      const { identifierId, ...rest } = body;
      const newBody = { ...rest, externalApiId: externalApi._id };
      const user = await this.usersService.create({ ...newBody, identifierId });

      return user;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  checkValidEmailDomain(googleUser: IGoogleUser): IGoogleUser {
    if (!googleUser) {
      throw new UnauthorizedException('Google User Not Found');
    }

    return googleUser;
  }

  async getGoogleUserInfo(code: string): Promise<IGoogleUser> {
    const { tokens } = await this.authClient.getToken(code);
    const response = await lastValueFrom(
      this.httpService.get(`${authConfig.google.user_url}`, {
        params: {
          alt: 'json',
          access_token: `${tokens.access_token}`,
        },
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      }),
    );

    return this.checkValidEmailDomain(response.data);
  }

  async getGoogleUser(res: any, code: string) {
    try {
      const { FE } = this.configService.baseUrl;
      const googleUser = await this.getGoogleUserInfo(code);
      if (!googleUser) {
        const url = this.invalidEmailURL();
        return res.redirect(url);
      }

      const user = await this.usersService.createUserFromGoogleLogin(
        googleUser,
      );

      if (user?.deletedAt) {
        const url = this.invalidEmailURL();
        return res.redirect(url);
      }

      const userBody = {
        id: user.id,
        email: user.email,
        role: user.role,
        hasBusiness: user.hasBusiness,
      };
      const { accessToken, refreshToken } = this.jwtAuthService.login(userBody);
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });

      let dmo;
      let authority;
      if (user.role === UserType.DMO || user.role === UserType.DMOADMIN) {
        dmo = await this.dmoService.findDMOByUserID(user.id);
      }

      if (
        user.role === UserType.AUTHORITY
        || user.role === UserType.AUTHORITY_ADMIN
      ) {
        authority = await this.authorityService.findAuthorityByUserID(user.id);
        dmo = authority.dmoId;
      }
      await this.usersService.updateLastLogin(user.id, {
        lastLogin: new Date(),
        loginAttempts: 0,
      });

      const data = {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneDetails: {
            countryCode: user.countryCode || null,
            phoneNumber: user.phoneNumber,
          },
          languagePreference: user.languagePreference,
          address: user.address,
          dob: user.dob,
          email: user.email,
          isPhoneVerify: user.isPhoneVerify,
          isEmailVerify: user.isEmailVerify,
          role: user.role,
          hasBusiness: user.hasBusiness,
          dmo: dmo ? { id: dmo._id, name: dmo.name } : null,
          authority: authority
            ? { id: authority._id, name: authority.name }
            : null,
        },
      };
      return res.redirect(
        `${FE}dashboard?userData=${encodeURIComponent(JSON.stringify(data))}`,
      );
    } catch (err) {
      const url = this.invalidEmailURL();
      return res.redirect(url);
    }
  }

  invalidEmailURL(): URL {
    const { FE } = this.configService.baseUrl;

    const stringUrl = `${FE}/login`;
    const url = new URL(stringUrl);
    const params = url.searchParams;
    params.append('error', 'invalid_email');
    return url;
  }
}
