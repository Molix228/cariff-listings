import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Model } from './models.entity';
import { Listing } from '../listings.entity';

@Entity('makes')
export class Make {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  make: string;

  @OneToMany(() => Model, (model) => model.make)
  models: Model[];

  @OneToMany(() => Listing, (listing) => listing.make)
  listings: Listing[];
}
