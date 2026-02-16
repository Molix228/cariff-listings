import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Make } from './makes.entity';

@Entity('models')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  name: string;

  @ManyToOne(() => Make, (make) => make.models)
  @JoinColumn({ name: 'make_id' })
  make: Make;
}
