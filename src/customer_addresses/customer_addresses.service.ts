import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerAddress } from './entities/customer-addresses-entity.js';
import { Customer } from '../customers/entities/customer-entity.js';
import {
  CreateCustomerAddressDto,
  FindCustomerAddressesQueryDto,
  UpdateCustomerAddressDto,
} from './dto/customer_addresses_dto.js';

@Injectable()
export class CustomerAddressesService {
  constructor(
    @InjectRepository(CustomerAddress)
    private readonly addressRepository: Repository<CustomerAddress>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // mencari semua alamat (opsional difilter berdasarkan pelanggan)
  async findAll(query: FindCustomerAddressesQueryDto): Promise<CustomerAddress[]> {
    return this.addressRepository.find({
      where: query.customerId ? { customer: { id: query.customerId } } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<CustomerAddress> {
    const address = await this.addressRepository.findOne({
      where: { id },
      relations: { customer: true },
    });

    if (!address) {
      throw new NotFoundException(`Alamat dengan id ${id} tidak ditemukan`);
    }

    return address;
  }

  async create(dto: CreateCustomerAddressDto): Promise<CustomerAddress> {
    const { customerId, ...data } = dto;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Customer dengan id ${customerId} tidak ditemukan`,
      );
    }

    const address = this.addressRepository.create({ ...data, customer });
    const saved = await this.addressRepository.save(address);
    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    const address = await this.findOne(id);
    Object.assign(address, dto);
    await this.addressRepository.save(address);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const address = await this.findOne(id);
    await this.addressRepository.remove(address);

    return { message: 'Alamat berhasil dihapus' };
  }
}