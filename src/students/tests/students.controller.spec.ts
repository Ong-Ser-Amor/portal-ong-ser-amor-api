import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { StudentResponseDto } from '../dto/student-response.dto';
import {
  mockCreateStudentDto,
  mockStudent,
  mockStudentList,
} from '../mocks/student.mock';
import { StudentsController } from '../students.controller';
import { StudentsService } from '../students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockStudentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso
    it('should create a student and return StudentResponseDto', async () => {
      // Arrange
      mockStudentsService.create.mockResolvedValue(mockStudent);

      // Act
      const result = await controller.create(mockCreateStudentDto);

      // Assert
      expect(result).toEqual(new StudentResponseDto(mockStudent));
      expect(result).toBeInstanceOf(StudentResponseDto);
      expect(mockStudentsService.create).toHaveBeenCalledWith(
        mockCreateStudentDto,
      );
    });
  });

  describe('findAll', () => {
    // Testa o fluxo de sucesso
    it('should return an array of StudentResponseDto', async () => {
      // Arrange
      mockStudentsService.findAll.mockResolvedValue(mockStudentList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(
        mockStudentList.map((student) => new StudentResponseDto(student)),
      );
      expect(result).toBeInstanceOf(Array);
      expect(mockStudentsService.findAll).toHaveBeenCalled();

      expect(result).toHaveLength(mockStudentList.length);
      result.forEach((student) => {
        expect(student).toBeInstanceOf(StudentResponseDto);
      });
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return StudentResponseDto when student is found', async () => {
      // Arrange
      mockStudentsService.findOne.mockResolvedValue(mockStudent);

      // Act
      const result = await controller.findOne(mockStudent.id);

      // Assert
      expect(result).toBeInstanceOf(StudentResponseDto);
      expect(mockStudentsService.findOne).toHaveBeenCalledWith(mockStudent.id);
      expect(result).toEqual(new StudentResponseDto(mockStudent));
    });

    // Testa o fluxo de erro - Estudante não encontrado
    it('should throw NotFoundException when student is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockStudentsService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockStudentsService.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    // Testa o fluxo de sucesso
    it('should update a student and return StudentResponseDto', async () => {
      // Arrange
      const updatedStudent = { ...mockStudent, name: 'Updated Name' };
      mockStudentsService.update.mockResolvedValue(updatedStudent);

      // Act
      const result = await controller.update(mockStudent.id, {
        name: 'Updated Name',
      });

      // Assert
      expect(result).toBeInstanceOf(StudentResponseDto);
      expect(mockStudentsService.update).toHaveBeenCalledWith(mockStudent.id, {
        name: 'Updated Name',
      });
      expect(result).toEqual(new StudentResponseDto(updatedStudent));
    });

    // Testa o fluxo de erro - Estudante não encontrado
    it('should throw NotFoundException when trying to update a non-existent student', async () => {
      // Arrange
      const nonExistentId = 99;
      mockStudentsService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.update(nonExistentId, { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockStudentsService.update).toHaveBeenCalledWith(nonExistentId, {
        name: 'Updated Name',
      });
    });
  });

  describe('remove', () => {
    // Testa o fluxo de sucesso
    it('should remove a student', async () => {
      // Arrange
      mockStudentsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockStudent.id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockStudentsService.remove).toHaveBeenCalledWith(mockStudent.id);
    });

    // Testa o fluxo de erro - Estudante não encontrado
    it('should throw NotFoundException when trying to remove a non-existent student', async () => {
      // Arrange
      const nonExistentId = 99;
      mockStudentsService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockStudentsService.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
