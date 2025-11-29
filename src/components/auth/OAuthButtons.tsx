import { Box, Button, Stack, Divider, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import { API_URL } from "@/shared/api/http";
import { useTranslation } from "react-i18next";

const OAuthButtons = () => {
  const { t } = useTranslation("auth");

  const providers = [
    {
      name: "Google",
      icon: <GoogleIcon />,
      url: `${API_URL}/auth/google`,
    },
    {
      name: "GitHub",
      icon: <GitHubIcon />,
      url: `${API_URL}/auth/github`,
    },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      {/* Divider with text */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography sx={{ mx: 2, color: "text.secondary" }}>
          {t("orContinueWith")}
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      {/* OAuth buttons */}
      <Stack spacing={1}>
        {providers.map((p) => (
          <Button
            key={p.name}
            variant="outlined"
            fullWidth
            startIcon={p.icon}
            onClick={() => (window.location.href = p.url)}
            sx={{
              textTransform: "none",
              height: 45,
              borderRadius: 2,
              fontSize: "15px",
            }}
          >
            {p.name}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default OAuthButtons;
