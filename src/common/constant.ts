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
  FORBIDDEN: 'Access Denied',
  IS_NOT_BLANK: 'cannot be empty or contain only spaces',
  USER: {
    NOT_FOUND: 'User not found',
    EXISTS: 'User already exists',
    NOT_MATCH: 'Password Not match',
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

  PRODUCT: {
    NOT_FOUND: 'Product not found',
    ADD_FAILED: {
      BUSINESS: 'Unable to add a new product as your business is either not valid or have not been approved by DMO.',
    },
  },
  BUSS_CATEGORY: {
    NOT_FOUND: 'Business Category not found',
    EXISTS: 'Bussiness Category already exists',
  },

  BUSS_SUB_CATEGORY: {
    NOT_FOUND: 'Business Sub Category not found',
    EXISTS: 'Bussiness Sub Category already exists',
  },

  GROUP_TYPE: {
    NOT_FOUND: 'Group Type not found',
    EXISTS: 'Group Type already exists',
  },

  ACCESSIBILITY: {
    NOT_FOUND: 'Accessibility not found',
    EXISTS: 'Accessibility already exists',
  },
  VOUCHER_TEMPLATE: {
    NOT_FOUND: 'Voucher Template not found',
    EXISTS: 'Voucher Template already exists',
  },
  VOUCHER: {
    NOT_FOUND: 'Voucher not found',
    EXISTS: 'Voucher  already exists',
    CANNOT_UPDATE_BALANCE: 'The voucher balance cannot be updated as the entered amount exceeds the voucher value',
  },

  CAMPAIGN: {
    NOT_FOUND: 'Campaign not found',
    EXISTS: 'Campaign already exists',
  },

  ORDERS: {
    NOT_FOUND: 'Order not found',
  },
  OTP: {
    EXPIRE: 'Code was expire',
    NOT_MATCH: 'Code not match',
    NOT_VERIFY: 'Code was not verify',
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
  USER: {
    CREATED: 'User was succesfully created',
    LISTED: 'User was succesfully listed',
    UPDATED: 'User was succesfully updated',
    DELETED: 'User was deleted successfully',
<<<<<<< HEAD
    CHANGEPASSWORD: 'Password change successfully',
=======
>>>>>>> main
    FORGET_PASSWORD: 'OTP was successfully send',
  },
  ICON_CREATED: 'Icon was succesfully created',
  ICON_LISTED: 'Icon was succesfully listed',
  ICON_UPDATED: 'Icon was succesfully updated',

  ICON_CATEGORY_CREATED: 'Icon category was succesfully created',
  ICON_CATEGORY_LISTED: 'Icon category was succesfully listed',
  ICON_CATEGORY_UPDATED: 'Icon category was succesfully updated',

  MEDIA: {
    UPLOADED: 'Media was uploaded successfully',
    DELETED: 'Media was deleted successfully',
  },

  PRODUCTS: {
    CREATED: 'Product was created successfully',
    UPDATED: 'Product was updated sucessfully',
    LISTED: 'Product was listed sucessfully',
    DELETED: 'Product was deleted sucessfully',
  },

  ACCESSIBILITY: {
    CREATED: 'Accessibility was created successfully',
    UPDATED: 'Accessibility was updated sucessfully',
    LISTED: 'Accessibility was listed sucessfully',
    DELETED: 'Accessibility was deleted sucessfully',
  },
  GROUP_TYPE: {
    CREATED: 'Group Type was created successfully',
    UPDATED: 'Group Type was updated sucessfully',
    LISTED: 'Group Type was listed sucessfully',
    DELETED: 'Group Type was deleted sucessfully',
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
  VOUCHER_TEMPLATE: {
    CREATED: 'Voucher Template was succesfully created',
    UPDATED: 'Voucher Template was succesfully updated',
    LISTED: 'Voucher Template was succesfully listed',
    DELETED: 'Voucher Template was succesfully deleted',
  },

  VOUCHER: {
    CREATED: 'Voucher  was succesfully created',
    UPDATED: 'Voucher  was succesfully updated',
    LISTED: 'Voucher  was succesfully listed',
    DELETED: 'Voucher  was succesfully deleted',
    ASSIGNED: 'Voucher was successfully assigned',
  },

  CAMPAIGN: {
    CREATED: 'Campaign was succesfully created',
    UPDATED: 'Campaign was succesfully updated',
    LISTED: 'Campaign was succesfully listed',
    DELETED: 'Campaign was succesfully deleted',
  },

  ORDERS: {
    CREATED: 'Order was succesfully created',
    UPDATED: 'Order was succesfully updated',
    LISTED: 'Order was succesfully listed',
    DELETED: 'Order was succesfully deleted',
  },
  OTP: {
    VERIFY: 'Code was verify',
  },
};
