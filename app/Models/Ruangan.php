<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruangan extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'ruangan';

    protected $fillable = [
        'nama_ruangan',
        'kode_ruangan',
        'kapasitas',
        'gedung',
        'lantai',
        'fasilitas',
        'is_active',
    ];

    protected $casts = [
        'kapasitas' => 'integer',
        'lantai' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Str::uuid();
            }
        });
    }

    public function jadwalUjian(): HasMany
    {
        return $this->hasMany(JadwalUjian::class);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }
}