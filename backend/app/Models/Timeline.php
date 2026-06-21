<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'magang_id',
        'title',
        'description',
        'day_number',
        'ai_feedback',
        'ai_status',
        'ai_analyzed_at',
    ];

    protected function casts(): array
    {
        return [
            'ai_feedback' => 'array',
            'ai_analyzed_at' => 'datetime',
        ];
    }

    public function magang()
    {
        return $this->belongsTo(Magang::class);
    }
}
