import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BodyType } from './nested/body-type.entity';
import { Make } from './nested/makes.entity';
import { Model } from './nested/models.entity';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BodyType)
  @JoinColumn({ name: 'body_type_id' })
  bodyType: BodyType;

  @ManyToOne(() => Make)
  @JoinColumn({ name: 'make_id' })
  make: Make;

  @ManyToOne(() => Model)
  @JoinColumn({ name: 'model_id' })
  model: Model;

  @Column({ type: 'date', name: 'initial_reg', nullable: false })
  initialReg: Date;

  @Column({ type: 'int', name: 'mileage', nullable: false })
  mileage: number;

  @Column({ type: 'decimal', name: 'price', nullable: false })
  price: number;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  vin?: string;

  @Column('text', { array: true, nullable: true, default: '{}' })
  features: string[];

  @Column({ type: 'jsonb', nullable: true, default: {} })
  specs: Record<string, string>;

  @Column('text', { array: true, nullable: false })
  images: string[];

  @Column({
    type: 'varchar',
    name: 'source_listing_id',
    nullable: true,
    unique: true,
  })
  sourceListingId: string | null;

  @Column({ type: 'varchar', name: 'source_url', nullable: true })
  sourceUrl: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
