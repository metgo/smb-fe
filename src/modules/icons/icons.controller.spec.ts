import { Test, TestingModule } from '@nestjs/testing';
import { IconsController } from './icons.controller';

describe('IconsController', () => {
  let controller: IconsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IconsController],
    }).compile();

    controller = module.get<IconsController>(IconsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
