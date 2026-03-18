import { Address } from '../entities/address.entity';

export class AddressResponseDto {
  id: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  zipCode: string;
  city: string;
  state: string;

  constructor(address: Address) {
    this.id = address.id;
    this.street = address.street;
    this.number = address.number;
    this.complement = address.complement;
    this.neighborhood = address.neighborhood;
    this.zipCode = address.zipCode;
    this.city = address.city;
    this.state = address.state;
  }
}
