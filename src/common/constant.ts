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

export const milesConfig = 5;

export const impactRange = {
  min: 200,
  max: 800,
};

export const notifPayload = { type: 'NEW_NOTIFICATION' };
export const defaultMetGoLogo = 'default-metgo-logo-OBNusjAgOeNMDToi1.png';
export const defaultMetGoLogoURL
  = 'https://storage.googleapis.com/metgo_dev/2024/6/dzqmK8civ9yuGPs8.png';

export const emailDefaultTemplate = {
  PRIMARY_BG_COLOR: '#39AEEA',
  PRIMARY_TEXT_COLOR: '#FFFFFF',
  SIDE_LOGO:
    'https://storage.googleapis.com/metgo_dev/2024/6/PXFefWso_3aYY_C9.png',
  MAIN_LOGO:
    'https://storage.googleapis.com/metgo_dev/2024/6/PVDn19Gq-k644tRM.png',
  IMAGE1:
    'https://mcusercontent.com/ea29cc0201ca929f255720bbf/images/5c7837bc-e798-8d83-6b78-47b42cf81319.png',
  IMAGE2:
    'https://mcusercontent.com/ea29cc0201ca929f255720bbf/images/f6ea7516-9ec5-92fe-75e2-0f449ddc04a2.png',
  IMAGE3:
    'https://mcusercontent.com/ea29cc0201ca929f255720bbf/images/adfeaba8-bc86-0edc-bca4-96701c43cbd0.jpeg',
};

export const ServerErrors = {
  FORBIDDEN: 'Access Denied',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  IS_NOT_EMPTY: 'cannot be empty',
  IS_NOT_BLANK: 'cannot be empty or contain only spaces',
  DUPLICATE: 'already exists',
  DATE_IS_NOT_LESS: 'start date must be less than end date.',
  INVALID_ID: 'id is invalid',
  INVALID: 'is invalid',
  INVALID_QUANTITY: 'Entered quantity is not valid number',
  NOT_FOUND: 'not found',

  EVENT: {
    NOT_FOUND: 'Event not found',
  },
  MAP_POINT: {
    NOT_FOUND: 'Map Point not found',
  },
  USER: {
    NOT_FOUND: 'User not found',
    EXISTS: 'User already exists',
    NOT_MATCH: 'Password Not match',
    DELETED_BUT_RECOVERABLE: 'The user has been deleted but can be recovered.',
    BLOCKED:
      'Your account is currently restricted due to multiple unsuccessful login attempts.',
    INVALID_CREDENTIALS: 'Invalid Credentials',
  },
  NOT_DMO_USER: 'Not a dmo user',
  JWT_EXPIRED_OR_NOT_FOUND:
    'Authorization header not found or jwt token has expired',
  FAILED_VALIDATION: 'Failed Validation',
  MAP_POINT_EXISTS: 'This Map Point already exists',
  MAP_POINT_CATEGORIES_EXISTS: 'This Map Point Categories already exists',
  MAP_POINT_SUB_CATEGORIES_EXISTS:
    'This Map Point Sub Categories already exists',
  MAP_POINT_SUB_CATEGORIES_ITEMS_EXISTS:
    'This Map Point Sub Categories Items already exists',
  MAP_POINT_NOT_FOUND: 'Map Point not found',
  MAP_POINT_CATEGORIES_NOT_FOUND: 'This Map Point Categories not found',
  MAP_POINT_SUB_CATEGORIES_NOT_FOUND: 'This Map Point Sub Categories not found',
  MAP_POINT_SUB_CATEGORIES_ITEMS_NOT_FOUND:
    'This Map Point Sub Categories Items not found',
  BUSINESS_NOT_FOUND: 'Business not found',
  EVENTS_NOT_FOUND: 'Event not found',
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
      BUSINESS:
        'Unable to add a new product as your business is either not valid or have not been approved by DMO.',
    },
    IMAGE_EMPTY: 'Product must have at least one image',
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

  AUTHORITY: {
    EXISTS: 'Authority name already exists',
    NOT_FOUND: 'Authority not found',
  },

  CITY: {
    NOT_FOUND: 'City not found',
  },

  VOUCHER_TEMPLATE: {
    NOT_FOUND: 'Voucher Template not found',
    EXISTS: 'Voucher Template already exists',
  },
  VOUCHER: {
    NOT_FOUND: 'Voucher not found',
    RESTRICTED_CAMPAIGN: 'This voucher cannot be used on this website',
    EXISTS: 'Voucher already exists',
    NO_BALANCE: 'This voucher has no balance and is not applicable.',
    UNPAID:
      'Access to the voucher is forbidden until payment is made successfully',
    CANNOT_UPDATE_BALANCE:
      'The voucher balance cannot be updated as the entered amount exceeds the voucher value',
    EXPIRED: 'Your voucher has expired and is no longer valid.',
    CANNOT_ASSIGN:
      'This voucher no longer exists or you lack the required permissions',
    LIMIT_EXCEEDED: 'You can no longer create voucher under this campaign',
    CONCURRENT_REDEMPTION:
      'This voucher was just redeemed by another request. Please try again.',
  },

  CAMPAIGN: {
    NOT_FOUND: 'Invalid campaign',
    EXISTS: 'Campaign already exists',
    EXPIRED_OR_REWARD_DONT_EXIST:
      'The campaign is either expired or has no reward',
  },

  CART: {
    NOT_FOUND: 'Cart not found',
  },

  ORDERS: {
    NOT_FOUND: 'Order not found',
  },
  OTP: {
    EXPIRE: 'Code was expire',
    NOT_MATCH: 'Code not match',
    NOT_VERIFY: 'Code was not verify',
  },
  EXTERNAL_API: {
    IDENTIFIER_ID: 'The provided identifier id doesnt exist',
    NOT_FOUND: 'External API was not found',
  },
  MEDIA: {
    NOT_FOUND: 'URL not found',
  },
  PAYMENT: {
    FAILED: 'Your payment was failed',
  },
  PROMOTION_GROUP: {
    NOT_FOUND: 'Promotion group not found',
    EXISTS: 'Promotion group already exists for this externalApiId',
  },
};

export const ServerSuccess = {
  CREATED: 'was created successfully',
  LISTED: 'was listed sucessfully',
  UPDATED: 'was updated sucessfully',
  DELETED: 'was deleted sucessfully',
  CONTACT_US_EMAIL: 'Contact Us email saved successfully',
  INQUIRY_FUNDAY: 'Inquiry funday saved successfully',
  SEARCH: 'Search data listed successfully',
  MAP_POINT_CREATED: 'Map Point was successfully created',
  MAP_POINT_CATEGORIES_CREATED: 'Map Point Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_CREATED:
    'Map Point Sub Categories was successfully created',
  MAP_POINT_SUB_CATEGORIES_ITEMS_CREATED:
    'Map Point Sub Categories Items was successfully created',
  MAP_POINT_LISTED: 'Map Point was successfully listed',
  MAP_POINT_CATEGORIES_LISTED: 'Map Point Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_LISTED:
    'Map Point Sub Categories was successfully listed',
  MAP_POINT_SUB_CATEGORIES_ITEMS_LISTED:
    'Map Point Sub Categories Items was successfully listed',
  MAP_POINT_UPDATED: 'Map Point was successfully updated',
  MAP_POINT_CATEGORIES_UPDATED: 'Map Point Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_UPDATED:
    'Map Point Sub Categories was successfully updated',
  MAP_POINT_SUB_CATEGORIES_ITEMS_UPDATED:
    'Map Point Sub Categories Items was successfully updated',
  BUSINESS_CREATED: 'Business was successfully created',
  BUSINESS_LISTED: 'Business was successfully listed',
  BUSINESS_UPDATED: 'Business was successfully updated',
  DMO_CREATED: 'DMO was successfully created',
  DMO_LISTED: 'DMO was successfully listed',
  DMO_UPDTED: 'DMO was successfully updated',
  SOCIAL_MEDIA_CREATED: 'Social Media was successfully created',
  SOCIAL_MEDIA_LISTED: 'Social Media was successfully listed',
  SOCIAL_MEDIA_UPDTED: 'Social Media was successfully updated',
  CART: {
    CREATED: 'Cart was succesfully created',
    UPDATED: 'Cart was succesfully updated',
    LISTED: 'Cart was succesfully listed',
    DELETED: 'Cart was succesfully deleted',
  },
  USER: {
    CREATED: 'User was succesfully created',
    LISTED: 'User was succesfully listed',
    UPDATED: 'User was succesfully updated',
    DELETED:
      'User was deleted successfully and can be restored within the next 30 days',
    HARD_DELETED: 'User was deleted successfully and cannot be recovered.',
    CHANGEPASSWORD: 'Password change successfully',
    FORGET_PASSWORD: 'OTP was successfully send',
    RECOVER: 'User account was successfully recovered',
    UNBLOCK: 'User account was successfully unblocked',
  },
  ICON_CREATED: 'Icon was succesfully created',
  ICON_LISTED: 'Icon was succesfully listed',
  ICON_UPDATED: 'Icon was succesfully updated',

  ICON_CATEGORY_CREATED: 'Icon category was succesfully created',
  ICON_CATEGORY_LISTED: 'Icon category was succesfully listed',
  ICON_CATEGORY_UPDATED: 'Icon category was succesfully updated',

  MOCK_DATA: {
    LISTED: 'Mock data  was succesfully listed',
  },
  MEDIA: {
    UPLOADED: 'Media was uploaded successfully',
    DELETED: 'Media was deleted successfully',
  },

  USER_ENGAGEMENT: {
    LISTED: 'User Engagement was succesfully listed',
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
  AUTHORITY: {
    CREATED: 'Authority was created successfully',
    LISTED: 'Authority was listed sucessfully',
  },
  EVENTS: {
    CREATED: 'Events was successfully created',
    UPDATED: 'Events was successfully updated',
    LISTED: 'Events was successfully listed',
    DELETED: 'Events was successfully deleted',
  },
  MAPPOINTS: {
    CREATED: 'Map-point was successfully created',
    UPDATED: 'Map-point was successfully updated',
    LISTED: 'Map-point was successfully listed',
    DELETED: 'Map-point was successfully deleted',
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
  CITY: {
    CREATED: 'City was created successfully',
    LISTED: 'City was listed sucessfully',
  },
  VOUCHER_TEMPLATE: {
    CREATED: 'Voucher Template was succesfully created',
    UPDATED: 'Voucher Template was succesfully updated',
    LISTED: 'Voucher Template was succesfully listed',
    DELETED: 'Voucher Template was succesfully deleted',
  },

  VOUCHER: {
    CREATED: 'Voucher was succesfully created',
    UPDATED: 'Voucher was succesfully updated',
    LISTED: 'Voucher was succesfully listed',
    DELETED: 'Voucher was succesfully deleted',
    ASSIGNED: 'Voucher was successfully assigned',
  },

  CAMPAIGN_SEGMENT: {
    CREATED: 'Campaign segment was succesfully created',
    UPDATED: 'Campaign segment was succesfully updated',
    LISTED: 'Campaign segment was succesfully listed',
    DELETED: 'Campaign segment was succesfully deleted',
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
  SETTINGS: {
    CREATED: 'Settings was created successfully',
    UPDATED: 'Settings was updated sucessfully',
    LISTED: 'Settings was listed sucessfully',
    DELETED: 'Settings was deleted sucessfully',
  },
  PAYMENT: {
    START: 'Your payment process begins',
    UPDATE: 'Your payment was successfully updated',
    SUCCESS: 'Your payment was successfully paid',
  },
  REWARD: {
    UPDATED: 'Rewards was updated sucessfully',
  },
  EXTERNAL_API: {
    CREATED: 'New External API was added successfully',
    LISTED: 'External APIs was listed successfully',
    UPDATED: 'External APIs was updated successfully',
    DELETED: 'can no longer use our API',
    VOUCHER: {
      CREATED: 'voucher was created successfully',
      UPDATE_BALANCE: 'Voucher Balance was successfully updated to',
      ASSIGNED: 'Voucher was successfully assigned to',
    },
  },
  EMAIL: {
    SENT: 'Email was sent successfully',
  },
  SMS: {
    SENT: 'SMS was sent successfully',
  },
  THEME: {
    CREATED: 'Theme was created successfully',
  },
  TICKET: {
    CREATED: 'Ticket for event was created successfully',
    DELETED: 'Ticket for event was deleted successfully',
    LISTED: 'Ticket for event was listed successfully',
  },
  PROMOTION_GROUP: {
    CREATED: 'Promotion group was created successfully',
    UPDATED: 'Promotion group was updated successfully',
    LISTED: 'Promotion group was listed successfully',
  },
};
