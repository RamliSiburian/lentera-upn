<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengajuanUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'pengajuan_ujian';

    protected $fillable = [
        'mahasiswa_id',
        'tahapan_id',
        'status',
        'keterangan',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
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

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function tahapan()
    {
        return $this->belongsTo(TahapanConfig::class, 'tahapan_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function penguji()
    {
        return $this->hasMany(PengujiUjian::class, 'pengajuan_ujian_id');
    }

    public function jadwal()
    {
        return $this->hasOne(JadwalUjian::class, 'pengajuan_ujian_id');
    }

    public function penilaian()
    {
        return $this->hasMany(PenilaianUjian::class, 'pengajuan_ujian_id');
    }

    public function approvals()
    {
        return $this->hasMany(PenilaianApproval::class, 'pengajuan_ujian_id');
    }
}