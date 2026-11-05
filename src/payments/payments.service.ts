import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Payment } from './entities/payment-entity.js';
import { Order } from '../orders/entities/order-entity.js';
import {
  CreatePaymentDto,
  FindPaymentsQueryDto,
  UpdatePaymentDto,
  UpdatePaymentStatusDto,
} from './dto/payments_dto.js';

// pending -> paid / failed, failed -> pending (percobaan ulang), paid = final
const PAYMENT_FLOW: Record<string, string[]> = {
  pending: ['paid', 'failed'],
  failed: ['pending'],
  paid: [],
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(query: FindPaymentsQueryDto): Promise<Payment[]> {
    const where: FindOptionsWhere<Payment> = {};
    if (query.orderId) where.order = { id: query.orderId };
    if (query.status) where.status = query.status;

    return this.paymentRepository.find({
      where,
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment dengan id ${id} tidak ditemukan`);
    }

    return payment;
  }

  // mencatat pembayaran untuk satu pesanan (rancangan sederhana: 1 order = 1 payment)
  async create(dto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order dengan id ${dto.orderId} tidak ditemukan`);
    }
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Pembayaran hanya dapat dibuat untuk pesanan berstatus pending (status saat ini: ${order.status})`,
      );
    }

    const existing = await this.paymentRepository.findOne({
      where: { order: { id: dto.orderId } },
    });
    if (existing) {
      throw new ConflictException('Pesanan ini sudah memiliki catatan pembayaran');
    }

    // jumlah pembayaran harus sama dengan total pesanan
    const total = Math.round(Number(order.totalAmount) * 100) / 100;
    const amount =
      dto.amount !== undefined ? Math.round(dto.amount * 100) / 100 : total;
    if (amount !== total) {
      throw new BadRequestException(
        `Jumlah pembayaran (${amount}) harus sama dengan total pesanan (${total})`,
      );
    }

    const saved = await this.paymentRepository.save(
      this.paymentRepository.create({
        order,
        paymentMethod: dto.paymentMethod,
        amount,
        status: 'pending',
        paidAt: null,
      }),
    );

    return this.findOne(saved.id);
  }

  // mengubah metode pembayaran (hanya sebelum lunas)
  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status === 'paid') {
      throw new BadRequestException(
        'Pembayaran yang sudah lunas tidak dapat diubah',
      );
    }

    Object.assign(payment, dto);
    await this.paymentRepository.save(payment);
    return this.findOne(id);
  }

  /**
   * Mengubah status pembayaran.
   * Saat berhasil (paid): paid_at diisi dan status pesanan menjadi paid.
   */
  async updateStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if (!PAYMENT_FLOW[payment.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Status pembayaran tidak dapat diubah dari "${payment.status}" ke "${dto.status}"`,
      );
    }

    if (dto.status === 'paid') {
      const order = await this.orderRepository.findOne({
        where: { id: payment.order.id },
      });
      if (!order || order.status !== 'pending') {
        throw new BadRequestException(
          `Pesanan berstatus "${order?.status}" sehingga tidak dapat dibayar`,
        );
      }

      await this.orderRepository.update({ id: order.id }, { status: 'paid' });
      payment.paidAt = new Date();
    }

    payment.status = dto.status;
    await this.paymentRepository.save(payment);
    return this.findOne(id);
  }

  // hanya pembayaran yang belum lunas yang boleh dihapus
  async remove(id: string): Promise<{ message: string }> {
    const payment = await this.findOne(id);

    if (payment.status === 'paid') {
      throw new BadRequestException(
        'Pembayaran yang sudah lunas tidak dapat dihapus',
      );
    }

    await this.paymentRepository.remove(payment);
    return { message: 'Pembayaran berhasil dihapus' };
  }
}