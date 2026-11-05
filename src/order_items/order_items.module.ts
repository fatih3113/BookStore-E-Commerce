import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsController } from './order_items.controller.js';
import { OrderItemsService } from './order_items.service.js';
import { OrderItem } from './entities/order-item-entity.js';
import { Order } from '../orders/entities/order-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { Payment } from '../payments/entities/payment-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem, Order, Book, Payment])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
})
export class OrderItemsModule {}