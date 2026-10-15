import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Show({ course, students, canManage }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing } = useForm({
        student_ids: course.students.map((student) => student.id),
    });
    const enrolled = new Set(data.student_ids);

    function toggleStudent(studentId) {
        setData('student_ids', enrolled.has(studentId)
            ? data.student_ids.filter((id) => id !== studentId)
            : [...data.student_ids, studentId]);
    }

    function submit(e) {
        e.preventDefault();
        put(route('courses.students.update', course.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('courses.index')} className="text-gray-500 hover:text-green-800 dark:text-gray-400 dark:hover:text-green-300">Courses</Link>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{course.course_code}</span>
                </div>
            }
        >
            <Head title={`${course.course_code} enrollment`} />
            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-2xl bg-[#12351d] p-6 text-white shadow-lg sm:p-8">
                        <p className="text-sm font-semibold text-yellow-300">{course.course_code} · {course.semester}</p>
                        <h1 className="mt-2 text-2xl font-semibold">{course.course_name}</h1>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-green-100">
                            <span>Instructor: {course.instructor}</span>
                            <span>{course.meeting_schedule}</span>
                            {course.room && <span>{course.room}</span>}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href={route('attendance.index', { course_id: course.id })} className="rounded-lg bg-[#fff200] px-4 py-2.5 text-sm font-semibold text-green-950 transition hover:bg-yellow-300">Take attendance</Link>
                            <Link href={route('attendance.reports', { course_id: course.id })} className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Course report</Link>
                        </div>
                    </section>

                    {flash?.success && <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{flash.success}</div>}

                    {canManage ? <form onSubmit={submit} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Enrolled students</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select the students who attend this course. Attendance is recorded only for this enrollment list.</p>
                            </div>
                            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">{data.student_ids.length} enrolled</span>
                        </div>
                        {students.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add students to the roster before enrolling them in a course.</p>
                                <Link href={route('students.index')} className="mt-3 inline-flex rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Add students</Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {students.map((student) => (
                                    <label key={student.id} className="flex cursor-pointer items-center gap-4 px-5 py-3.5 transition hover:bg-green-50/60 dark:hover:bg-gray-700/30">
                                        <input
                                            type="checkbox"
                                            checked={enrolled.has(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="rounded border-gray-300 text-green-700 shadow-sm focus:ring-yellow-400"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</span>
                                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{student.student_number} · Year {student.grade_level} · {student.section}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-700">
                            <Link href={route('courses.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Back to courses</Link>
                            <button type="submit" disabled={processing} className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50">
                                {processing ? 'Saving…' : 'Save enrollment'}
                            </button>
                        </div>
                    </form> : (
                        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Enrolled students</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.students.length} students in this course roster.</p>
                            </div>
                            {course.students.length === 0 ? <p className="px-5 py-10 text-center text-sm text-gray-500">No students are enrolled in this course.</p> : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {course.students.map((student) => (
                                        <div key={student.id} className="px-5 py-3.5">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{student.student_number} · {student.grade_level} · {student.section}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
