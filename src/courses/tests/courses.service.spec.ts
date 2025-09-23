import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CoursesService } from '../courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { Course } from '../entities/course.entity';
import {
  mockCreateCourseDto,
  mockCourse,
  mockCourseList,
} from '../mocks/course.mock';

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: Repository<Course>;

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
    create: jest.fn().mockImplementation((dto: CreateCourseDto) => dto),
    save: jest.fn(),
    findOneByOrFail: jest.fn(),
    find: jest.fn(),
    merge: jest
      .fn()
      .mockImplementation((course: Course, dto: UpdateCourseDto) =>
        Object.assign(course, dto),
      ),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<CoursesService>(CoursesService);
    repository = module.get<Repository<Course>>(getRepositoryToken(Course));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso do método create
    it('should create and return a course', async () => {
      // Arrange
      mockRepository.save.mockResolvedValue(mockCourse);

      // Act
      const result = await service.create(mockCreateCourseDto);

      // Assert
      expect(result).toEqual(mockCourse);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreateCourseDto);
    });

    // Testa o fluxo de erro do método create
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateCourseDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    // Testa o fluxo de sucesso do método findAll
    it('should return an array of courses', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockCourseList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockCourseList);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    // Testa o fluxo de erro do método findAll
    it('should throw InternalServerErrorException on repository find error', async () => {
      // Arrange
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso do método findOne
    it('should return a course by id', async () => {
      // Arrange
      mockRepository.findOneByOrFail.mockResolvedValue(mockCourse);

      // Act
      const result = await service.findOne(mockCourse.id);

      // Assert
      expect(result).toEqual(mockCourse);
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({
        id: mockCourse.id,
      });
    });

    // Testa o fluxo de erro quando o curso não é encontrado
    it('should throw NotFoundException if course not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockRepository.findOneByOrFail.mockRejectedValue(
        new EntityNotFoundError(Course, { id: nonExistentId }),
      );

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico do método findOne
    it('should throw InternalServerErrorException on repository error', async () => {
      // Arrange
      mockRepository.findOneByOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(mockCourse.id)).rejects.toThrow(
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
    it('should update and return the course', async () => {
      // Arrange
      const updateCourseDto = { name: 'Updated Course Name' };

      findOneSpy.mockResolvedValue(mockCourse);

      mockRepository.save.mockImplementation((course) =>
        Promise.resolve(course),
      );

      // Act
      const result = await service.update(mockCourse.id, updateCourseDto);

      // Assert
      expect(result).toEqual({ ...mockCourse, ...updateCourseDto });
      expect(findOneSpy).toHaveBeenCalledWith(mockCourse.id);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCourse,
        ...updateCourseDto,
      });
    });

    // Testa o fluxo de erro do método update quando o curso não é encontrado
    it('should throw NotFoundException if course to update is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.update(99, { name: 'Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    // Testa o fluxo de erro genérico do método update
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourse);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.update(mockCourse.id, { name: 'Name' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso do método remove
    it('should soft delete the course', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourse);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockCourse.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockCourse.id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockCourse.id);
    });

    // Testa o fluxo de erro do método remove quando o curso não é encontrado
    it('should throw NotFoundException if course to delete is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    // Testa o fluxo de erro genérico do método remove
    it('should throw InternalServerErrorException on repository softDelete error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourse);
      mockRepository.softDelete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(mockCourse.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
