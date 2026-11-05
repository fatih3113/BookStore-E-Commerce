import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishersController } from './publishers.controller.js';
import { PublishersService } from './publishers.service.js';
import { Publisher } from './entities/publisher-entity.js';
import { Book } from '../books/entities/book-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher, Book])],
  controllers: [PublishersController],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}