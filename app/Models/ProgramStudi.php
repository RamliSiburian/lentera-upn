<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramStudi extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'program_studi';

    protected $fillable = [
        'kode',
        'nama',
        'jenjang',
        'deskripsi',
        'kaprodi_id',
        'is_active',
    ];

    protected $casts = [
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

    public function mahasiswa(): HasMany
    {
        return $this->hasMany(Mahasiswa::class, 'prodi_id');
    }

    /**
     * Kaprodi (relasi ke Dosen)
     */
    public function kaprodi(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'kaprodi_id');
    }

    /**
     * Nama lengkap termasuk jenjang, contoh: "S1. Sistem Informasi"
     */
    public function getNamaLengkapAttribute(): string
    {
        return $this->jenjang . '. ' . $this->nama;
    }
}
