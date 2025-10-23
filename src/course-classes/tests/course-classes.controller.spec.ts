import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LessonResponseDto } from 'src/lessons/dto/lesson-response.dto';
import { LessonsService } from 'src/lessons/lessons.service';
import { mockLesson, mockLessonList } from 'src/lessons/mocks/lesson.mock';
import { StudentResponseDto } from 'src/students/dto/student-response.dto';
import { mockStudent } from 'src/students/mocks/student.mock';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { mockTeacher } from 'src/users/mocks/user.mock';

import { CourseClassesController } from '../course-classes.controller';
import { CourseClassesService } from '../course-classes.service';
import { CourseClassResponseDto } from '../dto/course-class-response.dto';
import {
  mockCourseClass,
  mockCourseClassList,
  mockCourseClassWithTeacher,
  mockCreateCourseClassDto,
} from '../mocks/course-class.mock';

describe('CourseClassesController', () => {
  let controller: CourseClassesController;
  let service: CourseClassesService;
  let lessonsService: LessonsService;

  const mockCourseClassesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addTeacherToClass: jest.fn(),
    removeTeacherFromClass: jest.fn(),
    getTeachersFromClass: jest.fn(),
    addStudentToClass: jest.fn(),
    removeStudentFromClass: jest.fn(),
    getStudentsFromClass: jest.fn(),
  };

  const mockLessonsService = {
    findByCourseClassId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseClassesController],
      providers: [
        {
          provide: CourseClassesService,
          useValue: mockCourseClassesService,
        },
        {
          provide: LessonsService,
          useValue: mockLessonsService,
        },
      ],
    }).compile();

    controller = module.get<CourseClassesController>(CourseClassesController);
    service = module.get<CourseClassesService>(CourseClassesService);
    lessonsService = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(lessonsService).toBeDefined();
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
      expect(result.teachers).toEqual([]);
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
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(CourseClassResponseDto);
      expect(result[1].teachers[0]).toBeInstanceOf(UserResponseDto);
      expect(mockCourseClassesService.findAll).toHaveBeenCalled();
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
      mockCourseClassesService.findOne.mockResolvedValue(
        mockCourseClassWithTeacher,
      );

      // Act
      const result = await controller.findOne(mockCourseClassWithTeacher.id);

      // Assert
      expect(result).toBeInstanceOf(CourseClassResponseDto);
      expect(result.teachers[0].id).toEqual(mockTeacher.id);
      expect(mockCourseClassesService.findOne).toHaveBeenCalledWith(
        mockCourseClassWithTeacher.id,
      );
      expect(result).toEqual(
        new CourseClassResponseDto(mockCourseClassWithTeacher),
      );
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

  // TESTES PARA AS ROTAS DE GERENCIAMENTO DE PROFESSORES
  describe('Teacher Management Routes', () => {
    describe('addTeacher', () => {
      it('should add a teacher and return the updated CourseClassResponseDto', async () => {
        // Arrange
        mockCourseClassesService.addTeacherToClass.mockResolvedValue(
          mockCourseClassWithTeacher,
        );
        const dto = { teacherId: mockTeacher.id };

        // Act
        const result = await controller.addTeacher(mockCourseClass.id, dto);

        // Assert
        expect(mockCourseClassesService.addTeacherToClass).toHaveBeenCalledWith(
          mockCourseClass.id,
          mockTeacher.id,
        );
        expect(result).toBeInstanceOf(CourseClassResponseDto);
        expect(result.teachers).toHaveLength(1);
        expect(result.teachers[0].id).toEqual(mockTeacher.id);
      });
    });

    describe('getTeachers', () => {
      it('should return an array of UserResponseDto', async () => {
        // Arrange
        mockCourseClassesService.getTeachersFromClass.mockResolvedValue([
          mockTeacher,
        ]);

        // Act
        const result = await controller.getTeachers(mockCourseClass.id);

        // Assert
        expect(
          mockCourseClassesService.getTeachersFromClass,
        ).toHaveBeenCalledWith(mockCourseClass.id);
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(UserResponseDto);
        expect(result[0].id).toEqual(mockTeacher.id);
      });
    });

    describe('removeTeacher', () => {
      it('should remove a teacher and return the updated CourseClassResponseDto', async () => {
        // Arrange
        mockCourseClassesService.removeTeacherFromClass.mockResolvedValue(
          mockCourseClass,
        ); // Retorna a turma sem professores

        // Act
        const result = await controller.removeTeacher(
          mockCourseClass.id,
          mockTeacher.id,
        );

        // Assert
        expect(
          mockCourseClassesService.removeTeacherFromClass,
        ).toHaveBeenCalledWith(mockCourseClass.id, mockTeacher.id);
        expect(result).toBeInstanceOf(CourseClassResponseDto);
        expect(result.teachers).toHaveLength(0);
      });
    });
  });

  // TESTES PARA AS ROTAS DE GERENCIAMENTO DE ALUNOS
  describe('Student Management Routes', () => {
    describe('addStudent', () => {
      it('should add a student and return the updated CourseClassResponseDto', async () => {
        // Arrange
        const classWithStudent = {
          ...mockCourseClass,
          students: [mockStudent],
        };
        mockCourseClassesService.addStudentToClass.mockResolvedValue(
          classWithStudent,
        );
        const dto = { studentId: mockStudent.id };

        // Act
        const result = await controller.addStudent(mockCourseClass.id, dto);

        // Assert
        expect(mockCourseClassesService.addStudentToClass).toHaveBeenCalledWith(
          mockCourseClass.id,
          mockStudent.id,
        );
        expect(result).toBeInstanceOf(CourseClassResponseDto);
        expect(result.students).toHaveLength(1);
      });
    });

    describe('getStudents', () => {
      it('should return an array of StudentResponseDto', async () => {
        // Arrange
        mockCourseClassesService.getStudentsFromClass.mockResolvedValue([
          mockStudent,
        ]);

        // Act
        const result = await controller.getStudents(mockCourseClass.id);

        // Assert
        expect(result[0]).toBeInstanceOf(StudentResponseDto);
        expect(result[0].id).toEqual(mockStudent.id);
      });
    });
  });

  // TESTES PARA AS ROTAS DE GERENCIAMENTO DE AULAS
  describe('Lesson Management Routes', () => {
    describe('getLessons', () => {
      it('should return an array of LessonResponseDto', async () => {
        // Arrange
        mockLessonsService.findByCourseClassId.mockResolvedValue(
          mockLessonList,
        );

        // Act
        const result = await controller.getLessons(mockCourseClass.id);

        // Assert
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(LessonResponseDto);
        expect(mockLessonsService.findByCourseClassId).toHaveBeenCalledWith(
          mockCourseClass.id,
        );
        expect(result).toHaveLength(mockLessonList.length);
        result.forEach((item) => {
          expect(item).toBeInstanceOf(LessonResponseDto);
        });
        expect(result).toEqual(
          mockLessonList.map((lesson) => new LessonResponseDto(lesson)),
        );
      });

      it('should throw NotFoundException when course class not found', async () => {
        // Arrange
        const nonExistentId = 99;
        mockLessonsService.findByCourseClassId.mockRejectedValue(
          new NotFoundException('Course class not found'),
        );

        // Act & Assert
        await expect(controller.getLessons(nonExistentId)).rejects.toThrow(
          NotFoundException,
        );
        expect(mockLessonsService.findByCourseClassId).toHaveBeenCalledWith(
          nonExistentId,
        );
      });
    });
  });
});
