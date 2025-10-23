import { Lesson } from '../entities/lesson.entity';

export class LessonResponseDto {
  id: number;
  courseClassId: number;
  date: Date;
  topic?: string;

  constructor(lesson: Lesson) {
    this.id = lesson.id;
    this.date = lesson.date;
    this.topic = lesson.topic;
    this.courseClassId = lesson.courseClassId;
  }
}
