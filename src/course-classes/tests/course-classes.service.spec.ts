import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from 'src/courses/courses.service';
import { mockCourse } from 'src/courses/mocks/course.mock';
import { mockStudent } from 'src/students/mocks/student.mock';
import { StudentsService } from 'src/students/students.service';
import { mockTeacher } from 'src/users/mocks/user.mock';
import { UsersService } from 'src/users/users.service';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CourseClassesService } from '../course-classes.service';
import { UpdateCourseClassDto } from '../dto/update-course-class.dto';
import { CourseClass } from '../entities/course-class.entity';
import {
  mockCourseClass,
  mockCourseClassList,
  mockCourseClassWithTeacher,
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

  const mockCoursesService = { findOne: jest.fn() };

  const mockUsersService = { findOne: jest.fn() };

  const mockStudentsService = { findOne: jest.fn() };

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
        { provide: UsersService, useValue: mockUsersService },
        { provide: StudentsService, useValue: mockStudentsService },
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
    it('should return a course class by id with its relations', async () => {
      // Arrange
      const mockCourseClassWithAllRelations = {
        ...mockCourseClass,
        teachers: [],
        students: [],
      };
      mockRepository.findOneOrFail.mockResolvedValue(
        mockCourseClassWithAllRelations,
      );

      // Act
      const result = await service.findOne(mockCourseClass.id);

      // Assert
      expect(mockRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockCourseClass.id },
        relations: ['course', 'teachers', 'students'],
      });
      expect(result).toEqual(mockCourseClassWithAllRelations);
      expect(result.teachers).toBeDefined();
      expect(Array.isArray(result.teachers)).toBe(true);
      expect(result.students).toBeDefined();
      expect(Array.isArray(result.students)).toBe(true);
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

  // TESTES PARA GERENCIAMENTO DE PROFESSORES
  describe('Teacher Management', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    describe('addTeacherToClass', () => {
      it('should add a teacher to a class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue({ ...mockCourseClass, teachers: [] });
        mockUsersService.findOne.mockResolvedValue(mockTeacher);
        mockRepository.save.mockResolvedValue(mockCourseClassWithTeacher);

        // Act
        const result = await service.addTeacherToClass(
          mockCourseClass.id,
          mockTeacher.id,
        );

        // Assert
        expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
        expect(mockUsersService.findOne).toHaveBeenCalledWith(mockTeacher.id);
        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            teachers: [mockTeacher],
          }),
        );
        expect(result.teachers).toContain(mockTeacher);
      });

      it('should throw BadRequestException if teacher is already in class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue(mockCourseClassWithTeacher);
        mockUsersService.findOne.mockResolvedValue(mockTeacher);

        // Act & Assert
        await expect(
          service.addTeacherToClass(mockCourseClass.id, mockTeacher.id),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('removeTeacherFromClass', () => {
      it('should remove a teacher from a class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue({ ...mockCourseClassWithTeacher });
        mockRepository.save.mockResolvedValue(mockCourseClass);

        // Act
        const result = await service.removeTeacherFromClass(
          mockCourseClass.id,
          mockTeacher.id,
        );

        // Assert
        expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({ teachers: [] }),
        );
        expect(result.teachers).toHaveLength(0);
      });

      it('should throw NotFoundException if teacher to remove is not in class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue(mockCourseClass);

        // Act & Assert
        await expect(
          service.removeTeacherFromClass(mockCourseClass.id, 99),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getTeachersFromClass', () => {
      it('should return an array of teachers', async () => {
        // Arrange
        findOneSpy.mockResolvedValue(mockCourseClassWithTeacher);

        // Act
        const result = await service.getTeachersFromClass(mockCourseClass.id);

        // Assert
        expect(result).toEqual([mockTeacher]);
        expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
      });
    });
  });

  // TESTES PARA GERENCIAMENTO DE ALUNOS
  describe('Student Management', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne');
    });

    describe('addStudentToClass', () => {
      it('should add a student to a class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue({ ...mockCourseClass, students: [] });
        mockStudentsService.findOne.mockResolvedValue(mockStudent);
        mockRepository.save.mockResolvedValue({
          ...mockCourseClass,
          students: [mockStudent],
        });

        // Act
        const result = await service.addStudentToClass(
          mockCourseClass.id,
          mockStudent.id,
        );

        // Assert
        expect(findOneSpy).toHaveBeenCalledWith(mockCourseClass.id);
        expect(mockStudentsService.findOne).toHaveBeenCalledWith(
          mockStudent.id,
        );
        expect(mockRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            students: [mockStudent],
          }),
        );
        expect(result.students).toContain(mockStudent);
      });

      it('should throw BadRequestException if student is already in class', async () => {
        // Arrange
        findOneSpy.mockResolvedValue({
          ...mockCourseClass,
          students: [mockStudent],
        });
        mockStudentsService.findOne.mockResolvedValue(mockStudent);

        // Act & Assert
        await expect(
          service.addStudentToClass(mockCourseClass.id, mockStudent.id),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
