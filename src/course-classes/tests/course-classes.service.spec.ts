import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { mockCourse } from 'src/courses/mocks/course.mock';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CourseClassesService } from '../course-classes.service';
import { UpdateCourseClassDto } from '../dto/update-course-class.dto';
import { CourseClass } from '../entities/course-class.entity';
import {
  mockCourseClass,
  mockCourseClassList,
  mockCreateCourseClassDto,
} from '../mocks/course-class.mock';

describe('CourseClassesService', () => {
  let service: CourseClassesService;
  let repository: Repository<CourseClass>;
  let coursesService: CoursesService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  // Mock do repositório para simular o banco de dados
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    merge: jest
      .fn()
      .mockImplementation(
        (courseClass: CourseClass, dto: UpdateCourseClassDto) =>
          Object.assign(courseClass, dto),
      ),
    softDelete: jest.fn(),
  };

  const mockCoursesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseClassesService,
        {
          provide: getRepositoryToken(CourseClass),
          useValue: mockRepository,
        },
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<CourseClassesService>(CourseClassesService);
    repository = module.get<Repository<CourseClass>>(
      getRepositoryToken(CourseClass),
    );
    coursesService = module.get<CoursesService>(CoursesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(coursesService).toBeDefined();
  });

  describe('create', () => {
    // Teste o fluxo de sucesso do método create
    it('should create and return a course class', async () => {
      // Arrange
      mockCoursesService.findOne.mockResolvedValue(mockCourse);

      mockRepository.create.mockReturnValue({
        ...mockCreateCourseClassDto,
        course: mockCourse,
      });
      mockRepository.save.mockResolvedValue(mockCourseClass);

      // Act
      const result = await service.create(mockCreateCourseClassDto);

      // Assert
      expect(result).toEqual(mockCourseClass);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith(
        mockCreateCourseClassDto.courseId,
      );
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCreateCourseClassDto,
        course: mockCourse,
      });
    });

    // Teste o fluxo de erro quando o curso associado não é encontrado
    it('should throw NotFoundException if the associated course is not found', async () => {
      // Arrange
      mockCoursesService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.create(mockCreateCourseClassDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Teste o fluxo de erro genérico do método create
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      mockCoursesService.findOne.mockResolvedValue(mockCourse);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateCourseClassDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    // Teste o fluxo de sucesso do método findAll
    it('should return an array of course classes', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockCourseClassList);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockCourseClassList);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    // Teste o fluxo de erro genérico do método findAll
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
    // Teste o fluxo de sucesso do método findOne
    it('should return a course class by id', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockCourseClass);

      // Act
      const result = await service.findOne(mockCourseClass.id);

      // Assert
      expect(result).toEqual(mockCourseClass);
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockCourseClass.id },
        relations: ['course'],
      });
    });

    // Teste o fluxo de erro quando a turma do curso não é encontrada
    it('should throw NotFoundException if course class not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(CourseClass, { id: nonExistentId }),
      );

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Teste o fluxo de erro genérico do método findOne
    it('should throw InternalServerErrorException on repository error', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Teste o fluxo de sucesso do método update
    it('should update and return the course class', async () => {
      // Arrange
      const updateDto = { name: 'Updated Class Name' };
      findOneSpy.mockResolvedValue(mockCourseClass);
      mockRepository.save.mockImplementation((courseClass) =>
        Promise.resolve(courseClass),
      );

      // Act
      const result = await service.update(mockCourseClass.id, updateDto);

      // Assert
      expect(result).toEqual({ ...mockCourseClass, ...updateDto });
      expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockCourseClass,
        ...updateDto,
      });
    });

    // Teste o fluxo de erro quando a turma do curso não é encontrada
    it('should throw NotFoundException if course class to update is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.update(99, { name: 'Name' })).rejects.toThrow(
        NotFoundException,
      );
    });

    // Teste o fluxo de erro genérico do método update
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourseClass);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.update(mockCourseClass.id, { name: 'Name' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Teste o fluxo de sucesso do método remove
    it('should soft delete the course class', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourseClass);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockCourseClass.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(
        mockCourseClass.id,
      );
    });

    // Teste o fluxo de erro quando a turma do curso não é encontrada
    it('should throw NotFoundException if course class to delete is not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    // Teste o fluxo de erro genérico do método remove
    it('should throw InternalServerErrorException on repository softDelete error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockCourseClass);
      mockRepository.softDelete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(mockCourseClass.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
