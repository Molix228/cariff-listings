import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('body_types')
export class BodyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category: string;
}
