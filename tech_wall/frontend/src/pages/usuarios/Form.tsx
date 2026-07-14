// packages
import React, { useEffect, useState } from "react";
import * as yup from "yup";

// icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// material-ui
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import { type Role, type UserModel } from "types/user";

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: UsuarioFormValues) => Promise<void>;
  item: UserModel | null;
}

const getValidationSchema = (isEditing: boolean) =>
  yup.object({
    username: yup.string().required("Campo obrigatório"),
    fullName: yup.string().required("Campo obrigatório"),
    email: yup.string().email("Email inválido").required("Campo obrigatório"),
    password: isEditing
      ? yup.string()
      : yup.string().required("Senha é obrigatória para novos usuários"),
    passwordConfirmation: yup.string().when("password", {
      is: (val?: string) => Boolean(val && val.length > 0),
      then: (schema: yup.StringSchema) =>
        schema
          .required("Confirme a nova senha")
          .oneOf([yup.ref("password")], "As senhas não coincidem"),
      otherwise: (schema: yup.StringSchema) => schema.optional(),
    } as unknown as yup.StringSchema),
    roles: yup
      .array()
      .min(1, "Selecione ao menos um cargo")
      .required("Campo obrigatório"),
  });

const initialValues = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  roles: [] as string[],
};

export type UsuarioFormValues = typeof initialValues;

const UsuariosForm: React.FC<FormProps> = ({
  open,
  onClose,
  onSubmit,
  item,
}) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validationSchema = getValidationSchema(!!item);

  useEffect(() => {
    if (open) {
      api.get(ENDPOINTS.ROLES, { params: { length: 100 } }).then((res) => {
        // Como o endpoint agora retorna { data: [...], recordsTotal: ... }
        // Pegamos o .data.data (com fallback para .data antigo caso o endpoint mude)
        setAvailableRoles(res.data.data || res.data);
      });
    }
  }, [open]);

  return (
    <DataTableDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      maxWidth="md"
      title={item ? "Editar Usuário" : "Novo Usuário"}
      item={
        item
          ? ({
              ...item,
              roles: item.roles.map(
                (r: string | { role?: string | { role: string } }) => {
                  if (typeof r === "string") return r;
                  if (r.role && typeof r.role === "string") return r.role;
                  if (r.role && typeof r.role === "object" && "role" in r.role)
                    return (r.role as { role: string }).role;
                  return String(r);
                },
              ),
            } as unknown as UsuarioFormValues)
          : null
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              autoFocus
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              fullWidth
              helperText={
                formik.touched.fullName && (formik.errors.fullName as string)
              }
              label="Nome completo"
              name="fullName"
              onChange={formik.handleChange}
              size="small"
              value={formik.values.fullName}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              error={formik.touched.username && Boolean(formik.errors.username)}
              fullWidth
              helperText={
                formik.touched.username && (formik.errors.username as string)
              }
              label="Nome de usuário"
              name="username"
              onChange={formik.handleChange}
              size="small"
              value={formik.values.username}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              error={formik.touched.email && Boolean(formik.errors.email)}
              fullWidth
              helperText={
                formik.touched.email && (formik.errors.email as string)
              }
              label="E-mail"
              name="email"
              onChange={formik.handleChange}
              size="small"
              type="email"
              value={formik.values.email}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl
              error={formik.touched.roles && Boolean(formik.errors.roles)}
              fullWidth
            >
              <InputLabel size="small" id="roles-label">
                Cargos
              </InputLabel>
              <Select
                id="roles"
                input={<OutlinedInput label="Cargos" />}
                labelId="roles-label"
                multiple
                name="roles"
                onChange={formik.handleChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
                size="small"
                value={formik.values.roles}
              >
                {availableRoles.map((r) => (
                  <MenuItem key={r.id} value={r.role}>
                    <Checkbox
                      checked={formik.values.roles.indexOf(r.role) > -1}
                    />
                    <ListItemText primary={r.role} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              error={formik.touched.password && Boolean(formik.errors.password)}
              fullWidth
              helperText={
                formik.touched.password && (formik.errors.password as string)
              }
              label={item ? "Nova Senha" : "Senha"}
              name="password"
              onChange={formik.handleChange}
              size="small"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              error={
                formik.touched.passwordConfirmation &&
                Boolean(formik.errors.passwordConfirmation)
              }
              fullWidth
              helperText={
                formik.touched.passwordConfirmation &&
                (formik.errors.passwordConfirmation as string)
              }
              label="Confirmar Senha"
              name="passwordConfirmation"
              onChange={formik.handleChange}
              size="small"
              type={showConfirmPassword ? "text" : "password"}
              value={formik.values.passwordConfirmation}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        size="small"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      )}
    />
  );
};

export default UsuariosForm;
