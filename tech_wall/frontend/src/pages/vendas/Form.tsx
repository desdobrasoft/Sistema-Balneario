import { useEffect, useState } from "react";
import * as yup from "yup";

// icons
import EditNoteIcon from "@mui/icons-material/EditNote";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// project imports
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import CustomizeVendaDialog, {
  type VendaFullCustomization,
} from "./CustomizeVendaDialog";

// ===============================
// TYPES
// ===============================
interface VendaFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: any | null;
}

export interface IVendaForm {
  clienteId: number;
  modeloId: number;
  preco: number;
  enderecoEntrega: string;
  dataVenda: string;
  overrides: VendaFullCustomization | null;
}

const validationSchema = yup.object().shape({
  clienteId: yup.number().required("Obrigatório"),
  modeloId: yup.number().required("Obrigatório"),
  preco: yup.number().min(0, "Mínimo 0").required("Obrigatório"),
  enderecoEntrega: yup.string().required("Obrigatório"),
  dataVenda: yup.string().required("Obrigatório"),
});

const initialValues: IVendaForm = {
  clienteId: "" as unknown as number,
  modeloId: "" as unknown as number,
  preco: 0,
  enderecoEntrega: "",
  dataVenda: new Date().toISOString().split("T")[0],
  overrides: null,
};

// ===============================
// FORM COMPONENT
// ===============================
const VendaForm = ({ open, onClose, onSuccess, item }: VendaFormProps) => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);

  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [cRes, mRes] = await Promise.all([
          api.get(ENDPOINTS.CLIENTES),
          api.get(ENDPOINTS.MODELO_CASA),
        ]);
        setClientes(
          Array.isArray(cRes.data) ? cRes.data : cRes.data.data || [],
        );
        setModelos(Array.isArray(mRes.data) ? mRes.data : mRes.data.data || []);
      };
      fetchData();
    }
  }, [open]);

  const getInitialValues = () => {
    if (item) {
      return {
        ...initialValues,
        clienteId: item.clienteId || item.cliente?.id || "",
        modeloId: item.modeloId || item.modeloCasa?.id || "",
        preco: parseFloat(item.preco) || 0,
        enderecoEntrega: item.enderecoEntrega || "",
        dataVenda: item.dataVenda
          ? new Date(item.dataVenda).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        overrides: null,
      };
    }
    return initialValues;
  };

  return (
    <>
      <DataTableDialog<IVendaForm>
        open={open}
        onClose={onClose}
        onSubmit={async (values) => {
          const payload = {
            clienteId: values.clienteId,
            modeloId: values.modeloId,
            dataVenda: new Date(values.dataVenda).toISOString(),
            preco: values.preco,
            enderecoEntrega: values.enderecoEntrega,
            itensOverride: values.overrides?.itens?.map((o) => ({
              materiaPrimaId: o.materiaPrimaId,
              qtFinal: o.qtFinal,
            })),
            requisitosOverride: values.overrides?.requisitos,
            suprimentosOverride: values.overrides?.suprimentos,
          };

          if (item) {
            await api.patch(`${ENDPOINTS.VENDAS}/${item.id}`, payload);
          } else {
            await api.post(ENDPOINTS.VENDAS, payload);
          }
          onSuccess();
        }}
        title={item ? "Editar Venda" : "Registrar Nova Venda"}
        maxWidth="md"
        item={item}
        initialValues={getInitialValues()}
        validationSchema={validationSchema}
        renderForm={(formik) => {
          const selectedModeloObj = modelos.find(
            (m) => m.id === formik.values.modeloId,
          );

          return (
            <>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    select
                    fullWidth
                    name="clienteId"
                    label="Cliente"
                    size="small"
                    value={formik.values.clienteId}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.clienteId &&
                      Boolean(formik.errors.clienteId)
                    }
                    helperText={
                      formik.touched.clienteId &&
                      (formik.errors.clienteId as string)
                    }
                  >
                    {clientes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    name="dataVenda"
                    label="Data da Venda"
                    type="date"
                    size="small"
                    value={formik.values.dataVenda}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.dataVenda &&
                      Boolean(formik.errors.dataVenda)
                    }
                    helperText={
                      formik.touched.dataVenda &&
                      (formik.errors.dataVenda as string)
                    }
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    select
                    fullWidth
                    name="modeloId"
                    label="Modelo da Casa"
                    size="small"
                    value={formik.values.modeloId}
                    onChange={(e) => {
                      formik.handleChange(e);
                      const id = Number(e.target.value);
                      const modelo = modelos.find((m) => m.id === id);
                      if (modelo) {
                        formik.setFieldValue("preco", parseFloat(modelo.preco));
                        formik.setFieldValue("overrides", null);
                      }
                    }}
                    disabled={!!item}
                    error={
                      formik.touched.modeloId && Boolean(formik.errors.modeloId)
                    }
                    helperText={
                      formik.touched.modeloId &&
                      (formik.errors.modeloId as string)
                    }
                  >
                    {modelos.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    name="preco"
                    label="Preço Final"
                    type="number"
                    size="small"
                    value={formik.values.preco}
                    onChange={formik.handleChange}
                    error={formik.touched.preco && Boolean(formik.errors.preco)}
                    helperText={
                      formik.touched.preco && (formik.errors.preco as string)
                    }
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">R$</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                {formik.values.modeloId && !item && (
                  <Grid size={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">
                        {formik.values.overrides
                          ? "Modelo Customizado"
                          : "Utilizando modelo padrão."}
                      </Typography>
                      <Button
                        startIcon={<EditNoteIcon />}
                        size="small"
                        variant="outlined"
                        onClick={() => setCustomizeOpen(true)}
                      >
                        Customizar Projeto
                      </Button>
                    </Box>
                  </Grid>
                )}

                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="enderecoEntrega"
                    label="Endereço de Entrega"
                    value={formik.values.enderecoEntrega}
                    onChange={formik.handleChange}
                    placeholder="Rua, Número, Bairro, Cidade, Estado..."
                    error={
                      formik.touched.enderecoEntrega &&
                      Boolean(formik.errors.enderecoEntrega)
                    }
                    helperText={
                      formik.touched.enderecoEntrega &&
                      (formik.errors.enderecoEntrega as string)
                    }
                  />
                </Grid>
              </Grid>

              <CustomizeVendaDialog
                open={customizeOpen}
                onClose={() => setCustomizeOpen(false)}
                baseModel={selectedModeloObj}
                currentCustomization={formik.values.overrides}
                onSave={(newOverrides) => {
                  formik.setFieldValue("overrides", newOverrides);
                  setCustomizeOpen(false);
                }}
              />
            </>
          );
        }}
      />
    </>
  );
};

export default VendaForm;
