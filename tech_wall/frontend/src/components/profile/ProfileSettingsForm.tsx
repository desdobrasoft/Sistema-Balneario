import { useFormik } from "formik";
import React from "react";
import * as yup from "yup";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import { useAuthStore } from "store/authStore";

const validationSchema = yup.object({
  fullName: yup.string().required("Campo obrigatório"),
  username: yup.string().required("Campo obrigatório"),
  email: yup.string().email("E-mail inválido").required("Campo obrigatório"),
});

interface ProfileSettingsFormProps {
  onSuccess: () => void;
}

export const ProfileSettingsForm: React.FC<ProfileSettingsFormProps> = ({
  onSuccess,
}) => {
  const { user, setUser } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user) return;
      try {
        await api.patch(`${ENDPOINTS.USERS}/${user.id}`, values);
        // Refresh local user data
        const res = await api.get(ENDPOINTS.AUTH.CURRENT_USER);
        setUser(res.data);
        onSuccess();
      } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert(
          "Erro ao atualizar o perfil. Verifique se o e-mail ou nome de usuário estão disponíveis.",
        );
      }
    },
  });

  return (
    <form id="profile-settings-form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid size={12}>
          <TextField
            fullWidth
            name="fullName"
            label="Nome Completo"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={
              formik.touched.fullName && (formik.errors.fullName as string)
            }
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            name="username"
            label="Nome de Usuário"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={
              formik.touched.username && (formik.errors.username as string)
            }
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            name="email"
            label="E-mail"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && (formik.errors.email as string)}
            size="small"
          />
        </Grid>
      </Grid>
    </form>
  );
};
