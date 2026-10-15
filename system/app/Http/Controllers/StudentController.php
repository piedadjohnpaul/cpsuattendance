<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    private const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    private const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

    private const PROGRAMS = ['BSIT', 'BEEd', 'BSCrim', 'BSAB', 'BSHM', 'BSED'];

    private const IMPORT_HEADERS = ['student_number', 'name', 'program', 'grade_level', 'section'];

    private const MAX_IMPORT_ROWS = 500;

    public function index(Request $request): Response
    {
        return Inertia::render('Students/Index', [
            'students' => $this->studentsVisibleTo($request)->orderBy('name')->get(),
        ]);
    }

    public function importTemplate(): StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $stream = fopen('php://output', 'wb');
            fputcsv($stream, self::IMPORT_HEADERS);
            fclose($stream);
        }, 'student-roster-template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'extensions:csv', 'max:2048'],
        ]);

        $stream = fopen($validated['file']->getRealPath(), 'rb');
        if ($stream === false) {
            throw ValidationException::withMessages(['file' => 'The uploaded CSV file could not be read.']);
        }

        try {
            $headers = fgetcsv($stream, null, ',', '"', '');
            if (! is_array($headers)) {
                throw ValidationException::withMessages(['file' => 'The CSV file is empty or has no header row.']);
            }

            $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
            $headers = array_map(fn ($header) => strtolower(trim((string) $header)), $headers);
            if ($headers !== self::IMPORT_HEADERS) {
                throw ValidationException::withMessages([
                    'file' => 'Use the template and keep these columns in order: '.implode(', ', self::IMPORT_HEADERS).'.',
                ]);
            }

            $rows = [];
            $rowErrors = [];
            $seenStudentNumbers = [];
            $lineNumber = 1;
            $dataRowCount = 0;

            while (($columns = fgetcsv($stream, null, ',', '"', '')) !== false) {
                $lineNumber++;
                if ($columns === [null] || (count($columns) === 1 && trim((string) $columns[0]) === '')) {
                    continue;
                }

                $dataRowCount++;
                if ($dataRowCount > self::MAX_IMPORT_ROWS) {
                    throw ValidationException::withMessages([
                        'file' => 'A CSV file can contain no more than '.self::MAX_IMPORT_ROWS.' student rows.',
                    ]);
                }

                if (count($columns) !== count(self::IMPORT_HEADERS)) {
                    $this->addImportRowError($rowErrors, "Row {$lineNumber}: expected ".count(self::IMPORT_HEADERS).' columns.');

                    continue;
                }

                $row = array_combine(self::IMPORT_HEADERS, array_map(
                    fn ($value) => trim((string) $value),
                    $columns,
                ));
                $validator = Validator::make($row, [
                    'student_number' => ['required', 'string', 'max:50'],
                    'name' => ['required', 'string', 'max:255'],
                    'program' => ['required', Rule::in(self::PROGRAMS)],
                    'grade_level' => ['required', Rule::in(self::YEAR_LEVELS)],
                    'section' => ['required', Rule::in(self::SECTIONS)],
                ]);

                if ($validator->fails()) {
                    foreach ($validator->errors()->all() as $error) {
                        $this->addImportRowError($rowErrors, "Row {$lineNumber}: {$error}");
                    }

                    continue;
                }

                $studentNumber = $row['student_number'];
                if (isset($seenStudentNumbers[$studentNumber])) {
                    $this->addImportRowError($rowErrors, "Row {$lineNumber}: student ID {$studentNumber} appears more than once in the file.");

                    continue;
                }

                $seenStudentNumbers[$studentNumber] = true;
                $rows[] = $row;
            }

            if ($rows === [] && $rowErrors === []) {
                throw ValidationException::withMessages(['file' => 'The CSV file has no student rows to import.']);
            }
        } finally {
            fclose($stream);
        }

        if ($rowErrors !== []) {
            return redirect()->route('students.index')
                ->withErrors(['file' => 'Fix the listed row errors and upload the CSV again.'])
                ->with('import_rows', $rowErrors);
        }

        $existingNumbers = Student::query()
            ->whereIn('student_number', array_column($rows, 'student_number'))
            ->pluck('student_number')
            ->all();
        $existingNumbers = array_fill_keys($existingNumbers, true);
        $newStudents = array_values(array_filter(
            $rows,
            fn ($row) => ! isset($existingNumbers[$row['student_number']]),
        ));

        DB::transaction(function () use ($newStudents, $request): void {
            foreach ($newStudents as $student) {
                if (! $request->user()->isAdmin()) {
                    $student['created_by'] = $request->user()->id;
                }

                Student::create($student);
            }
        });

        $skipped = count($rows) - count($newStudents);
        $message = count($newStudents).' student'.(count($newStudents) === 1 ? '' : 's').' imported successfully.';
        if ($skipped > 0) {
            $message .= " {$skipped} existing student ID".($skipped === 1 ? ' was' : 's were').' skipped.';
        }

        return redirect()->route('students.index')->with('success', $message);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_number' => ['required', 'string', 'max:50', 'unique:students,student_number'],
            'name' => ['required', 'string', 'max:255'],
            'grade_level' => ['required', Rule::in(self::YEAR_LEVELS)],
            'section' => ['required', Rule::in(self::SECTIONS)],
            'program' => ['required', Rule::in(self::PROGRAMS)],
        ]);

        if (! $request->user()->isAdmin()) {
            $validated['created_by'] = $request->user()->id;
        }

        Student::create($validated);

        return redirect()->route('students.index')->with('success', 'Student added successfully.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $this->authorizeStudent($request, $student);
        $validated = $request->validate([
            'student_number' => ['required', 'string', 'max:50', 'unique:students,student_number,'.$student->id],
            'name' => ['required', 'string', 'max:255'],
            'grade_level' => ['required', Rule::in(self::YEAR_LEVELS)],
            'section' => ['required', Rule::in(self::SECTIONS)],
            'program' => ['required', Rule::in(self::PROGRAMS)],
        ]);

        $student->update($validated);

        return redirect()->route('students.index')->with('success', 'Student updated successfully.');
    }

    public function destroy(Request $request, Student $student): RedirectResponse
    {
        $this->authorizeStudent($request, $student);

        if (! $request->user()->isAdmin() && $student->courses()
            ->where(fn ($query) => $query->whereNull('instructor_user_id')
                ->orWhere('instructor_user_id', '!=', $request->user()->id))
            ->exists()) {
            abort(403, 'This student is enrolled in another instructor’s course and cannot be removed.');
        }

        $student->delete();

        return redirect()->route('students.index')->with('success', 'Student removed successfully.');
    }

    private function studentsVisibleTo(Request $request): Builder
    {
        return Student::query()->when(! $request->user()->isAdmin(), fn ($query) => $query
            ->where(function ($query) use ($request): void {
                $query->where('created_by', $request->user()->id)
                    ->orWhereHas('courses', fn ($courses) => $courses
                        ->where('instructor_user_id', $request->user()->id));
            }));
    }

    private function authorizeStudent(Request $request, Student $student): void
    {
        abort_unless($request->user()->isAdmin() || $this->studentsVisibleTo($request)
            ->whereKey($student->id)
            ->exists(), 404);
    }

    private function addImportRowError(array &$errors, string $message): void
    {
        if (count($errors) < 50) {
            $errors[] = $message;
        } elseif (count($errors) === 50) {
            $errors[] = 'Additional row errors were omitted.';
        }
    }
}
