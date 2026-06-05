import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";

import LanguageIcon from "@mui/icons-material/Language";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useState } from "react";

import { LanguageMenu } from "./LanguageMenu";
import { ProfileMenu } from "./ProfileMenu";
import NotificationsMenu from "@/features/notifications/ui/NotificationsMenu";

import { useTheme } from "@mui/material/styles";
import { useColorMode } from "@/shared/theme/sharedColorMode";
import daratilIcon from "@/shared/assets/image/daratil_icon.jpg";

const NavBar = () => {
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();
  const location = useLocation();

  const isAuth = useAuthStore((s) => s.isAuth);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const username = user?.username || "User";
  const initials = username.charAt(0).toUpperCase();

  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const controlSx = {
    width: 42,
    height: 42,
    borderRadius: 999,
    border:
      theme.palette.mode === "light"
        ? "1px solid rgba(148,163,184,0.3)"
        : "1px solid rgba(71,85,105,0.42)",
    backgroundColor:
      theme.palette.mode === "light"
        ? "rgba(255,255,255,0.82)"
        : "rgba(15,23,42,0.82)",
    boxShadow:
      theme.palette.mode === "light"
        ? "0 10px 24px rgba(15,23,42,0.08)"
        : "0 12px 28px rgba(2,6,23,0.34)",
    backdropFilter: "blur(10px)",
    transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow:
        theme.palette.mode === "light"
          ? "0 14px 28px rgba(15,23,42,0.12)"
          : "0 16px 34px rgba(2,6,23,0.44)",
      backgroundColor:
        theme.palette.mode === "light"
          ? "rgba(255,255,255,0.94)"
          : "rgba(15,23,42,0.94)",
    },
  };

  const handleLoginClick = () => {
    const isAuthPage =
      location.pathname === "/login" || location.pathname === "/register";

    if (isAuthPage) {
      navigate("/login");
      return;
    }

    const next = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?next=${next}`);
  };

  const handleRegisterClick = () => navigate("/register");

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="transparent"
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor:
          theme.palette.mode === "light"
            ? "rgba(249,250,251,0.92)"
            : "rgba(15,23,42,0.94)",
        backdropFilter: "blur(18px)",
        borderBottom:
          theme.palette.mode === "light"
            ? "1px solid rgba(148,163,184,0.35)"
            : "1px solid rgba(15,23,42,0.9)",
      })}
    >
      <Toolbar
        sx={{
          minHeight: 74,
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 1.5, sm: 2.5, md: 3.25 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            minWidth: 0,
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src={daratilIcon}
            alt="Daratil"
            sx={(theme) => ({
              width: 42,
              height: 42,
              borderRadius: "13px",
              objectFit: "cover",
              display: "block",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 14px 28px rgba(15,23,42,0.16)"
                  : "0 14px 28px rgba(2,6,23,0.45)",
            })}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
            }}
          >
            Daratil
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            px: 0.6,
            py: 0.45,
            borderRadius: 999,
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(248,250,252,0.72)"
                : "rgba(15,23,42,0.62)",
            border:
              theme.palette.mode === "light"
                ? "1px solid rgba(148,163,184,0.18)"
                : "1px solid rgba(51,65,85,0.34)",
            backdropFilter: "blur(14px)",
          }}
        >
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            sx={controlSx}
          >
            {theme.palette.mode === "light" ? (
              <DarkModeIcon />
            ) : (
              <LightModeIcon />
            )}
          </IconButton>

          <IconButton
            id="language"
            color="inherit"
            onClick={(e) => setLangAnchor(e.currentTarget)}
            sx={controlSx}
          >
            <LanguageIcon />
          </IconButton>

          <LanguageMenu
            anchorEl={langAnchor}
            onClose={() => setLangAnchor(null)}
          />

          <NotificationsMenu />

          {isAuth ? (
            <>
              <IconButton
                id="user-icon"
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  p: 0.45,
                  ...controlSx,
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    fontSize: 15,
                    backgroundImage: theme.gradients.dashboardHeader,
                    color: "#fff",
                    boxShadow: "0 10px 22px rgba(15,23,42,0.35)",
                  })}
                >
                  {initials}
                </Avatar>
              </IconButton>

              <ProfileMenu
                anchorEl={profileAnchor}
                onClose={() => setProfileAnchor(null)}
                username={username}
                onLogout={logout}
              />
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={handleLoginClick}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                {t("login")}
              </Button>
              <Button
                variant="contained"
                onClick={handleRegisterClick}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  px: 2.5,
                  boxShadow: "0 10px 24px rgba(15,23,42,0.35)",
                }}
              >
                {t("register")}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
