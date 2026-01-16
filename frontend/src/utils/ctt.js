// frontend/src/utils/ctt.js

// Utility functions for Classical Test Theory (CTT) analysis
export const getDefaultForScale = (scale) => {
  if (scale === 'binary') return { max: 1, threshold: 1 };
  if (scale === '5') return { max: 5, threshold: 4 };
  if (scale === '100') return { max: 100, threshold: 60 };
  if (scale === 'custom') return { max: 4, threshold: 3 }; // default for custom, user can edit per question
  return { max: 1, threshold: 1 };
};

const pearson = (x, y) => {
  if (!x || !y || x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const mx = x.reduce((a,b)=>a+b,0)/n;
  const my = y.reduce((a,b)=>a+b,0)/n;
  const num = x.reduce((s,xi,i)=>s + (xi-mx)*(y[i]-my),0);
  const sx = Math.sqrt(x.reduce((s,xi)=>s + (xi-mx)**2,0));
  const sy = Math.sqrt(y.reduce((s,yi)=>s + (yi-my)**2,0));
  const den = sx * sy;
  return den === 0 ? 0 : (num / den);
};

const varianceArr = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const m = arr.reduce((a,b)=>a+b,0)/arr.length;
  return arr.reduce((s,x)=>s + (x-m)*(x-m),0) / arr.length;
};

// Main exported function
export function runCTTAnalysis({
  itemKeys,
  questionKeys,
  analysisStudents,
  answers,
  weights,
  questionWeights,
  maxes,
  scale,
  rekapTableData,
  computeStudentTotalFromAnswers,
}) {
  const results = [];
  const students = (analysisStudents && analysisStudents.length>0) ? analysisStudents : (rekapTableData || []).map(r=>({ id_siswa: r.id_siswa, nama_siswa: r.nama_siswa }));
  const defMax = getDefaultForScale(scale).max;

  // Also precompute per-student weighted totals (weighted fraction / totalWeight) to use as totals for point-biserial
  const studentTotals = students.map(s => {
    const row = answers[s.id_siswa] || {};
    let weightedPoints = 0; let totalWeight = 0;
    itemKeys.forEach(k => {
      const v = row[k];
      // Bobot = Max Score
      const bobot = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) { weightedPoints += (Number(v) / (bobot>0?bobot:1)) * bobot; }
      totalWeight += bobot;
    });
    return (totalWeight > 0) ? (weightedPoints / totalWeight) : null;
  });

  // Build per-student fraction matrix (0..1), null if missing
  const studentMap = students.map(s => {
    const row = answers[s.id_siswa] || {};
    const fr = {};
    itemKeys.forEach(k => {
      const v = row[k];
      // Bobot = Max Score
      const bobot = (weights && weights[k] !== undefined) ? Number(weights[k]) : 1;
      // DEBUG: Log first question calculation
      if (k === itemKeys[0] && s === students[0]) {
        console.log('🔍 DEBUG CTT Calculation:');
        console.log(`  Question: ${k}`);
        console.log(`  Student: ${s.nama_siswa || s.id_siswa}`);
        console.log(`  Value (v): ${v}`);
        console.log(`  Bobot (weights[k]): ${weights ? weights[k] : 'weights is null'}`);
        console.log(`  Calculated bobot: ${bobot}`);
        console.log(`  Fraction (v/bobot): ${v} / ${bobot} = ${Number(v) / bobot}`);
        console.log(`  Scale: ${scale}, defMax: ${defMax}`);
      }
      if (v !== '' && v !== undefined && v !== null && !isNaN(Number(v))) fr[k] = Number(v) / (bobot > 0 ? bobot : 1); else fr[k] = null;
    });
    return { id: s.id_siswa, fractions: fr };
  });

  // Totals used for point-biserial (weighted average as before)
  const totals = (itemKeys === questionKeys) ? studentTotals : (rekapTableData || []).map(r => computeStudentTotalFromAnswers ? computeStudentTotalFromAnswers(r) : null);

  // Prepare arrays per item for variance/cronbach
  const kItems = itemKeys.length;
  const scoresMatrix = studentMap.map(sm => itemKeys.map(k => (sm.fractions[k] === null ? 0 : sm.fractions[k])));

  const itemVars = itemKeys.map((k, idx) => varianceArr(scoresMatrix.map(r => r[idx])));
  const totalScores = scoresMatrix.map(r => r.reduce((a,b)=>a+b, 0));
  const varTotal = varianceArr(totalScores);

  let alpha = null; let sem = null;
  if (kItems > 1 && varTotal > 0) {
    const sumItemVars = itemVars.reduce((a,b)=>a+b,0);
    alpha = (kItems / (kItems - 1)) * (1 - (sumItemVars / varTotal));
    const sdTotal = Math.sqrt(varTotal);
    sem = alpha !== null ? (sdTotal * Math.sqrt(1 - alpha)) : null;
  }

  for (let ik=0; ik<itemKeys.length; ik++) {
    const key = itemKeys[ik];
    const weight = (weights && weights[key] !== undefined) ? Number(weights[key]) : (questionWeights && questionWeights[key] !== undefined ? Number(questionWeights[key]) : 1);

    const itemValues = [];
    const pbPairs = [];

    studentMap.forEach((sm, idx) => {
      const frac = sm.fractions[key];
      if (frac !== null) {
        itemValues.push(frac);
        const tot = totals[idx];
        if (tot != null) pbPairs.push([frac, tot]);
      }
    });

    const n = itemValues.length;
    const mean = n===0 ? null : (itemValues.reduce((a,b)=>a+b,0) / n);
    // P-value per new spec = mean fraction (meanScore / max). Keep null if no data.
    const p = mean === null ? null : mean;

    let pb = null;
    if (pbPairs.length > 2) {
      const xs = pbPairs.map(p=>p[0]);
      const ys = pbPairs.map(p=>p[1]);
      pb = pearson(xs, ys);
    }

    // corrected item-total correlation
    const itcPairsX = [];
    const itcPairsY = [];
    studentMap.forEach((sm) => {
      const frac = sm.fractions[key];
      if (frac === null) return;
      let sumOther = 0; let cntOther = 0;
      itemKeys.forEach(k2 => { if (k2 !== key) { const v = sm.fractions[k2]; if (v !== null) { sumOther += v; cntOther++; } } });
      if (cntOther === 0) return;
      const totalExcl = sumOther / cntOther;
      itcPairsX.push(frac);
      itcPairsY.push(totalExcl);
    });
    let itc = null;
    if (itcPairsX.length > 2) itc = pearson(itcPairsX, itcPairsY);

    results.push({
      question: key,
      weight,
      n,
      nCorrect: itemValues.reduce((c,v)=> c + (v !== null && v >= 1 - 1e-9 ? 1 : 0), 0),
      p_value: p,
      mean: mean,
      point_biserial: pb,
      item_total_corr: itc,
      difficulty: null // consumer can call classifyByP locally if needed
    });
  }

  return { results, cronbachAlpha: alpha, semValue: sem };
}

export function exportCTTAnalysisToExcel(params) {
  // dynamic import to avoid bundling XLSX in main bundle
  return import('../features/guru/exportExcelHelper').then(mod => mod.exportAnalysisToExcel(params));
}
