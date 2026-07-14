import React, { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import ContentCopy from "@mui/icons-material/ContentCopy";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import type { ErrorNotification } from "utils/ErrorNotifier";

const STATUS_TEXT_MAP: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

interface ErrorDetailDialogProps {
  notification: ErrorNotification | null;
  onClose: () => void;
  open: boolean;
}

const ErrorDetailDialog: React.FC<ErrorDetailDialogProps> = ({
  notification,
  onClose,
  open,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!notification) return null;

  const { detalhes, erro, mensagens, requestPayload, statusCode, statusText } =
    notification;

  const resolvedStatusText =
    statusText ??
    (statusCode != null ? STATUS_TEXT_MAP[statusCode] : undefined);

  const hasExpandableContent =
    !!detalhes ||
    (mensagens != null && mensagens.length > 0) ||
    !!requestPayload;

  const handleCopy = async () => {
    if (!requestPayload) return;
    await navigator.clipboard.writeText(requestPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setExpanded(false);
    setCopied(false);
    onClose();
  };

  let prettyPayload: string | undefined;
  if (requestPayload) {
    try {
      prettyPayload = JSON.stringify(JSON.parse(requestPayload), null, 2);
    } catch {
      prettyPayload = requestPayload;
    }
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={handleClose} open={open}>
      <DialogTitle
        sx={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Algo deu errado
        <IconButton aria-label="fechar" onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ mb: 1.5 }} variant="body1">
          {erro}
        </Typography>

        {statusCode != null && (
          <Chip
            label={
              resolvedStatusText
                ? `${statusCode} - ${resolvedStatusText}`
                : String(statusCode)
            }
            size="small"
            sx={{ mb: 2 }}
            variant="outlined"
          />
        )}

        {hasExpandableContent && (
          <Box sx={{ mb: 1 }}>
            <Button
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setExpanded((prev) => !prev)}
              size="small"
            >
              Mais detalhes
            </Button>
          </Box>
        )}

        <Collapse in={expanded}>
          {detalhes && (
            <Typography color="text.secondary" sx={{ mb: 1.5 }} variant="body2">
              {detalhes}
            </Typography>
          )}

          {detalhes &&
            ((mensagens != null && mensagens.length > 0) ||
              requestPayload) && <Divider sx={{ my: 1.5 }} />}

          {mensagens != null && mensagens.length > 0 && (
            <Box component="ul" sx={{ mb: 1.5, mt: 0, pl: 3 }}>
              {mensagens.map((msg, idx) => (
                <Typography component="li" key={idx} variant="body2">
                  {msg}
                </Typography>
              ))}
            </Box>
          )}

          {mensagens != null && mensagens.length > 0 && requestPayload && (
            <Divider sx={{ my: 1.5 }} />
          )}

          {prettyPayload && (
            <Box sx={{ mt: 1 }}>
              <Typography color="text.secondary" sx={{ mb: 0.5 }} variant="caption">
                Payload da requisição
              </Typography>
              <Box
                sx={{
                  "&:hover .copy-btn": { opacity: 1 },
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                  borderRadius: 1,
                  maxHeight: 300,
                  overflow: "auto",
                  p: 1.5,
                  position: "relative",
                }}
              >
                <Tooltip
                  open={copied}
                  placement="top"
                  title="Copiado!"
                >
                  <IconButton
                    aria-label="copiar payload"
                    className="copy-btn"
                    onClick={handleCopy}
                    size="small"
                    sx={{
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "grey.900" : "grey.100",
                      float: "right",
                      opacity: 0,
                      position: "sticky",
                      right: 4,
                      top: 4,
                      transition: "opacity 0.2s",
                      zIndex: 1,
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Box
                  component="pre"
                  sx={{
                    fontFamily: "'Ubuntu Mono', monospace",
                    fontSize: "0.8rem",
                    m: 0,
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {prettyPayload}
                </Box>
              </Box>
            </Box>
          )}
        </Collapse>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorDetailDialog;
