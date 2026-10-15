<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropUnique('courses_course_code_semester_unique');
            $table->unique(
                ['instructor_user_id', 'course_code', 'semester'],
                'courses_owner_code_semester_unique',
            );
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropUnique('courses_owner_code_semester_unique');
            $table->unique(['course_code', 'semester']);
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
        });
    }
};
