import { ApiProperty } from '@nestjs/swagger';

import { ToBoolean } from 'src/core/decorators/to-boolean.decorator';

class OpeningHours {
  @ApiProperty({ type: String, description: 'Days of operation' })
    days: string;

  @ApiProperty({ type: Date, description: 'Opening time' })
    open: Date;

  @ApiProperty({ type: Date, description: 'Closing time' })
    close: Date;

  @ApiProperty({
    type: Boolean,
    description: 'Is it a holiday?',
    default: false,
  })
  @ToBoolean()
    isHoliday: boolean;
}

class PickUpLocation {
  @ApiProperty({ type: String })
    address: string;

  @ApiProperty({ type: Boolean })
  @ToBoolean()
    isAlwaysOpen: boolean;

  @ApiProperty()
    openingHrs: OpeningHours[];
}

export class DeliveryArea {
  @ApiProperty({ type: String, description: 'DeliveryArea' })
    area: string;

  @ApiProperty({ type: String, description: 'Price to deliver to the area' })
    price: string;

  @ApiProperty({ type: String, description: 'Pickup location in that area' })
    pickUpLocation: PickUpLocation[];
}
