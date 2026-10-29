
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book-entity.js';
import { Author } from '../../authors/entities/author-entity.js';

@Entity({ name: 'book_authors' })
export class BookAuthor {
  @PrimaryColumn('uuid', { name: 'book_id' })
  bookId: string;

  @PrimaryColumn('uuid', { name: 'author_id' })
  authorId: string;

  @ManyToOne(() => Book, (book) => book.bookAuthors, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Author, (author) => author.bookAuthors, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: Author;
}
