import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Shipment } from './entities/shipment-entity.js';
import { Order } from '../orders/entities/order-entity.js';
import {
  CreateShipmentDto,
  FindShipmentsQueryDto,
  UpdateShipmentDto,
  UpdateShipmentStatusDto,
} from './dto/shipments_dto.js';

// pending -> shipped -> delivered
const SHIPMENT_FLOW: Record<string, string[]> = {
  pending: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
};

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(query: FindShipmentsQueryDto): Promise<Shipment[]> {
    const where: FindOptionsWhere<Shipment> = {};
    if (query.orderId) where.order = { id: query.orderId };
    if (query.status) where.status = query.status;

    return this.shipmentRepository.find({
      where,
      relations: { order: true },
    });
  }

  async findOne(id: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
      relations: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment dengan id ${id} tidak ditemukan`);
    }

    return shipment;
  }


  async create(dto: CreateShipmentDto): Promise<Shipment> {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order dengan id ${dto.orderId} tidak ditemukan`);
    }
    if (order.status !== 'paid' && order.status !== 'processing') {
      throw new BadRequestException(
        `Pengiriman hanya dapat dibuat untuk pesanan yang sudah dibayar (status saat ini: ${order.status})`,
      );
    }

    const existing = await this.shipmentRepository.findOne({
      where: { order: { id: dto.orderId } },
    });
    if (existing) {
      throw new ConflictException('Pesanan ini sudah memiliki pengiriman');
    }

    const saved = await this.shipmentRepository.save(
      this.shipmentRepository.create({
        order,
        courier: dto.courier,
        trackingNumber: dto.trackingNumber ?? null,
        status: 'pending',
        shippedAt: null,
        deliveredAt: null,
      }),
    );

    if (order.status === 'paid') {
      await this.orderRepository.update(
        { id: order.id },
        { status: 'processing' },
      );
    }

    return this.findOne(saved.id);
  }

  // mengubah kurir / nomor resi (selama belum diterima)
  async update(id: string, dto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    if (shipment.status === 'delivered') {
      throw new BadRequestException(
        'Pengiriman yang sudah diterima tidak dapat diubah',
      );
    }

    Object.assign(shipment, dto);
    await this.shipmentRepository.save(shipment);
    return this.findOne(id);
  }


  async updateStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.findOne(id);

    if (!SHIPMENT_FLOW[shipment.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Status pengiriman tidak dapat diubah dari "${shipment.status}" ke "${dto.status}"`,
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id: shipment.order.id },
    });
    if (!order) {
      throw new NotFoundException('Order untuk pengiriman ini tidak ditemukan');
    }

    if (dto.status === 'shipped') {
      if (!shipment.trackingNumber) {
        throw new BadRequestException(
          'Nomor resi wajib diisi sebelum pengiriman berstatus shipped',
        );
      }
      if (order.status !== 'processing') {
        throw new BadRequestException(
          `Pesanan berstatus "${order.status}" sehingga belum dapat dikirim`,
        );
      }
      shipment.shippedAt = new Date();
      await this.orderRepository.update({ id: order.id }, { status: 'shipped' });
    }

    if (dto.status === 'delivered') {
      shipment.deliveredAt = new Date();
      await this.orderRepository.update(
        { id: order.id },
        { status: 'completed' },
      );
    }

    shipment.status = dto.status;
    await this.shipmentRepository.save(shipment);
    return this.findOne(id);
  }

  // hanya pengiriman yang belum dikirim yang boleh dihapus
  async remove(id: string): Promise<{ message: string }> {
    const shipment = await this.findOne(id);

    if (shipment.status !== 'pending') {
      throw new BadRequestException(
        'Hanya pengiriman berstatus pending yang dapat dihapus',
      );
    }

    // pesanan kembali menunggu pengiriman
    if (shipment.order.status === 'processing') {
      await this.orderRepository.update(
        { id: shipment.order.id },
        { status: 'paid' },
      );
    }

    await this.shipmentRepository.remove(shipment);
    return { message: 'Pengiriman berhasil dihapus' };
  }
}