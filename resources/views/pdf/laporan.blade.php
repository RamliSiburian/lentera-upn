<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Bimbingan Skripsi</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10pt; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 3px double #E8500A; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #E8500A; font-size: 16pt; margin: 0 0 2px 0; letter-spacing: 3px; }
        .header h2 { font-size: 11pt; margin: 0 0 2px 0; color: #555; }
        .header p { font-size: 8pt; color: #888; margin: 0; }
        .info-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px; }
        .info-box table { width: 100%; }
        .info-box td { padding: 2px 0; font-size: 10pt; }
        .info-box td:first-child { width: 130px; font-weight: bold; color: #555; }
        .section-title { background: #E8500A; color: white; padding: 6px 12px; font-size: 11pt; font-weight: bold; margin: 18px 0 8px 0; border-radius: 3px; }
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
        table.data th { background: #f0f0f0; border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-weight: bold; color: #444; }
        table.data td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; }
        table.data tr:nth-child(even) { background: #fafafa; }
        .badge { padding: 1px 6px; border-radius: 3px; font-size: 8pt; font-weight: bold; }
        .badge-green { background: #d4edda; color: #155724; }
        .badge-blue { background: #d1ecf1; color: #0c5460; }
        .badge-yellow { background: #fff3cd; color: #856404; }
        .badge-red { background: #f8d7da; color: #721c24; }
        .badge-gray { background: #e2e3e5; color: #383d41; }
        .footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 8pt; color: #999; }
        .sign-table { width: 100%; margin-top: 20px; }
        .sign-table td { width: 33%; text-align: center; vertical-align: top; padding: 0 10px; }
        .sign-box { border: 1px solid #ddd; border-radius: 4px; padding: 8px; min-height: 80px; }
        .sign-box .sign-label { font-size: 8pt; color: #888; margin-bottom: 4px; }
        .sign-box .sign-name { font-weight: bold; font-size: 10pt; }
        .sign-box .sign-role { font-size: 8pt; color: #666; }
        .sign-box .sign-date { font-size: 8pt; color: #999; margin-top: 4px; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>

<div class="header">
    <h1>LENTERA</h1>
    <h2>Layanan Elektronik Tugas Akhir Terintegrasi</h2>
    <h2>LAPORAN BIMBINGAN SKRIPSI</h2>
    <p>Dicetak pada: {{ $tanggalCetak }}</p>
</div>

{{-- Info Mahasiswa --}}
<div class="info-box">
    <table>
        <tr><td>Nama Mahasiswa</td><td>: {{ $mahasiswa->user->name ?? '-' }}</td></tr>
        <tr><td>NIM</td><td>: {{ $mahasiswa->nim ?? '-' }}</td></tr>
        <tr><td>Program Studi</td><td>: Ilmu Komputer</td></tr>
        <tr><td>Konsentrasi</td><td>: {{ $judul->konsentrasi->nama ?? '-' }}</td></tr>
    </table>
</div>

{{-- Info Judul --}}
@if($judul)
<div class="info-box">
    <table>
        <tr><td>Judul Skripsi</td><td>: {{ $judul->judul }}</td></tr>
        <tr><td>Tanggal Pengajuan</td><td>: {{ $judul->submitted_at ? \Carbon\Carbon::parse($judul->submitted_at)->format('d M Y H:i') : '-' }}</td></tr>
        <tr><td>Status Judul</td><td>: <span class="badge {{ $judul->status === 'approved_kaprodi' ? 'badge-green' : 'badge-yellow' }}">{{ strtoupper(str_replace('_', ' ', $judul->status)) }}</span></td></tr>
    </table>
</div>

{{-- Pembimbing --}}
@if($judul->pembimbing->count() > 0)
<div class="section-title">PEMBIMBING</div>
<table class="data">
    <thead>
        <tr><th>No</th><th>Nama Dosen</th><th>Urutan</th><th>Status</th><th>Tanggal ACC</th></tr>
    </thead>
    <tbody>
        @foreach($judul->pembimbing as $i => $p)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $p->dosen->user->name ?? '-' }}</td>
            <td>{{ $p->urutan === 'pembimbing_utama' ? 'Pembimbing 1' : 'Pembimbing 2' }}</td>
            <td><span class="badge {{ $p->status === 'approved' ? 'badge-green' : 'badge-yellow' }}">{{ strtoupper($p->status) }}</span></td>
            <td>{{ $p->approved_at ? \Carbon\Carbon::parse($p->approved_at)->format('d M Y H:i') : '-' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif
@endif

{{-- Riwayat Bimbingan --}}
<div class="section-title">RIWAYAT BIMBINGAN</div>
@if($bimbingan->count() > 0)
<table class="data">
    <thead>
        <tr>
            <th>No</th>
            <th>Tanggal Submit</th>
            <th>Tahapan</th>
            <th>Ke-</th>
            <th>Tipe</th>
            <th>Judul Laporan</th>
            <th>Status</th>
            <th>Catatan Mhs</th>
            <th>ACC Oleh</th>
            <th>Tanggal Review</th>
        </tr>
    </thead>
    <tbody>
        @foreach($bimbingan as $i => $b)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $b->submitted_at ? \Carbon\Carbon::parse($b->submitted_at)->format('d M Y H:i') : $b->created_at->format('d M Y H:i') }}</td>
            <td>{{ $b->tahapanConfig->nama ?? '-' }}</td>
            <td>{{ $b->bimbingan_ke }}</td>
            <td><span class="badge {{ $b->tipe === 'bimbingan' ? 'badge-blue' : 'badge-yellow' }}">{{ ucfirst($b->tipe) }}</span></td>
            <td>{{ $b->judul_laporan ?? '-' }}</td>
            <td><span class="badge {{ $b->status === 'approved' ? 'badge-green' : ($b->status === 'rejected' ? 'badge-red' : 'badge-yellow') }}">{{ strtoupper(str_replace('_', ' ', $b->status)) }}</span></td>
            <td>{{ $b->catatan_mhs ?? '-' }}</td>
            <td>
                @foreach($b->approvals as $a)
                    <div style="margin-bottom:2px;">
                        {{ $a->pembimbing->dosen->user->name ?? '-' }}:
                        <span class="badge {{ $a->status === 'approved' ? 'badge-green' : ($a->status === 'rejected' ? 'badge-red' : 'badge-gray') }}">{{ strtoupper($a->status) }}</span>
                        @if($a->catatan)<br><em style="font-size:7pt;color:#888;">{{ $a->catatan }}</em>@endif
                    </div>
                @endforeach
            </td>
            <td>
                @foreach($b->approvals as $a)
                    <div style="margin-bottom:2px;">{{ $a->reviewed_at ? \Carbon\Carbon::parse($a->reviewed_at)->format('d M Y H:i') : '-' }}</div>
                @endforeach
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="text-align:center;color:#999;padding:20px;">Belum ada riwayat bimbingan</p>
@endif

{{-- Riwayat Ujian --}}
@if($ujian->count() > 0)
<div class="section-title">RIWAYAT UJIAN</div>
<table class="data">
    <thead>
        <tr>
            <th>No</th>
            <th>Jenis Ujian</th>
            <th>Tanggal Pengajuan</th>
            <th>Status</th>
            <th>Tanggal Ujian</th>
            <th>Ruangan</th>
            <th>Penguji</th>
            <th>Hasil</th>
        </tr>
    </thead>
    <tbody>
        @foreach($ujian as $i => $u)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $u->tahapan->nama ?? '-' }}</td>
            <td>{{ $u->submitted_at ? \Carbon\Carbon::parse($u->submitted_at)->format('d M Y H:i') : $u->created_at->format('d M Y H:i') }}</td>
            <td><span class="badge {{ $u->status === 'lulus' ? 'badge-green' : ($u->status === 'revisi' ? 'badge-yellow' : ($u->status === 'gagal' ? 'badge-red' : 'badge-gray')) }}">{{ strtoupper(str_replace('_', ' ', $u->status)) }}</span></td>
            <td>{{ $u->jadwal ? \Carbon\Carbon::parse($u->jadwal->tanggal)->format('d M Y H:i') : '-' }}</td>
            <td>{{ $u->jadwal->ruangan->nama_ruangan ?? '-' }}</td>
            <td>
                @foreach($u->penguji as $p)
                    <div style="margin-bottom:1px;">• {{ $p->dosen->user->name ?? '-' }}</div>
                @endforeach
            </td>
            <td>
                @if($u->penilaian->count() > 0)
                    @foreach($u->penilaian as $p)
                        <div style="margin-bottom:2px;">
                            {{ $p->penguji->dosen->user->name ?? '-' }}: <strong>{{ $p->nilai }}</strong>
                        </div>
                    @endforeach
                @else
                    -
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@endif

{{-- Tanda Tangan --}}
@php
    $pembimbingCount = $judul ? $judul->pembimbing->count() : 0;
    $totalSignCols = $pembimbingCount + $pengujiTotal + 1; // +1 for kaprodi
    $colWidth = $totalSignCols > 0 ? round(100 / $totalSignCols) : 25;
@endphp
<div style="margin-top: 30px;">
    <div style="font-weight: bold; font-size: 11pt; margin-bottom: 10px;">Tanda Tangan</div>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            {{-- Each Pembimbing gets own box --}}
            @if($judul && $judul->pembimbing->count() > 0)
                @foreach($judul->pembimbing as $p)
                <td style="text-align: center; vertical-align: top; padding: 0 5px; width: {{ $colWidth }}%;">
                    <div class="sign-box" style="min-height: 100px;">
                        <div class="sign-label">{{ $p->urutan === 'pembimbing_utama' ? 'Pembimbing 1' : 'Pembimbing 2' }}</div>
                        @if($p->dosen && $p->dosen->paraf)
                            <div style="margin: 6px 0;"><img src="{{ storage_path('app/public/' . $p->dosen->paraf) }}" style="height: 30px;" /></div>
                        @else
                            <div style="margin: 14px 0 8px; color: #ccc; font-size: 7pt;">(Tanda Tangan)</div>
                        @endif
                        <div class="sign-name">{{ $p->dosen->user->name ?? '-' }}</div>
                        <div class="sign-date">{{ $p->dosen_acc_at ? \Carbon\Carbon::parse($p->dosen_acc_at)->format('d M Y') : '____/____/______' }}</div>
                    </div>
                </td>
                @endforeach
            @endif

            {{-- Each Penguji gets own box --}}
            @php $pengujiIndex = 0; @endphp
            @foreach($ujian as $u)
                @foreach($u->penguji as $px)
                <td style="text-align: center; vertical-align: top; padding: 0 5px; width: {{ $colWidth }}%;">
                    <div class="sign-box" style="min-height: 100px;">
                        <div class="sign-label">Penguji {{ $px->urutan ?? ++$pengujiIndex }}</div>
                        @if($px->dosen && $px->dosen->paraf)
                            <div style="margin: 6px 0;"><img src="{{ storage_path('app/public/' . $px->dosen->paraf) }}" style="height: 30px;" /></div>
                        @else
                            <div style="margin: 14px 0 8px; color: #ccc; font-size: 7pt;">(Tanda Tangan)</div>
                        @endif
                        <div class="sign-name">{{ $px->dosen->user->name ?? '-' }}</div>
                        <div class="sign-date">____/____/______</div>
                    </div>
                </td>
                @endforeach
            @endforeach

            {{-- Kaprodi gets own box --}}
            <td style="text-align: center; vertical-align: top; padding: 0 5px; width: {{ $colWidth }}%;">
                <div class="sign-box" style="min-height: 100px;">
                    <div class="sign-label">Ketua Program Studi</div>
                    <div style="margin: 14px 0 8px; color: #ccc; font-size: 7pt;">(Tanda Tangan)</div>
                    <div class="sign-name">________________________</div>
                    <div class="sign-date">____/____/______</div>
                </div>
            </td>
        </tr>
    </table>
</div>

<div class="footer">
    LENTERA - Layanan Elektronik Tugas Akhir Terintegrasi<br>
    Dokumen ini dihasilkan secara otomatis oleh sistem LENTERA
</div>

</body>
</html>