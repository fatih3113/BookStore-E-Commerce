import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookAuthorsController } from './book_authors.controller.js';
import { BookAuthorsService } from './book_authors.service.js';
import { BookAuthor } from './entities/book-author-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { Author } from '../authors/entities/author-entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([BookAuthor, Book, Author])],
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService],
})
export class BookAuthorsModule {}