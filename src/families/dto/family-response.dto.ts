import { Family } from '../entities/family.entity';

export class FamilyResponseDto {
  id: string;
  incomeRange: string;
  receivesIncomeTransfer: boolean;
  housingType: string;
  addressId: string;

  constructor(family: Family) {
    this.id = family.id;
    this.incomeRange = family.incomeRange;
    this.receivesIncomeTransfer = family.receivesIncomeTransfer;
    this.housingType = family.housingType;
    this.addressId = family.addressId;
  }
}
