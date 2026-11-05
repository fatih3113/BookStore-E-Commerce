import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishersController } from './publishers.controller.js';
import { PublishersService } from './publishers.service.js';
import { Publisher } from './entities/publisher-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  controllers: [PublishersController],
  providers: [PublishersService],
})
export class PublishersModule {}