import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AttendancesController } from '../attendances.controller';
import { AttendancesService } from '../attendances.service';
import { AttendanceResponseDto } from '../dto/attendance-response.dto';
import {
  mockAttendance,
  mockAttendanceList,
  mockCreateAttendanceDto,
} from '../mocks/attendance.mock';

describe('AttendancesController', () => {
  let controller: AttendancesController;
  let service: AttendancesService;

  const mockAttendancesService = {
    create: jest.fn(),
    findAllByLesson: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendancesController],
      providers: [
        {
          provide: AttendancesService,
          useValue: mockAttendancesService,
        },
      ],
    }).compile();

    controller = module.get<AttendancesController>(AttendancesController);
    service = module.get<AttendancesService>(AttendancesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso
    it('should create an attendance record and return AttendanceResponseDto', async () => {
      // Arrange
      mockAttendancesService.create.mockResolvedValue(mockAttendance);

      // Act
      const result = await controller.create(mockCreateAttendanceDto);

      // Assert
      expect(result).toBeInstanceOf(AttendanceResponseDto);
      expect(mockAttendancesService.create).toHaveBeenCalledWith(
        mockCreateAttendanceDto,
      );
      expect(result.id).toEqual(mockAttendance.id);
    });

    // Testa o fluxo de erro quando o registro já existe
    it('should throw ConflictException if record already exists', async () => {
      // Arrange
      mockAttendancesService.create.mockRejectedValue(new ConflictException());

      // Act & Assert
      await expect(controller.create(mockCreateAttendanceDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return AttendanceResponseDto when attendance is found', async () => {
      // Arrange
      mockAttendancesService.findOne.mockResolvedValue(mockAttendance);

      // Act
      const result = await controller.findOne(mockAttendance.id);

      // Assert
      expect(result).toBeInstanceOf(AttendanceResponseDto);
      expect(mockAttendancesService.findOne).toHaveBeenCalledWith(
        mockAttendance.id,
      );
      expect(result.id).toEqual(mockAttendance.id);
    });

    it('should throw NotFoundException when attendance record not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockAttendancesService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an attendance record and return AttendanceResponseDto', async () => {
      // Arrange
      const updateDto = { present: false, notes: 'Saiu mais cedo' };
      const updatedAttendance = { ...mockAttendance, ...updateDto };
      mockAttendancesService.update.mockResolvedValue(updatedAttendance);

      // Act
      const result = await controller.update(mockAttendance.id, updateDto);

      // Assert
      expect(result).toBeInstanceOf(AttendanceResponseDto);
      expect(mockAttendancesService.update).toHaveBeenCalledWith(
        mockAttendance.id,
        updateDto,
      );
      expect(result.present).toEqual(updatedAttendance.present);
      expect(result.notes).toEqual(updatedAttendance.notes);
    });

    it('should throw NotFoundException if attendance record to update is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockAttendancesService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.update(nonExistentId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should call the remove method on the service', async () => {
      // Arrange
      mockAttendancesService.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(mockAttendance.id);

      // Assert
      expect(mockAttendancesService.remove).toHaveBeenCalledWith(
        mockAttendance.id,
      );
    });

    it('should throw NotFoundException if attendance record to delete is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockAttendancesService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
