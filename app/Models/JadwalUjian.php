<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JadwalUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'jadwal_ujian';

    protected $fillable = [
        'pengajuan_ujian_id',
        'ruangan_id',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'catatan',
        'created_by',
    ];

    protected $casts = [
        'tanggal' => 'date',
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

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}