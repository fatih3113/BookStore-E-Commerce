import { Module } from '@nestjs/common';
import { OrderItemsController } from './order_items.controller.js';
import { OrderItemsService } from './order_items.service.js';

@Module({
  controllers: [OrderItemsController],
  providers: [OrderItemsService]
})
export class OrderItemsModule {}
