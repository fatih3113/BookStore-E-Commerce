import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BookAuthor } from './entities/book-author-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { Author } from '../authors/entities/author-entity.js';
import {
  CreateBookAuthorDto,
  FindBookAuthorsQueryDto,
} from './dto/book_authors_dto.js';

@Injectable()
export class BookAuthorsService {
  constructor(
    @InjectRepository(BookAuthor)
    private readonly bookAuthorRepository: Repository<BookAuthor>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  // mencari relasi buku-penulis (opsional difilter bookId / authorId)
  async findAll(query: FindBookAuthorsQueryDto): Promise<BookAuthor[]> {
    const where: FindOptionsWhere<BookAuthor> = {};
    if (query.bookId) where.bookId = query.bookId;
    if (query.authorId) where.authorId = query.authorId;

    return this.bookAuthorRepository.find({
      where,
      relations: { book: true, author: true },
    });
  }

  async findOne(bookId: string, authorId: string): Promise<BookAuthor> {
    const relation = await this.bookAuthorRepository.findOne({
      where: { bookId, authorId },
      relations: { book: true, author: true },
    });

    if (!relation) {
      throw new NotFoundException(
        'Relasi antara buku dan penulis tersebut tidak ditemukan',
      );
    }

    return relation;
  }

  // menghubungkan buku dengan penulis (many-to-many)
  async create(dto: CreateBookAuthorDto): Promise<BookAuthor> {
    const book = await this.bookRepository.findOne({
      where: { id: dto.bookId },
    });
    if (!book) {
      throw new NotFoundException(`Book dengan id ${dto.bookId} tidak ditemukan`);
    }

    const author = await this.authorRepository.findOne({
      where: { id: dto.authorId },
    });
    if (!author) {
      throw new NotFoundException(
        `Author dengan id ${dto.authorId} tidak ditemukan`,
      );
    }

    const existing = await this.bookAuthorRepository.findOne({
      where: { bookId: dto.bookId, authorId: dto.authorId },
    });
    if (existing) {
      throw new ConflictException(
        `Penulis "${author.name}" sudah terdaftar pada buku "${book.title}"`,
      );
    }

    await this.bookAuthorRepository.insert({
      bookId: dto.bookId,
      authorId: dto.authorId,
    });
    return this.findOne(dto.bookId, dto.authorId);
  }

  // melepas hubungan buku dengan penulis
  async remove(bookId: string, authorId: string): Promise<{ message: string }> {
    const relation = await this.findOne(bookId, authorId);
    await this.bookAuthorRepository.remove(relation);

    return { message: 'Relasi buku dan penulis berhasil dihapus' };
  }
}