/* eslint-disable no-console */
import {
  UsePipes,
  HttpCode,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiResponseOptions,
  ApiTags,
} from '@nestjs/swagger';
import { ServerErrors, softValidationPipe, standardValidationPipe } from 'src/common/constant';
import { strIf } from '../helper/text-helper';

export const hasApiEndpointDecoratorMetadataName = 'hasApiEndpointDecorator';

export function targetToString(target: Object, propertyKey?: string | symbol) {
  return `${target.constructor.name}${strIf(() => `.${propertyKey!.toString()}`, !!propertyKey)}`;
}

export function targetLogPrefix(target: Object, propertyKey?: string | symbol) {
  return `${targetToString(target, propertyKey)}:`;
}

export const ApiEndpoint = (args: {
  allowExtraDtoFields?: boolean
  noAuthToken?: boolean

  response?: ApiResponseOptions & {
    /**
     * Whether to override the return status with the `status` code specified in `response`
     */
    enforceStatus?: boolean
  }
  tags?: string[]
  softBlockExtraDtoFields?: boolean
}) => {
  const {
    allowExtraDtoFields,
    noAuthToken,
    response,
    tags,
    softBlockExtraDtoFields,
  } = args;

  const decorators: MethodDecorator[] = [];

  if (response) {
    const { enforceStatus, ...responseRest } = response;
    decorators.push(ApiResponse(responseRest));
    if (enforceStatus) {
      const { status } = response;
      if (typeof status === 'number') {
        decorators.push(HttpCode(status));
      } else {
        decorators.push(
          (target, propertyKey) => (
            // eslint-disable-next-line no-console
            console.warn(
              `${targetLogPrefix(target, propertyKey)} response.enforceStatus specified, `
                + 'but response.status is not a number, so it will not be enforced',
            )
          ),
        );
      }
    }
  }

  if (tags?.length) {
    decorators.push(ApiTags(...tags));
  }

  // ApiResponse decorator in that case.
  decorators.push(ApiResponse({ status: 422, description: ServerErrors.FAILED_VALIDATION }));

  if (noAuthToken) {
    decorators.push(ApiBearerAuth());
    decorators.push(ApiResponse({ status: 401, description: ServerErrors.JWT_EXPIRED_OR_NOT_FOUND }));

    /** @TODO After permissionsRequired feature and permissions data has been UATed, remove the feature flags below. */
  }
  if (allowExtraDtoFields && softBlockExtraDtoFields) {
    decorators.push(
      (target, propertyKey) => {
        throw new Error(
          `${targetLogPrefix(target, propertyKey)} allowExtraDtoFields and softBlockExtraDtoFields are mutually exclusive`,
        );
      },
    );
  } else if (allowExtraDtoFields) {
    decorators.push(
      (target, propertyKey) => {
        console.warn(
          `${targetLogPrefix(target, propertyKey)} [SECURITY] `
            + 'extra fields not defined in the input dto '
            + 'are allowed to pass through to endpoint, potentially upserting '
            + 'restricted or hidden database columns',
        );
      },
    );
  } else if (softBlockExtraDtoFields) {
    // prune extra fields but don't reject the request
    decorators.push(UsePipes(softValidationPipe));
  } else {
    // reject request if there are extra fields
    decorators.push(UsePipes(standardValidationPipe));
  }

  decorators.push(SetMetadata(hasApiEndpointDecoratorMetadataName, true));

  const decorator: MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    decorators.forEach(decorate => decorate(target, propertyKey, descriptor));
  };

  return decorator;
};
