import React from "react";

// icons
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// material-ui
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

// project
import type { TipoPlacaOption } from "./Form";

// ===============================
// Interfaces
// ===============================

interface ConfirmacaoDeducaoDialogProps {
  open: boolean;
  onClose: () => void; // Cancelar
  onConfirm: () => void; // Confirmar (deduzir sem economia)
  onModify: () => void; // Modificar (abrir economia dialog)
  quantidade: number; // quantidade de placas sendo criadas
  tipoPlaca: TipoPlacaOption | null;
}

// ===============================
// Component
// ===============================

const ConfirmacaoDeducaoDialog: React.FC<ConfirmacaoDeducaoDialogProps> = ({
  open,
  onClose,
  onConfirm,
  onModify,
  quantidade,
  tipoPlaca,
}) => {
  const materiais = tipoPlaca?.materiais ?? [];

  // Calcula dedução e resultado para cada material
  const linhas = materiais.map((mat) => {
    const estoqueAtual = mat.materiaPrima?.quantidade ?? 0;
    const deducao = mat.quantidade * quantidade;
    const resultado = estoqueAtual - deducao;
    return {
      materiaPrimaId: mat.materiaPrimaId,
      nome: mat.materiaPrima?.item ?? `Material #${mat.materiaPrimaId}`,
      unidade: mat.materiaPrima?.unidade ?? "",
      estoqueAtual,
      deducao,
      resultado,
    };
  });

  const temNegativo = linhas.some((l) => l.resultado < 0);
  const materiaisNegativos = linhas
    .filter((l) => l.resultado < 0)
    .map((l) => l.nome);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dedução de Matéria-Prima</DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          As seguintes matérias-primas serão deduzidas do estoque:
        </Typography>

        {/* Tabela de materiais */}
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            "& th, & td": {
              px: 1.5,
              py: 0.75,
              textAlign: "left",
              borderBottom: "1px solid",
              borderColor: "divider",
            },
            "& th": {
              fontWeight: "bold",
              bgcolor: "action.hover",
            },
          }}
        >
          <thead>
            <tr>
              <th>Material</th>
              <th>Estoque</th>
              <th>Dedução</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.materiaPrimaId}>
                <td>
                  {linha.nome}{" "}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    ({linha.unidade})
                  </Typography>
                </td>
                <td>{linha.estoqueAtual}</td>
                <td>- {linha.deducao}</td>
                <td>
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      color:
                        linha.resultado < 0 ? "error.main" : "success.main",
                    }}
                  >
                    → {linha.resultado}
                  </Typography>
                  {linha.resultado < 0 && (
                    <WarningAmberIcon
                      fontSize="small"
                      color="error"
                      sx={{ ml: 0.5, verticalAlign: "middle" }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>

        {/* Alerta de estoque negativo */}
        {temNegativo && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Estoque insuficiente para{" "}
            <strong>{materiaisNegativos.join(", ")}</strong>.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="outlined" onClick={onModify}>
          Modificar
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={temNegativo}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmacaoDeducaoDialog;
export type { ConfirmacaoDeducaoDialogProps };
