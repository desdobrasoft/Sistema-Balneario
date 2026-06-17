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
import RequisitosEditor, {
  type RequisitoOverride,
} from "components/RequisitosEditor";
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
  item: Record<string, unknown> | null;
  initialIsAvulso?: boolean;
}

export interface IVendaForm {
  clienteId: number;
  modeloId: number;
  preco: number;
  enderecoEntrega: string;
  dataVenda: string;
  isAvulso: boolean;
  placasAvulsas: RequisitoOverride[];
  overrides: VendaFullCustomization | null;
}

const validationSchema = yup.object().shape({
  isAvulso: yup.boolean(),
  clienteId: yup.number().required("Obrigatório"),
  modeloId: yup.number().when("isAvulso", {
    is: false,
    then: (schema) => schema.required("Obrigatório"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
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
  isAvulso: false,
  placasAvulsas: [],
  overrides: null,
};

interface RawVendaRequisito {
  tipo: "PLACA_LISA" | "CORTE_ESPECIFICO";
  largura?: string | number;
  altura?: string | number;
  espessura?: string | number;
  tramaEsquerdaId?: number | null;
  tramaDireitaId?: number | null;
  tramaSuperiorId?: number | null;
  tramaInferiorId?: number | null;
  corteId?: number | null;
  reforco?: string;
}

const groupVendaRequisitos = (
  reqs: RawVendaRequisito[],
): RequisitoOverride[] => {
  if (!reqs || !Array.isArray(reqs)) return [];
  const grouped: RequisitoOverride[] = [];
  for (const r of reqs) {
    const key = `${r.tipo}-${r.largura}-${r.altura}-${r.espessura}-${r.tramaEsquerdaId}-${r.tramaDireitaId}-${r.tramaSuperiorId}-${r.tramaInferiorId}-${r.corteId}-${r.reforco}`;
    const existing = grouped.find(
      (g) =>
        `${g.tipo}-${g.largura}-${g.altura}-${g.espessura}-${g.tramaEsquerdaId}-${g.tramaDireitaId}-${g.tramaSuperiorId}-${g.tramaInferiorId}-${g.corteId}-${g.reforco}` ===
        key,
    );
    if (existing) {
      existing.quantidade = (existing.quantidade || 0) + 1;
    } else {
      grouped.push({
        tipo: r.tipo,
        largura: r.largura ? parseFloat(r.largura.toString()) : undefined,
        altura: r.altura ? parseFloat(r.altura.toString()) : undefined,
        espessura: r.espessura ? parseFloat(r.espessura.toString()) : undefined,
        tramaEsquerdaId: r.tramaEsquerdaId || null,
        tramaDireitaId: r.tramaDireitaId || null,
        tramaSuperiorId: r.tramaSuperiorId || null,
        tramaInferiorId: r.tramaInferiorId || null,
        corteId: r.corteId || null,
        reforco: r.reforco || "S_P",
        quantidade: 1,
        parede: "Geral",
      });
    }
  }
  return grouped;
};

// ===============================
// FORM COMPONENT
// ===============================
const VendaForm = ({
  open,
  onClose,
  onSuccess,
  item,
  initialIsAvulso = false,
}: VendaFormProps) => {
  const [clientes, setClientes] = useState<{ id: number; nome: string }[]>([]);
  const [modelos, setModelos] = useState<
    { id: number; nome: string; preco?: number }[]
  >([]);

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
        clienteId: Number(
          item.clienteId || (item.cliente as Record<string, unknown>)?.id || 0,
        ),
        modeloId: Number(
          item.modeloId ||
            (item.modeloCasa as Record<string, unknown>)?.id ||
            0,
        ),
        preco: parseFloat(item.preco as string) || 0,
        enderecoEntrega: (item.enderecoEntrega as string) || "",
        dataVenda: item.dataVenda
          ? new Date(item.dataVenda as string).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        isAvulso: item
          ? !item.modeloId && !(item.modeloCasa as Record<string, unknown>)?.id
          : initialIsAvulso,
        placasAvulsas:
          item &&
          !item.modeloId &&
          !(item.modeloCasa as Record<string, unknown>)?.id
            ? groupVendaRequisitos(
                (item.vendaRequisitos as RawVendaRequisito[]) || [],
              )
            : [],
        overrides: null,
      };
    }
    return { ...initialValues, isAvulso: initialIsAvulso };
  };

  return (
    <>
      <DataTableDialog<IVendaForm>
        open={open}
        onClose={onClose}
        onSubmit={async (values) => {
          const payload: Record<string, unknown> = {
            clienteId: values.clienteId,
            dataVenda: new Date(values.dataVenda).toISOString(),
            preco: values.preco,
            enderecoEntrega: values.enderecoEntrega,
            itensOverride: [],
            requisitosOverride: [],
            suprimentosOverride: [],
          };

          if (values.isAvulso) {
            const reqs: Array<Record<string, unknown>> = [];
            for (const placa of values.placasAvulsas) {
              const qty = placa.quantidade || 0;
              for (let i = 0; i < Number(qty); i++) {
                reqs.push({
                  tipo: placa.tipo,
                  largura: placa.largura,
                  altura: placa.altura,
                  espessura: placa.espessura,
                  tramaEsquerdaId: placa.tramaEsquerdaId || null,
                  tramaDireitaId: placa.tramaDireitaId || null,
                  tramaSuperiorId: placa.tramaSuperiorId || null,
                  tramaInferiorId: placa.tramaInferiorId || null,
                  corteId: placa.corteId || null,
                  reforco: placa.reforco,
                });
              }
            }
            payload.requisitosOverride = reqs;
          } else {
            payload.modeloId = values.modeloId;
            payload.itensOverride =
              values.overrides?.itens?.map((o) => ({
                materiaPrimaId: o.materiaPrimaId,
                qtFinal: o.qtFinal,
              })) || [];
            payload.requisitosOverride = values.overrides?.requisitos || [];
            payload.suprimentosOverride = values.overrides?.suprimentos || [];
          }

          if (item) {
            await api.patch(`${ENDPOINTS.VENDAS}/${item.id}`, payload);
          } else {
            await api.post(ENDPOINTS.VENDAS, payload);
          }
          onSuccess();
        }}
        title={item ? "Editar Venda" : "Registrar Nova Venda"}
        maxWidth="md"
        item={item as unknown as IVendaForm | null}
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

                {!formik.values.isAvulso && (
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
                        const modeloInfo = modelos.find((m) => m.id === id);
                        if (modeloInfo) {
                          const preco = modeloInfo?.preco
                            ? parseFloat(modeloInfo.preco.toString())
                            : 0;
                          formik.setFieldValue("preco", preco);
                          formik.setFieldValue("overrides", null);
                        }
                      }}
                      disabled={!!item}
                      error={
                        formik.touched.modeloId &&
                        Boolean(formik.errors.modeloId)
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
                )}

                {formik.values.isAvulso && (
                  <Grid size={12}>
                    <RequisitosEditor
                      requisitos={formik.values.placasAvulsas}
                      onChange={(val) =>
                        formik.setFieldValue("placasAvulsas", val)
                      }
                      showParedes={false}
                      showQuantidade={true}
                    />
                  </Grid>
                )}

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
                baseModel={
                  selectedModeloObj as { id: number; nome: string } | null
                }
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
