/* eslint-disable no-shadow */
export enum GoogleWalletObjectState {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  INACTIVE = 'INACTIVE',
}

export interface GoogleWalletPass {
  objectId: string;
  saveUrl: string;
}
