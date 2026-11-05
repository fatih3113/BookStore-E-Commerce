import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher-entity.js';
import { Book } from '../books/entities/book-entity.js';
import {
  CreatePublisherDto,
  UpdatePublisherDto,
} from './dto/publishers_dto.js';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAll(): Promise<Publisher[]> {
    return this.publisherRepository.find({ order: { name: 'ASC' } });
  }

  // menampilkan penerbit beserta buku yang diterbitkan
  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publisherRepository.findOne({
      where: { id },
      relations: { books: true },
    });

    if (!publisher) {
      throw new NotFoundException(`Publisher dengan id ${id} tidak ditemukan`);
    }

    return publisher;
  }

  async create(dto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publisherRepository.create(dto);
    return this.publisherRepository.save(publisher);
  }

  async update(id: string, dto: UpdatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, dto);
    return this.publisherRepository.save(publisher);
  }

  async remove(id: string): Promise<{ message: string }> {
    const publisher = await this.findOne(id);

    // jaga integritas data: penerbit yang masih punya buku tidak boleh dihapus
    const totalBooks = await this.bookRepository.count({
      where: { publisher: { id } },
      withDeleted: true,
    });
    if (totalBooks > 0) {
      throw new ConflictException(
        `Publisher "${publisher.name}" masih memiliki ${totalBooks} buku`,
      );
    }

    await this.publisherRepository.remove(publisher);
    return { message: `Publisher "${publisher.name}" berhasil dihapus` };
  }
}