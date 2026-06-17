import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

interface ReportExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'PDF' | 'CSV' | 'XLSX' | 'PRINT', filters: { startDate: string; endDate: string; tipo?: string }) => void;
  showTipoFilter?: boolean;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ open, onClose, onExport, showTipoFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tipo, setTipo] = useState('ALL');

  useEffect(() => {
    if (open) {
      // Documentação: Precisamos forçar o reinício do modal no momento em que ele se torna visível. 
      // Como o Modal (Dialog do MUI) permanece na DOM com estado "fechado", seu ciclo de vida não é desmontado.
      // O React desaconselha "setState" dentro de Effects (causa double render), porém para limpeza de estado
      // baseado na prop "open" de um componente que persiste, isso é estritamente necessário.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStartDate('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEndDate('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTipo('ALL');
    }
  }, [open]);

  const handleExport = (format: 'PDF' | 'CSV' | 'XLSX' | 'PRINT') => {
    onExport(format, { startDate, endDate, tipo: showTipoFilter ? tipo : undefined });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exportar Relatório</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Data Inicial"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Data Final"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            size="small"
          />
          {showTipoFilter && (
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
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button onClick={() => handleExport('PRINT')} color="primary" variant="outlined">Imprimir</Button>
        <Button onClick={() => handleExport('CSV')} color="primary" variant="contained">CSV</Button>
        <Button onClick={() => handleExport('XLSX')} color="primary" variant="contained">Excel</Button>
        <Button onClick={() => handleExport('PDF')} color="primary" variant="contained">PDF</Button>
      </DialogActions>
    </Dialog>
  );
};
