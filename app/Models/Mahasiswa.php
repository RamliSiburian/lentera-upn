<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mahasiswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'mahasiswa';

    protected $fillable = [
        'user_id',
        'nim',
        'prodi_id',
        'angkatan',
        'status',
        'no_hp',
    ];

    protected $casts = [
        'angkatan' => 'integer',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prodi(): BelongsTo
    {
        return $this->belongsTo(ProgramStudi::class, 'prodi_id');
    }

    public function judulPengajuan(): HasMany
    {
        return $this->hasMany(JudulPengajuan::class);
    }

    public function pembimbing(): HasMany
    {
        return $this->hasMany(Pembimbing::class);
    }

    public function bimbingan(): HasMany
    {
        return $this->hasMany(Bimbingan::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'aktif';
    }

    public function getCurrentPembimbing()
    {
        return $this->pembimbing()->where('status', 'approved')->get();
    }

    public function getLatestJudul()
    {
        return $this->judulPengajuan()->latest()->first();
    }
}