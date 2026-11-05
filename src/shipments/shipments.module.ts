import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller.js';
import { ShipmentsService } from './shipments.service.js';
import { Shipment } from './entities/shipment-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
})
export class ShipmentsModule {}