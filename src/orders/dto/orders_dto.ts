import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

// daftar status pesanan yang diperbolehkan
const ORDER_STATUSES = [
  'pending',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
];

// satu baris buku yang dibeli saat checkout
export class OrderItemInputDto {
  @IsUUID()
  bookId: string;

  @IsInt()
  @Min(1, { message: 'Jumlah buku minimal 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan minimal berisi 1 buku' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES, {
    message: `status harus salah satu dari: ${ORDER_STATUSES.join(', ')}`,
  })
  status: string;
}

export class FindOrdersQueryDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsIn(ORDER_STATUSES)
  status?: string;
}