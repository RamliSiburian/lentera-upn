<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Bimbingan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bimbingan';

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
        'tahapan_id',
        'judul_laporan',
        'file_path',
        'tipe',
        'status',
        'bimbingan_ke',
        'catatan_mhs',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function tahapanConfig()
    {
        return $this->belongsTo(TahapanConfig::class, 'tahapan_id');
    }

    public function approvals()
    {
        return $this->hasMany(BimbinganAcc::class, 'bimbingan_id');
    }

    public function komentar()
    {
        return $this->hasMany(Komentar::class, 'bimbingan_id');
    }
}