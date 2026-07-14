// packages
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ParedeExportData {
  parede: string;
  items: {
    alias: string;
    dimensoes: string;
    tramas: string;
  }[];
}

export interface ExportTrama {
  id: number;
  nome: string;
}

export interface ExportModelo {
  nome: string;
  requisitos?: {
    parede?: string;
    tipo: string;
    alias?: string;
    tipoPlaca?: {
      largura: number;
      altura: number;
      tramaEsquerdaId?: number;
      tramaDireitaId?: number;
      tramaSuperiorId?: number;
      tramaInferiorId?: number;
    };
    corte?: {
      nome?: string;
      largura?: number;
      altura?: number;
      percurso?: { distancia: number }[];
    };
  }[];
}

const formatMeasure = (val: number | undefined): string => {
  if (val === undefined || val === null) return "0";
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(val);
};

const buildExportData = (modelo: ExportModelo, allTramas: ExportTrama[]): ParedeExportData[] => {
  const requisitos = modelo.requisitos || [];
  const grouped: Record<string, ParedeExportData> = {};

  requisitos.forEach((item) => {
    const pNome = item.parede || "Geral";
    if (!grouped[pNome]) {
      grouped[pNome] = { parede: pNome, items: [] };
    }

    let dimensoes = "—";
    if (item.tipo === "PLACA_LISA") {
      dimensoes = item.tipoPlaca ? `${formatMeasure(item.tipoPlaca.largura)} x ${formatMeasure(item.tipoPlaca.altura)}` : "—";
    } else if (item.tipo === "CORTE_ESPECIFICO" && item.corte) {
      const percurso = Array.isArray(item.corte.percurso)
        ? item.corte.percurso
        : [];

      // Se for retangular (4 lados), exibe apenas largura x altura conforme solicitado
      if (percurso.length === 4) {
        dimensoes = `${formatMeasure(item.corte.largura)} x ${formatMeasure(item.corte.altura)}`;
      } else {
        // Caso contrário, exibe o valor bruto das medidas do percurso
        dimensoes = percurso.map((v: { distancia: number }) => formatMeasure(v.distancia)).join(" x ");
      }
    }

    // Tenta extrair tramas baseando-se na presença de ID nos requisitos
    const tramasSet = new Set<string>();
    const tramaIds = [
      item.tipoPlaca?.tramaEsquerdaId,
      item.tipoPlaca?.tramaDireitaId,
      item.tipoPlaca?.tramaSuperiorId,
      item.tipoPlaca?.tramaInferiorId,
    ].filter(Boolean);

    tramaIds.forEach((id) => {
      const found = allTramas.find((t) => t.id === id);
      if (found) {
        tramasSet.add(found.nome);
      }
    });

    const tramasStr =
      tramasSet.size > 0 ? Array.from(tramasSet).join(", ") : "—";

    grouped[pNome].items.push({
      alias:
        item.alias ||
        (item.tipo === "PLACA_LISA" ? "Placa Lisa" : item.corte?.nome) ||
        "Sem Nome",
      dimensoes: dimensoes,
      tramas: tramasStr,
    });
  });

  return Object.values(grouped);
};

export const exportToPDF = (modelo: ExportModelo, allTramas: ExportTrama[]) => {
  const data = buildExportData(modelo, allTramas);
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Mapa de Cortes - ${modelo.nome}`, 14, 20);

  let currentY = 30;

  data.forEach((paredeGroup) => {
    // Título da parede
    doc.setFontSize(12);
    doc.text(paredeGroup.parede, 14, currentY);
    currentY += 5;

    const tableData = paredeGroup.items.map((i) => [
      i.alias,
      i.dimensoes,
      i.tramas,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["NOME", "MEDIDAS (cm)", "TRAMAS"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 45 }, // NOME
        1: { cellWidth: 90 }, // MEDIDAS (cm)
        2: { cellWidth: 47 }, // TRAMAS
      },
      margin: { left: 14 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  });

  doc.save(`Mapa_Cortes_${modelo.nome.replace(/\s+/g, "_")}.pdf`);
};

export const exportToExcel = async (modelo: ExportModelo, allTramas: ExportTrama[]) => {
  const data = buildExportData(modelo, allTramas);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema Balneário";
  workbook.created = new Date();

  data.forEach((paredeGroup) => {
    // Nomes de abas tem limite no Excel (31 caracteres)
    const sheetName = paredeGroup.parede.substring(0, 31);
    const worksheet = workbook.addWorksheet(sheetName);

    // Definindo as colunas
    worksheet.columns = [
      { header: "NOME", key: "nome", width: 15 },
      { header: "MEDIDAS (cm)", key: "medidas", width: 35 },
      { header: "TRAMAS", key: "tramas", width: 15 },
    ];

    // Estilizando o cabeçalho
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2980B9" },
    };

    // Adicionando as linhas
    paredeGroup.items.forEach((item) => {
      worksheet.addRow({
        nome: item.alias,
        medidas: item.dimensoes,
        tramas: item.tramas,
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  // Criar o download nativo via Blob
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Mapa_Cortes_${modelo.nome.replace(/\s+/g, "_")}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToCSV = (modelo: ExportModelo, allTramas: ExportTrama[]) => {
  const data = buildExportData(modelo, allTramas);
  let csvContent = "Parede,Nome,Medidas,Tramas\n";

  data.forEach((paredeGroup) => {
    paredeGroup.items.forEach((item) => {
      // Escape strings containing commas with double quotes
      const escape = (str: string) => `"${str.replace(/"/g, '""')}"`;
      csvContent += `${escape(paredeGroup.parede)},${escape(item.alias)},${escape(item.dimensoes)},${escape(item.tramas)}\n`;
    });
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Mapa_Cortes_${modelo.nome.replace(/\s+/g, "_")}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const printExport = (modelo: ExportModelo, allTramas: ExportTrama[]) => {
  const data = buildExportData(modelo, allTramas);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  let htmlContent = `
    <html>
      <head>
        <title>Mapa de Cortes - ${modelo.nome}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          h2 { margin-top: 30px; border-bottom: 2px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2980b9; color: white; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="padding: 10px 20px; margin-bottom: 20px; cursor: pointer;">Imprimir Relatório</button>
        <h1>Mapa de Cortes - ${modelo.nome}</h1>
  `;

  data.forEach((paredeGroup) => {
    htmlContent += `
      <h2>${paredeGroup.parede}</h2>
      <table>
        <thead>
          <tr>
            <th>NOME</th>
            <th>MEDIDAS (cm)</th>
            <th>TRAMAS</th>
          </tr>
        </thead>
        <tbody>
    `;

    paredeGroup.items.forEach((item) => {
      htmlContent += `
          <tr>
            <td>${item.alias}</td>
            <td>${item.dimensoes}</td>
            <td>${item.tramas}</td>
          </tr>
      `;
    });

    htmlContent += `
        </tbody>
      </table>
    `;
  });

  htmlContent += `
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
};
