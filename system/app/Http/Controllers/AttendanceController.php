<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'course_id' => ['sometimes', 'integer', 'exists:courses,id'],
        ]);
        $date = $validated['date'] ?? now()->toDateString();
        $courses = Course::query()
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->where('instructor_user_id', $request->user()->id))
            ->orderBy('course_code')
            ->get([
                'id',
                'course_code',
                'course_name',
                'semester',
                'meeting_schedule',
                'room',
            ]);
        $selectedCourse = isset($validated['course_id'])
            ? $courses->firstWhere('id', $validated['course_id'])
            : $courses->first();

        if (isset($validated['course_id']) && ! $selectedCourse) {
            abort(404);
        }

        $students = $selectedCourse
            ? $selectedCourse->students()
                ->with(['attendances' => fn ($query) => $query
                    ->where('course_id', $selectedCourse->id)
                    ->whereDate('date', $date)])
                ->orderBy('name')
                ->get()
                ->map(fn ($student) => [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'name' => $student->name,
                    'grade_level' => $student->grade_level,
                    'section' => $student->section,
                    'status' => $student->attendances->first()?->status,
                ])
            : collect();

        return Inertia::render('Attendance/Index', [
            'students' => $students,
            'date' => $date,
            'courses' => $courses,
            'selectedCourse' => $selectedCourse,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'records.*.status' => ['required', Rule::in(['present', 'absent', 'late', 'excused'])],
        ]);

        $course = Course::query()
            ->whereKey($validated['course_id'])
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->where('instructor_user_id', $request->user()->id))
            ->firstOrFail();
        $courseStudents = $course->students()->orderBy('students.id')->pluck('students.id');
        $submittedStudentIds = collect($validated['records'])->pluck('student_id')->sort()->values();

        if ($courseStudents->isEmpty() || $submittedStudentIds->all() !== $courseStudents->all()) {
            throw ValidationException::withMessages([
                'records' => 'Please mark attendance for every student enrolled in the selected course.',
            ]);
        }

        DB::transaction(function () use ($validated): void {
            foreach ($validated['records'] as $record) {
                $attendance = Attendance::query()
                    ->where('course_id', $validated['course_id'])
                    ->where('student_id', $record['student_id'])
                    ->whereDate('date', $validated['date'])
                    ->first();

                if ($attendance) {
                    $attendance->update(['status' => $record['status']]);
                } else {
                    Attendance::create([
                        'course_id' => $validated['course_id'],
                        'student_id' => $record['student_id'],
                        'date' => $validated['date'],
                        'status' => $record['status'],
                    ]);
                }
            }
        });

        return redirect()->route('attendance.index', [
            'date' => $validated['date'],
            'course_id' => $validated['course_id'],
        ])
            ->with('success', 'Attendance saved successfully.');
    }
}
