<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('courses')) {
            Schema::create('courses', function (Blueprint $table) {
                $table->id();
                $table->string('course_code');
                $table->string('course_name');
                $table->string('instructor');
                $table->string('semester');
                $table->string('meeting_schedule');
                $table->string('room')->nullable();
                $table->timestamps();
                $table->unique(['course_code', 'semester']);
            });
        }

        if (! Schema::hasTable('course_student')) {
            Schema::create('course_student', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained()->cascadeOnDelete();
                $table->foreignId('student_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['course_id', 'student_id']);
            });
        }

        if (! Schema::hasColumn('attendances', 'course_id')) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->foreignId('course_id')
                    ->nullable()
                    ->after('student_id')
                    ->constrained()
                    ->cascadeOnDelete();
            });
        }

        if (! Schema::hasIndex('attendances', 'attendances_student_id_index')) {
            Schema::table('attendances', fn (Blueprint $table) => $table->index('student_id'));
        }

        if (Schema::hasIndex('attendances', 'attendances_student_id_date_unique')) {
            Schema::table('attendances', fn (Blueprint $table) => $table->dropUnique('attendances_student_id_date_unique'));
        }

        if (! Schema::hasIndex('attendances', 'attendances_course_id_student_id_date_unique')) {
            Schema::table('attendances', fn (Blueprint $table) => $table->unique(['course_id', 'student_id', 'date']));
        }
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasIndex('attendances', 'attendances_course_id_student_id_date_unique')) {
                $table->dropUnique('attendances_course_id_student_id_date_unique');
            }
            if (Schema::hasColumn('attendances', 'course_id')) {
                $table->dropConstrainedForeignId('course_id');
            }
            if (Schema::hasIndex('attendances', 'attendances_student_id_index')) {
                $table->dropIndex('attendances_student_id_index');
            }
            if (! Schema::hasIndex('attendances', 'attendances_student_id_date_unique')) {
                $table->unique(['student_id', 'date']);
            }
        });

        Schema::dropIfExists('course_student');
        Schema::dropIfExists('courses');
    }
};
