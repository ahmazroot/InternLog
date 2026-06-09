<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Magang extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'timeline',
        'tempat_magang',
        'tanggal_mulai',
        'tanggal_selesai',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function timelines()
    {
        return $this->hasMany(Timeline::class);
    }
}
