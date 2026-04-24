// package
import React from "react";
import * as yup from "yup";

// material-ui
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

// project
import DataTableDialog from "components/datatable/DataTableDialog";
import { APP_MODULES, type Role } from "types/user";

interface FormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  item: Role | null;
}

const validationSchema = yup.object({
  role: yup.string().required("Nome do cargo é obrigatório"),
  permissions: yup.array().of(yup.string()).required("Campo obrigatório"),
});

export const initialValues = {
  role: "",
  permissions: [] as string[],
};

const RolesForm: React.FC<FormProps> = ({ open, onClose, onSubmit, item }) => {
  return (
    <DataTableDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      maxWidth="sm"
      title={item ? "Editar Cargo" : "Novo Cargo"}
      item={item}
      initialValues={initialValues}
      validationSchema={validationSchema}
      renderForm={(formik) => (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              name="role"
              label="Nome do Cargo"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && (formik.errors.role as string)}
              placeholder="Ex: Administrador, Vendedor, etc."
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl
              fullWidth
              error={
                formik.touched.permissions && Boolean(formik.errors.permissions)
              }
            >
              <InputLabel size="small" id="permissions-label">Módulos Permitidos</InputLabel>
              <Select
                labelId="permissions-label"
                id="permissions"
                multiple
                name="permissions"
                size="small"
                value={formik.values.permissions}
                onChange={formik.handleChange}
                input={<OutlinedInput label="Módulos Permitidos" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={APP_MODULES[value] ?? value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {Object.entries(APP_MODULES).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Checkbox
                      checked={formik.values.permissions.indexOf(key) > -1}
                    />
                    <ListItemText primary={label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}
    />
  );
};

export default RolesForm;
