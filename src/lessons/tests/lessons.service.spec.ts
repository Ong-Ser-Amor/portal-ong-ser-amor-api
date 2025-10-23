import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseClassesService } from 'src/course-classes/course-classes.service';
import { CourseClass } from 'src/course-classes/entities/course-class.entity';
import { mockCourseClass } from 'src/course-classes/mocks/course-class.mock';
import { EntityNotFoundError, Repository } from 'typeorm';

import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { Lesson } from '../entities/lesson.entity';
import { LessonsService } from '../lessons.service';
import {
  mockCreateLessonDto,
  mockLesson,
  mockLessonList,
} from '../mocks/lesson.mock';

describe('LessonsService', () => {
  let service: LessonsService;
  let repository: Repository<Lesson>;
  let courseClassesService: CourseClassesService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneOrFail: jest.fn(),
    merge: jest
      .fn()
      .mockImplementation((lesson: Lesson, dto: UpdateLessonDto) =>
        Object.assign(lesson, dto),
      ),
    softDelete: jest.fn(),
  };

  const mockCourseClassesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockRepository,
        },
        {
          provide: CourseClassesService,
          useValue: mockCourseClassesService,
        },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<LessonsService>(LessonsService);
    repository = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
    courseClassesService =
      module.get<CourseClassesService>(CourseClassesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(courseClassesService).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso
    it('should create and return a new lesson', async () => {
      // Arrange
      mockCourseClassesService.findOne.mockResolvedValue(mockCourseClass);
      mockRepository.create.mockReturnValue(mockLesson);
      mockRepository.save.mockResolvedValue(mockLesson);

      // Act
      const result = await service.create(mockCreateLessonDto);

      // Assert
      expect(result).toEqual(mockLesson);
      expect(mockCourseClassesService.findOne).toHaveBeenCalledWith(
        mockCreateLessonDto.courseClassId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockCreateLessonDto,
        courseClass: mockCourseClass,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLesson);
    });

    // Testa o fluxo de erro quando a courseClassId não é encontrada
    it('should throw NotFoundException if course class does not exist', async () => {
      // Arrange
      mockCourseClassesService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(service.create(mockCreateLessonDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      mockCourseClassesService.findOne.mockResolvedValue(mockCourseClass);
      mockRepository.create.mockReturnValue(mockLesson);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateLessonDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByCourseClassId', () => {
    // Testa o fluxo de sucesso
    it('should return an array of lessons', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockLessonList);

      // Act
      const result = await service.findByCourseClassId(mockCourseClass.id);

      // Assert
      expect(result).toEqual(mockLessonList);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { courseClass: { id: mockCourseClass.id } },
      });
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository find error', async () => {
      // Arrange
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.findByCourseClassId(mockCourseClass.id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return a lesson by id', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockLesson);

      // Act
      const result = await service.findOne(mockLesson.id);

      // Assert
      expect(result).toEqual(mockLesson);
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockLesson.id },
      });
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException if lesson not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Lesson, { id: nonExistentId }),
      );

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository findOneOrFail error', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.findOne(mockLesson.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso
    it('should update and return the lesson', async () => {
      // Arrange
      const updateDto = { topic: 'Updated Lesson Topic' };
      findOneSpy.mockResolvedValue(mockLesson);
      mockRepository.save.mockImplementation((lesson) =>
        Promise.resolve(lesson),
      );

      // Act
      const result = await service.update(mockLesson.id, updateDto);

      // Assert
      expect(result).toEqual({ ...mockLesson, ...updateDto });
      expect(findOneSpy).toHaveBeenCalledWith(mockLesson.id);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockLesson,
        ...updateDto,
      });
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException if lesson to update not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        service.update(99, { topic: 'Updated Lesson Topic' }),
      ).rejects.toThrow(NotFoundException);
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockLesson);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.update(mockLesson.id, { topic: 'Updated Lesson Topic' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso
    it('should soft delete the lesson', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockLesson);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockLesson.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockLesson.id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockLesson.id);
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException if lesson to delete not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository softDelete error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockLesson);
      mockRepository.softDelete.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.remove(mockLesson.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
