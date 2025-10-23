import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessonsService } from 'src/lessons/lessons.service';
import { mockLesson } from 'src/lessons/mocks/lesson.mock';
import { mockStudent } from 'src/students/mocks/student.mock';
import { StudentsService } from 'src/students/students.service';
import { EntityNotFoundError, QueryFailedError, Repository } from 'typeorm';

import { AttendancesService } from '../attendances.service';
import { UpdateAttendanceDto } from '../dto/update-attendance.dto';
import { Attendance } from '../entities/attendance.entity';
import {
  mockAttendance,
  mockAttendanceList,
  mockCreateAttendanceDto,
} from '../mocks/attendance.mock';

describe('AttendancesService', () => {
  let service: AttendancesService;
  let repository: Repository<Attendance>;
  let studentsService: StudentsService;
  let lessonsService: LessonsService;

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
      .mockImplementation((attendance: Attendance, dto: UpdateAttendanceDto) =>
        Object.assign(attendance, dto),
      ),
    softDelete: jest.fn(),
  };

  const mockStudentsService = { findOne: jest.fn() };
  const mockLessonsService = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendancesService,
        { provide: getRepositoryToken(Attendance), useValue: mockRepository },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: LessonsService, useValue: mockLessonsService },
      ],
    })
      .setLogger(mockLogger)
      .compile();

    service = module.get<AttendancesService>(AttendancesService);
    repository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
    studentsService = module.get<StudentsService>(StudentsService);
    lessonsService = module.get<LessonsService>(LessonsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
    expect(studentsService).toBeDefined();
    expect(lessonsService).toBeDefined();
  });

  describe('create', () => {
    // Testa o fluxo de sucesso
    it('should create and return an attendance', async () => {
      // Arrange
      mockStudentsService.findOne.mockResolvedValue(mockStudent);
      mockLessonsService.findOne.mockResolvedValue(mockLesson);
      mockRepository.create.mockReturnValue(mockAttendance);
      mockRepository.save.mockResolvedValue(mockAttendance);

      // Act
      const result = await service.create(mockCreateAttendanceDto);

      // Assert
      expect(result).toEqual(mockAttendance);
      expect(mockStudentsService.findOne).toHaveBeenCalledWith(
        mockCreateAttendanceDto.studentId,
      );
      expect(mockLessonsService.findOne).toHaveBeenCalledWith(
        mockCreateAttendanceDto.lessonId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...mockCreateAttendanceDto,
        student: mockStudent,
        lesson: mockLesson,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAttendance);
      expect(result).toBe(mockAttendance);
    });

    // Testa o fluxo de erro ao buscar o estudante
    it('should throw NotFoundException if student does not exist', async () => {
      // Arrange
      mockStudentsService.findOne.mockRejectedValue(new NotFoundException());
      mockLessonsService.findOne.mockResolvedValue(mockLesson);

      // Act & Assert
      await expect(service.create(mockCreateAttendanceDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro ao buscar a aula
    it('should throw NotFoundException if lesson does not exist', async () => {
      // Arrange
      mockStudentsService.findOne.mockResolvedValue(mockStudent);
      mockLessonsService.findOne.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.create(mockCreateAttendanceDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Simula erro de constraint UNIQUE
    it('should throw ConflictException if attendance already exists', async () => {
      // Arrange
      mockStudentsService.findOne.mockResolvedValue(mockStudent);
      mockLessonsService.findOne.mockResolvedValue(mockLesson);
      mockRepository.create.mockReturnValue(mockAttendance);
      // Simula um erro específico do PostgreSQL para violação de UNIQUE constraint (código 23505)
      const uniqueConstraintError = new QueryFailedError('', [], new Error());
      Object.assign(uniqueConstraintError, { code: '23505' });
      mockRepository.save.mockRejectedValue(uniqueConstraintError);

      // Act & Assert
      await expect(service.create(mockCreateAttendanceDto)).rejects.toThrow(
        ConflictException,
      );
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on generic repository save error', async () => {
      // Arrange
      mockStudentsService.findOne.mockResolvedValue(mockStudent);
      mockLessonsService.findOne.mockResolvedValue(mockLesson);
      mockRepository.create.mockReturnValue(mockAttendance);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.create(mockCreateAttendanceDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllByLesson', () => {
    // Testa o fluxo de sucesso
    it('should return an array of attendances for a given lesson', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue(mockAttendanceList);
      const lessonId = 1;

      // Act
      const result = await service.findAllByLesson(lessonId);

      // Assert
      expect(result).toEqual(mockAttendanceList);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { lesson: { id: lessonId } },
        relations: ['student'],
      });
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository find error', async () => {
      // Arrange
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.findAllByLesson(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    // Testa o fluxo de sucesso
    it('should return an attendance by id', async () => {
      // Arrange
      mockRepository.findOneOrFail.mockResolvedValue(mockAttendance);

      // Act
      const result = await service.findOne(mockAttendance.id);

      // Assert
      expect(result).toEqual(mockAttendance);
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockAttendance.id },
        relations: ['student', 'lesson'],
      });
    });

    // Testa o fluxo de erro - Attendance não encontrada
    it('should throw NotFoundException if attendance not found', async () => {
      // Arrange
      const nonExistentId = 99;
      mockRepository.findOneOrFail.mockRejectedValue(
        new EntityNotFoundError(Attendance, { id: nonExistentId }),
      );

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on generic repository findOneOrFail error', async () => {
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

    // Testa o fluxo de sucesso
    it('should update and return the attendance', async () => {
      // Arrange
      const updateDto = { present: false, notes: 'Saiu mais cedo.' };
      findOneSpy.mockResolvedValue(mockAttendance);
      mockRepository.save.mockImplementation((attendance) =>
        Promise.resolve(attendance),
      );

      // Act
      const result = await service.update(mockAttendance.id, updateDto);

      // Assert
      expect(result).toEqual({ ...mockAttendance, ...updateDto });
      expect(findOneSpy).toHaveBeenCalledWith(mockAttendance.id);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockAttendance,
        ...updateDto,
      });
    });

    // Testa o fluxo de erro - Attendance não encontrada
    it('should throw NotFoundException if attendance record to update not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.update(99, { present: true })).rejects.toThrow(
        NotFoundException,
      );
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository save error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockAttendance);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.update(mockAttendance.id, { present: false }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    // Testa o fluxo de sucesso
    it('should remove the attendance record', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockAttendance);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      // Act
      await service.remove(mockAttendance.id);

      // Assert
      expect(findOneSpy).toHaveBeenCalledWith(mockAttendance.id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(mockAttendance.id);
    });

    it('should throw NotFoundException if attendance record to delete not found', async () => {
      // Arrange
      findOneSpy.mockRejectedValueOnce(new NotFoundException());

      // Act & Assert
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });

    // Testa o fluxo de erro genérico
    it('should throw InternalServerErrorException on repository softDelete error', async () => {
      // Arrange
      findOneSpy.mockResolvedValue(mockAttendance);
      mockRepository.softDelete.mockRejectedValueOnce(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.remove(mockAttendance.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
