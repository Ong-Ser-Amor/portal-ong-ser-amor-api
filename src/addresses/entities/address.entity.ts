import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  street: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement: string | null;

  @Column({ type: 'varchar', length: 50 })
  neighborhood: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 8 })
  zipCode: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 2 })
  state: string;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
