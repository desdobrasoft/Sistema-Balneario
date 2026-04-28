import * as yup from "yup";

// material-ui
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { StatusProducao, StatusProducaoLabels } from "types/enums";

// ===============================
// TYPES
// ===============================
interface ProducaoFormValues {
  status: StatusProducao;
  notas: string;
}

interface ProducaoFormProps {
  open: boolean;
  onClose: () => void;
  item: any;
  onSubmit: (values: ProducaoFormValues) => Promise<void>;
}

// ===============================
// VALIDATION
// ===============================
const validationSchema = yup.object().shape({
  status: yup.string().required("Obrigatório"),
  notas: yup.string(),
});

const initialValues: ProducaoFormValues = {
  status: StatusProducao.AGENDADO,
  notas: "",
};

// ===============================
// FORM COMPONENT
// ===============================
const ProducaoForm: React.FC<ProducaoFormProps> = ({
  open,
  onClose,
  item,
  onSubmit,
}) => {
  const getInitialValues = (): ProducaoFormValues => {
    if (item) {
      return {
        status: item.status || StatusProducao.AGENDADO,
        notas: "",
      };
    }
    return initialValues;
  };

  return (
    <DataTableDialog<ProducaoFormValues>
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Alterar Status (Venda #${item?.venda?.id || item?.vendaId || ""})`}
      maxWidth="sm"
      item={item ? getInitialValues() : null}
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              select
              fullWidth
              name="status"
              label="Novo Status"
              size="small"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={
                formik.touched.status && (formik.errors.status as string)
              }
            >
              {Object.values(StatusProducao)
                .filter(
                  (s) =>
                    s !== StatusProducao.PRONTO_PARA_ENVIO &&
                    s !== StatusProducao.MATERIAIS_PENDENTES &&
                    s !== StatusProducao.CANCELADO,
                )
                .map((s) => (
                  <MenuItem key={s} value={s}>
                    {StatusProducaoLabels[s] || s}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="notas"
              label="Notas da Alteração (Opcional)"
              value={formik.values.notas}
              onChange={formik.handleChange}
              placeholder="Ex: Todos os materiais foram alocados."
            />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Histórico de Status
            </Typography>
          </Grid>

          <Grid
            size={12}
            sx={{
              maxHeight: 200,
              overflow: "auto",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <List>
              {(item?.ordensProducaoHistorico || [])
                .slice()
                .reverse()
                .map((h: any, idx: number) => (
                  <ListItem
                    key={idx}
                    divider={
                      idx < (item?.ordensProducaoHistorico?.length || 0) - 1
                    }
                  >
                    <ListItemText
                      primary={
                        <span>
                          {h.statusAnterior && (
                            <span
                              style={{
                                textDecoration: "line-through",
                                marginRight: 8,
                                color: "gray",
                              }}
                            >
                              {StatusProducaoLabels[
                                h.statusAnterior as StatusProducao
                              ] || h.statusAnterior}
                            </span>
                          )}
                          <strong>
                            {StatusProducaoLabels[
                              h.statusNovo as StatusProducao
                            ] || h.statusNovo}
                          </strong>
                        </span>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ display: "block" }}
                          >
                            {new Date(h.dataAlteracao).toLocaleString("pt-BR")}
                          </Typography>
                          {h.notas && (
                            <Typography component="span" variant="body2">
                              {h.notas}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              {(!item?.ordensProducaoHistorico ||
                item.ordensProducaoHistorico.length === 0) && (
                <ListItem>
                  <ListItemText primary="Nenhum histórico disponível." />
                </ListItem>
              )}
            </List>
          </Grid>
        </Grid>
      )}
    />
  );
};

export default ProducaoForm;
