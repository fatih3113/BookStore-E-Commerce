import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './entities/author-entity.js';
import { CreateAuthorDto, UpdateAuthorDto } from './dto/authors_dto.js';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
  ) {}

  // mencari semua data penulis
  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({
      order: { name: 'ASC' },
    });
  }

  // menampilkan data berdasarkan id (beserta buku yang ditulis)
  async findOne(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: { bookAuthors: { book: true } },
    });

    if (!author) {
      throw new NotFoundException(`Author dengan id ${id} tidak ditemukan`);
    }

    return author;
  }

  // menyimpan data penulis baru
  async create(dto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(dto);
    return this.authorRepository.save(author);
  }

  // mengubah data penulis
  async update(id: string, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, dto);
    return this.authorRepository.save(author);
  }

  // menghapus data penulis
  async remove(id: string): Promise<{ message: string }> {
    const author = await this.findOne(id);
    await this.authorRepository.remove(author);

    return { message: `Author "${author.name}" berhasil dihapus` };
  }
}