import { User } from 'src/modules/users/schema/users.schema';
import { UpdateFieldInterface } from 'src/modules/vouchers/interface/voucher.interface';

export interface AssignVoucherCommand{
    code: string;
    updateField: UpdateFieldInterface;
    loggedInUserEmail: string;
    user?: User | null
}
