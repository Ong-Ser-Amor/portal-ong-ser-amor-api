import { Contact } from '../entities/contact.entity';

export class ContactResponseDto {
  id: string;
  contactType: string;
  value: string;

  constructor(contact: Contact) {
    this.id = contact.id;
    this.contactType = contact.contactType;
    this.value = contact.value;
  }
}
