<?php

namespace App\Services;

use App\Models\Notifikasi;

class NotifikasiService
{
    public static function send($userId, $judul, $pesan, $refType = null, $refId = null)
    {
        if (!$userId) {
            return null;
        }
        
        return Notifikasi::create([
            'user_id' => $userId,
            'judul' => $judul,
            'pesan' => $pesan,
            'ref_type' => $refType,
            'ref_id' => $refId,
            'is_read' => false,
        ]);
    }

    public static function sendBulk($userIds, $judul, $pesan, $refType = null, $refId = null)
    {
        $notifications = [];
        if (empty($userIds)) {
            return $notifications;
        }

        foreach ($userIds as $userId) {
            $notifications[] = self::send($userId, $judul, $pesan, $refType, $refId);
        }
        return $notifications;
    }
}
