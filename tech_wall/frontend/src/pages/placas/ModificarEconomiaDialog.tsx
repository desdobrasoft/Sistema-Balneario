import React, { useMemo, useState } from "react";

// material-ui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

// project
import type { TipoPlacaOption } from "./Form";

// ===============================
// Interfaces
// ===============================

interface EconomiaItem {
  estoqueAtual: number;
  materiaPrimaId: number;
  nome: string;
  receitaPorPlaca: number; // quantidade da receita por placa
  tipo: "economia" | "gasto"; // economia ou gasto adicional
  unidade: string;
  valor: number | ""; // valor do ajuste (sempre positivo no campo, ou vazio)
}

interface ModificarEconomiaDialogProps {
  open: boolean;
  onClose: () => void; // Cancelar (voltar ao formulário)
  onConfirm: (itens: EconomiaItem[]) => void; // Salvar
  quantidade: number; // quantidade de placas
  tipoPlaca: TipoPlacaOption | null;
}

// Tipo para rastrear ajustes do usuário por materiaPrimaId
interface Ajuste {
  tipo: "economia" | "gasto";
  valor: number | "";
}

// ===============================
// Component
// ===============================

const ModificarEconomiaDialog: React.FC<ModificarEconomiaDialogProps> = ({
  open,
  onClose,
  onConfirm,
  quantidade,
  tipoPlaca,
}) => {
  // Ajustes do usuário, rastreados por materiaPrimaId
  const [ajustes, setAjustes] = useState<Record<number, Ajuste>>({});

  // Itens base derivados das props (sem setState em effect)
  const itensBase = useMemo(() => {
    if (!tipoPlaca?.materiais) return [];
    return tipoPlaca.materiais.map((mat) => ({
      estoqueAtual: mat.materiaPrima?.quantidade ?? 0,
      materiaPrimaId: mat.materiaPrimaId,
      nome: mat.materiaPrima?.item ?? `Material #${mat.materiaPrimaId}`,
      receitaPorPlaca: mat.quantidade,
      unidade: mat.materiaPrima?.unidade ?? "",
    }));
  }, [tipoPlaca]);

  // Itens combinados (base + ajustes do usuário)
  const itens: EconomiaItem[] = useMemo(
    () =>
      itensBase.map((base) => {
        const ajuste = ajustes[base.materiaPrimaId];
        return {
          ...base,
          tipo: ajuste?.tipo ?? ("economia" as const),
          valor: ajuste?.valor ?? 0,
        };
      }),
    [itensBase, ajustes],
  );

  // Atualiza o ajuste de um material específico
  const updateAjuste = (
    materiaPrimaId: number,
    campo: keyof Ajuste,
    valor: Ajuste[keyof Ajuste],
  ) => {
    setAjustes((prev) => ({
      ...prev,
      [materiaPrimaId]: {
        ...(prev[materiaPrimaId] ?? { tipo: "economia", valor: 0 }),
        [campo]: valor,
      },
    }));
  };

  // Calcula o resultado para um item
  const calcularResultado = (item: EconomiaItem): number => {
    const deducaoBase = item.receitaPorPlaca * quantidade;
    const val = item.valor === "" ? 0 : item.valor;
    if (item.tipo === "economia") {
      return item.estoqueAtual - (deducaoBase - val);
    }
    return item.estoqueAtual - (deducaoBase + val);
  };

  // Formata a linha de cálculo para exibição
  const formatarCalculo = (
    item: EconomiaItem,
  ): { resultado: number; texto: string } => {
    const deducaoBase = item.receitaPorPlaca * quantidade;
    const resultado = calcularResultado(item);
    const val = item.valor === "" ? 0 : item.valor;

    if (item.tipo === "economia" && val > 0) {
      return {
        resultado,
        texto: `${item.estoqueAtual} - ${deducaoBase} + ${val} (economia)`,
      };
    }
    if (item.tipo === "gasto" && val > 0) {
      return {
        resultado,
        texto: `${item.estoqueAtual} - ${deducaoBase} - ${val} (gasto)`,
      };
    }
    // Sem ajuste
    return {
      resultado,
      texto: `${item.estoqueAtual} - ${deducaoBase}`,
    };
  };

  const handleClose = () => {
    setAjustes({});
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(itens);
    setAjustes({});
  };

  const temNegativo = itens.some((item) => calcularResultado(item) < 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modificar Economia de Material</DialogTitle>

      <DialogContent dividers>
        {itens.map((item, index) => {
          const calculo = formatarCalculo(item);

          return (
            <React.Fragment key={item.materiaPrimaId}>
              {index > 0 && <Divider sx={{ my: 2 }} />}

              {/* Nome do material + unidade */}
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {item.nome}{" "}
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                >
                  ({item.unidade})
                </Typography>
              </Typography>

              {/* Toggle economia/gasto + campo de valor */}
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  gap: 2,
                  mt: 1,
                }}
              >
                <ToggleButtonGroup
                  exclusive
                  onChange={(_, v: string | null) =>
                    v &&
                    updateAjuste(
                      item.materiaPrimaId,
                      "tipo",
                      v as "economia" | "gasto",
                    )
                  }
                  size="small"
                  value={item.tipo}
                >
                  <ToggleButton value="economia">Economia</ToggleButton>
                  <ToggleButton value="gasto">Gasto</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  label={item.tipo === "economia" ? "Economia" : "Gasto"}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateAjuste(
                      item.materiaPrimaId,
                      "valor",
                      val === "" ? "" : Math.max(0, Number(val) || 0),
                    );
                  }}
                  size="small"
                  slotProps={{ htmlInput: { min: 0, step: "any" } }}
                  sx={{ width: 140 }}
                  type="number"
                  value={item.valor}
                />
              </Box>

              {/* Cálculo ao vivo */}
              <Box
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  mt: 1,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                >
                  {calculo.texto} →{" "}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    color:
                      calculo.resultado < 0 ? "error.main" : "success.main",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  {calculo.resultado} {item.unidade}
                </Typography>
              </Box>
            </React.Fragment>
          );
        })}

        {itens.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nenhum material na receita deste tipo de placa.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={temNegativo}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModificarEconomiaDialog;
export type { EconomiaItem, ModificarEconomiaDialogProps };
