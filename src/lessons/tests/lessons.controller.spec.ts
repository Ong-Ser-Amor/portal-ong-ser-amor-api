import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { LessonResponseDto } from '../dto/lesson-response.dto';
import { LessonsController } from '../lessons.controller';
import { LessonsService } from '../lessons.service';
import { mockCreateLessonDto, mockLesson } from '../mocks/lesson.mock';

describe('LessonsController', () => {
  let controller: LessonsController;
  let service: LessonsService;

  const mockLessonsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCourseClassId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [
        {
          provide: LessonsService,
          useValue: mockLessonsService,
        },
      ],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
    service = module.get<LessonsService>(LessonsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso
    it('should create a lesson and return a LessonResponseDto', async () => {
      // Arrange
      mockLessonsService.create.mockResolvedValue(mockLesson);

      // Act
      const result = await controller.create(mockCreateLessonDto);

      // Assert
      expect(result).toBeInstanceOf(LessonResponseDto);
      expect(mockLessonsService.create).toHaveBeenCalledWith(
        mockCreateLessonDto,
      );
      expect(result).toEqual(new LessonResponseDto(mockLesson));
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return a LessonResponseDto when found', async () => {
      // Arrange
      mockLessonsService.findOne.mockResolvedValue(mockLesson);

      // Act
      const result = await controller.findOne(mockLesson.id);

      // Assert
      expect(result).toBeInstanceOf(LessonResponseDto);
      expect(mockLessonsService.findOne).toHaveBeenCalledWith(mockLesson.id);
      expect(result).toEqual(new LessonResponseDto(mockLesson));
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException when lesson not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockLessonsService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLessonsService.findOne).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('update', () => {
    // Testa o fluxo de sucesso
    it('should update a lesson and return a LessonResponseDto', async () => {
      // Arrange
      const updateDto = { topic: 'Updated Topic' };
      const updatedLesson = { ...mockLesson, ...updateDto };
      mockLessonsService.update.mockResolvedValue(updatedLesson);

      // Act
      const result = await controller.update(mockLesson.id, updateDto);

      // Assert
      expect(result).toBeInstanceOf(LessonResponseDto);
      expect(mockLessonsService.update).toHaveBeenCalledWith(
        mockLesson.id,
        updateDto,
      );
      expect(result).toEqual(new LessonResponseDto(updatedLesson));
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException if lesson to update is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockLessonsService.update.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.update(nonExistentId, { topic: 'Updated Topic' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockLessonsService.update).toHaveBeenCalledWith(nonExistentId, {
        topic: 'Updated Topic',
      });
    });
  });

  describe('remove', () => {
    // Testa o fluxo de sucesso
    it('should call the remove method on the service', async () => {
      // Arrange
      mockLessonsService.remove.mockResolvedValue(undefined);

      // Act
      const result = await controller.remove(mockLesson.id);

      // Assert
      expect(result).toBeUndefined();
      expect(mockLessonsService.remove).toHaveBeenCalledWith(mockLesson.id);
    });

    // Testa o fluxo de erro quando a aula não é encontrada
    it('should throw NotFoundException if lesson to delete is not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockLessonsService.remove.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockLessonsService.remove).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
