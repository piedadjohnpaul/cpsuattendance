import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRef } from 'react';

function MetricCard({ label, value, caption, icon, color }) {
    return (
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-gray-400">{caption}</p>
        </div>
    );
}

function MetricIcon({ children }) {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {children}
        </svg>
    );
}

function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export default function Dashboard({
    studentCount,
    courseCount,
    todayPresent,
    todayAbsent,
    todayLate,
    todayExcused,
    recentAttendance,
    attendanceAlerts,
    alertThreshold,
}) {
    const user = usePage().props.auth.user;
    const today = new Date();
    const dateLabel = today.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const markedCount = todayPresent + todayAbsent + todayLate + todayExcused;
    const countedForRate = todayPresent + todayAbsent + todayLate;
    const attendanceRate = markedCount > 0
        ? Math.round(((todayPresent + todayLate) / (countedForRate || 1)) * 100)
        : 0;
    const heroRef = useRef(null);

    function moveCampusBackground(event) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
        const background = heroRef.current;

        if (background) {
            background.style.setProperty('--pointer-x', `${pointerX * -18}px`);
            background.style.setProperty('--pointer-y', `${pointerY * -12}px`);
        }
    }

    function resetCampusBackground() {
        heroRef.current?.style.setProperty('--pointer-x', '0px');
        heroRef.current?.style.setProperty('--pointer-y', '0px');
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">Overview</span>
                    <span className="text-slate-300 dark:text-gray-600">/</span>
                    <span className="text-slate-500 dark:text-gray-400">Dashboard</span>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-7 px-4 sm:px-6 lg:px-8">
                    <section
                        className="relative isolate overflow-hidden rounded-3xl bg-[#12351d] px-6 py-8 text-white shadow-xl shadow-green-950/10 sm:px-9 sm:py-10"
                        onPointerMove={moveCampusBackground}
                        onPointerLeave={resetCampusBackground}
                    >
                        <div
                            ref={heroRef}
                            aria-hidden="true"
                            className="absolute -inset-3 bg-cover bg-center transition-[background-position] duration-200 ease-out motion-reduce:transition-none"
                            style={{
                                backgroundImage: "url('/images/cpsu-campus.png')",
                                backgroundPosition: 'calc(50% + var(--pointer-x, 0px)) calc(50% + var(--pointer-y, 0px))',
                            }}
                        />
                        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#092012]/90 via-[#0b2c19]/75 to-[#0b2c19]/45" />
                        <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
                        <div className="relative flex flex-wrap items-end justify-between gap-6">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-yellow-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                                    {dateLabel}
                                </div>
                                <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Good day, {user.name.split(' ')[0]}.
                                </h1>
                                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                                    Here’s what’s happening in your college classes. Let’s make today count.
                                </p>
                            </div>
                            <Link
                                href={route('attendance.index')}
                                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#fff200] px-5 py-3 text-sm font-semibold text-[#17391f] shadow-lg shadow-black/10 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:ring-offset-2 focus:ring-offset-[#12351d]"
                            >
                                <svg className="h-4 w-4 text-green-800 transition group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Take attendance
                            </Link>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <MetricCard
                            label="Students"
                            value={studentCount}
                            caption="Students in your roster"
                            color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                            icon={<MetricIcon><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></MetricIcon>}
                        />
                        <MetricCard
                            label="Courses"
                            value={courseCount}
                            caption="Courses available for attendance"
                            color="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            icon={<MetricIcon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8m-8 4h8" /></MetricIcon>}
                        />
                        <MetricCard
                            label="Present today"
                            value={todayPresent}
                            caption={markedCount ? `${todayPresent + todayLate} present or late` : 'No attendance marked yet'}
                            color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                            icon={<MetricIcon><path d="m5 12 4 4L19 6" /></MetricIcon>}
                        />
                        <MetricCard
                            label="Absent today"
                            value={todayAbsent}
                            caption="Students marked absent"
                            color="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300"
                            icon={<MetricIcon><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></MetricIcon>}
                        />
                        <MetricCard
                            label="Late today"
                            value={todayLate}
                            caption="Students marked late"
                            color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                            icon={<MetricIcon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></MetricIcon>}
                        />
                        <MetricCard
                            label="Excused today"
                            value={todayExcused}
                            caption="Excused absences"
                            color="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            icon={<MetricIcon><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></MetricIcon>}
                        />
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Attendance rate</p>
                                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{countedForRate ? `${attendanceRate}%` : '—'}</p>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
                                    <MetricIcon><path d="M3 3v18h18M18 17V9m-5 8V5m-5 12v-4" /></MetricIcon>
                                </div>
                            </div>
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-gray-700">
                                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${attendanceRate}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">{markedCount ? `${todayPresent + todayLate} present or late · ${todayExcused} excused` : 'Mark attendance to see your rate'}</p>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-900/60 dark:bg-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Attendance alerts</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Students below the {alertThreshold}% attendance threshold. Present and late count as attended; excused sessions are excluded.</p>
                            </div>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200">{attendanceAlerts.length} flagged</span>
                        </div>
                        {attendanceAlerts.length === 0 ? (
                            <p className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No students are currently below the attendance threshold.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            {['Student', 'Course', 'Attendance rate', 'Sessions'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{heading}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {attendanceAlerts.map((alert) => (
                                            <tr key={`${alert.course_id}-${alert.student_id}`}>
                                                <td className="px-5 py-3.5">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{alert.name}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{alert.student_number} · {alert.grade_level} · {alert.section}</p>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{alert.course_code} · {alert.course_name}</td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-amber-800 dark:text-amber-300">{alert.attendance_rate}%</td>
                                                <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{alert.present + alert.late} attended · {alert.absent} absent · {alert.excused} excused</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-gray-700 sm:px-7">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-semibold text-slate-900 dark:text-gray-100">Recent attendance</h2>
                                    {recentAttendance.length > 0 && (
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-gray-700 dark:text-gray-300">{recentAttendance.length}</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">The latest attendance updates from your college classes</p>
                            </div>
                            <Link href={route('courses.index')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 transition hover:text-green-500 dark:text-green-400">
                                Manage courses
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M5 12h14m-7-7 7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        {recentAttendance.length === 0 ? (
                            <div className="px-5 py-14 text-center sm:py-16">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                                    <MetricIcon><path d="M7.5 3.75v3m9-3v3m-12 2.5h15M6 5.25h12A1.5 1.5 0 0 1 19.5 6.75v11.5A1.5 1.5 0 0 1 18 19.75H6a1.5 1.5 0 0 1-1.5-1.5V6.75A1.5 1.5 0 0 1 6 5.25Z" /><path d="m8 14 2 2 5-5" /></MetricIcon>
                                </div>
                                <p className="mt-4 font-semibold text-slate-900 dark:text-gray-100">Your college classes start here</p>
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-gray-400">Add courses, enroll college students, then record lecture attendance. Your latest updates will show up here.</p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    <Link href={route('courses.index')} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500">Manage courses</Link>
                                    {courseCount > 0 && <Link href={route('students.index')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Add students</Link>}
                                    {studentCount > 0 && <Link href={route('attendance.index')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Take attendance</Link>}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100 dark:divide-gray-700">
                                    <thead className="bg-slate-50/80 dark:bg-gray-900/30">
                                        <tr>
                                            {['Student', 'Student ID', 'Course', 'Date', 'Status'].map((heading) => (
                                                <th key={heading} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:px-7">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                                        {recentAttendance.map((record) => (
                                            <tr key={record.id} className="transition hover:bg-slate-50/70 dark:hover:bg-gray-700/30">
                                                <td className="whitespace-nowrap px-5 py-3.5 sm:px-7">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">{initials(record.student.name)}</div>
                                                        <span className="text-sm font-medium text-slate-800 dark:text-gray-100">{record.student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500 dark:text-gray-300 sm:px-7">{record.student.student_number}</td>
                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500 dark:text-gray-300 sm:px-7">{record.course ? `${record.course.course_code} · ${record.course.course_name}` : 'Unassigned'}</td>
                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-500 dark:text-gray-300 sm:px-7">{record.date}</td>
                                                <td className="whitespace-nowrap px-5 py-3.5 sm:px-7">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${{
                                                        present: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                                                        absent: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                                                        late: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                                        excused: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                                                    }[record.status]}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${{
                                                            present: 'bg-emerald-500',
                                                            absent: 'bg-rose-500',
                                                            late: 'bg-amber-500',
                                                            excused: 'bg-green-700',
                                                        }[record.status]}`} />
                                                        {record.status}
                                                    </span>
                                                </td>
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
