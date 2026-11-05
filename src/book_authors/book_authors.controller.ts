import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BookAuthorsService } from './book_authors.service.js';
import {
  CreateBookAuthorDto,
  FindBookAuthorsQueryDto,
} from './dto/book_authors_dto.js';

@Controller('book-authors')
export class BookAuthorsController {
  constructor(private readonly bookAuthorsService: BookAuthorsService) {}

  // GET /book-authors?bookId=&authorId=
  @Get()
  findAll(@Query() query: FindBookAuthorsQueryDto) {
    return this.bookAuthorsService.findAll(query);
  }

  // GET /book-authors/:bookId/:authorId
  @Get(':bookId/:authorId')
  findOne(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ) {
    return this.bookAuthorsService.findOne(bookId, authorId);
  }

  // POST /book-authors
  @Post()
  create(@Body() dto: CreateBookAuthorDto) {
    return this.bookAuthorsService.create(dto);
  }

  // DELETE /book-authors/:bookId/:authorId
  @Delete(':bookId/:authorId')
  remove(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Param('authorId', ParseUUIDPipe) authorId: string,
  ) {
    return this.bookAuthorsService.remove(bookId, authorId);
  }
}