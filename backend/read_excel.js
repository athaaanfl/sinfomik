const XLSX = require('xlsx');

const filePath = 'c:\\Users\\Han\\Desktop\\sinfomik\\backup9\\sinfomik\\Pemetaan CP -  Rise Up! (1).xlsx';

console.log('Reading Excel file:', filePath);

try {
    const workbook = XLSX.readFile(filePath);
    
    console.log('\n=== SHEET NAMES ===');
    console.log(workbook.SheetNames.join(', '));
    
    // Read first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    console.log('\n=== SHEET:', firstSheetName, '===');
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    console.log('\nTotal Rows:', data.length);
    console.log('\n=== FIRST 30 ROWS ===\n');
    
    // Print first 30 rows
    data.slice(0, 30).forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`, JSON.stringify(row));
    });
    
    // Also check if there are merged cells or special formatting
    console.log('\n=== RANGE ===');
    console.log(worksheet['!ref']);
    
} catch (error) {
    console.error('Error reading Excel:', error.message);
}
