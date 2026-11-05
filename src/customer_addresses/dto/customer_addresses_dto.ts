import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama penerima tidak boleh kosong' })
  @MaxLength(150)
  recipientName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon penerima tidak boleh kosong' })
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Kota tidak boleh kosong' })
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Kode pos tidak boleh kosong' })
  @MaxLength(10)
  postalCode: string;
}

// alamat tidak dapat dipindahkan ke pelanggan lain, jadi customerId tidak ikut
export class UpdateCustomerAddressDto extends PartialType(
  OmitType(CreateCustomerAddressDto, ['customerId'] as const),
) {}

export class FindCustomerAddressesQueryDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;
}