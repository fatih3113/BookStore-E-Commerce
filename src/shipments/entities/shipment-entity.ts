import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Order } from '../../orders/entities/order-entity.js';

@Entity({ name: 'shipments' })
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  courier: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'tracking_number',
    nullable: true,
  })
  trackingNumber: string | null;

  @Column({ type: 'varchar', length: 30 })
  status: string;

  @Column({ type: 'timestamp', name: 'shipped_at', nullable: true })
  shippedAt: Date | null;

  @Column({ type: 'timestamp', name: 'delivered_at', nullable: true })
  deliveredAt: Date | null;

  @OneToOne(() => Order, (order) => order.shipment, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;
}