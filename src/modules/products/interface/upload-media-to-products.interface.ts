import { Image } from 'src/common/interface/image.interface';
import { UserType } from 'src/modules/users/users.type';

export interface UploadMediaCommand {
    productId: string,
    businessId: string,
    loggedInUserId: string,
    body: Image[],
    role: UserType,
}
