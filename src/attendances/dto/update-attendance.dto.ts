import { OmitType, PartialType } from '@nestjs/swagger';

import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(
  OmitType(CreateAttendanceDto, ['studentId', 'lessonId'] as const),
) {}
