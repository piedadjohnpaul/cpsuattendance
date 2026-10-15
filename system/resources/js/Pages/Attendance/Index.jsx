import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const statuses = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'excused', label: 'Excused' },
];

export default function Index({ students, date, courses, selectedCourse }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        date,
        course_id: selectedCourse?.id ?? '',
        records: students.map((student) => ({
            student_id: student.id,
            status: student.status ?? '',
        })),
    });
    const selectedCourseValue = selectedCourse ? String(selectedCourse.id) : '';

    function changeFilters({ nextDate = date, nextCourseId = selectedCourse?.id }) {
        router.get(
            route('attendance.index'),
            {
                date: nextDate,
                ...(nextCourseId ? { course_id: nextCourseId } : {}),
            },
            { preserveState: false, preserveScroll: true },
        );
    }

    function setStatus(index, status) {
        const records = [...data.records];
        records[index] = { ...records[index], status };
        setData('records', records);
    }

    function markAll(status) {
        setData('records', data.records.map((record) => ({ ...record, status })));
    }

    function submit(e) {
        e.preventDefault();
        post(route('attendance.store'));
    }

    const statusCounts = Object.fromEntries(
        statuses.map(({ value }) => [
            value,
            data.records.filter((record) => record.status === value).length,
        ]),
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Course attendance</h2>}
        >
            <Head title="Course attendance" />
            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-green-800 dark:text-green-400">College course session</p>
                            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">Take attendance</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose a course and date to record attendance for its enrolled students.</p>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label htmlFor="attendance-course" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                                <select
                                    id="attendance-course"
                                    value={selectedCourseValue}
                                    onChange={(e) => changeFilters({ nextCourseId: e.target.value })}
                                    className="min-w-64 rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                    disabled={courses.length === 0}
                                >
                                    {courses.length === 0 && <option value="">No courses available</option>}
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.course_code} · {course.course_name} · {course.semester}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="attendance-date" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Session date</label>
                                <input
                                    id="attendance-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => e.target.value && changeFilters({ nextDate: e.target.value })}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {flash?.success && (
                        <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {flash.success}
                        </div>
                    )}

                    {courses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Set up a course first</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a college course and enroll students before recording attendance.</p>
                            <Link href={route('courses.index')} className="mt-4 inline-block rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Manage courses</Link>
                        </div>
                    ) : selectedCourse && students.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-800">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">No students enrolled in {selectedCourse.course_code}</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enroll students in this course before taking attendance.</p>
                            <Link href={route('courses.show', selectedCourse.id)} className="mt-4 inline-block rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Manage enrollment</Link>
                        </div>
                    ) : selectedCourse && (
                        <form onSubmit={submit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <input type="hidden" name="course_id" value={data.course_id} />
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                <div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedCourse.course_code} · {selectedCourse.course_name}</p>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{selectedCourse.semester}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{selectedCourse.instructor} · {selectedCourse.meeting_schedule}{selectedCourse.room ? ` · ${selectedCourse.room}` : ''}</p>
                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">{students.length} enrolled</span>
                                        {statuses.map(({ value, label }) => (
                                            <span key={value} className={
                                                value === 'present' ? 'text-emerald-700 dark:text-emerald-400'
                                                    : value === 'absent' ? 'text-rose-700 dark:text-rose-400'
                                                        : value === 'late' ? 'text-amber-700 dark:text-amber-400'
                                                            : 'text-green-800 dark:text-green-300'
                                            }>
                                                {statusCounts[value]} {label.toLowerCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => markAll(value)}
                                            className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-yellow-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                                        >
                                            Mark all {label.toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            {['Student ID', 'Student', 'Year / Section', 'Status'].map((heading) => (
                                                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {students.map((student, index) => (
                                            <tr key={student.id}>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{student.student_number}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.name}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.grade_level} · {student.section}</td>
                                                <td className="px-5 py-4">
                                                    <select
                                                        aria-label={`Attendance status for ${student.name}`}
                                                        value={data.records[index].status}
                                                        onChange={(e) => setStatus(index, e.target.value)}
                                                        className="rounded-md border-gray-300 text-sm shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                                    >
                                                        <option value="">Choose status</option>
                                                        {statuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                                                    </select>
                                                    <InputError message={errors[`records.${index}.status`]} className="mt-1" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {errors.records && <p className="px-5 pt-3 text-sm text-rose-600">{errors.records}</p>}
                            <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                                <button type="submit" disabled={processing} className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                                    {processing ? 'Saving…' : 'Save attendance'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
