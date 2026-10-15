<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## CPSU Attendease

This application is designed for college classes. College instructors and staff can add, edit, and remove students, organize the roster by program (BSIT, BEEd, BSCrim, BSAB, BSHM, or BSED), year level (1st through 4th), and section (A through F), or import up to 500 students from the CSV template on the **Students** page. CSV columns must be ordered as `student_number,name,program,grade_level,section`; invalid files are rejected without partial imports and existing student IDs are skipped. Instructors can create courses and enroll students in each course. Attendance is recorded for a selected course and date using present, absent, late, or excused statuses. The **Reports** page summarizes attendance by course and student for a selected date range, with optional course/year-level/section filters and CSV export.

The system has instructor and administrator roles. Public registration immediately creates an instructor account; teachers can sign up and start using the system without administrator approval, and signup never grants administrator privileges. Instructors can create their own courses and student rosters, enroll those students, take attendance, and review course reports. Their course and roster access is isolated from other instructors. Administrator accounts are provisioned only from the server command below. Attendance alerts flag students below 75% for each course, counting present and late as attended and excluding excused sessions from the rate.

To initialize an administrator on a fresh deployment, first register the intended administrator account, then run `php artisan app:make-admin admin@example.com` from the server terminal, replacing the email with that account's email. This command is server-side only; administrator privileges cannot be granted through public registration.

To run the application from PowerShell:

```powershell
cd C:\Users\john paul piedad\attendance\system
php artisan migrate
npm run build
php artisan serve
```

Open the URL printed by `php artisan serve` and register: the account can immediately create courses and student rosters, enroll students, and take attendance. Existing course records can be corrected by selecting the same course and date and saving attendance again. Attendance records created before course management was introduced remain available to administrators in reports as **Unassigned attendance**.

## Production deployment

The local `.env` is for development and is not ready to expose publicly. Configure the hosting provider's environment variables (do not commit production secrets or copy them into source control) before starting the application:

```dotenv
APP_NAME="CPSU Attendease"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-real-domain.example
APP_TIMEZONE=Asia/Manila

APP_KEY=<generate a unique key with php artisan key:generate>

DB_CONNECTION=mysql
DB_HOST=<database-host>
DB_PORT=3306
DB_DATABASE=<database-name>
DB_USERNAME=<database-user>
DB_PASSWORD=<strong-database-password>

SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
CACHE_STORE=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=<smtp-host>
MAIL_PORT=587
MAIL_USERNAME=<smtp-user>
MAIL_PASSWORD=<smtp-password>
MAIL_FROM_ADDRESS=<verified-sender-address>
MAIL_FROM_NAME="${APP_NAME}"
```

Use a real HTTPS domain, managed production database, and SMTP credentials from your hosting/email provider. Generate the application key once for the deployment and keep it stable; changing it later invalidates encrypted sessions. Set the web server document root to this project's `public` directory, enable HTTPS, and grant the web-server account write access to `storage` and `bootstrap/cache`. Enable automated database backups and verify that you can restore one before relying on the system for attendance records.

From the project directory on the server, install production dependencies and build assets:

```sh
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

Run `php artisan key:generate` only when creating the deployment's initial `APP_KEY`, then set its output securely in the hosting environment and rebuild the config cache with `php artisan optimize`. Register the intended administrator account, then run `php artisan app:make-admin admin@example.com` on the trusted server terminal. Confirm `/up` returns successfully, test registration/login and password-reset email delivery, and check that HTTPS cookies and the correct Manila date are used. Never run the development server (`php artisan serve`) as the public production web server.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
