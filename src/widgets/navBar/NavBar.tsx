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
import { useState, useContext } from "react";

import { LanguageMenu } from "./LanguageMenu";
import { ProfileMenu } from "./ProfileMenu";

import { ColorModeContext } from "@/layout/rootLayout/ColorModeContext";
import { useTheme } from "@mui/material/styles";

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
  const { toggleColorMode } = useContext(ColorModeContext);

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
          minHeight: 64,
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 1.5, sm: 3, md: 4 },
        }}
      >
        {/* Logo / brand */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            sx={(theme) => ({
              width: 32,
              height: 32,
              borderRadius: "12px",
              backgroundImage: theme.gradients.dashboardHeader,
              boxShadow: "0 10px 24px rgba(15,23,42,0.35)",
            })}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            Dara Til
          </Typography>
        </Box>

        {/* Right controls */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {/* Theme toggle */}
          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            sx={{
              borderRadius: 999,
              border:
                theme.palette.mode === "light"
                  ? "1px solid rgba(148,163,184,0.4)"
                  : "1px solid rgba(30,64,175,0.9)",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(15,23,42,0.9)",
            }}
          >
            {theme.palette.mode === "light" ? (
              <DarkModeIcon />
            ) : (
              <LightModeIcon />
            )}
          </IconButton>

          {/* Language */}
          <IconButton
            id="language"
            color="inherit"
            onClick={(e) => setLangAnchor(e.currentTarget)}
            sx={{
              borderRadius: 999,
              border:
                theme.palette.mode === "light"
                  ? "1px solid rgba(148,163,184,0.4)"
                  : "1px solid rgba(30,64,175,0.9)",
            }}
          >
            <LanguageIcon />
          </IconButton>

          <LanguageMenu
            anchorEl={langAnchor}
            onClose={() => setLangAnchor(null)}
          />

          {/* Auth */}
          {isAuth ? (
            <>
              <IconButton
                id="user-icon"
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{
                  p: 0.5,
                }}
              >
                <Avatar
                  sx={(theme) => ({
                    width: 32,
                    height: 32,
                    fontSize: 16,
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
                sx={{ textTransform: "none", fontWeight: 500 }}
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
