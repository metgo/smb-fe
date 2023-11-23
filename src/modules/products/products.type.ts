/* eslint-disable no-shadow */
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface IProductQuery{
    page?: number,
    limit?: number,
    businessId?: string;
}

export interface FindProducts {
    query: IProductQuery,
    myProduct?: boolean,
    collaboratedProducts?: boolean,
    loggedInUser?: string,
}
