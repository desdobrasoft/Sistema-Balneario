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
    largura?: number;
    altura?: number;
    alias?: string;
    corte?: {
      nome?: string;
      largura?: number;
      altura?: number;
      percurso?: { distancia: number }[];
    };
    tramaEsquerdaId?: number;
    tramaDireitaId?: number;
    tramaSuperiorId?: number;
    tramaInferiorId?: number;
  }[];
}

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
      dimensoes = `${item.largura} x ${item.altura}`;
    } else if (item.tipo === "CORTE_ESPECIFICO" && item.corte) {
      const percurso = Array.isArray(item.corte.percurso)
        ? item.corte.percurso
        : [];

      // Se for retangular (4 lados), exibe apenas largura x altura conforme solicitado
      if (percurso.length === 4) {
        dimensoes = `${item.corte.largura} x ${item.corte.altura}`;
      } else {
        // Caso contrário, exibe o valor bruto das medidas do percurso
        dimensoes = percurso.map((v: { distancia: number }) => v.distancia).join(" x ");
      }
    }

    // Tenta extrair tramas baseando-se na presença de ID nos requisitos
    const tramasSet = new Set<string>();
    const tramaIds = [
      item.tramaEsquerdaId,
      item.tramaDireitaId,
      item.tramaSuperiorId,
      item.tramaInferiorId,
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
