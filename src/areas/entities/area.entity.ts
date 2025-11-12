import { Location } from 'src/locations/entities/location.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'area' })
@Unique('UQ_AREA_NAME_LOCATION_ID', ['name', 'locationId'])
export class Area {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'location_id', type: 'integer' })
  locationId: number;

  @Index()
  @ManyToOne(() => Location, (location: Location) => location.areas)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'id' })
  location: Location;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  constructor(partial: Partial<Area>) {
    Object.assign(this, partial);
  }
}
