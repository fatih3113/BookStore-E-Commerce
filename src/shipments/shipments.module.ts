import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller.js';
import { ShipmentsService } from './shipments.service.js';
import { Shipment } from './entities/shipment-entity.js';
import { Order } from '../orders/entities/order-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Order])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}