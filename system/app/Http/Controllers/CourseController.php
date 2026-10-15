<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Courses/Index', [
            'courses' => Course::query()
                ->when(! $request->user()->isAdmin(), fn ($query) => $query->where('instructor_user_id', $request->user()->id))
                ->withCount('students')
                ->withCount('attendances')
                ->orderBy('course_code')
                ->orderBy('semester')
                ->get(),
            'instructors' => $request->user()->isAdmin()
                ? User::query()->where('role', 'instructor')->orderBy('name')->get(['id', 'name', 'email'])
                : [],
            'canManage' => true,
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        abort_unless($request->user()->isAdmin() || $course->instructor_user_id === $request->user()->id, 404);
        $canManage = true;
        $students = Student::query()->when(! $request->user()->isAdmin(), fn ($query) => $query
            ->where(function ($query) use ($request, $course): void {
                $query->where('created_by', $request->user()->id)
                    ->orWhereHas('courses', fn ($courses) => $courses
                        ->where(function ($courses) use ($request, $course): void {
                            $courses->where('courses.id', $course->id)
                                ->orWhere('instructor_user_id', $request->user()->id);
                        }));
            }));

        return Inertia::render('Courses/Show', [
            'course' => $course->load([
                'students' => fn ($query) => $query->orderBy('name'),
            ]),
            'students' => $students->orderBy('name')->get([
                'id',
                'student_number',
                'name',
                'grade_level',
                'section',
            ]),
            'canManage' => $canManage,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedCourse($request);
        if (! $request->user()->isAdmin()) {
            $validated['instructor_user_id'] = $request->user()->id;
            $validated['instructor'] = $request->user()->name;
        }
        Course::create($validated);

        return redirect()->route('courses.index')->with('success', 'Course created successfully.');
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourse($request, $course);
        $validated = $this->validatedCourse($request, $course);
        if (! $request->user()->isAdmin()) {
            $validated['instructor_user_id'] = $request->user()->id;
            $validated['instructor'] = $request->user()->name;
        }
        $course->update($validated);

        return redirect()->route('courses.index')->with('success', 'Course updated successfully.');
    }

    public function updateStudents(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourse($request, $course);
        $validated = $request->validate([
            'student_ids' => ['present', 'array'],
            'student_ids.*' => ['required', 'integer', 'distinct', 'exists:students,id'],
        ]);

        if (! $request->user()->isAdmin()) {
            $allowedStudentIds = Student::query()
                ->where(function ($query) use ($request, $course): void {
                    $query->where('created_by', $request->user()->id)
                        ->orWhereHas('courses', fn ($courses) => $courses
                            ->where(function ($courses) use ($request, $course): void {
                                $courses->where('courses.id', $course->id)
                                    ->orWhere('instructor_user_id', $request->user()->id);
                            }));
                })
                ->whereIn('id', $validated['student_ids'])
                ->count();

            if ($allowedStudentIds !== count($validated['student_ids'])) {
                abort(403, 'You can only enroll students from your own roster or courses.');
            }
        }

        DB::transaction(fn () => $course->students()->sync($validated['student_ids']));

        return redirect()->route('courses.show', $course)->with('success', 'Course enrollment updated successfully.');
    }

    public function destroy(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourse($request, $course);
        $course->delete();

        return redirect()->route('courses.index')->with('success', 'Course and its attendance records removed.');
    }

    private function validatedCourse(Request $request, ?Course $course = null): array
    {
        $instructorId = $request->user()->isAdmin()
            ? $request->input('instructor_user_id')
            : $request->user()->id;

        $validated = $request->validate([
            'course_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('courses', 'course_code')
                    ->where('semester', $request->input('semester'))
                    ->where(fn ($query) => $instructorId === null
                        ? $query->whereNull('instructor_user_id')
                        : $query->where('instructor_user_id', $instructorId))
                    ->ignore($course?->id),
            ],
            'course_name' => ['required', 'string', 'max:255'],
            'instructor' => ['required', 'string', 'max:255'],
            'semester' => ['required', 'string', 'max:100'],
            'meeting_schedule' => ['required', 'string', 'max:255'],
            'room' => ['nullable', 'string', 'max:100'],
            'instructor_user_id' => $request->user()->isAdmin() ? [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', 'instructor'),
            ] : ['prohibited'],
        ]);

        return $validated;
    }

    private function authorizeCourse(Request $request, Course $course): void
    {
        abort_unless($request->user()->isAdmin() || $course->instructor_user_id === $request->user()->id, 404);
    }
}
