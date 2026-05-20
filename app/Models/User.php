<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
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

    public function mahasiswa(): HasOne
    {
        return $this->hasOne(Mahasiswa::class);
    }

    public function dosen(): HasOne
    {
        return $this->hasOne(Dosen::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Komentar::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notifikasi::class);
    }

    public function emailLogs(): HasMany
    {
        return $this->hasMany(EmailLog::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->isPimpinan();
    }

    public function isMahasiswa(): bool
    {
        return $this->role === 'mahasiswa';
    }

    public function isDosen(): bool
    {
        return $this->role === 'dosen';
    }

    public function isPimpinan(): bool
    {
        return ($this->role === 'pimpinan') || ($this->dosen && $this->dosen->isPimpinan());
    }

    public function isKaprodi(): bool
    {
        return $this->dosen && $this->dosen->is_kaprodi;
    }

    public function getRoleName(): string
    {
        if ($this->isPimpinan()) {
            return 'Pimpinan';
        }
        if ($this->isKaprodi()) {
            return 'Kepala Program Studi';
        }
        return match($this->role) {
            'admin' => 'Administrator',
            'pimpinan' => 'Pimpinan',
            'dosen' => 'Dosen',
            'mahasiswa' => 'Mahasiswa',
            default => 'User'
        };
    }

    public function getEffectiveRoleAttribute(): string
    {
        if ($this->role === 'admin') return 'admin';
        if ($this->isPimpinan()) return 'pimpinan';
        if ($this->isKaprodi()) return 'k.prodi';
        return $this->role;
    }
}
