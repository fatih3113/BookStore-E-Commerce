import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { Payment } from './entities/payment-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}