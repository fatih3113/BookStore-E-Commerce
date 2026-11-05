import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category-entity.js';
import { CreateCategoryDto } from './dto/category_dto.js';

type UpdateCategoryDto = Partial<CreateCategoryDto>;

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // mencari semua data kategori
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  // menampilkan data berdasarkan id
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { books: true },
    });

    if (!category) {
      throw new NotFoundException(`Category dengan id ${id} tidak ditemukan`);
    }

    return category;
  }

  // menyimpan data kategori baru
  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Category dengan nama "${dto.name}" sudah ada`,
      );
    }

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  // mengubah data kategori
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const duplicate = await this.categoryRepository.findOne({
        where: { name: dto.name },
      });

      if (duplicate) {
        throw new ConflictException(
          `Category dengan nama "${dto.name}" sudah ada`,
        );
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  // menghapus data kategori
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    return { message: `Category "${category.name}" berhasil dihapus` };
  }
}