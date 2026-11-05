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
import { PublishersService } from './publishers.service.js';
import {
  CreatePublisherDto,
  UpdatePublisherDto,
} from './dto/publishers_dto.js';

@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  // GET /publishers
  @Get()
  findAll() {
    return this.publishersService.findAll();
  }

  // GET /publishers/:id
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.findOne(id);
  }

  // POST /publishers
  @Post()
  create(@Body() dto: CreatePublisherDto) {
    return this.publishersService.create(dto);
  }

  // PATCH /publishers/:id
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublisherDto,
  ) {
    return this.publishersService.update(id, dto);
  }

  // DELETE /publishers/:id
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.publishersService.remove(id);
  }
}