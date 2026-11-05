import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  bookId: string;

  @IsInt()
  @Min(1, { message: 'Jumlah buku minimal 1' })
  quantity: number;
}

export class UpdateOrderItemDto {
  @IsInt()
  @Min(1, { message: 'Jumlah buku minimal 1' })
  quantity: number;
}

export class FindOrderItemsQueryDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;
}