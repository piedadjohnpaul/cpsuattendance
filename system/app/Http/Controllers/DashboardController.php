<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use App\Services\AttendanceAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, AttendanceAlertService $alerts): Response
    {
        $today = now()->toDateString();
        $user = $request->user();

        if ($user->isStudent()) {
            $student = $user->student;
            $student?->load(['courses' => fn ($query) => $query
                ->with(['attendances' => fn ($attendance) => $attendance
                    ->where('student_id', $student->id)
                    ->orderByDesc('date')])]);
            $courseSummaries = $student
                ? $alerts->summaries($student->courses->pluck('id'), $student->id)->keyBy('course_id')
                : collect();

            return Inertia::render('Student/Portal', [
                'student' => $student ? [
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'grade_level' => $student->grade_level,
                    'section' => $student->section,
                    'courses' => $student->courses->map(function (Course $course) use ($courseSummaries): array {
                        $summary = $courseSummaries->get($course->id);

                        return [
                            'id' => $course->id,
                            'course_code' => $course->course_code,
                            'course_name' => $course->course_name,
                            'semester' => $course->semester,
                            'attendance_rate' => $summary['attendance_rate'] ?? null,
                            'below_threshold' => $summary['below_threshold'] ?? false,
                            'attendance' => $course->attendances->map(fn (Attendance $attendance) => [
                                'date' => $attendance->date->toDateString(),
                                'status' => $attendance->status,
                            ]),
                        ];
                    }),
                    'alertThreshold' => AttendanceAlertService::THRESHOLD,
                ] : null,
            ]);
        }

        $courseIds = $user->isAdmin()
            ? null
            : $user->taughtCourses()->pluck('id');

        return Inertia::render('Dashboard', [
            'studentCount' => $user->isAdmin()
                ? Student::count()
                : Student::query()->whereHas('courses', fn ($query) => $query->where('instructor_user_id', $user->id))->count(),
            'courseCount' => $user->isAdmin() ? Course::count() : $user->taughtCourses()->count(),
            'attendanceAlerts' => $alerts->summaries($courseIds)->where('below_threshold', true)->values(),
            'alertThreshold' => AttendanceAlertService::THRESHOLD,
            'todayPresent' => $this->attendanceCount('present', $today, $courseIds),
            'todayAbsent' => $this->attendanceCount('absent', $today, $courseIds),
            'todayLate' => $this->attendanceCount('late', $today, $courseIds),
            'todayExcused' => $this->attendanceCount('excused', $today, $courseIds),
            'recentAttendance' => Attendance::query()
                ->when($courseIds !== null, fn ($query) => $query->whereIn('course_id', $courseIds))
                ->with('student:id,student_number,name,grade_level,section')
                ->with('course:id,course_code,course_name')
                ->select('id', 'student_id', 'course_id', 'date', 'status')
                ->orderByDesc('date')
                ->orderByDesc('updated_at')
                ->limit(8)
                ->get()
                ->map(fn (Attendance $attendance) => [
                    'id' => $attendance->id,
                    'date' => $attendance->date->toDateString(),
                    'status' => $attendance->status,
                    'course' => $attendance->course,
                    'student' => $attendance->student,
                ]),
        ]);
    }

    private function attendanceCount(string $status, string $date, ?Collection $courseIds): int
    {
        return Attendance::query()
            ->whereDate('date', $date)
            ->where('status', $status)
            ->when($courseIds !== null, fn ($query) => $query->whereIn('course_id', $courseIds))
            ->count();
    }
}
