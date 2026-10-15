import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const statusStyles = {
    present: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    absent: 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    late: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    excused: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export default function Portal({ student, alertThreshold }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">My attendance</h2>}>
            <Head title="My attendance" />
            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-400">Student portal</p>
                        <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">My attendance</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Review your course enrollment and attendance history.</p>
                    </div>
                    {!student ? (
                        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                            <h2 className="font-semibold">Your account is not linked to a student record yet.</h2>
                            <p className="mt-1 text-sm">Please contact the college office to link your account to your student roster record.</p>
                        </section>
                    ) : (
                        <>
                            <section className="rounded-2xl bg-[#12351d] p-6 text-white shadow-lg sm:p-8">
                                <p className="text-sm font-semibold text-yellow-300">{student.student_number}</p>
                                <h2 className="mt-2 text-2xl font-semibold">{student.name}</h2>
                                <p className="mt-1 text-sm text-green-100">{student.program && `${student.program} · `}{student.grade_level} · Section {student.section}</p>
                            </section>
                            {student.courses.length === 0 ? (
                                <section className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-800">
                                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">No courses enrolled</h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your course enrollments will appear here when they are set up by the college office.</p>
                                </section>
                            ) : student.courses.map((course) => (
                                <section key={course.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                                        <p className="text-xs font-semibold text-green-800 dark:text-green-400">{course.course_code} · {course.semester}</p>
                                        <h2 className="mt-1 font-semibold text-gray-900 dark:text-gray-100">{course.course_name}</h2>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.attendance.length} sessions recorded</p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.below_threshold ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                                                {course.attendance_rate === null ? 'Rate unavailable' : `${course.attendance_rate}% attendance`}
                                            </span>
                                            {course.below_threshold && <span role="status" className="text-xs font-medium text-amber-800 dark:text-amber-300">Your attendance is below the {alertThreshold}% threshold. Please contact your instructor.</span>}
                                        </div>
                                    </div>
                                    {course.attendance.length === 0 ? (
                                        <p className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No attendance sessions recorded yet.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-900/40">
                                                    <tr>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Session date</th>
                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {course.attendance.map((record) => (
                                                        <tr key={`${record.date}-${record.status}`}>
                                                            <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{record.date}</td>
                                                            <td className="px-5 py-3.5">
                                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[record.status] ?? ''}`}>{record.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
