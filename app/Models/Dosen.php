<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dosen extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'dosen';

    protected $fillable = [
        'user_id',
        'nidn',
        'bidang_keahlian',
        'kuota_bimbingan',
        'is_kaprodi',
        'foto_profil_path',
        'paraf_path',
        'no_hp',
    ];

    protected $casts = [
        'is_kaprodi' => 'boolean',
        'kuota_bimbingan' => 'integer',
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

    public function konsentrasi(): BelongsToMany
    {
        return $this->belongsToMany(Konsentrasi::class, 'dosen_konsentrasi', 'dosen_id', 'konsentrasi_id');
    }

    public function pembimbing(): HasMany
    {
        return $this->hasMany(Pembimbing::class);
    }


    public function isKaprodi(): bool
    {
        return $this->is_kaprodi;
    }

    public function getCurrentLoad(): int
    {
        return $this->pembimbing()->where('status', 'approved')->count();
    }

    public function getAvailableSlots(): int
    {
        return max(0, $this->kuota_bimbingan - $this->getCurrentLoad());
    }

    public function isAvailable(): bool
    {
        return $this->getAvailableSlots() > 0;
    }

    public function hasKonsentrasi($konsentrasiId): bool
    {
        return $this->konsentrasi()->where('konsentrasi_id', $konsentrasiId)->exists();
    }

    public function canAcceptMahasiswa($konsentrasiId = null): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        if ($konsentrasiId && !$this->hasKonsentrasi($konsentrasiId)) {
            return false;
        }

        return true;
    }
}