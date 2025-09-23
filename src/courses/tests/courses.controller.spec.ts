import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CoursesController } from '../courses.controller';
import { CoursesService } from '../courses.service';
import { CourseResponseDto } from '../dto/course-response.dto';
import {
  mockCreateCourseDto,
  mockCourse,
  mockCourseList,
} from '../mocks/course.mock';

describe('CoursesController', () => {
  let controller: CoursesController;
  let service: CoursesService;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
    service = module.get<CoursesService>(CoursesService);
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
    it('should create a course and return CourseResponseDto', async () => {
      // Arrange
      mockCoursesService.create.mockResolvedValue(mockCourse);

      // Act
      const result = await controller.create(mockCreateCourseDto);

      // Assert
      // Verifica se o resultado é uma instância de CourseResponseDto
      expect(result).toBeInstanceOf(CourseResponseDto);
      expect(mockCoursesService.create).toHaveBeenCalledWith(
        mockCreateCourseDto,
      );
      expect(result).toEqual(new CourseResponseDto(mockCourse));
    });
  });

  describe('findAll', () => {
    // Testa o fluxo de sucesso do método findAll
    it('should return an array of CourseResponseDto', async () => {
      // Arrange
      mockCoursesService.findAll.mockResolvedValue(mockCourseList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockCoursesService.findAll).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(mockCourseList.length);
      result.forEach((course) => {
        expect(course).toBeInstanceOf(CourseResponseDto);
      });

      expect(result).toEqual(
        mockCourseList.map((course) => new CourseResponseDto(course)),
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso do método findOne
    it('should return CourseResponseDto when course is found', async () => {
      // Arrange
      mockCoursesService.findOne.mockResolvedValue(mockCourse);

      // Act
      const result = await controller.findOne(mockCourse.id);

      // Assert
      expect(result).toBeInstanceOf(CourseResponseDto);
      expect(mockCoursesService.findOne).toHaveBeenCalledWith(mockCourse.id);
      expect(result).toEqual(new CourseResponseDto(mockCourse));
    });

    // Testa o fluxo de erro - Curso não encontrado
    it('should throw NotFoundException when course is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCoursesService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCoursesService.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    // Testa o fluxo de sucesso do método update
    it('should update a course and return CourseResponseDto', async () => {
      // Arrange
      const updatedCourse = { ...mockCourse, name: 'Updated Course' };
      mockCoursesService.update.mockResolvedValue(updatedCourse);

      // Act
      const result = await controller.update(mockCourse.id, {
        name: 'Updated Course',
      });

      // Assert
      expect(result).toBeInstanceOf(CourseResponseDto);
      expect(mockCoursesService.update).toHaveBeenCalledWith(mockCourse.id, {
        name: 'Updated Course',
      });
      expect(result).toEqual(new CourseResponseDto(updatedCourse));
    });

    // Testa o fluxo de erro - Curso não encontrado
    it('should throw NotFoundException when trying to update a non-existent course', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCoursesService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.update(nonExistentId, { name: 'Updated Course' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockCoursesService.update).toHaveBeenCalledWith(nonExistentId, {
        name: 'Updated Course',
      });
    });
  });

  describe('remove', () => {
    // Testa o fluxo de sucesso do método remove
    it('should remove a course', async () => {
      // Arrange
      mockCoursesService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockCourse.id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockCoursesService.remove).toHaveBeenCalledWith(mockCourse.id);
    });

    // Testa o fluxo de erro - Curso não encontrado
    it('should throw NotFoundException when trying to remove a non-existent course', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCoursesService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCoursesService.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
