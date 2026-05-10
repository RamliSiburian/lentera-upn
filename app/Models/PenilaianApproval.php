<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PenilaianApproval extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $table = 'penilaian_approval';

    protected $fillable = [
        'pengajuan_ujian_id',
        'kaprodi_id',
        'status',
        'catatan',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
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

    public function kaprodi()
    {
        return $this->belongsTo(User::class, 'kaprodi_id');
    }
}