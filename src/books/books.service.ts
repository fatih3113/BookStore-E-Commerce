import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  In,
  Repository,
} from 'typeorm';
import { Book } from './entities/book-entity.js';
import { Category } from '../categories/entities/category-entity.js';
import { Publisher } from '../publishers/entities/publisher-entity.js';
import { Author } from '../authors/entities/author-entity.js';
import { BookAuthor } from '../book_authors/entities/book-author-entity.js';
import {
  CreateBookDto,
  FindBooksQueryDto,
  UpdateBookDto,
} from './dto/books_dto.js';

const BOOK_RELATIONS = {
  category: true,
  publisher: true,
  bookAuthors: { author: true },
} as const;

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    private readonly dataSource: DataSource,
  ) {}

  // mencari semua buku (filter opsional: search, kategori, penerbit, ketersediaan)
  async findAll(query: FindBooksQueryDto): Promise<Book[]> {
    const base: FindOptionsWhere<Book> = {};
    if (query.categoryId) base.category = { id: query.categoryId };
    if (query.publisherId) base.publisher = { id: query.publisherId };
    if (query.isAvailable !== undefined) base.isAvailable = query.isAvailable;

    const where: FindOptionsWhere<Book> | FindOptionsWhere<Book>[] =
      query.search
        ? [
            { ...base, title: ILike(`%${query.search}%`) },
            { ...base, isbn: ILike(`%${query.search}%`) },
          ]
        : base;

    return this.bookRepository.find({
      where,
      relations: BOOK_RELATIONS,
      order: { title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: BOOK_RELATIONS,
    });

    if (!book) {
      throw new NotFoundException(`Book dengan id ${id} tidak ditemukan`);
    }

    return book;
  }

  async create(dto: CreateBookDto): Promise<Book> {
    await this.assertIsbnAvailable(dto.isbn);

    const category = dto.categoryId
      ? await this.getCategory(dto.categoryId)
      : null;
    const publisher = dto.publisherId
      ? await this.getPublisher(dto.publisherId)
      : null;
    const authorIds = await this.validateAuthors(dto.authorIds);

    const stock = dto.stock ?? 0;

    const bookId = await this.dataSource.transaction(async (manager) => {
      const book = manager.create(Book, {
        title: dto.title,
        isbn: dto.isbn,
        publishedYear: dto.publishedYear ?? 0,
        price: dto.price ?? 0,
        stock,
        // sinkronisasi dengan stok: stok 0 => tidak tersedia
        isAvailable: stock > 0 && (dto.isAvailable ?? true),
        category,
        publisher,
      });
      const saved = await manager.save(book);

      if (authorIds.length > 0) {
        await manager.insert(
          BookAuthor,
          authorIds.map((authorId) => ({ bookId: saved.id, authorId })),
        );
      }
      return saved.id;
    });

    return this.findOne(bookId);
  }

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book dengan id ${id} tidak ditemukan`);
    }

    if (dto.isbn !== undefined && dto.isbn !== book.isbn) {
      await this.assertIsbnAvailable(dto.isbn);
      book.isbn = dto.isbn;
    }
    if (dto.title !== undefined) book.title = dto.title;
    if (dto.publishedYear !== undefined) book.publishedYear = dto.publishedYear;
    if (dto.price !== undefined) book.price = dto.price;

    if (dto.categoryId !== undefined) {
      book.category = dto.categoryId
        ? await this.getCategory(dto.categoryId)
        : null;
    }
    if (dto.publisherId !== undefined) {
      book.publisher = dto.publisherId
        ? await this.getPublisher(dto.publisherId)
        : null;
    }

    // sinkronisasi stok <-> isAvailable
    const previousStock = book.stock;
    if (dto.stock !== undefined) book.stock = dto.stock;
    if (dto.isAvailable !== undefined) {
      book.isAvailable = dto.isAvailable;
    } else if (previousStock === 0 && book.stock > 0) {
      book.isAvailable = true; // restock => tersedia kembali
    }
    if (book.stock <= 0) book.isAvailable = false;

    const authorIds =
      dto.authorIds !== undefined
        ? await this.validateAuthors(dto.authorIds)
        : undefined;

    await this.dataSource.transaction(async (manager) => {
      await manager.save(book);

      if (authorIds !== undefined) {
        // ganti seluruh penulis buku dengan daftar baru
        await manager.delete(BookAuthor, { bookId: id });
        if (authorIds.length > 0) {
          await manager.insert(
            BookAuthor,
            authorIds.map((authorId) => ({ bookId: id, authorId })),
          );
        }
      }
    });

    return this.findOne(id);
  }

  // soft delete (deleted_at terisi) agar riwayat order_items tetap utuh
  async remove(id: string): Promise<{ message: string }> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book dengan id ${id} tidak ditemukan`);
    }

    await this.bookRepository.softRemove(book);
    return { message: `Book "${book.title}" berhasil dihapus` };
  }

  // ---------- helper ----------

  private async assertIsbnAvailable(isbn: string): Promise<void> {
    const existing = await this.bookRepository.findOne({
      where: { isbn },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(`Buku dengan ISBN "${isbn}" sudah ada`);
    }
  }

  private async getCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category dengan id ${id} tidak ditemukan`);
    }
    return category;
  }

  private async getPublisher(id: string): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({ where: { id } });
    if (!publisher) {
      throw new NotFoundException(`Publisher dengan id ${id} tidak ditemukan`);
    }
    return publisher;
  }

  private async validateAuthors(authorIds?: string[]): Promise<string[]> {
    if (!authorIds || authorIds.length === 0) return [];

    const found = await this.authorRepository.find({
      where: { id: In(authorIds) },
      select: { id: true },
    });
    if (found.length !== authorIds.length) {
      const foundIds = new Set(found.map((a) => a.id));
      const missing = authorIds.filter((authorId) => !foundIds.has(authorId));
      throw new BadRequestException(
        `Author tidak ditemukan: ${missing.join(', ')}`,
      );
    }
    return authorIds;
  }
}