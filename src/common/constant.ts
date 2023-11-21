import { ValidationPipe } from '@nestjs/common';

export const standardValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
});

export const softValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidUnknownValues: true,
});

export const ServerErrors = {
  USER: {
    NOT_FOUND: 'User not found',
    EXISTS: 'User already exists',
  },
  NOT_DMO_USER: 'Not a dmo user',
  JWT_EXPIRED_OR_NOT_FOUND: 'Authorization header not found or jwt token has expired',
  FAILED_VALIDATION: 'Failed Validation',
  MAP_POINT_EXISTS: 'This Map Point already exists',
  MAP_POINT_CATEGORIES_EXISTS: 'This Map Point Categories already exists',
  MAP_POINT_SUB_CATEGORIES_EXISTS: 'This Map Point Sub Categories already exists',
  MAP_POINT_SUB_CATEGORIES_ITEMS_EXISTS: 'This Map Point Sub Categories Items already exists',
  MAP_POINT_NOT_FOUND: 'Map Point not found',
  MAP_POINT_CATEGORIES_NOT_FOUND: 'This Map Point Categories not found',
  MAP_POINT_SUB_CATEGORIES_NOT_FOUND: 'This Map Point Sub Categories not found',
  MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND: 'This Map Point Sub Categories Items not found',
  BUSINESS_NOT_FOUND: 'Business not found',
  DMO_NOT_FOUND: 'DMO not found',
  DMO_EXISTS: 'DMO already exists',
  SOCIAL_MEDIA_NOT_FOUND: 'Social Media not found',
  BUSINESS_PHONE_EXISTS: 'Business Number already exists',

  ICON_NOT_FOUND: 'Icon not found',
  ICON_EXISTS: 'Icon already exists',
  ICON_CATEGORY_NOT_FOUND: 'Icon category not found',
  ICON_CATEGORY_EXISTS: 'Icon category already exists',

  CAMPAIGN_NOT_FOUND: 'Campaign not found',
  CAMPAIGN_EXISTS: 'Campaign already exists',

  BUSS_CATEGORY: {
    NOT_FOUND: 'Business Category not found',
    EXISTS: 'Bussiness Category already exists',
  },
  BUSS_SUB_CATEGORY: {
    NOT_FOUND: 'Business Sub Category not found',
    EXISTS: 'Bussiness Sub Category already exists',
  },

};

export const ServerSuccess = {
  MAP_POINT_CREATED: 'Map Point was successfully created',
  MAP_POINT_CATEGORIES_CREATED: 'Map Point Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_CREATED: 'Map Point Sub Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED: 'Map Point Sub Categories Items was successfully created',
  MAP_POINT_LISTED: 'Map Point was successfully listed',
  MAP_POINT_CATEGORIES_LISTED: 'Map Point Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_LISTED: 'Map Point Sub Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED: 'Map Point Sub Categories Items was successfully listed',
  MAP_POINT_UPDATED: 'Map Point was successfully updated',
  MAP_POINT_CATEGORIES_UPDATED: 'Map Point Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_UPDATED: 'Map Point Sub Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED: 'Map Point Sub Categories Items was successfully updated',
  BUSINESS_CREATED: 'Business was successfully created',
  BUSINESS_LISTED: 'Business was successfully listed',
  BUSINESS_UPDATED: 'Business was successfully updated',
  DMO_CREATED: 'DMO was successfully created',
  DMO_LISTED: 'DMO was successfully listed',
  DMO_UPDTED: 'DMO was successfully updated',
  SOCIAL_MEDIA_CREATED: 'Social Media was successfully created',
  SOCIAL_MEDIA_LISTED: 'Social Media was successfully listed',
  SOCIAL_MEDIA_UPDTED: 'Social Media was successfully updated',
  USER_CREATED: 'User was succesfully created',
  USER_LISTED: 'User was succesfully listed',
  USER_UPDATED: 'User was succesfully updated',

  ICON_CREATED: 'Icon was succesfully created',
  ICON_LISTED: 'Icon was succesfully listed',
  ICON_UPDATED: 'Icon was succesfully updated',

  ICON_CATEGORY_CREATED: 'Icon category was succesfully created',
  ICON_CATEGORY_LISTED: 'Icon category was succesfully listed',
  ICON_CATEGORY_UPDATED: 'Icon category was succesfully updated',

  MEDIA: {
    UPLOADED: 'Media uploaded successfully',
    DELETED: 'Media deleted successfully',
  },
  CAMPAIGN_CREATED: 'Campaign was succesfully created',
  CAMPAIGN_LISTED: 'Campaign was succesfully listed',
  CAMPAIGN_UPDATED: 'Campaign was succesfully updated',

  BUSS_CATEGORY: {
    CREATED: 'Business Category was succesfully created',
    UPDATED: 'Bussiness Category was succesfully updated',
    LISTED: 'Bussiness Category was succesfully listed',
    DELETED: 'Bussiness Category was succesfully deleted',
  },
  BUSS_SUB_CATEGORY: {
    CREATED: 'Business Sub Category was succesfully created',
    UPDATED: 'Bussiness Sub Category was succesfully updated',
    LISTED: 'Bussiness SUb Category was succesfully listed',
    DELETED: 'Bussiness Sub Category was succesfully deleted',
  },

};
