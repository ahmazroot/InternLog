<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'magang_id',
        'description',
    ];

    public function magang()
    {
        return $this->belongsTo(Magang::class);
    }
}
