
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
    nullable: true,
    name: 'tracking_number',
  })
  trackingNumber: string | null;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true, name: 'shipped_at' })
  shippedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date | null;

  @OneToOne(() => Order, (order) => order.shipment, {
    nullable: false,
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
