import { Module } from '@nestjs/common';
import { CustomerAddressesController } from './customer_addresses.controller.js';
import { CustomerAddressesService } from './customer_addresses.service.js';

@Module({
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService]
})
export class CustomerAddressesModule {}
