import * as XLSX from 'xlsx';

export function exportAnalysisToExcel({ subjectName, className, questionKeys, students, answers, weights, maxes, scale, analysisResults, cronbachAlpha, semValue }) {
  const wb = XLSX.utils.book_new();
  const data = [];

  // Metadata
  data.push([`Mata Pelajaran:`, subjectName || '']);
  data.push([`Kelas:`, className || '']);
  data.push([`Tanggal:`, new Date().toLocaleString()]);
  data.push([]);

  // Student table header
  const header = ['No', 'Nama Siswa', ...questionKeys, 'Weighted Points', 'Total Weight', 'Percent'];
  data.push(header);

  // Student rows
  students.forEach((s, idx) => {
    const row = [idx+1, s.nama_siswa];
    let weightedPoints = 0; let totalWeight = 0; let hadAny = false;
    questionKeys.forEach(k => {
      const v = (answers[s.id_siswa] && answers[s.id_siswa][k]) !== undefined ? answers[s.id_siswa][k] : '';
      row.push(v);
      const m = (maxes && maxes[k]) ? Number(maxes[k]) : (scale === '5' ? 5 : (scale === '100' ? 100 : 1));
      const w = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) { weightedPoints += (Number(v) / (m>0?m:1)) * w; hadAny = true; }
      totalWeight += w;
    });
    const percent = hadAny && totalWeight>0 ? (weightedPoints / totalWeight) : null;
    row.push(weightedPoints);
    row.push(totalWeight);
    row.push(percent === null ? '' : (percent * 100).toFixed(1) + '%');
    data.push(row);
  });

  data.push([]);

  // Analysis results table
  data.push(['Soal', 'N', 'p-value', 'Mean %', 'Item-Total Corr', 'Point-Biserial', 'Difficulty', 'Bobot']);
  analysisResults.forEach(r => {
    data.push([
      r.question,
      r.n,
      r.p_value === null ? '' : r.p_value.toFixed(3),
      r.mean === null ? '' : (r.mean * 100).toFixed(1) + '%',
      r.item_total_corr === null ? '' : r.item_total_corr.toFixed(3),
      r.point_biserial === null ? '' : r.point_biserial.toFixed(3),
      r.difficulty || '',
      r.weight || ''
    ]);
  });

  data.push([]);
  data.push(['Cronbach Alpha', cronbachAlpha === null ? '' : cronbachAlpha.toFixed(3)]);
  data.push(['SEM', semValue === null ? '' : semValue.toFixed(3)]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths a bit
  const cols = [{ wch: 5 }, { wch: 25 }].concat(questionKeys.map(()=>({ wch: 8 }))).concat([{ wch: 12 }, { wch: 12 }, { wch: 10 }]);
  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, 'Analisis Soal');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `analysis_${subjectName || className || 'analysis'}.xlsx`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}