import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
const programs = ['BSIT', 'BEEd', 'BSCrim', 'BSAB', 'BSHM', 'BSED'];
const selectClassName = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

const emptyStudent = {
    student_number: '',
    name: '',
    grade_level: '',
    section: '',
    program: '',
};

export default function Index({ students }) {
    const [editingId, setEditingId] = useState(null);
    const { flash } = usePage().props;
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyStudent);
    const importForm = useForm({ file: null });

    function submit(e) {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setEditingId(null);
                reset();
            },
        };

        if (editingId) {
            put(route('students.update', editingId), options);
        } else {
            post(route('students.store'), options);
        }
    }

    function edit(student) {
        setEditingId(student.id);
        setData({
            student_number: student.student_number,
            name: student.name,
            grade_level: student.grade_level,
            section: student.section,
            program: student.program ?? '',
        });
    }

    function cancelEdit() {
        setEditingId(null);
        reset();
    }

    function importStudents(e) {
        e.preventDefault();
        importForm.post(route('students.import'), {
            forceFormData: true,
            onSuccess: () => importForm.reset(),
        });
    }

    function remove(student) {
        if (window.confirm(`Remove ${student.name} from the roster? Their attendance history will also be deleted.`)) {
            router.delete(route('students.destroy', student.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Students</h2>}
        >
            <Head title="Students" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Student roster</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Add and manage students who should appear on attendance sheets.</p>
                    </div>

                    {flash?.success && (
                        <div role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            {flash.success}
                        </div>
                    )}

                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Import students from CSV</h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Upload up to 500 students at once. Existing student IDs are skipped.
                                </p>
                                <a
                                    href={route('students.import-template')}
                                    className="mt-2 inline-flex text-sm font-medium text-green-700 underline decoration-green-300 underline-offset-4 hover:text-green-600 dark:text-green-400"
                                >
                                    Download CSV template
                                </a>
                            </div>
                            <form onSubmit={importStudents} className="flex flex-wrap items-end gap-3">
                                <div>
                                    <InputLabel htmlFor="student-csv" value="Roster CSV file" />
                                    <input
                                        id="student-csv"
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={(e) => importForm.setData('file', e.target.files[0] ?? null)}
                                        className="mt-1 block w-full max-w-sm text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:font-medium file:text-green-800 hover:file:bg-green-100 dark:text-gray-300 dark:file:bg-green-900/40 dark:file:text-green-300"
                                        required
                                    />
                                    <InputError message={importForm.errors.file} className="mt-2" />
                                </div>
                                <button
                                    type="submit"
                                    disabled={importForm.processing || !importForm.data.file}
                                    className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {importForm.processing ? 'Importing…' : 'Import roster'}
                                </button>
                            </form>
                        </div>
                        {flash?.importRows?.length > 0 && (
                            <ul className="mt-4 space-y-1 rounded-lg bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-900/20 dark:text-rose-300">
                                {flash.importRows.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}
                            </ul>
                        )}
                    </section>

                    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit student' : 'Add a student'}</h2>
                            {editingId && <button type="button" onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <InputLabel htmlFor="student_number" value="Student ID" />
                                <TextInput id="student_number" value={data.student_number} onChange={(e) => setData('student_number', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.student_number} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="name" value="Full name" />
                                <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="grade_level" value="Year level" />
                                <select id="grade_level" value={data.grade_level} onChange={(e) => setData('grade_level', e.target.value)} className={selectClassName} required>
                                    <option value="">Select year level</option>
                                    {yearLevels.map((yearLevel) => <option key={yearLevel} value={yearLevel}>{yearLevel}</option>)}
                                </select>
                                <InputError message={errors.grade_level} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="section" value="Section" />
                                <select id="section" value={data.section} onChange={(e) => setData('section', e.target.value)} className={selectClassName} required>
                                    <option value="">Select section</option>
                                    {sections.map((section) => <option key={section} value={section}>{section}</option>)}
                                </select>
                                <InputError message={errors.section} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="program" value="Course / program" />
                                <select id="program" value={data.program} onChange={(e) => setData('program', e.target.value)} className={selectClassName} required>
                                    <option value="">Select course / program</option>
                                    {programs.map((program) => <option key={program} value={program}>{program}</option>)}
                                </select>
                                <InputError message={errors.program} className="mt-2" />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button type="submit" disabled={processing} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
                                {processing ? 'Saving…' : editingId ? 'Save changes' : 'Add student'}
                            </button>
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">All students <span className="ml-1 text-sm font-normal text-gray-500">({students.length})</span></h2>
                        </div>
                        {students.length === 0 ? (
                            <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No students yet. Use the form above to get started.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            {['Student ID', 'Name', 'Course / program', 'Year level', 'Section', 'Actions'].map((heading) => (
                                                <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{heading}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {students.map((student) => (
                                            <tr key={student.id}>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{student.student_number}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.name}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.program || '—'}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.grade_level}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{student.section}</td>
                                                <td className="whitespace-nowrap px-5 py-4 text-sm">
                                                    <button type="button" onClick={() => edit(student)} className="font-medium text-green-600 hover:text-green-500 dark:text-green-400">Edit</button>
                                                    <button type="button" onClick={() => remove(student)} className="ml-4 font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400">Remove</button>
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
