import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAddressesController } from './customer_addresses.controller.js';

describe('CustomerAddressesController', () => {
  let controller: CustomerAddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerAddressesController],
    }).compile();

    controller = module.get<CustomerAddressesController>(CustomerAddressesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
