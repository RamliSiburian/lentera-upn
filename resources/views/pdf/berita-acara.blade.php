<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Berita Acara Ujian Sidang</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            color: #000;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Kop Surat (Header) */
        .kop {
            width: 100%;
            border-bottom: 4px double #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-align: center;
            position: relative;
        }
        .kop-logo {
            position: absolute;
            left: 0;
            top: 5px;
            width: 80px;
        }
        .kop-logo img {
            width: 75px;
            height: 75px;
        }
        .kop-text {
            margin-left: 90px;
            margin-right: 20px;
        }
        .kop-text h2 {
            font-size: 13pt;
            font-weight: bold;
            margin: 0 0 3px 0;
            text-transform: uppercase;
        }
        .kop-text h3 {
            font-size: 11pt;
            font-weight: bold;
            margin: 0 0 3px 0;
            text-transform: uppercase;
        }
        .kop-text p {
            font-size: 9pt;
            margin: 0;
        }

        /* Title */
        .doc-title {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            text-transform: uppercase;
            margin-bottom: 5px;
            text-decoration: underline;
        }
        .doc-subtitle {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 15px;
        }

        /* Form-like list */
        .info-table {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 3px 0;
            vertical-align: top;
        }
        .info-table td.label {
            width: 32%;
        }
        .info-table td.colon {
            width: 3%;
            text-align: center;
        }
        .info-table td.value {
            width: 65%;
            font-weight: bold;
        }

        /* Tables */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        table.data-table th {
            border: 1px solid #000;
            padding: 6px;
            text-align: center;
            font-weight: bold;
            font-size: 10pt;
            background-color: #f2f2f2;
        }
        table.data-table td {
            border: 1px solid #000;
            padding: 5px 6px;
            font-size: 10pt;
            vertical-align: middle;
        }
        table.data-table td.center {
            text-align: center;
        }
        table.data-table td.right {
            text-align: right;
        }

        /* Signatures block */
        .signature-section {
            width: 100%;
            margin-top: 15px;
            margin-bottom: 15px;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }
        .signature-table td {
            width: 50%;
            vertical-align: top;
        }
        .signature-box {
            padding: 5px;
            min-height: 80px;
        }
        .signature-title {
            margin-bottom: 45px;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }

        /* Examiner signatures list on Page 1 */
        .examiner-sig-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 15px;
        }
        .examiner-sig-table td {
            border: 1px solid #000;
            padding: 8px;
            font-size: 10pt;
        }
        .examiner-sig-table td.num {
            width: 5%;
            text-align: center;
        }
        .examiner-sig-table td.name {
            width: 55%;
        }
        .examiner-sig-table td.sig {
            width: 40%;
            height: 35px;
        }

        /* Standards Table at bottom of page 1 */
        .standards-section {
            margin-top: 10px;
            font-size: 8pt;
        }
        .standards-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }
        .standards-table td {
            border: 1px solid #ddd;
            padding: 2px 4px;
            font-size: 7.5pt;
            text-align: center;
        }
        .standards-table th {
            border: 1px solid #ddd;
            padding: 2px 4px;
            font-size: 7.5pt;
            background-color: #f9f9f9;
        }

        /* Page breaks */
        .page-break {
            page-break-before: always;
        }

        .text-justify {
            text-align: justify;
        }
        .font-bold {
            font-weight: bold;
        }
        .mt-4 {
            margin-top: 15px;
        }
        .mb-2 {
            margin-bottom: 8px;
        }
        .mb-4 {
            margin-bottom: 15px;
        }

        /* Saran boxes */
        .saran-box {
            border: 1px solid #000;
            width: 100%;
            min-height: 150px;
            margin-top: 5px;
            margin-bottom: 15px;
            padding: 8px;
        }
    </style>
</head>
<body>

    <!-- ==================== HALAMAN 1: BERITA ACARA ==================== -->
    <div class="kop">
        <div class="kop-logo">
            <img src="{{ public_path('logo-upnvj.png') }}" alt="Logo UPNVJ">
        </div>
        <div class="kop-text">
            <h2>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h2>
            <h3>UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA</h3>
            <h3>FAKULTAS ILMU KOMPUTER</h3>
            <p>Jalan RS. Fatmawati, Pondok Labu, Jakarta Selatan 12450</p>
            <p>Telepon 021-7656971, Fax 021-7656971</p>
            <p>Laman: www.upnvj.ac.id</p>
        </div>
    </div>

    <div class="doc-title">BERITA ACARA UJIAN SIDANG TUGAS AKHIR/SKRIPSI</div>
    <div class="doc-subtitle" style="text-align: center;">Tahun Akademik: {{ $ujian->mahasiswa->angkatan }}/{{ $ujian->mahasiswa->angkatan + 1 }} &nbsp;&nbsp;&nbsp;&nbsp; Semester: {{ $ujian->tahapan->nama_tahapan ?? 'Ujian' }}</div>

    <p class="text-justify">
        Yang bertanda tangan di bawah ini, pada hari <strong>{{ $hari }}</strong> tanggal <strong>{{ $tanggal_terbilang }}</strong> bulan <strong>{{ $bulan }}</strong> tahun <strong>{{ $tahun_terbilang }}</strong>, telah dilaksanakan Ujian Sidang Tugas Akhir:
    </p>

    <table class="info-table">
        <tr>
            <td class="label">Program Pendidikan</td>
            <td class="colon">:</td>
            <td class="value">{{ $ujian->mahasiswa->prodi->jenjang ?? 'Sarjana (S1)' }}</td>
        </tr>
        <tr>
            <td class="label">Program Studi</td>
            <td class="colon">:</td>
            <td class="value">{{ $ujian->mahasiswa->prodi->nama ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Nomor Induk Mahasiswa</td>
            <td class="colon">:</td>
            <td class="value">{{ $ujian->mahasiswa->nim ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Nama Mahasiswa</td>
            <td class="colon">:</td>
            <td class="value">{{ $ujian->mahasiswa->user->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Judul Proposal Tugas Akhir</td>
            <td class="colon">:</td>
            <td class="value" style="font-style: italic;">{{ $judul->judul ?? '-' }}</td>
        </tr>
    </table>

    <div class="font-bold mb-2">Hasil Ujian:</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 40%;">Nama Penguji</th>
                <th style="width: 25%;">Jabatan Penguji</th>
                <th style="width: 10%;">Nilai (N)</th>
                <th style="width: 10%;">Bobot (B)</th>
                <th style="width: 10%;">Nilai Akhir (N x B)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pengujiData as $index => $p)
            <tr>
                <td class="center">{{ $index + 1 }}</td>
                <td>{{ $p['nama'] }}</td>
                <td>{{ $p['jabatan'] }}</td>
                <td class="center">{{ $p['nilai'] }}</td>
                <td class="center">{{ $p['bobot_percent'] }}</td>
                <td class="center">{{ $p['nilai_akhir'] }}</td>
            </tr>
            @endforeach
            <tr style="font-weight: bold; background-color: #fafafa;">
                <td colspan="5" class="right">Jumlah :</td>
                <td class="center">{{ $totalNilaiAkhir }}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #fafafa;">
                <td colspan="5" class="right">Nilai Mutu :</td>
                <td class="center">{{ $nilaiMutu }}</td>
            </tr>
        </tbody>
    </table>

    <p class="text-justify" style="margin-bottom: 20px;">
        Berdasarkan hasil penilaian diatas, maka mahasiswa tersebut oleh penguji Ujian Sidang Tugas Akhir dinyatakan :
        <strong style="font-size: 12pt; text-transform: uppercase; background-color: #f2f2f2; padding: 2px 8px; border: 1px solid #000; margin-left: 10px;">
            {{ $isLulus ? 'LULUS' : 'TIDAK LULUS' }}
        </strong>
    </p>

    <div class="font-bold mb-2">Tanda Tangan Penguji:</div>
    <table class="examiner-sig-table">
        <tbody>
            @foreach($pengujiData as $index => $p)
            <tr>
                <td class="num">{{ $index + 1 }}.</td>
                <td class="name">
                    <strong>{{ $p['nama'] }}</strong><br>
                    <span style="font-size: 8pt; color: #555;">NIDN: {{ $p['nidn'] }} ({{ $p['jabatan'] }})</span>
                </td>
                <td class="sig" style="position: relative;">
                    @if($index % 2 == 0)
                        <span style="position: absolute; left: 10px; top: 10px; font-size: 9pt;">{{ $index + 1 }}. ...........................</span>
                    @else
                        <span style="position: absolute; left: 120px; top: 10px; font-size: 9pt;">{{ $index + 1 }}. ...........................</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signature-section">
        <table class="signature-table">
            <tr>
                <td></td>
                <td>
                    <div class="signature-box" style="margin-left: 50px;">
                        <div class="signature-title">
                            Jakarta, {{ $ujian->jadwal?->tanggal ? $ujian->jadwal->tanggal->format('d') . ' ' . $bulan . ' ' . $ujian->jadwal->tanggal->format('Y') : '-' }}<br>
                            Mengetahui/Menyetujui<br>
                            Ketua Program Studi,
                        </div>
                        <div class="signature-name">{{ $kaprodiNama }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Standar Nilai UPNVJ -->
    <div class="standards-section">
        <div class="font-bold" style="font-size: 7.5pt;">Standar Nilai :</div>
        <table class="standards-table">
            <thead>
                <tr>
                    <th>Nilai Mutu</th>
                    <th>Range Nilai</th>
                    <th>Nilai Mutu</th>
                    <th>Range Nilai</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>A</strong> (4,00)</td>
                    <td>85,00 - 100,00</td>
                    <td><strong>C+</strong> (2,50)</td>
                    <td>60,00 - 64,99</td>
                </tr>
                <tr>
                    <td><strong>A-</strong> (3,75)</td>
                    <td>80,00 - 84,99</td>
                    <td><strong>C</strong> (2,00)</td>
                    <td>55,00 - 59,99</td>
                </tr>
                <tr>
                    <td><strong>B+</strong> (3,50)</td>
                    <td>75,00 - 79,99</td>
                    <td><strong>D</strong> (1,00)</td>
                    <td>40,00 - 54,99</td>
                </tr>
                <tr>
                    <td><strong>B</strong> (3,00)</td>
                    <td>70,00 - 74,99</td>
                    <td><strong>E</strong> (0,00)</td>
                    <td>1,00 - 39,99</td>
                </tr>
                <tr>
                    <td><strong>B-</strong> (2,75)</td>
                    <td>65,00 - 69,99</td>
                    <td><strong>T</strong> (-)</td>
                    <td>-</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- ==================== DETAIL PENILAIAN PENGUJI ==================== -->
    @foreach($pengujiData as $index => $p)
        @if($p['jabatan'] !== 'Pembimbing')
            <!-- ==================== HALAMAN PENILAIAN PENGUJI ==================== -->
            <div class="page-break"></div>

            <div class="kop">
                <div class="kop-logo">
                    <img src="{{ public_path('logo-upnvj.png') }}" alt="Logo UPNVJ">
                </div>
                <div class="kop-text">
                    <h2>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h2>
                    <h3>UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA</h3>
                    <h3>FAKULTAS ILMU KOMPUTER</h3>
                </div>
            </div>

            <div class="doc-title">LEMBAR PENILAIAN UJIAN SIDANG TUGAS AKHIR/SKRIPSI</div>
            <div class="doc-subtitle" style="text-align: center;">Tahun Akademik: {{ $ujian->mahasiswa->angkatan }}/{{ $ujian->mahasiswa->angkatan + 1 }}</div>

            <table class="info-table">
                <tr>
                    <td class="label">Program Pendidikan</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->jenjang ?? 'Sarjana (S1)' }}</td>
                </tr>
                <tr>
                    <td class="label">Program Studi</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nomor Induk Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->nim ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nama Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->user->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Judul Proposal Tugas Akhir</td>
                    <td class="colon">:</td>
                    <td class="value" style="font-style: italic;">{{ $judul->judul ?? '-' }}</td>
                </tr>
            </table>

            <div class="font-bold mb-2">Hasil Ujian:</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">No.</th>
                        <th style="width: 52%;">Faktor Penilaian</th>
                        <th style="width: 20%;">Nilai Maksimum</th>
                        <th style="width: 20%;">Nilai Penguji</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="center">1</td>
                        <td>
                            <strong>Presentasi / Penyajian</strong><br>
                            - Penggunaan sarana & efisiensi alokasi waktu yang digunakan<br>
                            - Tingkat kemampuan menjelaskan
                        </td>
                        <td class="center">15.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr>
                        <td class="center">2</td>
                        <td>
                            <strong>Teknik Penulisan Tugas Akhir / Skripsi</strong><br>
                            - Penggunaan standarisasi format penulisan sesuai panduan<br>
                            - Keutuhan dan kelengkapan<br>
                            - Kerapihan
                        </td>
                        <td class="center">25.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr>
                        <td class="center">3</td>
                        <td>
                            <strong>Materi Tugas Akhir / Skripsi</strong><br>
                            - Tingkat pemahaman terhadap pokok permasalahan<br>
                            - Tingkat pendekatan penyelesaian masalah<br>
                            - Kemampuan menjelaskan/menjawab pertanyaan dengan benar
                        </td>
                        <td class="center">60.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr style="font-weight: bold; background-color: #fafafa;">
                        <td colspan="2" class="right">Jumlah</td>
                        <td class="center">100.00</td>
                        <td class="center" style="font-size: 11pt; text-decoration: underline;">{{ $p['nilai'] }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="signature-section" style="margin-top: 30px;">
                <table class="signature-table">
                    <tr>
                        <td></td>
                        <td>
                            <div class="signature-box" style="margin-left: 50px;">
                                <div class="signature-title">
                                    Jakarta, {{ $ujian->jadwal?->tanggal ? $ujian->jadwal->tanggal->format('d') . ' ' . $bulan . ' ' . $ujian->jadwal->tanggal->format('Y') : '-' }}<br>
                                    {{ $p['jabatan'] }},
                                </div>
                                <div class="signature-name" style="margin-top: 50px;">{{ $p['nama'] }}</div>
                                <div style="font-size: 9pt;">NIDN: {{ $p['nidn'] }}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- ==================== HALAMAN SARAN PENGUJI ==================== -->
            <div class="page-break"></div>

            <div class="kop">
                <div class="kop-logo">
                    <img src="{{ public_path('logo-upnvj.png') }}" alt="Logo UPNVJ">
                </div>
                <div class="kop-text">
                    <h2>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h2>
                    <h3>UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA</h3>
                    <h3>FAKULTAS ILMU KOMPUTER</h3>
                </div>
            </div>

            <div class="doc-title">LEMBAR SARAN UJIAN SIDANG TUGAS AKHIR/SKRIPSI</div>
            <div class="doc-subtitle" style="text-align: center;">Tahun Akademik: {{ $ujian->mahasiswa->angkatan }}/{{ $ujian->mahasiswa->angkatan + 1 }}</div>

            <table class="info-table">
                <tr>
                    <td class="label">Program Pendidikan</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->jenjang ?? 'Sarjana (S1)' }}</td>
                </tr>
                <tr>
                    <td class="label">Program Studi</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nomor Induk Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->nim ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nama Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->user->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Judul Proposal Tugas Akhir</td>
                    <td class="colon">:</td>
                    <td class="value" style="font-style: italic;">{{ $judul->judul ?? '-' }}</td>
                </tr>
            </table>

            <div class="font-bold mt-4">Pertanyaan Pokok:</div>
            <div class="saran-box">
                @if($p['catatan'])
                    <span style="font-size: 10pt; font-family: monospace;">{{ $p['catatan'] }}</span>
                @else
                    <div style="height: 120px; border-bottom: 1px dotted #ccc; margin-bottom: 10px;"></div>
                    <div style="height: 120px;"></div>
                @endif
            </div>

            <div class="font-bold">Kesimpulan dan Saran:</div>
            <div class="saran-box" style="min-height: 120px;">
                <div style="height: 90px; border-bottom: 1px dotted #ccc; margin-bottom: 10px;"></div>
                <div style="height: 90px;"></div>
            </div>

            <div class="signature-section" style="margin-top: 30px;">
                <table class="signature-table">
                    <tr>
                        <td></td>
                        <td>
                            <div class="signature-box" style="margin-left: 50px;">
                                <div class="signature-title">
                                    Jakarta, {{ $ujian->jadwal?->tanggal ? $ujian->jadwal->tanggal->format('d') . ' ' . $bulan . ' ' . $ujian->jadwal->tanggal->format('Y') : '-' }}<br>
                                    {{ $p['jabatan'] }},
                                </div>
                                <div class="signature-name" style="margin-top: 50px;">{{ $p['nama'] }}</div>
                                <div style="font-size: 9pt;">NIDN: {{ $p['nidn'] }}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

        @else
            <!-- ==================== HALAMAN PENILAIAN BIMBINGAN (PEMBIMBING) ==================== -->
            <div class="page-break"></div>

            <div class="kop">
                <div class="kop-logo">
                    <img src="{{ public_path('logo-upnvj.png') }}" alt="Logo UPNVJ">
                </div>
                <div class="kop-text">
                    <h2>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</h2>
                    <h3>UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA</h3>
                    <h3>FAKULTAS ILMU KOMPUTER</h3>
                </div>
            </div>

            <div class="doc-title">LEMBAR PENILAIAN BIMBINGAN TUGAS AKHIR/SKRIPSI</div>
            <div class="doc-subtitle" style="text-align: center;">Tahun Akademik: {{ $ujian->mahasiswa->angkatan }}/{{ $ujian->mahasiswa->angkatan + 1 }}</div>

            <table class="info-table">
                <tr>
                    <td class="label">Program Pendidikan</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->jenjang ?? 'Sarjana (S1)' }}</td>
                </tr>
                <tr>
                    <td class="label">Program Studi</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->prodi->nama ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nomor Induk Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->nim ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nama Mahasiswa</td>
                    <td class="colon">:</td>
                    <td class="value">{{ $ujian->mahasiswa->user->name ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Judul Proposal Tugas Akhir</td>
                    <td class="colon">:</td>
                    <td class="value" style="font-style: italic;">{{ $judul->judul ?? '-' }}</td>
                </tr>
            </table>

            <div class="font-bold mb-2">Hasil Penilaian Bimbingan:</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">No.</th>
                        <th style="width: 52%;">Faktor Penilaian</th>
                        <th style="width: 20%;">Nilai Maksimum</th>
                        <th style="width: 20%;">Nilai Pembimbing</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="center">1</td>
                        <td>
                            <strong>Sikap</strong><br>
                            - Kedisiplinan selama pembimbingan<br>
                            - Kemauan berusaha<br>
                            - Kemandirian
                        </td>
                        <td class="center">30.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr>
                        <td class="center">2</td>
                        <td>
                            <strong>Teknik Penulisan Skripsi</strong><br>
                            - Penggunaan standarisasi format penulisan sesuai panduan<br>
                            - Keutuhan dan Kelengkapan<br>
                            - Kerapihan
                        </td>
                        <td class="center">30.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr>
                        <td class="center">3</td>
                        <td>
                            <strong>Penerapan Proses Ilmiah</strong><br>
                            - Kemampuan melakukan analisis permasalahan<br>
                            - Kemampuan memberikan solusi<br>
                            - Kemampuan melakukan kajian teoritis dan studi relevan<br>
                            - Penguasaan pengetahuan pada bidang ilmunya
                        </td>
                        <td class="center">40.00</td>
                        <td class="center"></td>
                    </tr>
                    <tr style="font-weight: bold; background-color: #fafafa;">
                        <td colspan="2" class="right">Jumlah</td>
                        <td class="center">100.00</td>
                        <td class="center" style="font-size: 11pt; text-decoration: underline;">{{ $p['nilai'] }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="signature-section" style="margin-top: 40px;">
                <table class="signature-table">
                    <tr>
                        <td></td>
                        <td>
                            <div class="signature-box" style="margin-left: 50px;">
                                <div class="signature-title">
                                    Jakarta, {{ $ujian->jadwal?->tanggal ? $ujian->jadwal->tanggal->format('d') . ' ' . $bulan . ' ' . $ujian->jadwal->tanggal->format('Y') : '-' }}<br>
                                    Pembimbing,
                                </div>
                                <div class="signature-name" style="margin-top: 55px;">{{ $p['nama'] }}</div>
                                <div style="font-size: 9pt;">NIDN: {{ $p['nidn'] }}</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        @endif
    @endforeach

</body>
</html>
