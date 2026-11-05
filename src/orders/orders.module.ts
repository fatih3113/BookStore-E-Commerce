import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { Order } from './entities/order-entity.js';
import { Customer } from '../customers/entities/customer-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { OrderItem } from '../order_items/entities/order-item-entity.js';
import { Payment } from '../payments/entities/payment-entity.js';
import { Shipment } from '../shipments/entities/shipment-entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Customer,
      Book,
      OrderItem,
      Payment,
      Shipment,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}