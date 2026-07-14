import React, { useCallback, useEffect, useState } from "react";
import AddHomeIcon from "@mui/icons-material/AddHome";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IosShareIcon from "@mui/icons-material/IosShare";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";

import { ReportExportModal } from "components/ReportExportModal";
import { ENDPOINTS } from "config/endpoints";
import { useDialog } from "hooks/useDialog";
import { useErrorHandler } from "hooks/useErrorHandler";
import { useSnackbar } from "hooks/useSnackbar";
import api from "services/api";
import { exportToCSV, exportToExcel, exportToPDF, printExport } from "./ExportUtils";
import ModelosForm, { type ModeloCasaModel } from "./Form";
import ModeloDetailsModal from "./ModeloDetailsModal";

const PAGE_SIZE = 12;

const Modelos: React.FC = () => {
  const [modelos, setModelos] = useState<ModeloCasaModel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("id-desc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [modeloToExport, setModeloToExport] = useState<ModeloCasaModel | null>(null);
  const [selectedModelo, setSelectedModelo] = useState<ModeloCasaModel | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, sortBy]);

  const { showDialog, closeDialog } = useDialog();
  const { showSnackbar } = useSnackbar();
  const handleError = useErrorHandler();

  const fetchModelos = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        draw: 1,
        start: (page - 1) * PAGE_SIZE,
        length: PAGE_SIZE,
        search: { value: searchTerm, regex: false },
        order: [],
        columns: [
          { data: "id", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "nome", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "preco", name: "", searchable: true, orderable: true, search: { value: "", regex: false } },
          { data: "createdAt", name: "", searchable: true, orderable: true, search: { value: "", regex: false } }
        ]
      };

      if (sortBy) {
        const [column, dir] = sortBy.split("-");
        const columnIndex = payload.columns.findIndex((c: any) => c.data === column);
        if (columnIndex !== -1) {
          payload.order = [{ column: columnIndex, dir }];
        }
      }

      const res = await api.post(`${ENDPOINTS.MODELO_CASA}${ENDPOINTS.DATATABLE}`, payload);
      setModelos(res.data.data);
      setTotalRecords(res.data.recordsFiltered);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, sortBy, handleError]);

  useEffect(() => {
    fetchModelos();
  }, [fetchModelos]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleOpenDialog = useCallback(async (modelo: ModeloCasaModel | null = null) => {
    if (modelo) {
      try {
        const res = await api.get(`${ENDPOINTS.MODELO_CASA}/${modelo.id}`);
        setSelectedModelo(res.data);
      } catch (error) {
        handleError(error);
      }
    } else {
      setSelectedModelo(null);
    }
    setDialogOpen(true);
  }, [handleError]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedModelo(null);
  };

  const handleOpenDetails = useCallback(async (modelo: ModeloCasaModel) => {
    try {
      const res = await api.get(`${ENDPOINTS.MODELO_CASA}/${modelo.id}`);
      setSelectedModelo(res.data);
      setDetailsModalOpen(true);
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedModelo(null);
  };

  const handleSubmit = async (values: Partial<ModeloCasaModel> & Record<string, unknown>) => {
    try {
      const payload = { ...values };
      delete payload.id;
      delete payload.deletedAt;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.qtVendido;
      delete payload.materiaisModeloCasa;
      delete payload.placasModeloCasa;
      delete payload._count;

      if (selectedModelo) {
        await api.patch(`${ENDPOINTS.MODELO_CASA}/${selectedModelo.id}`, payload);
        showSnackbar({ message: "Modelo atualizado com sucesso!", severity: "success" });
      } else {
        await api.post(ENDPOINTS.MODELO_CASA, payload);
        showSnackbar({ message: "Modelo criado com sucesso!", severity: "success" });
      }
      fetchModelos();
      handleCloseDialog();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = useCallback((id: number) => {
    showDialog({
      title: "Excluir Modelo",
      body: "Tem certeza de que deseja excluir este modelo? Esta ação não pode ser desfeita.",
      actions: [
        <Button key="cancel" onClick={closeDialog}>Cancelar</Button>,
        <Button
          key="confirm"
          color="error"
          variant="contained"
          onClick={async () => {
            closeDialog();
            try {
              await api.delete(`${ENDPOINTS.MODELO_CASA}/${id}`);
              showSnackbar({ message: "Modelo excluído com sucesso!", severity: "success" });
              fetchModelos();
            } catch (error) {
              handleError(error);
            }
          }}
        >
          Excluir
        </Button>,
      ],
    });
  }, [showDialog, closeDialog, handleError, showSnackbar, fetchModelos]);

  const handleOpenExportModal = useCallback((row: ModeloCasaModel) => {
    setModeloToExport(row);
    setExportModalOpen(true);
  }, []);

  const handleExport = useCallback(async (format: "PDF" | "CSV" | "XLSX" | "PRINT") => {
    if (!modeloToExport) return;
    setExportModalOpen(false);
    showSnackbar({ message: "Gerando exportação...", severity: "info" });
    try {
      const modelRes = await api.get(`${ENDPOINTS.MODELO_CASA}/${modeloToExport.id}`);
      const fullModel = modelRes.data;
      const tramasRes = await api.get(ENDPOINTS.TRAMAS);
      const allTramas = Array.isArray(tramasRes.data) ? tramasRes.data : tramasRes.data.data || [];

      if (format === "PDF") exportToPDF(fullModel, allTramas);
      else if (format === "XLSX") exportToExcel(fullModel, allTramas);
      else if (format === "CSV") exportToCSV(fullModel, allTramas);
      else if (format === "PRINT") printExport(fullModel, allTramas);

      showSnackbar({ message: "Exportação concluída com sucesso!", severity: "success" });
    } catch (error) {
      handleError(error);
    } finally {
      setModeloToExport(null);
    }
  }, [modeloToExport, handleError, showSnackbar]);

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2, gap: 2 }}>
        <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: "bold" }}>
          Catálogo de Modelos
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            placeholder="Buscar modelo..."
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-label">Ordenar por</InputLabel>
            <Select
              labelId="sort-label"
              id="sort-select"
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="id-desc">Mais recentes</MenuItem>
              <MenuItem value="id-asc">Mais antigos</MenuItem>
              <MenuItem value="nome-asc">Nome (A-Z)</MenuItem>
              <MenuItem value="nome-desc">Nome (Z-A)</MenuItem>
              <MenuItem value="preco-asc">Menor Preço</MenuItem>
              <MenuItem value="preco-desc">Maior Preço</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<AddHomeIcon />} onClick={() => handleOpenDialog()}>
            Novo Modelo
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {modelos.map((modelo) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={modelo.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden", // Garante que a imagem e o botão não vazem pelo canto arredondado
                boxShadow: 2,
                "&:hover": { boxShadow: 4 },
                transition: "box-shadow 0.2s",
              }}
            >
              {/* O Botão Ver mais com fundo 100% opaco da mesma cor da borda, no topo direito */}
              <Box
                onClick={() => handleOpenDetails(modelo)}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bgcolor: "background.paper",
                  borderLeft: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                  p: 1,
                  cursor: "pointer",
                  borderBottomLeftRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { opacity: 0.85 },
                  transition: "opacity 0.2s",
                  zIndex: 2,
                }}
              >
                <VisibilityIcon fontSize="small" />
              </Box>

              <Box sx={{ position: "relative", paddingTop: "56.25%", bgcolor: "grey.100" }}>
                {modelo.imagemBase64 ? (
                  <CardMedia
                    component="img"
                    image={modelo.imagemBase64}
                    alt={modelo.nome}
                    sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography color="text.secondary">Sem Imagem</Typography>
                  </Box>
                )}
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 2, position: "relative" }}>
                {/* Botões de Ações no canto superior direito do card content */}
                <Stack direction="row" spacing={0.5} sx={{ position: "absolute", top: 8, right: 8 }}>
                  <IconButton sx={{ color: (theme) => theme.palette.mode === "dark" ? "info.light" : "info.dark" }} size="small" title="Exportar" onClick={() => handleOpenExportModal(modelo)}>
                    <IosShareIcon fontSize="small" />
                  </IconButton>
                  <IconButton sx={{ color: (theme) => theme.palette.mode === "dark" ? "primary.light" : "primary.dark" }} size="small" title="Editar" onClick={() => handleOpenDialog(modelo)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton sx={{ color: (theme) => theme.palette.mode === "dark" ? "error.light" : "error.dark" }} size="small" title="Excluir" onClick={() => handleDelete(modelo.id as number)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Typography variant="h6" gutterBottom sx={{ pr: 10, fontWeight: "bold" }}>
                  {modelo.nome}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {modelo.descricao || "Sem descrição"}
                </Typography>
                
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: "bold" }}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(String(modelo.preco || "0")))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {modelos.length === 0 && !loading && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">Nenhum modelo encontrado.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      <ModelosForm
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={(values) => handleSubmit(values as unknown as Partial<ModeloCasaModel> & Record<string, unknown>)}
        item={selectedModelo}
      />

      <ReportExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        hideDateFilters={true}
      />

      <ModeloDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        modelo={selectedModelo}
      />
    </Box>
  );
};

export default Modelos;
