<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Konsentrasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'konsentrasi';

    protected $fillable = [
        'nama',
        'kode',
        'deskripsi',
        'is_active',
        'created_by',
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function dosen(): BelongsToMany
    {
        return $this->belongsToMany(Dosen::class, 'dosen_konsentrasi', 'konsentrasi_id', 'dosen_id');
    }

    public function judulPengajuan(): HasMany
    {
        return $this->hasMany(JudulPengajuan::class);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function getAvailableDosen()
    {
        return $this->dosen()->whereHas('user', function ($query) {
            $query->where('is_active', true);
        })->get()->filter(function ($dosen) {
            return $dosen->isAvailable();
        });
    }
}