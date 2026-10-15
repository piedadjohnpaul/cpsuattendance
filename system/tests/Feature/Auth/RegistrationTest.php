<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'instructor',
        ]);
    }

    public function test_public_registrations_receive_instructor_access_without_admin_approval(): void
    {
        User::factory()->create(['role' => 'admin']);

        $this->post('/register', [
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'student@example.com',
            'role' => 'instructor',
        ]);
    }

    public function test_existing_account_can_be_promoted_to_admin_from_the_server_command(): void
    {
        $user = User::factory()->create(['role' => 'instructor']);

        $this->artisan('app:make-admin', ['email' => $user->email])
            ->expectsOutput("{$user->email} is now an administrator.")
            ->assertExitCode(0);

        $this->assertSame('admin', $user->fresh()->role);
    }
}
