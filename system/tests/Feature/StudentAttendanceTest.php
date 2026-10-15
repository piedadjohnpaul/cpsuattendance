<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentAttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_attendance_pages_require_authentication(): void
    {
        $this->get(route('students.index'))->assertRedirect(route('login'));
        $this->get(route('attendance.index'))->assertRedirect(route('login'));
    }

    public function test_dashboard_shows_student_and_daily_attendance_totals(): void
    {
        $teacher = User::factory()->create();
        $present = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => '1st Year',
            'section' => 'A',
            'program' => 'BSIT',
        ]);
        $absent = Student::create([
            'student_number' => 'STU-1002',
            'name' => 'Jordan Reyes',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $late = Student::create([
            'student_number' => 'STU-1003',
            'name' => 'Sam Kim',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $excused = Student::create([
            'student_number' => 'STU-1004',
            'name' => 'Alex Morgan',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);

        Attendance::create(['student_id' => $present->id, 'date' => now()->toDateString(), 'status' => 'present']);
        Attendance::create(['student_id' => $absent->id, 'date' => now()->toDateString(), 'status' => 'absent']);
        Attendance::create(['student_id' => $late->id, 'date' => now()->toDateString(), 'status' => 'late']);
        Attendance::create(['student_id' => $excused->id, 'date' => now()->toDateString(), 'status' => 'excused']);

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('studentCount', 4)
                ->where('todayPresent', 1)
                ->where('todayAbsent', 1)
                ->where('todayLate', 1)
                ->where('todayExcused', 1)
                ->has('recentAttendance', 4));
    }

    public function test_dashboard_flags_students_below_75_percent_and_excludes_excused_sessions(): void
    {
        $administrator = User::factory()->create(['role' => 'admin']);
        $course = $this->createCourse();
        $belowThreshold = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $atThreshold = Student::create([
            'student_number' => 'STU-1002',
            'name' => 'Jordan Reyes',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $course->students()->attach([$belowThreshold->id, $atThreshold->id]);

        foreach ([
            [$belowThreshold, 'present'],
            [$belowThreshold, 'absent'],
            [$belowThreshold, 'absent'],
            [$atThreshold, 'present'],
            [$atThreshold, 'present'],
            [$atThreshold, 'late'],
            [$atThreshold, 'absent'],
            [$atThreshold, 'excused'],
            [$atThreshold, 'excused'],
        ] as [$student, $status]) {
            Attendance::create([
                'course_id' => $course->id,
                'student_id' => $student->id,
                'date' => now()->subDays(Attendance::query()->count() + 1)->toDateString(),
                'status' => $status,
            ]);
        }

        $this->actingAs($administrator)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('alertThreshold', 75)
                ->has('attendanceAlerts', 1)
                ->where('attendanceAlerts.0.student_number', 'STU-1001')
                ->where('attendanceAlerts.0.attendance_rate', 33)
                ->where('attendanceAlerts.0.below_threshold', true));
    }

    public function test_authenticated_teacher_can_add_a_student(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('students.store'), [
                'student_number' => 'STU-1001',
                'name' => 'Avery Santos',
                'grade_level' => '1st Year',
                'section' => 'A',
                'program' => 'BSIT',
            ])
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseHas('students', [
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => '1st Year',
            'section' => 'A',
            'program' => 'BSIT',
        ]);
    }

    public function test_student_number_must_be_unique(): void
    {
        Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);

        $this->actingAs(User::factory()->create())
            ->from(route('students.index'))
            ->post(route('students.store'), [
                'student_number' => 'STU-1001',
                'name' => 'Jordan Reyes',
                'grade_level' => '2nd Year',
                'section' => 'B',
                'program' => 'BEEd',
            ])
            ->assertSessionHasErrors('student_number');

        $this->assertDatabaseCount('students', 1);
    }

    public function test_student_year_section_and_program_must_use_the_available_options(): void
    {
        $this->actingAs(User::factory()->create())
            ->from(route('students.index'))
            ->post(route('students.store'), [
                'student_number' => 'STU-1001',
                'name' => 'Avery Santos',
                'grade_level' => '5th Year',
                'section' => 'G',
                'program' => 'BSN',
            ])
            ->assertSessionHasErrors(['grade_level', 'section', 'program']);

        $this->assertDatabaseCount('students', 0);
    }

    public function test_student_csv_template_can_be_downloaded(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('students.import-template'))
            ->assertOk()
            ->assertDownload('student-roster-template.csv');
    }

    public function test_instructor_can_import_students_from_csv_and_existing_ids_are_skipped(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Existing Student',
            'grade_level' => '1st Year',
            'section' => 'A',
            'program' => 'BSIT',
        ]);
        $file = UploadedFile::fake()->createWithContent(
            'roster.csv',
            "student_number,name,program,grade_level,section\n".
            "STU-1001,Existing Student,BSIT,1st Year,A\n".
            "STU-1002,Avery Santos,BSIT,2nd Year,B\n".
            "STU-1003,Jordan Reyes,BEEd,3rd Year,C\n",
        );

        $this->actingAs($instructor)
            ->post(route('students.import'), ['file' => $file])
            ->assertRedirect(route('students.index'))
            ->assertSessionHas('success', '2 students imported successfully. 1 existing student ID was skipped.');

        $this->assertDatabaseCount('students', 3);
        $this->assertDatabaseHas('students', [
            'student_number' => 'STU-1002',
            'name' => 'Avery Santos',
            'program' => 'BSIT',
            'grade_level' => '2nd Year',
            'section' => 'B',
            'created_by' => $instructor->id,
        ]);
        $this->assertDatabaseHas('students', [
            'student_number' => 'STU-1003',
            'program' => 'BEEd',
            'created_by' => $instructor->id,
        ]);
    }

    public function test_student_csv_import_rejects_invalid_rows_without_partial_import(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'roster.csv',
            "student_number,name,program,grade_level,section\n".
            "STU-1001,Avery Santos,BSIT,1st Year,A\n".
            "STU-1002,Jordan Reyes,BSN,5th Year,G\n",
        );

        $this->actingAs(User::factory()->create())
            ->from(route('students.index'))
            ->post(route('students.import'), ['file' => $file])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasErrors('file')
            ->assertSessionHas('import_rows');

        $this->assertDatabaseCount('students', 0);
    }

    public function test_student_csv_import_requires_expected_column_headers(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'roster.csv',
            "name,student_number,program,grade_level,section\nAvery Santos,STU-1001,BSIT,1st Year,A\n",
        );

        $this->actingAs(User::factory()->create())
            ->from(route('students.index'))
            ->post(route('students.import'), ['file' => $file])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasErrors('file');

        $this->assertDatabaseCount('students', 0);
    }

    public function test_student_csv_import_rejects_duplicate_ids_in_the_same_file(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'roster.csv',
            "student_number,name,program,grade_level,section\n".
            "STU-1001,Avery Santos,BSIT,1st Year,A\n".
            "STU-1001,Avery Santos,BSIT,1st Year,A\n",
        );

        $this->actingAs(User::factory()->create())
            ->from(route('students.index'))
            ->post(route('students.import'), ['file' => $file])
            ->assertRedirect(route('students.index'))
            ->assertSessionHasErrors('file')
            ->assertSessionHas('import_rows');

        $this->assertDatabaseCount('students', 0);
    }

    public function test_attendance_can_be_saved_and_updated_for_a_date(): void
    {
        $teacher = User::factory()->create();
        $course = $this->createCourse();
        $present = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $absent = Student::create([
            'student_number' => 'STU-1002',
            'name' => 'Jordan Reyes',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $course->students()->attach([$present->id, $absent->id]);

        $this->actingAs($teacher)
            ->get(route('attendance.index', ['course_id' => $course->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Attendance/Index')
                ->where('selectedCourse.id', $course->id)
                ->has('students', 2));

        $this->actingAs($teacher)
            ->post(route('attendance.store'), [
                'date' => '2026-10-14',
                'course_id' => $course->id,
                'records' => [
                    ['student_id' => $present->id, 'status' => 'present'],
                    ['student_id' => $absent->id, 'status' => 'absent'],
                ],
            ])
            ->assertRedirect(route('attendance.index', [
                'date' => '2026-10-14',
                'course_id' => $course->id,
            ]));

        $this->assertDatabaseCount('attendances', 2);
        $this->assertSame(
            'present',
            Attendance::query()->where('student_id', $present->id)->whereDate('date', '2026-10-14')->value('status'),
        );

        $this->post(route('attendance.store'), [
            'date' => '2026-10-14',
            'course_id' => $course->id,
            'records' => [
                ['student_id' => $present->id, 'status' => 'absent'],
                ['student_id' => $absent->id, 'status' => 'present'],
            ],
        ])
            ->assertRedirect(route('attendance.index', [
                'date' => '2026-10-14',
                'course_id' => $course->id,
            ]));

        $this->assertDatabaseCount('attendances', 2);
        $this->assertSame(
            'absent',
            Attendance::query()
                ->where('course_id', $course->id)
                ->where('student_id', $present->id)
                ->whereDate('date', '2026-10-14')
                ->value('status'),
        );
    }

    public function test_attendance_requires_a_status_for_every_student(): void
    {
        $course = $this->createCourse();
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $course->students()->attach($student);

        $this->actingAs(User::factory()->create())
            ->from(route('attendance.index'))
            ->post(route('attendance.store'), [
                'date' => '2026-10-14',
                'course_id' => $course->id,
                'records' => [
                    ['student_id' => $student->id, 'status' => ''],
                ],
            ])
            ->assertSessionHasErrors('records.0.status');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_attendance_can_be_marked_late_or_excused(): void
    {
        $course = $this->createCourse();
        $students = collect([
            ['student_number' => 'STU-1001', 'name' => 'Avery Santos', 'status' => 'late'],
            ['student_number' => 'STU-1002', 'name' => 'Jordan Reyes', 'status' => 'excused'],
        ])->map(function (array $student): array {
            $record = Student::create([
                'student_number' => $student['student_number'],
                'name' => $student['name'],
                'grade_level' => 'Grade 7',
                'section' => 'Section A',
            ]);

            return ['id' => $record->id, 'status' => $student['status']];
        });
        $course->students()->attach($students->pluck('id'));

        $this->actingAs(User::factory()->create())
            ->post(route('attendance.store'), [
                'date' => '2026-10-14',
                'course_id' => $course->id,
                'records' => $students->map(fn (array $student) => [
                    'student_id' => $student['id'],
                    'status' => $student['status'],
                ])->all(),
            ])
            ->assertRedirect(route('attendance.index', [
                'date' => '2026-10-14',
                'course_id' => $course->id,
            ]));

        $this->assertSame(
            ['excused', 'late'],
            Attendance::query()->orderBy('status')->pluck('status')->all(),
        );
    }

    public function test_attendance_submission_cannot_include_students_from_another_class(): void
    {
        $course = $this->createCourse();
        $classStudent = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $otherClassStudent = Student::create([
            'student_number' => 'STU-2001',
            'name' => 'Morgan Lee',
            'grade_level' => 'Grade 8',
            'section' => 'Section B',
        ]);
        $course->students()->attach($classStudent);

        $this->actingAs(User::factory()->create())
            ->from(route('attendance.index'))
            ->post(route('attendance.store'), [
                'date' => '2026-10-14',
                'course_id' => $course->id,
                'records' => [
                    ['student_id' => $classStudent->id, 'status' => 'present'],
                    ['student_id' => $otherClassStudent->id, 'status' => 'absent'],
                ],
            ])
            ->assertSessionHasErrors('records');

        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_attendance_report_filters_by_date_and_class_and_can_export_csv(): void
    {
        $teacher = User::factory()->create();
        $firstStudent = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        $otherClassStudent = Student::create([
            'student_number' => 'STU-2001',
            'name' => 'Morgan Lee',
            'grade_level' => 'Grade 8',
            'section' => 'Section B',
        ]);

        Attendance::create(['student_id' => $firstStudent->id, 'date' => '2026-10-14', 'status' => 'present']);
        Attendance::create(['student_id' => $firstStudent->id, 'date' => '2026-10-15', 'status' => 'late']);
        Attendance::create(['student_id' => $firstStudent->id, 'date' => '2026-10-16', 'status' => 'excused']);
        Attendance::create(['student_id' => $otherClassStudent->id, 'date' => '2026-10-15', 'status' => 'absent']);

        $filters = [
            'from_date' => '2026-10-14',
            'to_date' => '2026-10-15',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ];

        $this->actingAs($teacher)
            ->get(route('attendance.reports', $filters))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Attendance/Reports')
                ->where('summary.students', 1)
                ->where('summary.records', 2)
                ->where('summary.present', 1)
                ->where('summary.late', 1)
                ->where('summary.excused', 0)
                ->has('students', 1)
                ->where('students.0.student_number', 'STU-1001'));

        $this->get(route('attendance.reports.export', $filters))
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8')
            ->assertStreamedContent("\"Course Code\",\"Course Name\",\"Student ID\",\"Student Name\",\"Grade Level\",Section,\"Days Recorded\",Present,Absent,Late,Excused\nLegacy,\"Unassigned attendance\",STU-1001,\"Avery Santos\",\"Grade 7\",\"Section A\",2,1,0,1,0\n");
    }

    public function test_same_student_can_have_separate_course_attendance_on_the_same_day(): void
    {
        $teacher = User::factory()->create();
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $firstCourse = $this->createCourse('CS101');
        $secondCourse = $this->createCourse('MATH101');
        $firstCourse->students()->attach($student);
        $secondCourse->students()->attach($student);

        foreach ([[$firstCourse, 'present'], [$secondCourse, 'late']] as [$course, $status]) {
            $this->actingAs($teacher)
                ->post(route('attendance.store'), [
                    'date' => '2026-10-14',
                    'course_id' => $course->id,
                    'records' => [['student_id' => $student->id, 'status' => $status]],
                ])
                ->assertRedirect(route('attendance.index', [
                    'date' => '2026-10-14',
                    'course_id' => $course->id,
                ]));
        }

        $this->assertDatabaseCount('attendances', 2);
        $this->assertDatabaseHas('attendances', [
            'course_id' => $firstCourse->id,
            'student_id' => $student->id,
            'date' => '2026-10-14 00:00:00',
            'status' => 'present',
        ]);
        $this->assertDatabaseHas('attendances', [
            'course_id' => $secondCourse->id,
            'student_id' => $student->id,
            'date' => '2026-10-14 00:00:00',
            'status' => 'late',
        ]);

        $this->get(route('attendance.reports', [
            'from_date' => '2026-10-14',
            'to_date' => '2026-10-14',
            'course_id' => $secondCourse->id,
        ]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.students', 1)
                ->where('summary.records', 1)
                ->where('students.0.course_code', 'MATH101')
                ->where('students.0.late', 1));
    }

    public function test_course_catalog_can_create_and_enroll_students(): void
    {
        $teacher = User::factory()->create();
        $instructor = User::factory()->create(['role' => 'instructor']);
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);

        $this->actingAs($teacher)
            ->post(route('courses.store'), [
                'course_code' => 'CS101',
                'course_name' => 'Introduction to Computing',
                'instructor' => 'Prof. Santos',
                'semester' => 'First Semester',
                'meeting_schedule' => 'Monday, 9:00 AM',
                'room' => 'Room 101',
                'instructor_user_id' => $instructor->id,
            ])
            ->assertRedirect(route('courses.index'));

        $course = Course::query()->where('course_code', 'CS101')->firstOrFail();
        $this->assertSame($instructor->id, $course->instructor_user_id);

        $this->put(route('courses.students.update', $course), [
            'student_ids' => [$student->id],
        ])->assertRedirect(route('courses.show', $course));

        $this->assertDatabaseHas('course_student', [
            'course_id' => $course->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_instructors_can_only_access_assigned_courses_and_attendance(): void
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $otherInstructor = User::factory()->create(['role' => 'instructor']);
        $assignedCourse = $this->createCourse('CS101');
        $otherCourse = $this->createCourse('MATH101');
        $assignedCourse->update(['instructor_user_id' => $instructor->id]);
        $otherCourse->update(['instructor_user_id' => $otherInstructor->id]);
        $otherCourseStudent = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $assignedCourseStudent = Student::create([
            'student_number' => 'STU-1002',
            'name' => 'Jordan Reyes',
            'grade_level' => 'Year 2',
            'section' => 'Section B',
        ]);
        $otherCourse->students()->attach($otherCourseStudent);
        $assignedCourse->students()->attach($assignedCourseStudent);
        Attendance::create([
            'course_id' => $assignedCourse->id,
            'student_id' => $assignedCourseStudent->id,
            'date' => now()->toDateString(),
            'status' => 'present',
        ]);
        Attendance::create([
            'course_id' => $otherCourse->id,
            'student_id' => $otherCourseStudent->id,
            'date' => now()->toDateString(),
            'status' => 'absent',
        ]);

        $this->actingAs($instructor)
            ->get(route('courses.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('courses', 1)
                ->where('courses.0.id', $assignedCourse->id)
                ->where('canManage', true));

        $this->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('courseCount', 1)
                ->where('studentCount', 1)
                ->where('todayPresent', 1)
                ->where('todayAbsent', 0)
                ->has('recentAttendance', 1)
                ->where('recentAttendance.0.student.student_number', 'STU-1002'));

        $this->get(route('courses.show', $otherCourse))->assertNotFound();
        $this->get(route('students.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('students', 1)
                ->where('students.0.student_number', 'STU-1002'));
        $this->get('/users')->assertNotFound();
        $this->get(route('attendance.index', ['course_id' => $otherCourse->id]))->assertNotFound();
        $this->get(route('attendance.reports', ['course_id' => $otherCourse->id]))->assertNotFound();

        $this->post(route('attendance.store'), [
            'date' => '2026-10-14',
            'course_id' => $otherCourse->id,
            'records' => [['student_id' => $otherCourseStudent->id, 'status' => 'present']],
        ])->assertNotFound();
    }

    public function test_registered_instructor_can_create_courses_students_and_take_attendance_without_admin(): void
    {
        $response = $this->post('/register', [
            'name' => 'Instructor Santos',
            'email' => 'instructor@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
        $instructor = User::query()->where('email', 'instructor@example.com')->firstOrFail();
        $this->assertSame('instructor', $instructor->role);

        $this->actingAs($instructor)
            ->post(route('courses.store'), [
                'course_code' => 'CS101',
                'course_name' => 'Introduction to Computing',
                'instructor' => 'Untrusted Instructor Field',
                'semester' => 'First Semester',
                'meeting_schedule' => 'Monday, 9:00 AM',
                'room' => 'Room 101',
            ])
            ->assertRedirect(route('courses.index'));

        $course = Course::query()->where('course_code', 'CS101')->firstOrFail();
        $this->assertSame($instructor->id, $course->instructor_user_id);
        $this->assertSame($instructor->name, $course->instructor);

        $this->post(route('students.store'), [
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => '1st Year',
            'section' => 'A',
            'program' => 'BSIT',
        ])->assertRedirect(route('students.index'));

        $student = Student::query()->where('student_number', 'STU-1001')->firstOrFail();
        $this->assertSame($instructor->id, $student->created_by);
        $this->assertSame('BSIT', $student->program);

        $this->put(route('courses.students.update', $course), [
            'student_ids' => [$student->id],
        ])->assertRedirect(route('courses.show', $course));

        $this->post(route('attendance.store'), [
            'date' => '2026-10-14',
            'course_id' => $course->id,
            'records' => [['student_id' => $student->id, 'status' => 'present']],
        ])->assertRedirect(route('attendance.index', [
            'date' => '2026-10-14',
            'course_id' => $course->id,
        ]));

        $this->assertDatabaseHas('attendances', [
            'course_id' => $course->id,
            'student_id' => $student->id,
            'status' => 'present',
        ]);
        $this->get('/users')->assertNotFound();
    }

    public function test_instructors_cannot_view_or_edit_another_instructors_student_roster(): void
    {
        $firstInstructor = User::factory()->create(['role' => 'instructor']);
        $secondInstructor = User::factory()->create(['role' => 'instructor']);
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
            'created_by' => $firstInstructor->id,
        ]);

        $this->actingAs($secondInstructor)
            ->get(route('students.index'))
            ->assertInertia(fn (Assert $page) => $page->has('students', 0));

        $this->put(route('students.update', $student), [
            'student_number' => 'STU-1001',
            'name' => 'Changed Name',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ])->assertNotFound();
    }

    public function test_course_code_uniqueness_is_scoped_to_instructor_and_semester(): void
    {
        $firstInstructor = User::factory()->create(['role' => 'instructor']);
        $secondInstructor = User::factory()->create(['role' => 'instructor']);
        $courseData = [
            'course_code' => 'CS101',
            'course_name' => 'Introduction to Computing',
            'instructor' => 'Instructor',
            'semester' => 'First Semester',
            'meeting_schedule' => 'Monday, 9:00 AM',
            'room' => 'Room 101',
        ];

        $this->actingAs($firstInstructor)
            ->post(route('courses.store'), $courseData)
            ->assertRedirect(route('courses.index'));
        $this->actingAs($secondInstructor)
            ->post(route('courses.store'), $courseData)
            ->assertRedirect(route('courses.index'));
        $this->assertDatabaseCount('courses', 2);

        $this->actingAs($firstInstructor)
            ->from(route('courses.index'))
            ->post(route('courses.store'), $courseData)
            ->assertSessionHasErrors('course_code');
    }

    public function test_students_only_see_their_own_attendance_portal(): void
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $student->user()->associate($studentUser)->save();
        $otherStudent = Student::create([
            'student_number' => 'STU-2001',
            'name' => 'Jordan Reyes',
            'grade_level' => 'Year 1',
            'section' => 'Section A',
        ]);
        $course = $this->createCourse();
        $course->students()->attach([$student->id, $otherStudent->id]);
        Attendance::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'date' => '2026-10-14',
            'status' => 'present',
        ]);
        Attendance::create([
            'course_id' => $course->id,
            'student_id' => $otherStudent->id,
            'date' => '2026-10-14',
            'status' => 'absent',
        ]);

        $this->actingAs($studentUser)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Portal')
                ->where('student.student_number', 'STU-1001')
                ->has('student.courses', 1)
                ->where('student.courses.0.attendance_rate', 100)
                ->where('student.courses.0.below_threshold', false)
                ->where('student.courses.0.attendance.0.status', 'present'));

        $this->get(route('courses.index'))->assertForbidden();
        $this->get(route('attendance.reports'))->assertForbidden();
    }

    public function test_student_deletion_cascades_to_attendance_history(): void
    {
        $student = Student::create([
            'student_number' => 'STU-1001',
            'name' => 'Avery Santos',
            'grade_level' => 'Grade 7',
            'section' => 'Section A',
        ]);
        Attendance::create([
            'student_id' => $student->id,
            'date' => '2026-10-14',
            'status' => 'present',
        ]);

        $this->actingAs(User::factory()->create())
            ->delete(route('students.destroy', $student))
            ->assertRedirect(route('students.index'));

        $this->assertDatabaseCount('students', 0);
        $this->assertDatabaseCount('attendances', 0);
    }

    private function createCourse(string $courseCode = 'CS101'): Course
    {
        return Course::create([
            'course_code' => $courseCode,
            'course_name' => 'Introduction to Computing',
            'instructor' => 'Prof. Santos',
            'semester' => 'First Semester',
            'meeting_schedule' => 'Monday, 9:00 AM',
            'room' => 'Room 101',
        ]);
    }
}
