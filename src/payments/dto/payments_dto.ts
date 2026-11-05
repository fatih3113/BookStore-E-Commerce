import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

// daftar status pembayaran yang diperbolehkan
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsString()
  @IsNotEmpty({ message: 'Metode pembayaran tidak boleh kosong' })
  @MaxLength(50)
  paymentMethod: string;

  // opsional: jika kosong memakai total pesanan; jika diisi harus sama dengan total
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  paymentMethod?: string;
}

export class UpdatePaymentStatusDto {
  @IsIn(PAYMENT_STATUSES, {
    message: `status harus salah satu dari: ${PAYMENT_STATUSES.join(', ')}`,
  })
  status: string;
}

export class FindPaymentsQueryDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  status?: string;
}