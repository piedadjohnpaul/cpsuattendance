import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const statuses = [
    { key: 'present', label: 'Present', color: 'text-emerald-700 dark:text-emerald-400' },
    { key: 'absent', label: 'Absent', color: 'text-rose-700 dark:text-rose-400' },
    { key: 'late', label: 'Late', color: 'text-amber-700 dark:text-amber-400' },
    { key: 'excused', label: 'Excused', color: 'text-green-800 dark:text-green-300' },
];

export default function Reports({ courses, classes, filters, summary, students }) {
    const { errors } = usePage().props;
    const [filterData, setFilterData] = useState(filters);
    const selectedClass = filterData.grade_level
        ? JSON.stringify({
            grade_level: filterData.grade_level,
            section: filterData.section,
        })
        : '';
    const exportUrl = route('attendance.reports.export', {
        from_date: filters.from_date,
        to_date: filters.to_date,
        ...(filters.course_id ? { course_id: filters.course_id } : {}),
        ...(filters.grade_level ? {
            grade_level: filters.grade_level,
            section: filters.section,
        } : {}),
    });

    function submitFilters(e) {
        e.preventDefault();
        router.get(route('attendance.reports'), {
            from_date: filterData.from_date,
            to_date: filterData.to_date,
            ...(filterData.course_id ? { course_id: filterData.course_id } : {}),
            ...(filterData.grade_level ? {
                grade_level: filterData.grade_level,
                section: filterData.section,
            } : {}),
        }, { preserveState: true, preserveScroll: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <Link href={route('dashboard')} className="text-slate-500 hover:text-green-800 dark:text-gray-400 dark:hover:text-green-300">Overview</Link>
                    <span className="text-slate-300 dark:text-gray-600">/</span>
                    <span className="font-semibold text-slate-900 dark:text-gray-100">Reports</span>
                </div>
            }
        >
            <Head title="Attendance reports" />
            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-green-800 dark:text-green-400">Attendance insights</p>
                            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">Course reports</h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Review attendance by college course, year level, section, and date range.</p>
                        </div>
                        <a
                            href={exportUrl}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3" />
                            </svg>
                            Export CSV
                        </a>
                    </div>

                    <form onSubmit={submitFilters} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label htmlFor="report-from" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
                                <input id="report-from" type="date" value={filterData.from_date} onChange={(e) => setFilterData({ ...filterData, from_date: e.target.value })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                                {errors.from_date && <p className="mt-1 text-xs text-rose-600">{errors.from_date}</p>}
                            </div>
                            <div>
                                <label htmlFor="report-to" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
                                <input id="report-to" type="date" value={filterData.to_date} onChange={(e) => setFilterData({ ...filterData, to_date: e.target.value })} className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label htmlFor="report-course" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                                <select
                                    id="report-course"
                                    value={filterData.course_id}
                                    onChange={(e) => setFilterData({ ...filterData, course_id: e.target.value })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    <option value="">All courses</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.course_code} · {course.course_name} · {course.semester}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="report-class" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Year level / section</label>
                                <select
                                    id="report-class"
                                    value={selectedClass}
                                    onChange={(e) => setFilterData({
                                        ...filterData,
                                        ...(e.target.value
                                            ? JSON.parse(e.target.value)
                                            : { grade_level: '', section: '' }),
                                    })}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    <option value="">All year levels and sections</option>
                                    {classes.map((classroom) => {
                                        const value = JSON.stringify(classroom);

                                        return <option key={value} value={value}>{classroom.grade_level} · {classroom.section}</option>;
                                    })}
                                </select>
                                {errors.section && <p className="mt-1 text-xs text-rose-600">{errors.section}</p>}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="submit" className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700">Apply filters</button>
                        </div>
                    </form>

                    <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                        {[
                            { label: 'Students', value: summary.students, color: 'text-slate-900 dark:text-white' },
                            { label: 'Records', value: summary.records, color: 'text-slate-900 dark:text-white' },
                            ...statuses.map(({ key, label, color }) => ({ label, value: summary[key], color })),
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                                <p className={`mt-2 text-2xl font-semibold ${item.color}`}>{item.value}</p>
                            </div>
                        ))}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Per-student attendance</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {filters.from_date} through {filters.to_date}
                                {filters.course_id && ` · ${courses.find((course) => String(course.id) === String(filters.course_id))?.course_code ?? ''}`}
                                {filters.grade_level && ` · ${filters.grade_level} · ${filters.section}`}
                            </p>
                        </div>
                        {students.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="font-medium text-gray-900 dark:text-gray-100">No attendance records for these filters</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a different date range or class.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            {['Course', 'Student ID', 'Student', 'Year / Section', 'Days', 'Present', 'Absent', 'Late', 'Excused'].map((heading) => (
                                                <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {students.map((student) => (
                                            <tr key={`${student.course_id ?? 'legacy'}-${student.student_id}`}>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300">{student.course_code}<span className="block text-xs font-normal text-gray-500">{student.course_name}</span></td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100">{student.student_number}</td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">{student.name}</td>
                                                <td className="whitespace-nowrap px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">{student.grade_level} · {student.section}</td>
                                                <td className="px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{student.days_recorded}</td>
                                                {statuses.map(({ key, color }) => (
                                                    <td key={key} className={`px-4 py-3.5 text-sm font-medium ${color}`}>{student[key]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
