import { Image } from 'src/common/interface/image.interface';
import { ProductDto } from 'src/modules/products/dto/product.dto';
import { AllFilterQuery, FilterQuery } from 'src/modules/products/dto';
import { WebCreateProduct } from 'src/modules/products/dto/web-create-product.dto';
import { UserType } from '../users/users.type';

/* eslint-disable no-shadow */
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export interface FindProductsQuery {
    query: AllFilterQuery | FilterQuery,
    myProduct?: boolean,
    collaboratedProducts?: boolean,
    loggedInUser?: string,
    isAdmin?:boolean,
}

export interface UpdateCommand {
    productId: string,
    businessId: string,
    loggedInUserId: string,
    body: ProductDto | WebCreateProduct,
    isAdmin: boolean,

}

export interface UploadMediaCommand {
    productId: string,
    businessId: string,
    loggedInUserId: string,
    body: Image[],
    role: UserType
}
