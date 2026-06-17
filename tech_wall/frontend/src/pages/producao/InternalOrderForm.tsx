import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as yup from "yup";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import { ENDPOINTS } from "config/endpoints";
import { useErrorHandler } from "hooks/useErrorHandler";
import api from "services/api";

const validationSchema = yup.object({
  modeloId: yup.number().required("Selecione um modelo"),
});

interface InternalOrderFormProps {
  onSuccess: () => void;
}

export const InternalOrderForm: React.FC<InternalOrderFormProps> = ({ onSuccess }) => {
  const [modelos, setModelos] = useState<{ id: number; nome: string }[]>([]);
  const handleError = useErrorHandler();

  useEffect(() => {
    // Busca os modelos de casa disponíveis (limite de 100 para cobrir amplamente as opções do select)
    api.get(ENDPOINTS.MODELO_CASA, { params: { length: 100 } }).then((res) => {
      setModelos(res.data.data || res.data);
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      modeloId: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await api.post(`${ENDPOINTS.PRODUCAO}/internal-order`, {
          modeloId: Number(values.modeloId),
        });
        onSuccess();
      } catch (error) {
        console.error("Erro ao criar ordem interna:", error);
        handleError(error);
      }
    },
  });

  return (
    <form id="internal-order-form" onSubmit={formik.handleSubmit}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "justify" }}>
          Selecione um modelo de casa para criar uma ordem de produção interna.
          Isso gerará uma venda e um cliente internos predefinidos pelo sistema,
          que não aparecerão nas listagens principais de vendas e clientes externos,
          permitindo consumo de material isolado.
        </Typography>
        <FormControl
          size="small"
          fullWidth
          error={formik.touched.modeloId && Boolean(formik.errors.modeloId)}
        >
          <InputLabel id="modelo-label">Modelo da Casa</InputLabel>
          <Select
            labelId="modelo-label"
            name="modeloId"
            label="Modelo da Casa"
            value={formik.values.modeloId}
            onChange={formik.handleChange}
          >
            {modelos.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </form>
  );
};
