import { useFormik } from "formik";
import React from "react";
import * as yup from "yup";

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import { useAuthStore } from "store/authStore";

const validationSchema = yup.object({
  password: yup.string().required("A nova senha é obrigatória"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password")], "As senhas não coincidem")
    .required("Confirme a nova senha"),
});

interface ProfileSecurityFormProps {
  onSuccess: () => void;
}

export const ProfileSecurityForm: React.FC<ProfileSecurityFormProps> = ({
  onSuccess,
}) => {
  const { user } = useAuthStore();

  const formik = useFormik({
    initialValues: {
      password: "",
      passwordConfirmation: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user) return;
      try {
        await api.patch(`${ENDPOINTS.USERS}/${user.id}`, { password: values.password });
        onSuccess();
      } catch (error) {
        console.error("Erro ao alterar senha:", error);
        alert("Erro ao alterar a senha. Tente novamente mais tarde.");
      }
    },
  });

  return (
    <form id="profile-security-form" onSubmit={formik.handleSubmit}>
      <Grid container spacing={2} sx={{ pt: 1 }}>
        <Grid size={12}>
          <TextField
            fullWidth
            name="password"
            label="Nova Senha"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && (formik.errors.password as string)}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            fullWidth
            name="passwordConfirmation"
            label="Confirmar Nova Senha"
            type="password"
            value={formik.values.passwordConfirmation}
            onChange={formik.handleChange}
            error={
              formik.touched.passwordConfirmation &&
              Boolean(formik.errors.passwordConfirmation)
            }
            helperText={
              formik.touched.passwordConfirmation &&
              (formik.errors.passwordConfirmation as string)
            }
          />
        </Grid>
      </Grid>
    </form>
  );
};
