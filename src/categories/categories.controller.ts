import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/category_dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // mencari semua category
  // GET /categories
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // mencari data berdasarkan id
  // GET /categories/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  // menyimpan category baru
  // POST /categories
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  // update
  // PATCH /categories/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    return this.categoriesService.update(id, dto);
  }

  // hapus
  // DELETE /categories/:id
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}