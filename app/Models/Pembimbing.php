<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Pembimbing extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pembimbing';

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
        'dosen_id',
        'urutan',
        'status',
        'requested_at',
        'dosen_acc_at',
        'final_approved_by',
        'final_approved_at',
        'keterangan_tolak',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'dosen_acc_at' => 'datetime',
        'final_approved_at' => 'datetime',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }

    public function finalApprover()
    {
        return $this->belongsTo(User::class, 'final_approved_by');
    }

    public function bimbinganAcc()
    {
        return $this->hasMany(BimbinganAcc::class, 'pembimbing_id');
    }

    public function judulPengajuan()
    {
        // Pembimbing is linked to JudulPengajuan via mahasiswa_id
        return $this->hasOne(JudulPengajuan::class, 'mahasiswa_id', 'mahasiswa_id')
            ->whereNotIn('status', ['rejected'])
            ->latestOfMany();
    }
}
