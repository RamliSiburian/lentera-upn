<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengujiUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'penguji';

    protected $fillable = [
        'pengajuan_ujian_id',
        'dosen_id',
        'urutan',
        'assigned_by',
        'assigned_at',
        'penguji_acc',
        'penguji_acc_at',
        'penguji_acc_catatan',
    ];

    protected $casts = [
        'urutan' => 'integer',
        'assigned_at' => 'datetime',
        'penguji_acc_at' => 'datetime',
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

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function penilaian()
    {
        return $this->hasOne(PenilaianUjian::class, 'penguji_id');
    }
}