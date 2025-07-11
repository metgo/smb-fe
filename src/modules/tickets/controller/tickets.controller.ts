import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller('tickets')
export class TicketController {
  constructor(private readonly commandBus: CommandBus) {}
}
