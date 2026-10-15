<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $fillable = [
        'course_code',
        'course_name',
        'instructor',
        'semester',
        'meeting_schedule',
        'room',
        'instructor_user_id',
    ];

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class)->withTimestamps();
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function instructorAccount(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_user_id');
    }
}
