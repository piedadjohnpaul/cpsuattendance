import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

function BrandMark({ className = 'h-7 w-7' }) {
    return (
        <img
            src="/images/cpsu-logo.png"
            alt="Central Philippines State University"
            className={`${className} shrink-0 object-contain`}
        />
    );
}

function LoginShowcase() {
    return (
        <aside className="relative hidden min-h-[680px] overflow-hidden bg-[#f2f4f0] lg:block">
            <img
                src="/images/cpsu-campus.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 z-0 h-full w-full object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 z-10 bg-[#f2f4f0]/65" />
            <BrandMark
                className="absolute left-1/2 top-1/2 z-20 h-40 w-40 -translate-x-1/2 -translate-y-1/2 drop-shadow-md sm:h-44 sm:w-44"
            />
        </aside>
    );
}

export default function GuestLayout({ children, variant = 'default' }) {
    if (variant === 'login') {
        return (
            <div className="min-h-screen bg-[#f7faf5] text-slate-900">
                <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]">
                    <LoginShowcase />
                    <main className="flex min-h-screen flex-col">
                        <div className="flex items-center justify-between px-6 py-6 sm:px-10 lg:justify-end lg:px-12">
                            <Link href="/" className="inline-flex items-center gap-2.5 lg:hidden">
                                <BrandMark className="h-6 w-6" />
                                <span className="font-semibold tracking-tight">Classroom<span className="text-green-600">ly</span></span>
                            </Link>
                            <p className="text-sm text-slate-500">
                                New here?{' '}
                                <Link href={route('register')} className="font-semibold text-green-600 hover:text-green-500">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                        <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 sm:px-10 lg:px-12">
                            <div className="w-full max-w-[420px]">{children}</div>
                        </div>
                        <footer className="px-6 pb-6 text-center text-xs text-slate-400 sm:px-10 lg:px-12 lg:text-right">
                            Made for the people who make a difference.
                        </footer>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0 dark:bg-gray-900">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-800">
                {children}
            </div>
        </div>
    );
}
