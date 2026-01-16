import * as XLSX from 'xlsx-js-style';

export function exportAnalysisToExcel({ subjectName, className, questionKeys, students, answers, weights, scale, analysisResults, cronbachAlpha, semValue }) {
  const wb = XLSX.utils.book_new();
  const data = [];

  // Format tanggal dd-mm-yyyy
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  // Metadata dengan styling
  data.push([`Mata Pelajaran:`, subjectName || '']);
  data.push([`Kelas:`, className || '']);
  data.push([`Tanggal:`, formattedDate]);
  data.push([]);

  // === TABEL NILAI SISWA ===
  // Header 1: Nomor Soal
  const headerRow1 = ['No', 'Nama Siswa'];
  questionKeys.forEach(k => {
    headerRow1.push(k.replace('Q', 'Soal '));
  });
  headerRow1.push('Nilai Akhir');
  data.push(headerRow1);

  // Header 2: Total Bobot
  const headerRow2 = ['', 'Total Bobot'];
  questionKeys.forEach(k => {
    const bobot = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
    headerRow2.push(bobot);
  });
  const totalBobot = questionKeys.reduce((sum, k) => sum + ((weights && weights[k] !== undefined) ? Number(weights[k]) : 1), 0);
  headerRow2.push(totalBobot.toFixed(2));
  data.push(headerRow2);

  const headerStartRow = data.length - 2; // Row index untuk header (0-based)

  // Student rows
  students.forEach((s, idx) => {
    const row = [idx + 1, s.nama_siswa];
    let totalBobotSiswa = 0;
    let totalBobotNilai = 0;
    let hadAny = false;

    questionKeys.forEach(k => {
      const v = (answers[s.id_siswa] && answers[s.id_siswa][k]) !== undefined ? answers[s.id_siswa][k] : '';
      row.push(v === '' ? '' : Number(v));
      const bobot = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      totalBobotNilai += bobot;
      if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) {
        totalBobotSiswa += Number(v);
        hadAny = true;
      }
    });

    const nilaiAkhir = hadAny && totalBobotNilai > 0 ? (totalBobotSiswa / totalBobotNilai) * 100 : null;
    row.push(nilaiAkhir === null ? '' : nilaiAkhir.toFixed(2));
    data.push(row);
  });

  // === ANALISIS DI BAWAH SETIAP SOAL ===
  // Row #Resp
  const respRow = ['#Resp', ''];
  questionKeys.forEach(k => {
    const result = analysisResults.find(r => r.question === k);
    respRow.push(result ? (result.n || 0) : 0);
  });
  respRow.push('');
  data.push(respRow);

  // Row p-value
  const pValueRow = ['p-value', ''];
  questionKeys.forEach(k => {
    const result = analysisResults.find(r => r.question === k);
    pValueRow.push(result && result.p_value !== null ? result.p_value.toFixed(3) : '-');
  });
  pValueRow.push('');
  data.push(pValueRow);

  // Row Mean %
  const meanRow = ['Mean %', ''];
  questionKeys.forEach(k => {
    const result = analysisResults.find(r => r.question === k);
    meanRow.push(result && result.mean !== null ? (result.mean * 100).toFixed(1) + '%' : '-');
  });
  meanRow.push('');
  data.push(meanRow);

  // Row Difficulty
  const diffRow = ['Difficulty', ''];
  questionKeys.forEach(k => {
    const result = analysisResults.find(r => r.question === k);
    diffRow.push(result ? (result.difficulty || '-') : '-');
  });
  diffRow.push('');
  data.push(diffRow);

  const analysisRowStart = data.length - 4; // Start row of analysis section

  data.push([]);
  data.push([]);

  // === RANGKUMAN ANALISIS SOAL ===
  data.push(['', 'RANGKUMAN ANALISIS SOAL']);
  data.push([]);
  
  // Categorize questions by difficulty
  const mudah = analysisResults.filter(r => r.difficulty === 'Mudah');
  const sedang = analysisResults.filter(r => r.difficulty === 'Sedang');
  const sukar = analysisResults.filter(r => r.difficulty === 'Sukar');
  
  // Summary boxes
  const summaryStartRow = data.length;
  data.push(['Kategori', 'Jumlah Soal', 'Nomor Soal']);
  data.push(['MUDAH (p-value ≥ 70%)', mudah.length, mudah.length > 0 ? mudah.map(r => r.question.replace('Q', '')).join(', ') : '-']);
  data.push(['SEDANG (p-value 31-69%)', sedang.length, sedang.length > 0 ? sedang.map(r => r.question.replace('Q', '')).join(', ') : '-']);
  data.push(['SUKAR (p-value ≤ 30%)', sukar.length, sukar.length > 0 ? sukar.map(r => r.question.replace('Q', '')).join(', ') : '-']);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const cols = [
    { wch: 12 },  // No / Label
    { wch: 30 }, // Nama Siswa
    ...questionKeys.map(() => ({ wch: 10 })), // Soal
    { wch: 12 }  // Nilai Akhir
  ];
  ws['!cols'] = cols;

  // === APPLY STYLING ===
  const range = XLSX.utils.decode_range(ws['!ref']);
  
  // Apply borders to ALL cells
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) {
        ws[cellAddress] = { t: 's', v: '' };
      }
      
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      
      // Default border untuk semua cell
      ws[cellAddress].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
    }
  }

  // Header styling (Row 1: Nomor Soal)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerStartRow, c: C });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        fill: { patternType: 'solid', fgColor: { rgb: 'F9FAFB' } },
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'medium', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }

  // Header Row 2: Total Bobot (background abu-abu)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: headerStartRow + 1, c: C });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'medium', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }

  // Analysis rows styling (below student data)
  for (let R = analysisRowStart; R < analysisRowStart + 4; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (ws[cellAddress]) {
        // Label column (column 0)
        if (C === 0) {
          ws[cellAddress].s = {
            fill: { patternType: 'solid', fgColor: { rgb: 'F3F4F6' } },
            font: { bold: true },
            alignment: { horizontal: 'left', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
        } else if (C >= 2 && C < 2 + questionKeys.length) {
          // Question columns - center align
          ws[cellAddress].s = {
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
          
          // Difficulty row - add color coding
          if (R === analysisRowStart + 3) {
            const val = ws[cellAddress].v;
            let bgColor = 'FFFFFF';
            if (val === 'Mudah') bgColor = 'BBF7D0';
            else if (val === 'Sedang') bgColor = 'FEF08A';
            else if (val === 'Sukar') bgColor = 'FECACA';
            
            ws[cellAddress].s = {
              fill: { patternType: 'solid', fgColor: { rgb: bgColor } },
              font: { bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
              }
            };
          }
        }
      }
    }
  }

  // Summary header styling - title di kolom 1 (Nama Siswa)
  const summaryTitleCell = XLSX.utils.encode_cell({ r: summaryStartRow - 2, c: 1 });
  if (ws[summaryTitleCell]) {
    ws[summaryTitleCell].s = {
      font: { bold: true, sz: 14 },
      fill: { patternType: 'solid', fgColor: { rgb: 'DBEAFE' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };
  }
  
  // Summary table header
  for (let C = 0; C <= 2; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: summaryStartRow, c: C });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        fill: { patternType: 'solid', fgColor: { rgb: 'E5E7EB' } },
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: '000000' } },
          bottom: { style: 'thin', color: { rgb: '000000' } },
          left: { style: 'thin', color: { rgb: '000000' } },
          right: { style: 'thin', color: { rgb: '000000' } }
        }
      };
    }
  }
  
  // Summary rows color coding
  const summaryColors = [
    { row: summaryStartRow + 1, color: 'BBF7D0' }, // Mudah
    { row: summaryStartRow + 2, color: 'FEF08A' }, // Sedang
    { row: summaryStartRow + 3, color: 'FECACA' }  // Sukar
  ];
  
  summaryColors.forEach(({ row, color }) => {
    for (let C = 0; C <= 2; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          fill: { patternType: 'solid', fgColor: { rgb: color } },
          font: { bold: C === 0 },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      }
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Analisis Soal');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `analisis_soal_${subjectName || className || 'analysis'}_${new Date().getTime()}.xlsx`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}