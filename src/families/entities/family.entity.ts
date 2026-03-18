import { Address } from 'src/addresses/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { HousingType } from '../enums/housing-type.enum';
import { IncomeRange } from '../enums/income-range.enum';

@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('identity', { type: 'bigint' })
  id: string;

  @Column({ name: 'income_range', type: 'varchar', length: 50 })
  incomeRange: IncomeRange;

  @Column({ name: 'receives_income_transfer', type: 'boolean' })
  receivesIncomeTransfer: boolean;

  @Column({ name: 'housing_type', type: 'varchar', length: 50 })
  housingType: HousingType;

  @Column({ name: 'address_id', type: 'bigint' })
  addressId: string;

  @ManyToOne(() => Address, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  constructor(partial: Partial<Family>) {
    Object.assign(this, partial);
  }
}
