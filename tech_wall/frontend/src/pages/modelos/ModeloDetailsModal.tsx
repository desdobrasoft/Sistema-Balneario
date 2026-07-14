import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { type ModeloCasaModel } from "./Form";

interface Props {
  open: boolean;
  onClose: () => void;
  modelo: ModeloCasaModel | null;
}

const ModeloDetailsModal: React.FC<Props> = ({ open, onClose, modelo }) => {
  if (!modelo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {modelo.nome}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                width: "100%",
                height: 300,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
              }}
            >
              {modelo.imagemBase64 ? (
                <img
                  src={modelo.imagemBase64}
                  alt={modelo.nome}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Typography color="text.secondary">Sem Imagem</Typography>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Descrição:</strong> {modelo.descricao || "Nenhuma descrição"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Preço Base:</strong>{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(parseFloat(String(modelo.preco || "0")))}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Tempo de Fabricação:</strong> {modelo.tempoFabricacao} dias
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} gutterBottom>
              Requisitos da Venda ({modelo.requisitos?.length || 0})
            </Typography>
            
            {modelo.requisitos && modelo.requisitos.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                {Object.entries(
                  modelo.requisitos.reduce((acc, req) => {
                    const parede = req.parede || "Geral";
                    if (!acc[parede]) acc[parede] = [];
                    acc[parede].push(req);
                    return acc;
                  }, {} as Record<string, typeof modelo.requisitos>)
                ).map(([parede, reqs]) => (
                  <Box key={parede}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "text.secondary", mb: 0.5 }}>
                      {parede} ({reqs.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {reqs.map((req, index) => {
                        const tp = req.tipoPlaca;
                        const isCorte = req.tipo === "CORTE_ESPECIFICO" && req.corte;
                        let infoStr = "";
                        
                        if (tp || isCorte) {
                          const dimLargura = isCorte ? Number(req.corte?.largura) : Number(tp?.largura);
                          const dimAltura = isCorte ? Number(req.corte?.altura) : Number(tp?.altura);
                          const dim = (dimLargura && dimAltura) ? `${dimLargura}x${dimAltura}` : "";
                          
                          const ref = tp?.reforco === "UM_P" ? "1P" : tp?.reforco === "DOIS_P" ? "2P" : "";
                          const tramas = [
                            ...(tp?.tramaEsquerdaAtiva ? [tp.tramaEsquerda?.nome || "E"] : []),
                            ...(tp?.tramaDireitaAtiva ? [tp.tramaDireita?.nome || "D"] : []),
                            ...(tp?.tramaSuperiorAtiva ? [tp.tramaSuperior?.nome || "S"] : []),
                            ...(tp?.tramaInferiorAtiva ? [tp.tramaInferior?.nome || "I"] : []),
                          ].join(", ");
                          
                          const detailsList = [dim, ref, tramas].filter(Boolean);
                          infoStr = detailsList.join(", ");
                        }

                        const baseLabel = req.alias || req.corte?.nome || `Req ${index + 1}`;
                        const finalLabel = infoStr ? `${baseLabel} (${infoStr})` : baseLabel;
                        
                        return (
                          <Chip key={index} label={finalLabel} size="small" />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nenhum requisito listado.
              </Typography>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} gutterBottom>
              Materiais Padrão ({((modelo as any).materiaisModeloCasa || modelo.materiais)?.length || 0})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {((modelo as any).materiaisModeloCasa || modelo.materiais)?.map((mat: any, index: number) => (
                <Chip
                  key={index}
                  label={`${mat.qtModelo} ${mat.materiaPrima?.unidade || "un"} de ${mat.materiaPrima?.item || mat.materiaPrimaId}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
              {(!((modelo as any).materiaisModeloCasa || modelo.materiais) || ((modelo as any).materiaisModeloCasa || modelo.materiais).length === 0) && (
                <Typography variant="body2" color="text.secondary">Nenhum material listado.</Typography>
              )}
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }} gutterBottom>
              Suprimentos para a Obra ({modelo.suprimentosObra?.length || 0})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {modelo.suprimentosObra?.map((sup, index) => (
                <Chip
                  key={index}
                  label={`${sup.quantidade} ${sup.unidade} - ${sup.nome}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              ))}
              {(!modelo.suprimentosObra || modelo.suprimentosObra.length === 0) && (
                <Typography variant="body2" color="text.secondary">Nenhum suprimento listado.</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModeloDetailsModal;
