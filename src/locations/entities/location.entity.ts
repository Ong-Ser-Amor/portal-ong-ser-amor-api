import { Area } from 'src/areas/entities/area.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('location')
export class Location {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address: string;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Area, (area: Area) => area.location)
  areas: Area[];

  constructor(partial: Partial<Location>) {
    Object.assign(this, partial);
  }
}
