import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerAddressesController } from './customer_addresses.controller.js';
import { CustomerAddressesService } from './customer_addresses.service.js';
import { CustomerAddress } from './entities/customer-addresses-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerAddress])],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
})
export class CustomerAddressesModule {}