import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CourseClassesController } from '../course-classes.controller';
import { CourseClassesService } from '../course-classes.service';
import { CourseClassResponseDto } from '../dto/course-class-response.dto';
import {
  mockCourseClass,
  mockCourseClassList,
  mockCreateCourseClassDto,
} from '../mocks/course-class.mock';

describe('CourseClassesController', () => {
  let controller: CourseClassesController;
  let service: CourseClassesService;

  const mockCourseClassesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseClassesController],
      providers: [
        {
          provide: CourseClassesService,
          useValue: mockCourseClassesService,
        },
      ],
    }).compile();

    controller = module.get<CourseClassesController>(CourseClassesController);
    service = module.get<CourseClassesService>(CourseClassesService);
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
    it('should create a course class and return CourseClassResponseDto', async () => {
      // Arrange
      mockCourseClassesService.create.mockResolvedValue(mockCourseClass);

      // Act
      const result = await controller.create(mockCreateCourseClassDto);

      // Assert
      expect(result).toBeInstanceOf(CourseClassResponseDto);
      expect(mockCourseClassesService.create).toHaveBeenCalledWith(
        mockCreateCourseClassDto,
      );
      expect(result).toEqual(new CourseClassResponseDto(mockCourseClass));
    });
  });

  describe('findAll', () => {
    // Testa o fluxo de sucesso
    it('should return an array of CourseClassResponseDto', async () => {
      // Arrange
      mockCourseClassesService.findAll.mockResolvedValue(mockCourseClassList);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockCourseClassesService.findAll).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(mockCourseClassList.length);
      result.forEach((item) => {
        expect(item).toBeInstanceOf(CourseClassResponseDto);
      });
      expect(result).toEqual(
        mockCourseClassList.map(
          (courseClass) => new CourseClassResponseDto(courseClass),
        ),
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return CourseClassResponseDto when found', async () => {
      // Arrange
      mockCourseClassesService.findOne.mockResolvedValue(mockCourseClass);

      // Act
      const result = await controller.findOne(mockCourseClass.id);

      // Assert
      expect(result).toBeInstanceOf(CourseClassResponseDto);
      expect(mockCourseClassesService.findOne).toHaveBeenCalledWith(
        mockCourseClass.id,
      );
      expect(result).toEqual(new CourseClassResponseDto(mockCourseClass));
    });

    // Testa o fluxo de erro - CourseClass não encontrado
    it('should throw NotFoundException when not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCourseClassesService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCourseClassesService.findOne).toHaveBeenCalledWith(
        nonExistentId,
      );
    });
  });

  describe('update', () => {
    // Testa o fluxo de sucesso
    it('should update and return CourseClassResponseDto', async () => {
      // Arrange
      const updatedCourseClass = { ...mockCourseClass, name: 'Updated Name' };
      mockCourseClassesService.update.mockResolvedValue(updatedCourseClass);

      // Act
      const result = await controller.update(mockCourseClass.id, {
        name: 'Updated Name',
      });

      // Assert
      expect(result).toBeInstanceOf(CourseClassResponseDto);
      expect(mockCourseClassesService.update).toHaveBeenCalledWith(
        mockCourseClass.id,
        { name: 'Updated Name' },
      );
      expect(result).toEqual(new CourseClassResponseDto(updatedCourseClass));
    });

    // Testa o fluxo de erro - CourseClass não encontrado
    it('should throw NotFoundException when not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCourseClassesService.update.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(
        controller.update(nonExistentId, { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockCourseClassesService.update).toHaveBeenCalledWith(
        nonExistentId,
        { name: 'Updated Name' },
      );
    });
  });

  describe('remove', () => {
    // Testa o fluxo de sucesso
    it('should call remove on the service', async () => {
      // Arrange
      mockCourseClassesService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockCourseClass.id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockCourseClassesService.remove).toHaveBeenCalledWith(
        mockCourseClass.id,
      );
    });

    it('should throw NotFoundException when not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockCourseClassesService.remove.mockRejectedValue(
        new NotFoundException(),
      );

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockCourseClassesService.remove).toHaveBeenCalledWith(
        nonExistentId,
      );
    });
  });
});
