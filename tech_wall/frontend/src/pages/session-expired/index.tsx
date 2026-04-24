import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useAuthStore } from "store/authStore";

const SessionExpired: React.FC = () => {
  const navigate = useNavigate();
  const { isSessionExpired, logout } = useAuthStore();

  useEffect(() => {
    // Se o usuário tentar acessar manualmente sem estar com flag de expirada, volta pro login
    if (!isSessionExpired) {
      navigate("/login", { replace: true });
    }
  }, [isSessionExpired, navigate]);

  const handleReturnToLogin = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!isSessionExpired) return null;

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            backgroundColor: "common.white",
            borderRadius: 4,
            boxShadow: 3,
          }}
        >
          <ErrorOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "700" }}>
            Sessão Expirada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sua sessão expirou por inatividade ou por segurança. Por favor,
            realize o login novamente para continuar acessando o sistema.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleReturnToLogin}
            sx={{ fontWeight: "bold" }}
          >
            Voltar para o Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SessionExpired;
