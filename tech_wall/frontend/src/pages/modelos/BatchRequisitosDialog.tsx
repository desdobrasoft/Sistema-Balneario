import { useFormik } from "formik";
import React from "react";
import * as yup from "yup";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project
// project
import type { RequisitoRequerido } from "./Form";

interface BatchRequisitosDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (requisitos: RequisitoRequerido[]) => void;
  parede: string;
}

const validationSchema = yup.object({
  quantidade: yup.number().min(1, "Mínimo 1").required("Obrigatório"),
  valorInicial: yup.number().min(0, "Mínimo 0").required("Obrigatório"),
  largura: yup.number().min(1, "Mínimo 1").required("Obrigatório"),
  altura: yup.number().min(1, "Mínimo 1").required("Obrigatório"),
  espessura: yup.number().min(1, "Mínimo 1").required("Obrigatório"),
});

const BatchRequisitosDialog: React.FC<BatchRequisitosDialogProps> = ({
  open,
  onClose,
  onSubmit,
  parede,
}) => {
  const formik = useFormik({
    initialValues: {
      prefixo: "P",
      sufixo: "",
      valorInicial: 1,
      quantidade: "",
      algarismos: 2,
      largura: "",
      altura: "",
      espessura: 9,
    },
    validationSchema,
    onSubmit: (values) => {
      const generated: RequisitoRequerido[] = [];
      const qty = Number(values.quantidade);
      const start = Number(values.valorInicial);
      const padding = Number(values.algarismos) || 0;

      for (let i = 0; i < qty; i++) {
        const currentVal = start + i;
        const alias = `${values.prefixo}${String(currentVal).padStart(padding, "0")}${values.sufixo}`;

        generated.push({
          tipo: "PLACA_LISA",
          parede,
          alias,
          largura: Number(values.largura),
          altura: Number(values.altura),
          espessura: Number(values.espessura),
          tramaEsquerdaId: null,
          tramaDireitaId: null,
          tramaSuperiorId: null,
          tramaInferiorId: null,
          corteId: null,
        });
      }

      onSubmit(generated);
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Placas em Lote - {parede}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gere automaticamente múltiplas placas lisas com nomes sequenciais e
          medidas idênticas.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              fullWidth
              size="small"
              label="Prefixo"
              name="prefixo"
              value={formik.values.prefixo}
              onChange={formik.handleChange}
              placeholder="Ex: P"
            />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              size="small"
              label="Sufixo"
              name="sufixo"
              value={formik.values.sufixo}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Valor Inicial"
              name="valorInicial"
              type="number"
              value={formik.values.valorInicial}
              onChange={formik.handleChange}
              error={
                formik.touched.valorInicial &&
                Boolean(formik.errors.valorInicial)
              }
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Quantidade"
              name="quantidade"
              type="number"
              value={formik.values.quantidade}
              onChange={formik.handleChange}
              error={
                formik.touched.quantidade && Boolean(formik.errors.quantidade)
              }
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Zeros à esquerda"
              name="algarismos"
              type="number"
              value={formik.values.algarismos}
              onChange={formik.handleChange}
            />
          </Grid>

          <Grid size={12}>
            <Box
              sx={{ my: 1, borderTop: "1px solid", borderColor: "divider" }}
            />
          </Grid>

          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Largura"
              name="largura"
              type="number"
              value={formik.values.largura}
              onChange={formik.handleChange}
              error={formik.touched.largura && Boolean(formik.errors.largura)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Altura"
              name="altura"
              type="number"
              value={formik.values.altura}
              onChange={formik.handleChange}
              error={formik.touched.altura && Boolean(formik.errors.altura)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              fullWidth
              size="small"
              label="Espessura"
              name="espessura"
              type="number"
              value={formik.values.espessura}
              onChange={formik.handleChange}
              error={
                formik.touched.espessura && Boolean(formik.errors.espessura)
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">cm</InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>
          Gerar Placas
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BatchRequisitosDialog;
