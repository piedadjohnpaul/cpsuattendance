<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $rows = $this->reportRows($filters, $request);

        return Inertia::render('Attendance/Reports', [
            'courses' => $this->courses($request),
            'classes' => $this->classes($request),
            'filters' => $filters,
            'summary' => [
                'students' => $rows->count(),
                'records' => $rows->sum('days_recorded'),
                'present' => $rows->sum('present'),
                'absent' => $rows->sum('absent'),
                'late' => $rows->sum('late'),
                'excused' => $rows->sum('excused'),
            ],
            'students' => $rows,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $rows = $this->reportRows($filters, $request);

        return response()->streamDownload(function () use ($rows): void {
            $output = fopen('php://output', 'w');
            fputcsv($output, [
                'Course Code',
                'Course Name',
                'Student ID',
                'Student Name',
                'Grade Level',
                'Section',
                'Days Recorded',
                'Present',
                'Absent',
                'Late',
                'Excused',
            ]);

            foreach ($rows as $student) {
                fputcsv($output, [
                    $this->spreadsheetSafe($student['course_code']),
                    $this->spreadsheetSafe($student['course_name']),
                    $this->spreadsheetSafe($student['student_number']),
                    $this->spreadsheetSafe($student['name']),
                    $this->spreadsheetSafe($student['grade_level']),
                    $this->spreadsheetSafe($student['section']),
                    $student['days_recorded'],
                    $student['present'],
                    $student['absent'],
                    $student['late'],
                    $student['excused'],
                ]);
            }

            fclose($output);
        }, 'attendance-report-'.$filters['from_date'].'-to-'.$filters['to_date'].'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'from_date' => ['sometimes', 'date_format:Y-m-d'],
            'to_date' => ['sometimes', 'date_format:Y-m-d'],
            'course_id' => ['sometimes', 'integer', 'exists:courses,id'],
            'grade_level' => ['sometimes', 'string', 'max:50'],
            'section' => ['sometimes', 'string', 'max:100'],
        ]);

        $filters = [
            'from_date' => $validated['from_date'] ?? now()->startOfMonth()->toDateString(),
            'to_date' => $validated['to_date'] ?? now()->toDateString(),
            'course_id' => isset($validated['course_id']) ? (int) $validated['course_id'] : '',
            'grade_level' => $validated['grade_level'] ?? '',
            'section' => $validated['section'] ?? '',
        ];

        if ($filters['course_id'] !== '' && ! $this->courses($request)->contains(
            fn ($course) => $course->id === $filters['course_id'],
        )) {
            abort(404);
        }

        if ($filters['from_date'] > $filters['to_date']) {
            throw ValidationException::withMessages([
                'from_date' => 'The start date must be on or before the end date.',
            ]);
        }

        if ((bool) $filters['grade_level'] !== (bool) $filters['section']) {
            throw ValidationException::withMessages([
                'section' => 'Select both a grade and section.',
            ]);
        }

        if ($filters['grade_level'] !== '' && ! $this->classes($request)->contains(
            fn ($class) => $class->grade_level === $filters['grade_level']
                && $class->section === $filters['section'],
        )) {
            throw ValidationException::withMessages([
                'section' => 'The selected class is not in the student roster.',
            ]);
        }

        return $filters;
    }

    private function classes(Request $request): Collection
    {
        return Student::query()
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->whereHas('courses', fn ($courses) => $courses
                ->where('instructor_user_id', $request->user()->id)))
            ->select('grade_level', 'section')
            ->distinct()
            ->orderBy('grade_level')
            ->orderBy('section')
            ->get();
    }

    private function courses(Request $request): Collection
    {
        return Course::query()
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->where('instructor_user_id', $request->user()->id))
            ->orderBy('course_code')
            ->get(['id', 'course_code', 'course_name', 'semester']);
    }

    private function reportRows(array $filters, Request $request): Collection
    {
        $records = Attendance::query()
            ->join('students', 'students.id', '=', 'attendances.student_id')
            ->leftJoin('courses', 'courses.id', '=', 'attendances.course_id')
            ->whereDate('attendances.date', '>=', $filters['from_date'])
            ->whereDate('attendances.date', '<=', $filters['to_date'])
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->whereIn(
                'attendances.course_id',
                Course::query()->select('id')->where('instructor_user_id', $request->user()->id),
            ))
            ->when($filters['course_id'] !== '', fn ($query) => $query->where('attendances.course_id', $filters['course_id']))
            ->when($filters['grade_level'] !== '', fn ($query) => $query
                ->where('students.grade_level', $filters['grade_level'])
                ->where('students.section', $filters['section']))
            ->select([
                'attendances.course_id',
                'courses.course_code',
                'courses.course_name',
                'students.id as student_id',
                'students.student_number',
                'students.name',
                'students.grade_level',
                'students.section',
                'attendances.status',
            ])
            ->selectRaw('COUNT(attendances.id) as status_count')
            ->groupBy(
                'attendances.course_id',
                'courses.course_code',
                'courses.course_name',
                'students.id',
                'students.student_number',
                'students.name',
                'students.grade_level',
                'students.section',
                'attendances.status',
            )
            ->orderBy('students.name')
            ->get();

        return $records
            ->groupBy(fn ($record) => ($record->course_id ?? 'legacy').'-'.$record->student_id)
            ->map(function (Collection $studentRecords): array {
                $student = $studentRecords->first();
                $counts = $studentRecords->pluck('status_count', 'status');

                return [
                    'course_id' => $student->course_id,
                    'course_code' => $student->course_code ?? 'Legacy',
                    'course_name' => $student->course_name ?? 'Unassigned attendance',
                    'student_id' => $student->student_id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'grade_level' => $student->grade_level,
                    'section' => $student->section,
                    'days_recorded' => $studentRecords->sum('status_count'),
                    'present' => (int) ($counts['present'] ?? 0),
                    'absent' => (int) ($counts['absent'] ?? 0),
                    'late' => (int) ($counts['late'] ?? 0),
                    'excused' => (int) ($counts['excused'] ?? 0),
                ];
            })
            ->values();
    }

    private function spreadsheetSafe(string $value): string
    {
        return preg_match('/^[\s]*[=+\-@]/', $value) ? "'".$value : $value;
    }
}
