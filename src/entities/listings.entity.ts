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

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('text', { array: true, nullable: false })
  images: string[];

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
