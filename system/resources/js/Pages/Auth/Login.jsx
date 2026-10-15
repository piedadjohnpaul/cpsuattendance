import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout variant="login">
            <Head title="Log in" />

            {status && (
                <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {status}
                </div>
            )}

            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-600">Welcome back</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.1rem]">Sign in to your class</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Pick up right where you left off. Your college classes are waiting.</p>
            </div>

            <form onSubmit={submit}>
                <div className="space-y-2">
                    <InputLabel htmlFor="email" value="Email address" className="font-medium text-slate-700" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-green-600 focus:ring-yellow-400"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@school.edu"
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-5 space-y-2">
                    <InputLabel htmlFor="password" value="Password" className="font-medium text-slate-700" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full rounded-xl border-slate-200 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-green-600 focus:ring-yellow-400"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="rounded border-slate-300 text-green-600 shadow-sm focus:ring-green-500"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-slate-600">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-green-600 transition hover:text-green-500"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="mt-8">
                    <PrimaryButton
                        className="flex w-full justify-center rounded-xl bg-green-800 py-3 text-sm font-semibold normal-case tracking-normal shadow-lg shadow-green-900/20 transition hover:bg-green-700 focus:bg-green-900 active:bg-green-900"
                        disabled={processing}
                    >
                        {processing ? 'Signing in…' : 'Sign in'}
                    </PrimaryButton>
                </div>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                Secure access for college instructors and staff.
            </p>
        </GuestLayout>
    );
}
