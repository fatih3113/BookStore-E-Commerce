import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePublisherDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama penerbit tidak boleh kosong' })
  @MaxLength(150)
  name: string;
}

export class UpdatePublisherDto extends PartialType(CreatePublisherDto) {}