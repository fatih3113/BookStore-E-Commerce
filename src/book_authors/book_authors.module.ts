import { Module } from '@nestjs/common';
import { BookAuthorsController } from './book_authors.controller.js';
import { BookAuthorsService } from './book_authors.service.js';

@Module({
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService]
})
export class BookAuthorsModule {}
