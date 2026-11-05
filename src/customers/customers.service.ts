import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer-entity.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customers_dto.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // mencari semua data pelanggan (yang belum di-soft delete)
  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ order: { name: 'ASC' } });
  }

  // menampilkan pelanggan beserta alamatnya
  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: { addresses: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer dengan id ${id} tidak ditemukan`);
    }

    return customer;
  }

  // menampilkan riwayat pesanan milik pelanggan
  async findOrders(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: { orders: true },
      order: { orders: { createdAt: 'DESC' } },
    });

    if (!customer) {
      throw new NotFoundException(`Customer dengan id ${id} tidak ditemukan`);
    }

    return customer;
  }

  // menyimpan pelanggan baru
  async create(dto: CreateCustomerDto): Promise<Customer> {
    await this.assertEmailAvailable(dto.email);

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  // mengubah data pelanggan
  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (dto.email && dto.email !== customer.email) {
      await this.assertEmailAvailable(dto.email);
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  // soft delete: data tetap ada (deleted_at terisi) sehingga riwayat pesanan aman
  async remove(id: string): Promise<{ message: string }> {
    const customer = await this.findOne(id);
    await this.customerRepository.softRemove(customer);

    return { message: `Customer "${customer.name}" berhasil dihapus` };
  }

  // email bersifat unik, termasuk terhadap data yang sudah di-soft delete
  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.customerRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Email "${email}" sudah terdaftar`);
    }
  }
}

//penambahan customers