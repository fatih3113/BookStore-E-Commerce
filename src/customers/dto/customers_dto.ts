import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
//penambahan customers
export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan tidak boleh kosong' })
  @MaxLength(150)
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  @MaxLength(20)
  phone: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}