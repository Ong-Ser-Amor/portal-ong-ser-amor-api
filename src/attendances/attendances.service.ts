import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseClassesService } from 'src/course-classes/course-classes.service';
import { LessonsService } from 'src/lessons/lessons.service';
import { StudentsService } from 'src/students/students.service';
import { In, Repository } from 'typeorm';

import { AttendanceItemDto } from './dto/bulk-attendance.dto';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendancesService {
  private readonly logger = new Logger(AttendancesService.name);

  constructor(
    @InjectRepository(Attendance)
    private readonly repository: Repository<Attendance>,
    private readonly studentsService: StudentsService,
    private readonly lessonsService: LessonsService,
    private readonly courseClassesService: CourseClassesService,
  ) {}

  async findAllByLesson(lessonId: number): Promise<Attendance[]> {
    await this.lessonsService.findOne(lessonId);

    try {
      return await this.repository.find({
        where: { lesson: { id: lessonId } },
        relations: ['student'],
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(
        `Error finding attendances by lesson id: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error finding attendances by lesson id',
      );
    }
  }

  async removeAllByLesson(lessonId: number): Promise<void> {
    await this.lessonsService.findOne(lessonId);

    try {
      await this.repository.softDelete({ lesson: { id: lessonId } });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error removing all attendance records for lesson ${lessonId}: ${errorMessage}`,
      );
      throw new InternalServerErrorException(
        'Error removing attendance records.',
      );
    }
  }

  async bulkUpsert(
    lessonId: number,
    attendanceItems: AttendanceItemDto[],
  ): Promise<Attendance[]> {
    const lesson = await this.lessonsService.findOne(lessonId);

    const courseClassStudents =
      await this.courseClassesService.getStudentsFromClass(
        lesson.courseClassId,
      );

    const courseClassStudentIds = courseClassStudents.map(
      (student) => student.id,
    );

    const receivedStudentIds = attendanceItems.map((item) => item.studentId);

    // Valida que todos os alunos da turma foram incluídos
    const missingStudentIds = courseClassStudentIds.filter(
      (id) => !receivedStudentIds.includes(id),
    );
    if (missingStudentIds.length > 0) {
      throw new BadRequestException(
        `Missing attendance records for students with IDs: ${missingStudentIds.join(', ')}`,
      );
    }

    // Valida que todos os alunos recebidos pertencem à turma
    const invalidStudentIds = receivedStudentIds.filter(
      (id) => !courseClassStudentIds.includes(id),
    );
    if (invalidStudentIds.length > 0) {
      throw new BadRequestException(
        `Students with IDs ${invalidStudentIds.join(', ')} do not belong to this course class`,
      );
    }

    try {
      return await this.repository.manager.transaction(async (manager) => {
        // Busca todas as presenças existentes desta aula em uma única query
        const existingAttendances = await manager.find(Attendance, {
          where: {
            lesson: { id: lessonId },
            student: { id: In(receivedStudentIds) },
          },
          relations: ['student', 'lesson'],
        });

        // Cria maps para lookup O(1) de performance
        const existingAttendancesMap = new Map(
          existingAttendances.map((att) => [att.student.id, att]),
        );

        const studentsMap = new Map(
          courseClassStudents.map((student) => [student.id, student]),
        );

        const attendancesToSave: Attendance[] = [];

        for (const item of attendanceItems) {
          const existingAttendance = existingAttendancesMap.get(item.studentId);

          if (existingAttendance) {
            existingAttendance.present = item.present;
            existingAttendance.notes = item.notes;
            attendancesToSave.push(existingAttendance);
          } else {
            const student = studentsMap.get(item.studentId);
            const newAttendance = manager.create(Attendance, {
              present: item.present,
              notes: item.notes,
              student,
              lesson,
            });
            attendancesToSave.push(newAttendance);
          }
        }

        // Salva todas as presenças em uma única query (bulk save)
        return await manager.save(Attendance, attendancesToSave);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unexpected error occurred: ${String(error)}`;
      this.logger.error(`Error bulk upserting attendances: ${errorMessage}`);
      throw new InternalServerErrorException(
        'Error creating/updating attendance records',
      );
    }
  }
}
