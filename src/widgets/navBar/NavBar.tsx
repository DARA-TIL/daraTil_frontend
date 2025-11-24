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
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useContext } from "react";

import { LanguageMenu } from "./LanguageMenu";
import { ProfileMenu } from "./ProfileMenu";

import { ColorModeContext } from "@/layout/rootLayout/ColorModeContext";
import { useTheme } from "@mui/material/styles";

const NavBar = () => {
  const { t } = useTranslation("navbar"); // ← namespace
  const navigate = useNavigate();
  const location = useLocation();

  // zustand auth
  const isAuth = useAuthStore((s) => s.isAuth);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // menu anchors
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  const username = user?.username || "User";
  const initials = username.charAt(0).toUpperCase();

  // dark/light theme
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
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Dara Til
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          {/* Theme toggle */}
          <IconButton color="inherit" onClick={toggleColorMode}>
            {theme.palette.mode === "light" ? (
              <DarkModeIcon />
            ) : (
              <LightModeIcon />
            )}
          </IconButton>

          {/* Language */}
          <IconButton
            color="inherit"
            onClick={(e) => setLangAnchor(e.currentTarget)}
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
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
              >
                <Avatar>{initials}</Avatar>
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
              <Button color="inherit" onClick={handleLoginClick}>
                {t("login")} {/* namespace */}
              </Button>
              <Button color="inherit" onClick={handleRegisterClick}>
                {t("register")} {/* namespace */}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
