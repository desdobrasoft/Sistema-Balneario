import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import TableViewIcon from "@mui/icons-material/TableView";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

interface ReportExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (
    format: "PDF" | "CSV" | "XLSX" | "PRINT",
    filters: { startDate: string; endDate: string; tipo?: string },
  ) => void;
  showTipoFilter?: boolean;
  hideDateFilters?: boolean;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  open,
  onClose,
  onExport,
  showTipoFilter,
  hideDateFilters,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tipo, setTipo] = useState("ALL");

  useEffect(() => {
    if (open) {
      // Documentação: Precisamos forçar o reinício do modal no momento em que ele se torna visível.
      // Como o Modal (Dialog do MUI) permanece na DOM com estado "fechado", seu ciclo de vida não é desmontado.
      // O React desaconselha "setState" dentro de Effects (causa double render), porém para limpeza de estado
      // baseado na prop "open" de um componente que persiste, isso é estritamente necessário.

      const end = new Date();
      const start = new Date(
        end.getFullYear(),
        end.getMonth() - 1,
        end.getDate(),
      );

      // Ajuste para meses que não tem o dia correspondente (ex: 31 de Março - 1 mês = 31 de Fev -> pula pra 02 ou 03 de Março)
      // Se o mês gerado for igual ao mês atual, significa que ele "transbordou".
      if (start.getMonth() === end.getMonth()) {
        start.setDate(0); // Retorna para o último dia do mês anterior
      }

      const formatLocal = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartDate(formatLocal(start));

      setEndDate(formatLocal(end));

      setTipo("ALL");
    }
  }, [open]);

  const handleExport = (format: "PDF" | "CSV" | "XLSX" | "PRINT") => {
    onExport(format, {
      startDate,
      endDate,
      tipo: showTipoFilter ? tipo : undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exportar Relatório</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {!hideDateFilters && (
            <>
              <Grid size={6}>
                <TextField
                  label="Data Inicial"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid size={6}>
                <TextField
                  label="Data Final"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
            </>
          )}

          {showTipoFilter && (
            <Grid size={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo de Lançamento</InputLabel>
                <Select
                  value={tipo}
                  label="Tipo de Lançamento"
                  onChange={(e) => setTipo(e.target.value as string)}
                >
                  <MenuItem value="ALL">Ambos (Entradas e Saídas)</MenuItem>
                  <MenuItem value="R">Apenas Entradas (Receitas)</MenuItem>
                  <MenuItem value="D">Apenas Saídas (Despesas)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid size={12} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Formato de Exportação
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={() => handleExport("PRINT")}
                  sx={{ py: 1.5 }}
                >
                  Imprimir
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<TableViewIcon />}
                  onClick={() => handleExport("XLSX")}
                  sx={{ py: 1.5 }}
                >
                  Excel
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  startIcon={<DescriptionIcon />}
                  onClick={() => handleExport("CSV")}
                  sx={{ py: 1.5 }}
                >
                  CSV
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => handleExport("PDF")}
                  sx={{ py: 1.5 }}
                >
                  PDF
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
