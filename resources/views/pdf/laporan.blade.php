<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Bimbingan Skripsi</title>
    <style>
        @page { size: A4 landscape; margin: 15mm 15mm 15mm 15mm; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 9pt; color: #333; margin: 0; padding: 0; }

        /* ── KOP — float layout (DomPDF-safe) ── */
        .header { width: 100%; border-bottom: 3px double #E8500A; padding-bottom: 8px; margin-bottom: 12px; overflow: hidden; }
        .header-logo { float: left; width: 68px; text-align: center; }
        .header-logo img { width: 56px; height: 56px; }
        .header-text { margin-left: 78px; text-align: center; }
        .header-text .inst-name  { font-size: 13pt; font-weight: bold; color: #E8500A; letter-spacing: 1px; margin: 0 0 2px 0; }
        .header-text .univ-name  { font-size: 10pt; font-weight: bold; color: #555; margin: 0 0 2px 0; }
        .header-text .doc-title  { font-size: 11pt; font-weight: bold; color: #333; margin: 3px 0 0 0; }
        .header-text .print-date { font-size: 8pt; color: #888; margin: 2px 0 0 0; }
        .clearfix { clear: both; }

        /* ── Info Box — float layout (DomPDF-safe, NO height:100%) ── */
        .info-left  { float: left;  width: 48%; margin-right: 2%; }
        .info-right { float: right; width: 48%; }
        .info-after { clear: both; margin-bottom: 10px; }
        .info-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 8px 12px; }
        .info-box table { width: 100%; }
        .info-box td { padding: 2px 0; font-size: 9pt; }
        .info-box td:first-child { width: 120px; font-weight: bold; color: #555; }

        /* ── Section Title ── */
        .section-title { background: #E8500A; color: white; padding: 5px 10px; font-size: 10pt; font-weight: bold; margin: 14px 0 6px 0; border-radius: 3px; }

        /* ── Data Tables ── */
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 8pt; table-layout: fixed; }
        table.data th { background: #f0f0f0; border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-weight: bold; color: #444; word-wrap: break-word; }
        table.data td { border: 1px solid #ccc; padding: 3px 6px; vertical-align: top; word-wrap: break-word; }
        table.data tr:nth-child(even) { background: #fafafa; }

        /* ── Badges ── */
        .badge { padding: 1px 5px; border-radius: 3px; font-size: 7pt; font-weight: bold; }
        .badge-green  { background: #d4edda; color: #155724; }
        .badge-blue   { background: #d1ecf1; color: #0c5460; }
        .badge-yellow { background: #fff3cd; color: #856404; }
        .badge-red    { background: #f8d7da; color: #721c24; }
        .badge-gray   { background: #e2e3e5; color: #383d41; }

        /* ── Tanda Tangan ── */
        .sign-section { margin-top: 20px; }
        .sign-section .sign-title { font-weight: bold; font-size: 10pt; margin-bottom: 8px; }
        .sign-table { width: 100%; border-collapse: collapse; }
        .sign-box { border: 1px solid #ddd; border-radius: 4px; padding: 8px; min-height: 90px; text-align: center; }
        .sign-box .sign-label { font-size: 7.5pt; color: #888; margin-bottom: 4px; }
        .sign-box .sign-space { height: 35px; display: block; }
        .sign-box .sign-name  { font-weight: bold; font-size: 8.5pt; margin-top: 2px; }
        .sign-box .sign-date  { font-size: 7.5pt; color: #999; margin-top: 4px; }

        /* ── Footer ── */
        .footer { text-align: center; margin-top: 20px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 7.5pt; color: #999; }

        .page-break { page-break-before: always; }
    </style>
</head>
<body>

{{-- ── KOP LAPORAN ── --}}
<div class="header">
    <div class="header-logo">
        <img src="{{ public_path('logo-upnvj.png') }}" alt="Logo UPNVJ" />
    </div>
    <div class="header-text">
        <p class="inst-name">FAKULTAS ILMU KOMPUTER</p>
        <p class="univ-name">UNIVERSITAS PEMBANGUNAN NASIONAL VETERAN JAKARTA</p>
        <p class="doc-title">LAPORAN BIMBINGAN SKRIPSI</p>
        <p class="print-date">Dicetak pada: {{ $tanggalCetak }}</p>
    </div>
    <div class="clearfix"></div>
</div>

{{-- ── Info 2 kolom — float layout ── --}}
<div class="info-left">
    <div class="info-box">
        <table>
            <tr><td>Nama Mahasiswa</td><td>: {{ $mahasiswa->user->name ?? '-' }}</td></tr>
            <tr><td>NIM</td><td>: {{ $mahasiswa->nim ?? '-' }}</td></tr>
            <tr><td>Program Studi</td><td>: Ilmu Komputer</td></tr>
            <tr><td>Konsentrasi</td><td>: {{ $judul->konsentrasi->nama ?? '-' }}</td></tr>
        </table>
    </div>
</div>
@if($judul)
<div class="info-right">
    <div class="info-box">
        <table>
            <tr><td>Judul Skripsi</td><td>: {{ $judul->judul }}</td></tr>
            <tr><td>Tanggal Pengajuan</td><td>: {{ $judul->submitted_at ? \Carbon\Carbon::parse($judul->submitted_at)->format('d M Y H:i') : '-' }}</td></tr>
            <tr><td>Status Judul</td><td>: <span class="badge {{ $judul->status === 'approved_kaprodi' ? 'badge-green' : 'badge-yellow' }}">{{ strtoupper(str_replace('_', ' ', $judul->status)) }}</span></td></tr>
        </table>
    </div>
</div>
@endif
<div class="info-after"></div>


{{-- ── Pembimbing ── --}}
@if($judul && $judul->pembimbing->count() > 0)
<div class="section-title">PEMBIMBING</div>
<table class="data" style="width:60%;">
    <colgroup>
        <col style="width:5%">
        <col style="width:35%">
        <col style="width:20%">
        <col style="width:15%">
        <col style="width:25%">
    </colgroup>
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

{{-- ── Riwayat Bimbingan (landscape = banyak kolom pas) ── --}}
<div class="section-title">RIWAYAT BIMBINGAN</div>
@if($bimbingan->count() > 0)
<table class="data">
    <colgroup>
        <col style="width:3%">
        <col style="width:10%">
        <col style="width:13%">
        <col style="width:4%">
        <col style="width:7%">
        <col style="width:18%">
        <col style="width:8%">
        <col style="width:12%">
        <col style="width:16%">
        <col style="width:9%">
    </colgroup>
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
            <th>Tgl Review</th>
        </tr>
    </thead>
    <tbody>
        @foreach($bimbingan as $i => $b)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $b->submitted_at ? \Carbon\Carbon::parse($b->submitted_at)->format('d/m/Y H:i') : $b->created_at->format('d/m/Y H:i') }}</td>
            <td>{{ $b->tahapanConfig->nama ?? '-' }}</td>
            <td style="text-align:center;">{{ $b->bimbingan_ke }}</td>
            <td><span class="badge {{ $b->tipe === 'bimbingan' ? 'badge-blue' : 'badge-yellow' }}">{{ ucfirst($b->tipe) }}</span></td>
            <td>{{ $b->judul_laporan ?? '-' }}</td>
            <td><span class="badge {{ $b->status === 'approved' ? 'badge-green' : ($b->status === 'rejected' ? 'badge-red' : 'badge-yellow') }}">{{ strtoupper(str_replace('_', ' ', $b->status)) }}</span></td>
            <td>{{ $b->catatan_mhs ?? '-' }}</td>
            <td>
                @foreach($b->approvals as $a)
                    <div style="margin-bottom:2px;font-size:7.5pt;">
                        {{ $a->pembimbing->dosen->user->name ?? '-' }}:
                        <span class="badge {{ $a->status === 'approved' ? 'badge-green' : ($a->status === 'rejected' ? 'badge-red' : 'badge-gray') }}">{{ strtoupper($a->status) }}</span>
                        @if($a->catatan)<br><em style="font-size:6.5pt;color:#888;">{{ $a->catatan }}</em>@endif
                    </div>
                @endforeach
            </td>
            <td>
                @foreach($b->approvals as $a)
                    <div style="margin-bottom:2px;font-size:7.5pt;">{{ $a->reviewed_at ? \Carbon\Carbon::parse($a->reviewed_at)->format('d/m/Y') : '-' }}</div>
                @endforeach
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
@else
<p style="text-align:center;color:#999;padding:16px;">Belum ada riwayat bimbingan</p>
@endif

{{-- ── Riwayat Ujian ── --}}
@if($ujian->count() > 0)
<div class="section-title">RIWAYAT UJIAN</div>
<table class="data">
    <colgroup>
        <col style="width:3%">
        <col style="width:15%">
        <col style="width:12%">
        <col style="width:9%">
        <col style="width:12%">
        <col style="width:10%">
        <col style="width:22%">
        <col style="width:17%">
    </colgroup>
    <thead>
        <tr>
            <th>No</th>
            <th>Jenis Ujian</th>
            <th>Tanggal Pengajuan</th>
            <th>Status</th>
            <th>Tanggal Ujian</th>
            <th>Ruangan</th>
            <th>Penguji</th>
            <th>Hasil (Nilai)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($ujian as $i => $u)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $u->tahapan->nama ?? '-' }}</td>
            <td>{{ $u->submitted_at ? \Carbon\Carbon::parse($u->submitted_at)->format('d/m/Y H:i') : $u->created_at->format('d/m/Y H:i') }}</td>
            <td><span class="badge {{ $u->status === 'lulus' ? 'badge-green' : ($u->status === 'revisi' ? 'badge-yellow' : ($u->status === 'gagal' ? 'badge-red' : 'badge-gray')) }}">{{ strtoupper(str_replace('_', ' ', $u->status)) }}</span></td>
            <td>{{ $u->jadwal ? \Carbon\Carbon::parse($u->jadwal->tanggal)->format('d/m/Y') . ' ' . $u->jadwal->jam_mulai : '-' }}</td>
            <td>{{ $u->jadwal->ruangan->nama_ruangan ?? '-' }}</td>
            <td>
                @foreach($u->penguji as $p)
                    <div style="margin-bottom:1px;">• {{ $p->dosen->user->name ?? '-' }}</div>
                @endforeach
            </td>
            <td>
                @if($u->penilaian->count() > 0)
                    @foreach($u->penilaian as $p)
                        <div style="margin-bottom:2px;">{{ $p->penguji->dosen->user->name ?? '-' }}: <strong>{{ $p->nilai }}</strong></div>
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

{{-- ── Tanda Tangan — ambil penguji dari ujian TERAKHIR saja ── --}}
@php
    $lastUjian        = $ujian->last();            // ujian terakhir
    $lastPenguji      = $lastUjian ? $lastUjian->penguji->take(2) : collect(); // maks 2 penguji
    $pembimbingList   = $judul ? $judul->pembimbing : collect();

    $totalCols = $pembimbingList->count() + $lastPenguji->count() + 1; // +1 kaprodi
    $colWidth  = $totalCols > 0 ? round(100 / $totalCols) : 25;
@endphp

<div class="sign-section">
    <div class="sign-title">Tanda Tangan</div>
    <table class="sign-table">
        <tr>
            {{-- Pembimbing --}}
            @foreach($pembimbingList as $p)
            <td style="text-align:center; vertical-align:top; padding:0 5px; width:{{ $colWidth }}%;">
                <div class="sign-box">
                    <div class="sign-label">{{ $p->urutan === 'pembimbing_utama' ? 'Pembimbing 1' : 'Pembimbing 2' }}</div>
                    @if($p->dosen && $p->dosen->paraf)
                        <div style="margin:6px 0;"><img src="{{ storage_path('app/public/' . $p->dosen->paraf) }}" style="height:28px;" /></div>
                    @else
                        <span class="sign-space"></span>
                        <div style="color:#ccc;font-size:6.5pt;">(Tanda Tangan)</div>
                    @endif
                    <div class="sign-name">{{ $p->dosen->user->name ?? '-' }}</div>
                    <div class="sign-date">{{ $p->dosen_acc_at ? \Carbon\Carbon::parse($p->dosen_acc_at)->format('d M Y') : '____ / ____ / ______' }}</div>
                </div>
            </td>
            @endforeach

            {{-- 2 Penguji dari ujian terakhir --}}
            @foreach($lastPenguji as $px)
            <td style="text-align:center; vertical-align:top; padding:0 5px; width:{{ $colWidth }}%;">
                <div class="sign-box">
                    <div class="sign-label">Penguji {{ $loop->iteration }}</div>
                    @if($px->dosen && $px->dosen->paraf)
                        <div style="margin:6px 0;"><img src="{{ storage_path('app/public/' . $px->dosen->paraf) }}" style="height:28px;" /></div>
                    @else
                        <span class="sign-space"></span>
                        <div style="color:#ccc;font-size:6.5pt;">(Tanda Tangan)</div>
                    @endif
                    <div class="sign-name">{{ $px->dosen->user->name ?? '-' }}</div>
                    <div class="sign-date">____ / ____ / ______</div>
                </div>
            </td>
            @endforeach

            {{-- Ketua Program Studi --}}
            <td style="text-align:center; vertical-align:top; padding:0 5px; width:{{ $colWidth }}%;">
                <div class="sign-box">
                    <div class="sign-label">Ketua Program Studi</div>
                    <span class="sign-space"></span>
                    <div style="color:#ccc;font-size:6.5pt;">(Tanda Tangan)</div>
                    <div class="sign-name">________________________</div>
                    <div class="sign-date">____ / ____ / ______</div>
                </div>
            </td>
        </tr>
    </table>
</div>

<div class="footer">
    Fakultas Ilmu Komputer – Universitas Pembangunan Nasional Veteran Jakarta<br>
    Dokumen ini dihasilkan secara otomatis oleh Sistem LENTERA
</div>

</body>
</html>