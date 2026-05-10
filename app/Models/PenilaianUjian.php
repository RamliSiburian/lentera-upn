<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PenilaianUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'penilaian_ujian';

    protected $fillable = [
        'pengajuan_ujian_id',
        'penguji_id',
        'komponen',
        'nilai',
        'catatan',
        'status_hasil',
        'dinilai_at',
    ];

    protected $casts = [
        'nilai' => 'decimal:2',
        'dinilai_at' => 'datetime',
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

    public function pengajuanUjian()
    {
        return $this->belongsTo(PengajuanUjian::class, 'pengajuan_ujian_id');
    }

    public function penguji()
    {
        return $this->belongsTo(PengujiUjian::class, 'penguji_id');
    }
}