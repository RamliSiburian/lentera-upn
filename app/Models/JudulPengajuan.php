<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class JudulPengajuan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'judul_pengajuan';

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'mahasiswa_id',
        'konsentrasi_id',
        'judul',
        'deskripsi',
        'dokumen',
        'status',
        'keterangan_tolak',
        'pengajuan_ke',
        'submitted_at',
    ];

    protected $appends = ['dokumen_url'];

    public function getDokumenUrlAttribute()
    {
        return $this->dokumen ? asset('storage/' . $this->dokumen) : null;
    }

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function konsentrasi()
    {
        return $this->belongsTo(Konsentrasi::class, 'konsentrasi_id');
    }

    public function pembimbing()
    {
        return $this->hasMany(Pembimbing::class, 'mahasiswa_id', 'mahasiswa_id');
    }

    public function bimbingan()
    {
        return $this->hasMany(Bimbingan::class, 'mahasiswa_id', 'mahasiswa_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'rejected');
    }
}