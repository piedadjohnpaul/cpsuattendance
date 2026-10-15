import { Head, Link } from '@inertiajs/react';

function BrandMark({ className = 'h-10 w-10' }) {
    return (
        <img
            src="/images/cpsu-logo.png"
            alt="Central Philippines State University"
            className={`${className} shrink-0 object-contain`}
        />
    );
}

function DashboardPreview() {
    const bars = [42, 67, 54, 80, 61, 92, 73];

    return (
        <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-green-200/40 blur-3xl" />
            <div className="relative rotate-1 rounded-[1.75rem] border border-slate-200/80 bg-white p-3 shadow-2xl shadow-green-950/10 sm:p-4">
                <div className="overflow-hidden rounded-[1.25rem] border border-slate-100 bg-[#f7f8fc]">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2.5">
                            <BrandMark />
                            <div>
                                <p className="text-xs font-semibold text-slate-800 sm:text-sm">CPSU Attendease</p>
                                <p className="text-[10px] text-slate-400">College instructor dashboard</p>
                            </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">JS</div>
                    </div>
                    <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">MONDAY, OCTOBER 14</p>
                                <p className="mt-1 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">Good morning, Jamie</p>
                            </div>
                            <div className="rounded-lg bg-green-600 px-3 py-2 text-[10px] font-semibold text-white shadow-md shadow-green-600/20 sm:text-xs">+ Take attendance</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {[
                                { title: 'Students', value: '32', color: 'bg-green-50 text-green-600' },
                                { title: 'Present', value: '28', color: 'bg-emerald-50 text-emerald-600' },
                                { title: 'Absent', value: '4', color: 'bg-rose-50 text-rose-600' },
                            ].map((metric) => (
                                <div key={metric.title} className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4">
                                    <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">{metric.title}</p>
                                    <p className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{metric.value}</p>
                                    <div className={`mt-2 h-1 w-8 rounded-full ${metric.color.split(' ')[0]}`} />
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-semibold text-slate-700 sm:text-xs">Weekly attendance</p>
                                    <p className="text-[9px] text-slate-400">This week</p>
                                </div>
                                <div className="mt-3 flex h-16 items-end gap-2 sm:h-20 sm:gap-3">
                                    {bars.map((height, index) => (
                                        <div key={index} className="flex h-full flex-1 items-end">
                                            <div className={`w-full rounded-t-md ${index === 5 ? 'bg-green-500' : 'bg-green-100'}`} style={{ height: `${height}%` }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2 flex justify-between text-[8px] text-slate-400 sm:text-[9px]">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={index}>{day}</span>)}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4">
                                <p className="text-[10px] font-semibold text-slate-700 sm:text-xs">Recent activity</p>
                                <div className="mt-3 space-y-3">
                                    {[
                                        { initials: 'AM', name: 'Alex Morgan', state: 'Present', color: 'bg-emerald-50 text-emerald-700' },
                                        { initials: 'JL', name: 'Jordan Lee', state: 'Absent', color: 'bg-rose-50 text-rose-700' },
                                        { initials: 'SK', name: 'Sam Kim', state: 'Present', color: 'bg-emerald-50 text-emerald-700' },
                                    ].map((student) => (
                                        <div key={student.initials} className="flex items-center justify-between gap-1">
                                            <div className="flex min-w-0 items-center gap-1.5">
                                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-semibold text-slate-600">{student.initials}</div>
                                                <span className="truncate text-[8px] font-medium text-slate-600 sm:text-[9px]">{student.name}</span>
                                            </div>
                                            <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-semibold sm:text-[8px] ${student.color}`}>{student.state}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-800">Attendance saved</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">Your class is up to date</p>
                </div>
            </div>
        </div>
    );
}

function FeatureIcon({ children, color }) {
    return (
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {children}
            </svg>
        </div>
    );
}

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="CPSU Attendease" />
            <div className="min-h-screen overflow-hidden bg-white text-slate-900">
                <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <BrandMark />
                        <span className="text-lg font-semibold tracking-tight">CPSU <span className="text-green-600">Attendease</span></span>
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 sm:px-5">
                                Go to dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 sm:px-4">
                                    Log in
                                </Link>
                                <Link href={route('register')} className="rounded-xl bg-[#fff200] px-4 py-2.5 text-sm font-semibold text-green-950 shadow-sm transition hover:bg-yellow-300 sm:px-5">
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main>
                    <section className="relative isolate">
                        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(ellipse_at_74%_36%,rgba(220,252,231,0.75),transparent_47%),radial-gradient(ellipse_at_15%_70%,rgba(254,249,195,0.45),transparent_38%),linear-gradient(to_bottom,#fff,#fbfdf9)]" />
                        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-10 lg:pb-28 lg:pt-16">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50/80 px-3.5 py-2 text-xs font-semibold text-green-700">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff200] text-green-900">
                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m10 1.7 2.15 5.18 5.58.45-4.25 3.63 1.3 5.44L10 13.48l-4.78 2.92 1.3-5.44-4.25-3.63 5.58-.45L10 1.7Z" /></svg>
                                    </span>
                                    Built for college students and instructors
                                </div>
                                <h1 className="mt-7 text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[4.2rem]">
                                    College attendance
                                    <br />
                                    <span className="text-green-600">made simpler.</span>
                                </h1>
                                <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                                    Spend less time managing class lists and more time teaching. Keep your college student roster organized and every lecture accounted for.
                                </p>
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    {auth.user ? (
                                        <Link href={route('dashboard')} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:-translate-y-0.5 hover:bg-green-500">
                                            Open your dashboard
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                                        </Link>
                                    ) : (
                                        <>
                                            <Link href={route('register')} className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700">
                                                Get started for free
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                                            </Link>
                                            <Link href={route('login')} className="rounded-xl px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                                                I already have an account
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.13a1 1 0 0 1-1.42 0L3.29 8.91a1 1 0 1 1 1.42-1.41l4.22 4.24 6.36-6.44a1 1 0 0 1 1.414-.01Z" clipRule="evenodd" /></svg>
                                        Simple lecture check-ins
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.13a1 1 0 0 1-1.42 0L3.29 8.91a1 1 0 1 1 1.42-1.41l4.22 4.24 6.36-6.44a1 1 0 0 1 1.414-.01Z" clipRule="evenodd" /></svg>
                                        Your roster, all in one place
                                    </span>
                                </div>
                            </div>

                            <div className="px-2 py-3 sm:px-6 lg:px-0">
                                <DashboardPreview />
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-slate-100 bg-white">
                        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
                            <div className="mx-auto max-w-2xl text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">Made for college classes</p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">The essentials for campus, without the busywork.</h2>
                                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">A clear home for the everyday attendance tasks that keep college classes organized.</p>
                            </div>
                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                                    <FeatureIcon color="bg-green-100 text-green-700"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></FeatureIcon>
                                    <h3 className="mt-4 font-semibold text-slate-900">A tidy student roster</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">Keep college student names, IDs, year levels, and sections organized and easy to find.</p>
                                </article>
                                <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                                    <FeatureIcon color="bg-emerald-100 text-emerald-700"><path d="M7.5 3.75v3m9-3v3m-12 2.5h15M6 5.25h12A1.5 1.5 0 0 1 19.5 6.75v11.5A1.5 1.5 0 0 1 18 19.75H6a1.5 1.5 0 0 1-1.5-1.5V6.75A1.5 1.5 0 0 1 6 5.25Z" /><path d="m8 14 2 2 5-5" /></FeatureIcon>
                                    <h3 className="mt-4 font-semibold text-slate-900">Quick daily attendance</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">Mark students present, absent, late, or excused for each lecture day.</p>
                                </article>
                                <article className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                                    <FeatureIcon color="bg-amber-100 text-amber-700"><path d="M3 3v18h18M18 17V9m-5 8V5m-5 12v-4" /></FeatureIcon>
                                    <h3 className="mt-4 font-semibold text-slate-900">A helpful overview</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">See attendance totals and recent updates across your college classes.</p>
                                </article>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-slate-400 sm:px-8 lg:px-10">
                    <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-500">
                        <BrandMark />
                        <span>CPSU Attendease</span>
                    </Link>
                    <p>College attendance, organized. More time for teaching.</p>
                </footer>
            </div>
        </>
    );
}
