import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { Student } from '../entities/student.entity';
import {
  mockCreateStudentDto,
  mockStudent,
  mockStudentList,
} from '../mocks/student.mock';
import { StudentsService } from '../students.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: Repository<Student>;

  // Mock silencioso do logger para evitar logs durante os testes
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  // Mock do repositório para simular o banco de dados
  const mockRepository = {
    create: jest.fn().mockImplementation((dto: CreateStudentDto) => dto),
    save: jest.fn(),
    findOneByOrFail: jest.fn(),
    find: jest.fn(),
    merge: jest
      .fn()
      .mockImplementation((student: Student, dto: UpdateStudentDto) =>
        Object.assign(student, dto),
      ),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get<Repository<Student>>(getRepositoryToken(Student));

    // Limpa os mocks antes de cada teste para evitar interferência entre eles
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso do método create
    it('should create and return a student', async () => {
      // Arrange
      mockRepository.save.mockResolvedValue(mockStudent);

      // Act
      const result = await service.create(mockCreateStudentDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreateStudentDto);
      expect(result).toEqual(mockStudent);
    });

    // Testa o fluxo de erro do método create
    it('should handle errors when creating a student', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockRepository.save.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.create(mockCreateStudentDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    // Testa o fluxo de sucesso do método findAll
    it('should return an array of students', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockStudentList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStudentList);
    });

    // Testa o fluxo de erro do método findAll
    it('should throw InternalServerErrorException when retrieving students fails', async () => {
      // Arrange
      const errorMessage = 'Database error';
      mockRepository.find.mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso do método findOne
    it('should return a student by id', async () => {
      // Arrange
      mockRepository.findOneByOrFail.mockResolvedValue(mockStudent);

      // Act
      const result = await service.findOne(mockStudent.id);

      // Assert
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: mockStudent.id,
      });
      expect(result).toEqual(mockStudent);
    });

    // Testa o fluxo de erro quando o estudante não é encontrado
    it('should throw NotFoundException when student is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockRepository.findOneByOrFail.mockRejectedValueOnce(
        new EntityNotFoundError(Student, { id: nonExistentId }),
      );

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico do método findOne
    it('should throw InternalServerErrorException when retrieving student fails', async () => {
      // Arrange
      mockRepository.findOneByOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(mockStudent.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso do método update
    it('should update and return the updated student', async () => {
      // Arrange
      const updateStudentDto = { name: 'Updated Name' };

      findOneSpy.mockResolvedValue(mockStudent);

      mockRepository.save.mockImplementation((student) =>
        Promise.resolve(student),
      );

      // Act
      const result = await service.update(mockStudent.id, updateStudentDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockStudent,
        ...updateStudentDto,
      });
      expect(findOneSpy).toHaveBeenCalledWith(mockStudent.id);
      expect(result).toEqual({ ...mockStudent, ...updateStudentDto });
    });

    // Testa o fluxo de erro quando o estudante não é encontrado
    it('should throw NotFoundException when student to update is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(
        service.update(99, { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // Testa o fluxo de erro genérico do método update
    it('should throw InternalServerErrorException when updating student fails', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockStudent);
      mockRepository.save.mockRejectedValueOnce(new Error('Database error'));

      // Act & Assert
      await expect(
        service.update(mockStudent.id, { name: 'Updated Name' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso do método remove
    it('should soft delete the student', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockStudent);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockStudent.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockStudent.id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockStudent.id);
    });

    // Testa o fluxo de erro quando o estudante não é encontrado
    it('should throw NotFoundException when student to delete is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    // Testa o fluxo de erro genérico do método remove
    it('should throw InternalServerErrorException when deleting student fails', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockStudent);
      mockRepository.softDelete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(mockStudent.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
