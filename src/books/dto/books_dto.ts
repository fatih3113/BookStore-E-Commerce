import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul buku tidak boleh kosong' })
  @MaxLength(30)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'ISBN tidak boleh kosong' })
  @MaxLength(45)
  isbn: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  publishedYear?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  // kategori utama buku (boleh null pada update untuk melepas kategori)
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @IsOptional()
  @IsUUID()
  publisherId?: string | null;

  // relasi many-to-many ke authors melalui tabel book_authors
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  authorIds?: string[];
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class FindBooksQueryDto {
  // pencarian pada judul atau ISBN
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAvailable?: boolean;
}