<?php

namespace App\Services;

use App\Models\Attendance;
use Illuminate\Support\Collection;

class AttendanceAlertService
{
    public const THRESHOLD = 75;

    public function summaries(?Collection $courseIds = null, ?int $studentId = null): Collection
    {
        $records = Attendance::query()
            ->join('students', 'students.id', '=', 'attendances.student_id')
            ->join('courses', 'courses.id', '=', 'attendances.course_id')
            ->when($courseIds !== null, fn ($query) => $query->whereIn('courses.id', $courseIds))
            ->when($studentId !== null, fn ($query) => $query->where('students.id', $studentId))
            ->select([
                'courses.id as course_id',
                'courses.course_code',
                'courses.course_name',
                'students.id as student_id',
                'students.student_number',
                'students.name',
                'students.grade_level',
                'students.section',
            ])
            ->selectRaw("SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END) as present")
            ->selectRaw("SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END) as absent")
            ->selectRaw("SUM(CASE WHEN attendances.status = 'late' THEN 1 ELSE 0 END) as late")
            ->selectRaw("SUM(CASE WHEN attendances.status = 'excused' THEN 1 ELSE 0 END) as excused")
            ->groupBy(
                'courses.id',
                'courses.course_code',
                'courses.course_name',
                'students.id',
                'students.student_number',
                'students.name',
                'students.grade_level',
                'students.section',
            )
            ->orderBy('courses.course_code')
            ->orderBy('students.name')
            ->get();

        return $records->map(function ($record): array {
            $present = (int) $record->present;
            $absent = (int) $record->absent;
            $late = (int) $record->late;
            $excused = (int) $record->excused;
            $countedSessions = $present + $absent + $late;
            $rate = $countedSessions > 0
                ? (int) round((($present + $late) / $countedSessions) * 100)
                : null;

            return [
                'course_id' => (int) $record->course_id,
                'course_code' => $record->course_code,
                'course_name' => $record->course_name,
                'student_id' => (int) $record->student_id,
                'student_number' => $record->student_number,
                'name' => $record->name,
                'grade_level' => $record->grade_level,
                'section' => $record->section,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'counted_sessions' => $countedSessions,
                'attendance_rate' => $rate,
                'below_threshold' => $rate !== null && $rate < self::THRESHOLD,
            ];
        });
    }
}
