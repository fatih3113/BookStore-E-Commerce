import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item-entity.js';
import { Order } from '../orders/entities/order-entity.js';
import { Book } from '../books/entities/book-entity.js';
import { Payment } from '../payments/entities/payment-entity.js';
import {
  CreateOrderItemDto,
  FindOrderItemsQueryDto,
  UpdateOrderItemDto,
} from './dto/order_items_dto.js';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  // mencari item pesanan (filter opsional: orderId)
  async findAll(query: FindOrderItemsQueryDto): Promise<OrderItem[]> {
    return this.orderItemRepository.find({
      where: query.orderId ? { order: { id: query.orderId } } : {},
      relations: { book: true },
      withDeleted: true,
    });
  }

  async findOne(id: string): Promise<OrderItem> {
    const item = await this.orderItemRepository.findOne({
      where: { id },
      relations: { order: true, book: true },
      withDeleted: true,
    });

    if (!item) {
      throw new NotFoundException(`Order item dengan id ${id} tidak ditemukan`);
    }

    return item;
  }

  // menambah buku ke pesanan yang masih pending
  async create(dto: CreateOrderItemDto): Promise<OrderItem> {
    await this.checkOrderEditable(dto.orderId);

    // buku yang sama tidak boleh dobel dalam satu pesanan
    const duplicate = await this.orderItemRepository.findOne({
      where: { order: { id: dto.orderId }, book: { id: dto.bookId } },
    });
    if (duplicate) {
      throw new ConflictException(
        'Buku sudah ada di pesanan ini, ubah jumlahnya dengan PATCH /order-items/:id',
      );
    }

    const book = await this.bookRepository.findOne({
      where: { id: dto.bookId },
    });
    if (!book) {
      throw new NotFoundException(`Book dengan id ${dto.bookId} tidak ditemukan`);
    }
    if (!book.isAvailable) {
      throw new BadRequestException(`Buku "${book.title}" tidak tersedia`);
    }
    if (book.stock < dto.quantity) {
      throw new BadRequestException(
        `Stok buku "${book.title}" tidak mencukupi (tersisa ${book.stock})`,
      );
    }

    const price = Number(book.price); // snapshot harga saat ini
    const saved = await this.orderItemRepository.save(
      this.orderItemRepository.create({
        order: { id: dto.orderId },
        book,
        quantity: dto.quantity,
        price,
        subtotal: Math.round(price * dto.quantity * 100) / 100,
      }),
    );

    await this.changeStock(book, -dto.quantity);
    await this.updateOrderTotal(dto.orderId);

    return this.findOne(saved.id);
  }

  // mengubah jumlah buku; harga tetap memakai snapshot saat item dibuat
  async update(id: string, dto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOne(id);
    await this.checkOrderEditable(item.order.id);

    const diff = dto.quantity - item.quantity;
    if (diff > 0) {
      // jumlah ditambah -> stok harus cukup
      if (item.book.stock < diff) {
        throw new BadRequestException(
          `Stok buku "${item.book.title}" tidak mencukupi (tersisa ${item.book.stock})`,
        );
      }
      await this.changeStock(item.book, -diff);
    } else if (diff < 0) {
      // jumlah dikurangi -> stok dikembalikan
      await this.changeStock(item.book, -diff);
    }

    await this.orderItemRepository.update(
      { id },
      {
        quantity: dto.quantity,
        subtotal: Math.round(Number(item.price) * dto.quantity * 100) / 100,
      },
    );
    await this.updateOrderTotal(item.order.id);

    return this.findOne(id);
  }

  // menghapus buku dari pesanan pending, stok dikembalikan
  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.checkOrderEditable(item.order.id);

    const totalItems = await this.orderItemRepository.count({
      where: { order: { id: item.order.id } },
    });
    if (totalItems <= 1) {
      throw new BadRequestException(
        'Pesanan harus memiliki minimal 1 item. Batalkan pesanan jika tidak jadi membeli',
      );
    }

    await this.changeStock(item.book, item.quantity);
    await this.orderItemRepository.delete({ id });
    await this.updateOrderTotal(item.order.id);

    return { message: 'Item pesanan berhasil dihapus' };
  }

  // ---------- helper ----------

  // item hanya boleh diubah selama pesanan pending dan belum ada pembayaran
  private async checkOrderEditable(orderId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order dengan id ${orderId} tidak ditemukan`);
    }
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Item hanya dapat diubah pada pesanan berstatus pending (status saat ini: ${order.status})`,
      );
    }

    const payment = await this.paymentRepository.findOne({
      where: { order: { id: orderId } },
    });
    if (payment) {
      throw new ConflictException(
        'Pesanan sudah memiliki catatan pembayaran sehingga itemnya tidak dapat diubah',
      );
    }
  }

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

  // menghitung ulang total pesanan dari jumlah subtotal semua item
  private async updateOrderTotal(orderId: string): Promise<void> {
    const items = await this.orderItemRepository.find({
      where: { order: { id: orderId } },
    });
    const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    await this.orderRepository.update(
      { id: orderId },
      { totalAmount: Math.round(total * 100) / 100 },
    );
  }
}