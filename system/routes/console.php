<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('app:make-admin {email}', function (string $email): int {
    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error("No account found for {$email}.");

        return self::FAILURE;
    }

    $user->update(['role' => 'admin']);
    $this->info("{$user->email} is now an administrator.");

    return self::SUCCESS;
})->purpose('Promote an existing account to administrator');
