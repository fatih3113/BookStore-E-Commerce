import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Order } from '../../orders/entities/order-entity.js';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 30 })
  status: string;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date | null;

  @OneToOne(() => Order, (order) => order.payment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}