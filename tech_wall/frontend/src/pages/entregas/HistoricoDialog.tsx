import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import React from "react";
import { StatusEntregaLabels, type StatusEntrega } from "types/enums";

export interface HistoricoItem {
  id: number;
  statusAnterior: StatusEntrega | null;
  statusNovo: StatusEntrega;
  notas: string | null;
  dataAlteracao: string;
}

interface HistoricoDialogProps {
  open: boolean;
  onClose: () => void;
  historico: HistoricoItem[];
}

export const HistoricoDialog: React.FC<HistoricoDialogProps> = ({
  open,
  onClose,
  historico,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Histórico da Entrega</DialogTitle>
      <DialogContent dividers>
        {historico && historico.length > 0 ? (
          <Stepper orientation="vertical" nonLinear>
            {historico.map((item) => (
              <Step key={item.id} active={true}>
                <StepLabel
                  optional={
                    <Typography variant="caption">
                      {new Date(item.dataAlteracao).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  }
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {StatusEntregaLabels[item.statusNovo] || item.statusNovo}
                  </Typography>
                  {item.notas && (
                    <Typography variant="body2" color="text.secondary">
                      {item.notas}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Nenhum registro de histórico encontrado.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
