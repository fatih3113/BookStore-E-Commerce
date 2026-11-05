import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Order } from './entities/order-entity.js';
import { Customer } from '../customers/entities/customer-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { OrderItem } from '../order_items/entities/order-item-entity.js';
import {
  CreateOrderDto,
  FindOrdersQueryDto,
  UpdateOrderStatusDto,
} from './dto/orders_dto.js';

// alur status pesanan yang diperbolehkan
const ORDER_FLOW: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  // mencari semua pesanan (filter opsional: customerId, status)
  async findAll(query: FindOrdersQueryDto): Promise<Order[]> {
    const where: FindOptionsWhere<Order> = {};
    if (query.customerId) where.customer = { id: query.customerId };
    if (query.status) where.status = query.status;

    return this.orderRepository.find({
      where,
      relations: { customer: true },
      order: { createdAt: 'DESC' },
    });
  }

  // detail pesanan: pelanggan, item (beserta buku), pembayaran, pengiriman
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        customer: true,
        items: { book: true },
        payment: true,
        shipment: true,
      },
      withDeleted: true, // pelanggan/buku yang di-soft delete tetap tampil di riwayat
    });

    if (!order) {
      throw new NotFoundException(`Order dengan id ${id} tidak ditemukan`);
    }

    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. pelanggan harus ada
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer dengan id ${dto.customerId} tidak ditemukan`,
      );
    }

    // 2. buku yang sama tidak boleh muncul dua kali
    const bookIds = dto.items.map((item) => item.bookId);
    if (new Set(bookIds).size !== bookIds.length) {
      throw new BadRequestException(
        'Buku yang sama tidak boleh muncul dua kali, gabungkan jumlahnya',
      );
    }

    // 3. cek semua buku dulu (ada, tersedia, stok cukup) dan hitung total
    const books: Book[] = [];
    let total = 0;
    for (const item of dto.items) {
      const book = await this.bookRepository.findOne({
        where: { id: item.bookId },
      });
      if (!book) {
        throw new NotFoundException(
          `Book dengan id ${item.bookId} tidak ditemukan`,
        );
      }
      if (!book.isAvailable) {
        throw new BadRequestException(`Buku "${book.title}" tidak tersedia`);
      }
      if (book.stock < item.quantity) {
        throw new BadRequestException(
          `Stok buku "${book.title}" tidak mencukupi (tersisa ${book.stock})`,
        );
      }
      books.push(book);
      total += Number(book.price) * item.quantity;
    }

    // 4. simpan pesanan
    const order = await this.orderRepository.save(
      this.orderRepository.create({
        orderNumber: this.generateOrderNumber(),
        status: 'pending',
        totalAmount: Math.round(total * 100) / 100,
        customer,
      }),
    );

    // 5. simpan item pesanan dan kurangi stok buku
    for (let i = 0; i < dto.items.length; i++) {
      const book = books[i];
      const quantity = dto.items[i].quantity;
      const price = Number(book.price);

      await this.orderItemRepository.save(
        this.orderItemRepository.create({
          order,
          book,
          quantity,
          price,
          subtotal: Math.round(price * quantity * 100) / 100,
        }),
      );

      await this.changeStock(book, -quantity);
    }

    return this.findOne(order.id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);

    // cek alur status
    if (!ORDER_FLOW[order.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Status pesanan tidak dapat diubah dari "${order.status}" ke "${dto.status}"`,
      );
    }

    // status pesanan harus sesuai dengan pembayaran & pengiriman
    if (dto.status === 'paid' && order.payment?.status !== 'paid') {
      throw new BadRequestException(
        'Pesanan belum dapat berstatus paid: pembayaran belum berhasil',
      );
    }
    if (dto.status === 'shipped' && order.shipment?.status !== 'shipped') {
      throw new BadRequestException(
        'Pesanan belum dapat berstatus shipped: pengiriman belum dikirim',
      );
    }
    if (dto.status === 'completed' && order.shipment?.status !== 'delivered') {
      throw new BadRequestException(
        'Pesanan belum dapat berstatus completed: pesanan belum diterima',
      );
    }

    // pesanan dibatalkan -> kembalikan stok setiap buku
    if (dto.status === 'cancelled') {
      for (const item of order.items) {
        await this.changeStock(item.book, item.quantity);
      }
    }

    await this.orderRepository.update({ id }, { status: dto.status });
    return this.findOne(id);
  }

  // ---------- helper ----------

  // menambah / mengurangi stok. Stok 0 -> buku tidak tersedia,
  // stok kembali terisi dari 0 -> buku tersedia lagi
  private async changeStock(book: Book, change: number): Promise<void> {
    const wasEmpty = book.stock === 0;
    const newStock = book.stock + change;

    let isAvailable = book.isAvailable;
    if (newStock === 0) isAvailable = false;
    else if (wasEmpty && change > 0) isAvailable = true;

    await this.bookRepository.update(
      { id: book.id },
      { stock: newStock, isAvailable },
    );
  }

  private generateOrderNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${date}-${random}`;
  }
}