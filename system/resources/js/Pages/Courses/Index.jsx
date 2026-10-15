import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyCourse = {
    course_code: '',
    course_name: '',
    instructor: '',
    instructor_user_id: '',
    semester: '',
    meeting_schedule: '',
    room: '',
};

export default function Index({ courses, instructors, canManage }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyCourse);

    function submit(e) {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        };

        if (editingId) {
            put(route('courses.update', editingId), options);
        } else {
            post(route('courses.store'), options);
        }
    }

    function edit(course) {
        setEditingId(course.id);
        setData({
            course_code: course.course_code,
            course_name: course.course_name,
            instructor: course.instructor,
            instructor_user_id: course.instructor_user_id ? String(course.instructor_user_id) : '',
            semester: course.semester,
            meeting_schedule: course.meeting_schedule,
            room: course.room ?? '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        reset();
    }

    function remove(course) {
        if (window.confirm(`Delete ${course.course_code} — ${course.course_name}? Its course attendance records will also be deleted.`)) {
            router.delete(route('courses.destroy', course.id));
        }
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Courses</h2>}>
            <Head title="Courses" />
            <div className="min-h-[calc(100vh-64px)] bg-[#f7faf5] py-8 dark:bg-gray-900 sm:py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-400">College course setup</p>
                        <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">Courses</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Set up courses, then enroll students to take attendance by course session.</p>
                    </div>

                    {flash?.success && <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">{flash.success}</div>}

                    {canManage && <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit course' : 'Add a course'}</h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Course code is unique within each semester.</p>
                            </div>
                            {editingId && <button type="button" onClick={cancelEdit} className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <InputLabel htmlFor="course_code" value="Course code" />
                                <TextInput id="course_code" value={data.course_code} onChange={(e) => setData('course_code', e.target.value)} className="mt-1 block w-full" placeholder="e.g. CS 101" required />
                                <InputError message={errors.course_code} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="course_name" value="Course name" />
                                <TextInput id="course_name" value={data.course_name} onChange={(e) => setData('course_name', e.target.value)} className="mt-1 block w-full" placeholder="e.g. Introduction to Computing" required />
                                <InputError message={errors.course_name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="instructor" value="Instructor" />
                                <TextInput id="instructor" value={data.instructor} onChange={(e) => setData('instructor', e.target.value)} className="mt-1 block w-full" placeholder="Instructor name" required />
                                <InputError message={errors.instructor} className="mt-2" />
                            </div>
                            {instructors.length > 0 && <div>
                                <InputLabel htmlFor="instructor_user_id" value="Instructor account (optional)" />
                                <select
                                    id="instructor_user_id"
                                    value={data.instructor_user_id}
                                    onChange={(e) => {
                                        const instructor = instructors.find((account) => String(account.id) === e.target.value);
                                        setData({
                                            ...data,
                                            instructor_user_id: e.target.value,
                                            ...(instructor ? { instructor: instructor.name } : {}),
                                        });
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                                >
                                    <option value="">No account assigned</option>
                                    {instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name} · {instructor.email}</option>)}
                                </select>
                                <InputError message={errors.instructor_user_id} className="mt-2" />
                            </div>}
                            <div>
                                <InputLabel htmlFor="semester" value="Semester / term" />
                                <TextInput id="semester" value={data.semester} onChange={(e) => setData('semester', e.target.value)} className="mt-1 block w-full" placeholder="e.g. 1st Semester 2026–2027" required />
                                <InputError message={errors.semester} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="meeting_schedule" value="Meeting schedule" />
                                <TextInput id="meeting_schedule" value={data.meeting_schedule} onChange={(e) => setData('meeting_schedule', e.target.value)} className="mt-1 block w-full" placeholder="e.g. Mon / Wed, 9:00–10:30 AM" required />
                                <InputError message={errors.meeting_schedule} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="room" value="Room (optional)" />
                                <TextInput id="room" value={data.room} onChange={(e) => setData('room', e.target.value)} className="mt-1 block w-full" placeholder="e.g. Lab 2" />
                                <InputError message={errors.room} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button type="submit" disabled={processing} className="rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50">
                                {processing ? 'Saving…' : editingId ? 'Save changes' : 'Create course'}
                            </button>
                        </div>
                    </form>}

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Course catalog <span className="ml-1 text-sm font-normal text-gray-500">({courses.length})</span></h2>
                        </div>
                        {courses.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <p className="font-medium text-gray-900 dark:text-gray-100">No courses yet</p>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a course above to start enrolling students.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            {['Course', 'Instructor', 'Semester', 'Schedule / room', 'Students', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{heading}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {courses.map((course) => (
                                            <tr key={course.id}>
                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{course.course_code}</p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{course.course_name}</p>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{course.instructor}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{course.semester}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {course.meeting_schedule}
                                                    {course.room && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{course.room}</p>}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{course.students_count}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                    <Link href={route('courses.show', course.id)} className="font-medium text-green-800 hover:text-green-700 dark:text-green-400">{canManage ? 'Enroll' : 'Open'}</Link>
                                                    <Link href={route('attendance.index', { course_id: course.id })} className="ml-3 font-medium text-green-800 hover:text-green-700 dark:text-green-400">Attendance</Link>
                                                    {canManage && <>
                                                        <button type="button" onClick={() => edit(course)} className="ml-3 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Edit</button>
                                                        <button type="button" onClick={() => remove(course)} className="ml-3 font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400">Delete</button>
                                                    </>}
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
