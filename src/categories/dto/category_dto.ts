import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  readonly name: string;
}

// penambahan kategori