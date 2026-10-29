import { Module } from '@nestjs/common';
import { PublishersController } from './publishers.controller.js';
import { PublishersService } from './publishers.service.js';

@Module({
  controllers: [PublishersController],
  providers: [PublishersService]
})
export class PublishersModule {}
