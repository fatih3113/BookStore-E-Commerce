import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// daftar status pengiriman yang diperbolehkan
const SHIPMENT_STATUSES = ['pending', 'shipped', 'delivered'];

export class CreateShipmentDto {
  @IsUUID()
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama kurir tidak boleh kosong' })
  @MaxLength(100)
  courier: string;

  // nomor resi boleh kosong saat pengiriman dibuat, wajib saat status shipped
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  trackingNumber?: string;
}

export class UpdateShipmentDto extends PartialType(
  OmitType(CreateShipmentDto, ['orderId'] as const),
) {}

export class UpdateShipmentStatusDto {
  @IsIn(SHIPMENT_STATUSES, {
    message: `status harus salah satu dari: ${SHIPMENT_STATUSES.join(', ')}`,
  })
  status: string;
}

export class FindShipmentsQueryDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsIn(SHIPMENT_STATUSES)
  status?: string;
}