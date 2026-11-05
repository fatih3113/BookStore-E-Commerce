import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Customer } from '../../customers/entities/customer-entity.js';
import { OrderItem } from '../../order_items/entities/order-item-entity.js';
import { Payment } from '../../payments/entities/payment-entity.js';
import { Shipment } from '../../shipments/entities/shipment-entity.js';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
  orderNumber: string;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    nullable: false,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<Customer>;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: Relation<OrderItem[]>;

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Relation<Payment>;

  @OneToOne(() => Shipment, (shipment) => shipment.order)
  shipment: Relation<Shipment>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}