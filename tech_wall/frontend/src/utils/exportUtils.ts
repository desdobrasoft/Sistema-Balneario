import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

export interface ColumnDef {
  header: string;
  key: string;
  width?: number;
}

export const generatePDF = (title: string, columns: ColumnDef[], data: Record<string, unknown>[], type: 'DOWNLOAD' | 'PRINT' = 'DOWNLOAD') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  const tableData = data.map(row => columns.map(col => String(row[col.key] || '')));

  autoTable(doc, {
    startY: 30,
    head: [columns.map(c => c.header)],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  if (type === 'PRINT') {
    doc.autoPrint();
    const blob = doc.output('bloburl');
    window.open(blob, '_blank');
  } else {
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  }
};

export const generateExcel = async (title: string, columns: ColumnDef[], data: Record<string, unknown>[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  worksheet.columns = columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  data.forEach(row => {
    worksheet.addRow(row);
  });

  worksheet.getRow(1).font = { bold: true };
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

export const generateCSV = (title: string, columns: ColumnDef[], data: Record<string, unknown>[]) => {
  const headerRow = columns.map(c => `"${c.header}"`).join(';');
  const dataRows = data.map(row => 
    columns.map(c => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(';')
  );

  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const handleExportFormat = (
  format: 'PDF' | 'CSV' | 'XLSX' | 'PRINT',
  title: string,
  columns: ColumnDef[],
  data: Record<string, unknown>[]
) => {
  switch (format) {
    case 'PDF':
      generatePDF(title, columns, data, 'DOWNLOAD');
      break;
    case 'PRINT':
      generatePDF(title, columns, data, 'PRINT');
      break;
    case 'XLSX':
      generateExcel(title, columns, data);
      break;
    case 'CSV':
      generateCSV(title, columns, data);
      break;
  }
};
