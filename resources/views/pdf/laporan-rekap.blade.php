<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Rekap Progress Mahasiswa</title>
    <style>
        @page { size: A4 landscape; margin: 12mm 12mm 12mm 12mm; }
        body  { font-family: 'DejaVu Sans', sans-serif; font-size: 8.5pt; color: #222; margin: 0; padding: 0; }

        /* ── KOP ── */
        .header { width: 100%; border-bottom: 3px double #E8500A; padding-bottom: 7px; margin-bottom: 10px; overflow: hidden; }
        .header-logo { float: left; width: 64px; text-align: center; }
        .header-logo img { width: 52px; height: 52px; }
        .header-text { margin-left: 72px; text-align: center; }
        .header-text .inst-name  { font-size: 12pt; font-weight: bold; color: #E8500A; margin: 0 0 1px 0; }
        .header-text .univ-name  { font-size: 9.5pt; font-weight: bold; color: #555; margin: 0 0 2px 0; }
        .header-text .doc-title  { font-size: 10.5pt; font-weight: bold; color: #333; margin: 3px 0 0 0; }
        .header-text .print-date { font-size: 7.5pt; color: #888; margin: 2px 0 0 0; }
        .clearfix { clear: both; }

        /* ── Summary bar ── */
        .summary-bar {
            background: #f9f0eb;
            border: 1px solid #f0c4a8;
            border-radius: 4px;
            padding: 5px 12px;
            margin-bottom: 10px;
            font-size: 8pt;
            color: #555;
        }
        .summary-bar strong { color: #E8500A; font-size: 10pt; }

        /* ── Main Table ── */
        table.rekap { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: fixed; }
        table.rekap thead tr { background: #E8500A; color: white; }
        table.rekap th { padding: 5px 6px; text-align: left; font-weight: bold; font-size: 7.5pt; word-wrap: break-word; border: 1px solid #c0392b; }
        table.rekap td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; word-wrap: break-word; }
        table.rekap tr:nth-child(even) td { background: #fdf7f4; }
        table.rekap tr:nth-child(odd)  td { background: #ffffff; }

        /* ── Badges ── */
        .b { display: inline-block; padding: 1px 5px; border-radius: 3px; font-size: 6.5pt; font-weight: bold; white-space: nowrap; }
        .b-green  { background: #d4edda; color: #155724; }
        .b-blue   { background: #d1ecf1; color: #0c5460; }
        .b-yellow { background: #fff3cd; color: #856404; }
        .b-red    { background: #f8d7da; color: #721c24; }
        .b-gray   { background: #e2e3e5; color: #383d41; }
        .b-orange { background: #fde8d8; color: #8b3a0c; }

        /* ── Footer ── */
        .footer { text-align: center; margin-top: 14px; padding-top: 7px; border-top: 1px solid #ddd; font-size: 7pt; color: #999; }
    </style>
</head>
<body>

{{-- ── KOP ── --}}
<div class="header">
    <div class="header-logo">
        <img src="{{ public_path('logo-upnvj.svg') }}" alt="Logo UPNVJ" />
    </div>
    <div class="header-text">
        <p class="inst-name">FAKULTAS ILMU KOMPUTER</p>
        <p class="univ-name">UNIVERSITAS PEMBANGUNAN NASIONAL VETERAN JAKARTA</p>
        <p class="doc-title">REKAP PROGRESS MAHASISWA TUGAS AKHIR</p>
        <p class="print-date">Dicetak pada: {{ $tanggalCetak }}</p>
    </div>
    <div class="clearfix"></div>
</div>

{{-- ── Summary bar ── --}}
<div class="summary-bar">
    Total mahasiswa: <strong>{{ $totalMhs }}</strong> &nbsp;|&nbsp;
    Judul disetujui: <strong>{{ $mahasiswaList->where('status_judul', 'Disetujui')->count() }}</strong> &nbsp;|&nbsp;
    Bimbingan aktif: <strong>{{ $mahasiswaList->filter(fn($m) => $m['total_bimbingan'] > 0)->count() }}</strong> &nbsp;|&nbsp;
    Sudah ujian: <strong>{{ $mahasiswaList->filter(fn($m) => $m['jenis_ujian'] !== '-')->count() }}</strong>
</div>

{{-- ── Tabel Rekap ── --}}
<table class="rekap">
    <colgroup>
        <col style="width:3%">   {{-- No --}}
        <col style="width:8%">   {{-- NIM --}}
        <col style="width:14%">  {{-- Nama --}}
        <col style="width:17%">  {{-- Judul --}}
        <col style="width:8%">   {{-- Status Judul --}}
        <col style="width:13%">  {{-- Pembimbing --}}
        <col style="width:5%">   {{-- Jml Bimbingan --}}
        <col style="width:10%">  {{-- Tahapan Bimbingan --}}
        <col style="width:8%">   {{-- Status Bimbingan --}}
        <col style="width:8%">   {{-- Jenis Ujian --}}
        <col style="width:6%">   {{-- Status Ujian --}}
    </colgroup>
    <thead>
        <tr>
            <th>No</th>
            <th>NIM</th>
            <th>Nama Mahasiswa</th>
            <th>Judul Skripsi</th>
            <th>Status Judul</th>
            <th>Pembimbing</th>
            <th style="text-align:center">Jml Bimbingan</th>
            <th>Tahapan Bimbingan</th>
            <th>Status Bimbingan</th>
            <th>Jenis Ujian</th>
            <th>Status Ujian</th>
        </tr>
    </thead>
    <tbody>
        @forelse($mahasiswaList as $i => $m)
        <tr>
            <td style="text-align:center">{{ $i + 1 }}</td>
            <td>{{ $m['nim'] }}</td>
            <td>{{ $m['nama'] }}</td>
            <td style="font-size:7pt;">{{ Str::limit($m['judul'], 80) }}</td>
            <td>
                @php
                    $jBadge = match($m['status_judul']) {
                        'Disetujui'    => 'b-green',
                        'Diajukan'     => 'b-blue',
                        'Diverifikasi' => 'b-yellow',
                        'Ditolak'      => 'b-red',
                        default        => 'b-gray',
                    };
                @endphp
                <span class="b {{ $jBadge }}">{{ $m['status_judul'] }}</span>
            </td>
            <td style="font-size:7pt;">{{ $m['pembimbing'] }}</td>
            <td style="text-align:center; font-weight:bold; color:#E8500A;">{{ $m['total_bimbingan'] }}</td>
            <td>{{ $m['tahapan_bimbingan'] }}</td>
            <td>
                @php
                    $bBadge = match($m['status_bimbingan']) {
                        'Disetujui' => 'b-green',
                        'Ditinjau'  => 'b-yellow',
                        'Diajukan'  => 'b-blue',
                        'Revisi'    => 'b-red',
                        default     => 'b-gray',
                    };
                @endphp
                @if($m['status_bimbingan'] !== '-')
                    <span class="b {{ $bBadge }}">{{ $m['status_bimbingan'] }}</span>
                @else
                    <span style="color:#bbb;">-</span>
                @endif
            </td>
            <td style="font-size:7pt;">{{ $m['jenis_ujian'] }}</td>
            <td>
                @php
                    $uBadge = match($m['status_ujian']) {
                        'Lulus'         => 'b-green',
                        'Dijadwalkan'   => 'b-blue',
                        'Diajukan'      => 'b-yellow',
                        'Revisi'        => 'b-orange',
                        'Gagal'         => 'b-red',
                        'Tunggu Penguji'=> 'b-yellow',
                        default         => 'b-gray',
                    };
                @endphp
                @if($m['status_ujian'] !== '-')
                    <span class="b {{ $uBadge }}">{{ $m['status_ujian'] }}</span>
                @else
                    <span style="color:#bbb;">-</span>
                @endif
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="11" style="text-align:center; color:#999; padding:20px;">
                Belum ada data mahasiswa
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Fakultas Ilmu Komputer – Universitas Pembangunan Nasional Veteran Jakarta &nbsp;|&nbsp;
    Dokumen dihasilkan otomatis oleh Sistem LENTERA
</div>

</body>
</html>
