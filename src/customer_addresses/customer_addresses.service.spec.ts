import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAddressesService } from './customer_addresses.service.js';

describe('CustomerAddressesService', () => {
  let service: CustomerAddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerAddressesService],
    }).compile();

    service = module.get<CustomerAddressesService>(CustomerAddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
