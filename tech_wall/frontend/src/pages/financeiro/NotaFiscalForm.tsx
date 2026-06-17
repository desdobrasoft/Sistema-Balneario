// packages
import React, { useEffect, useState } from "react";
import * as yup from "yup";

// icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// material-ui
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";

// ===============================
// TYPES
// ===============================
interface NotaFiscalFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface NotaFiscalFormValues {
  fileName: string;
  fileType: string;
  fileBase64: string;
  fileSize: number | null;
  lancamentos: { id: number; descricao?: string; valorTotal?: string }[];
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  fileBase64: yup.string().required("Selecione um arquivo válido"),
  lancamentos: yup.array().min(1, "Vincule pelo menos 1 lançamento"),
});

// ===============================
// FORM COMPONENT
// ===============================
const NotaFiscalForm: React.FC<NotaFiscalFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const handleError = useErrorHandler();
  const { showSnackbar } = useSnackbar();

  // Lancamentos state
  const [lancamentosOptions, setLancamentosOptions] = useState<{ id: number; descricao: string; valorTotal: string }[]>([]);

  useEffect(() => {
    if (open) {
      // Fetch all lancamentos for selection
      api
        .get(ENDPOINTS.LANCAMENTOS)
        .then((res) =>
          setLancamentosOptions(Array.isArray(res.data) ? res.data : []),
        )
        .catch(handleError);
    }
  }, [open, handleError]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const initialValues: NotaFiscalFormValues = {
    fileName: "",
    fileType: "",
    fileBase64: "",
    fileSize: null,
    lancamentos: [],
  };

  return (
    <DataTableDialog<NotaFiscalFormValues>
      open={open}
      onClose={onClose}
      onSubmit={async (values) => {
        await api.post(ENDPOINTS.NOTAS_FISCAIS, {
          nomeArquivo: values.fileName,
          tipoArquivo: values.fileType,
          arquivoBase64: values.fileBase64,
          lancamentoIds: values.lancamentos.map((l: { id: number }) => l.id),
        });
        showSnackbar({
          message: "Nota fiscal registrada com sucesso!",
          severity: "success",
        });
        onSuccess();
      }}
      title="Registrar Nota Fiscal"
      maxWidth="sm"
      item={null}
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => {
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          // Validate file type
          const validTypes = [
            "application/pdf",
            "text/xml",
            "application/xml",
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ];
          if (!validTypes.includes(selected.type)) {
            showSnackbar({
              message:
                "Tipo de arquivo não suportado. Use PDF, XML ou imagens.",
              severity: "error",
            });
            return;
          }

          // Convert to base64
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:xxx;base64, prefix
            const base64 = result.split(",")[1];
            formik.setFieldValue("fileBase64", base64);
            formik.setFieldValue("fileName", selected.name);
            formik.setFieldValue("fileType", selected.type);
            formik.setFieldValue("fileSize", selected.size);
          };
          reader.readAsDataURL(selected);
        };

        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ py: 2, borderStyle: "dashed" }}
                color={
                  formik.touched.fileBase64 && formik.errors.fileBase64
                    ? "error"
                    : "primary"
                }
              >
                {formik.values.fileName
                  ? formik.values.fileName
                  : "Selecionar arquivo (PDF, XML, Imagem)"}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.xml,image/*"
                  onChange={handleFileChange}
                />
              </Button>
              {formik.values.fileName && formik.values.fileSize != null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {(formik.values.fileSize / 1024).toFixed(1)} KB —{" "}
                  {formik.values.fileType}
                </Typography>
              )}
              {formik.touched.fileBase64 && formik.errors.fileBase64 && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {formik.errors.fileBase64 as string}
                </Typography>
              )}
            </Grid>

            <Grid size={12}>
              <Autocomplete
                multiple
                options={lancamentosOptions}
                getOptionLabel={(opt: { descricao?: string; valorTotal?: string }) =>
                  `${opt.descricao || "Sem descrição"} — ${formatCurrency(parseFloat(opt.valorTotal || "0"))}`
                }
                value={formik.values.lancamentos}
                onChange={(_, value) =>
                  formik.setFieldValue("lancamentos", value)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Vincular a Lançamentos"
                    placeholder="Buscar lançamentos..."
                    size="small"
                    error={
                      formik.touched.lancamentos &&
                      Boolean(formik.errors.lancamentos)
                    }
                    helperText={
                      formik.touched.lancamentos && formik.errors.lancamentos
                        ? (formik.errors.lancamentos as string)
                        : `${formik.values.lancamentos.length} lançamento(s) selecionado(s)`
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        );
      }}
    />
  );
};

export default NotaFiscalForm;
