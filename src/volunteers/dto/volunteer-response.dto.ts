import { Volunteer } from '../entities/volunteer.entity';

export class VolunteerResponseDto {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
  academicBackground: string | null;
  educationStatus: string | null;
  volunteerType: string;

  constructor(volunteer: Volunteer) {
    this.id = volunteer.id;
    this.name = volunteer.person.name;
    this.cpf = volunteer.person.cpf;
    this.birthDate = volunteer.person.birthDate;
    this.academicBackground = volunteer.academicBackground;
    this.educationStatus = volunteer.educationStatus;
    this.volunteerType = volunteer.volunteerType;
  }
}
