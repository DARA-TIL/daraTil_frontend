import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  ButtonBase,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import { useTranslation } from "react-i18next";
import { profileMenuItems } from "@/widgets/navBar/navConfig";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { hasActiveSubscription } from "@/features/subscriptions/model/access";

const expandedWidth = 264;
const collapsedWidth = 82;
const navBarHeight = 74;
const sidebarGap = 14;
const sidebarInset = 12;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { t } = useTranslation("navbar");
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin";
  const isPremium = hasActiveSubscription(user);
  const isAuth = useAuthStore((state) => state.isAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (isAuth && !user && !isLoading) {
      void checkAuth();
    }
  }, [checkAuth, isAuth, isLoading, user]);

  const sidebarExpanded = isMdUp ? isOpen : true;
  const menuItems = profileMenuItems.filter((item) =>
    item.path.startsWith("/app/admin") ? isAdmin : true,
  );

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 68,
          px: 1.25,
          display: "flex",
          justifyContent: isMdUp ? (sidebarExpanded ? "flex-end" : "center") : "space-between",
          borderBottom: "1px solid",
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(148,163,184,0.18)"
              : "rgba(51,65,85,0.34)",
        }}
      >
        {isMdUp ? (
          <Tooltip
            title={
              isOpen
                ? t("collapseSidebar", { defaultValue: "Collapse sidebar" })
                : t("expandSidebar", { defaultValue: "Expand sidebar" })
            }
            placement="right"
            arrow
          >
            <ButtonBase
              onClick={toggleSidebar}
              sx={{
                minWidth: sidebarExpanded ? 42 : 42,
                height: 42,
                px: sidebarExpanded ? 1.4 : 0,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: sidebarExpanded ? 0.9 : 0,
                color: theme.palette.text.primary,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(255,255,255,0.86)"
                    : "rgba(15,23,42,0.86)",
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0 10px 24px rgba(15,23,42,0.12)"
                    : "0 16px 30px rgba(2,6,23,0.42)",
                border: "1px solid",
                borderColor:
                  theme.palette.mode === "light"
                    ? "rgba(148,163,184,0.28)"
                    : "rgba(71,85,105,0.42)",
                transition:
                  "background-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, min-width 180ms ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 16px 30px rgba(15,23,42,0.16)"
                      : "0 18px 36px rgba(2,6,23,0.52)",
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.96)"
                      : "rgba(15,23,42,0.96)",
                },
              }}
            >
              {isOpen ? (
                <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
              ) : (
                <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
              )}

              {sidebarExpanded ? (
                <Box
                  component="span"
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("collapseSidebar", { defaultValue: "" })}
                </Box>
              ) : null}
            </ButtonBase>
          </Tooltip>
        ) : (
          <IconButton
            onClick={toggleMobileSidebar}
            size="small"
            sx={{
              borderRadius: 999,
              bgcolor: "background.paper",
              boxShadow: 2,
              ml: "auto",
              "&:hover": {
                boxShadow: 3,
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <List
        sx={{
          flex: 1,
          py: 1.2,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 2,
            backgroundColor: "transparent",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "rgba(148,163,184,0.6)"
                : "rgba(30,64,175,0.8)",
          },
        }}
      >
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;

          const button = (
            <ListItemButton
              key={item.key}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (!isMdUp) toggleMobileSidebar();
              }}
              sx={{
                position: "relative",
                mx: 1.1,
                mb: 0.9,
                minHeight: 54,
                borderRadius: 3,
                justifyContent: sidebarExpanded ? "flex-start" : "center",
                transition:
                  "background-color 0.18s ease, transform 0.18s ease, padding 0.18s ease, border-color 0.18s ease",
                px: sidebarExpanded ? 1.45 : 1,
                py: 0.8,
                border: "1px solid transparent",
                "& .MuiListItemIcon-root": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: sidebarExpanded ? 1.5 : 0,
                  minWidth: "auto",
                  width: 34,
                  height: 34,
                  borderRadius: 2.2,
                  transition:
                    "margin-right 0.18s ease, background-color 0.18s ease, color 0.18s ease",
                  backgroundColor: selected
                    ? "rgba(255,255,255,0.16)"
                    : theme.palette.mode === "light"
                      ? "rgba(148,163,184,0.12)"
                      : "rgba(15,23,42,0.9)",
                },
                "& .MuiListItemIcon-root svg": {
                  fontSize: 20,
                },
                "&.Mui-selected": {
                  backgroundImage: theme.gradients.sidebarActive,
                  color: "#f9fafb",
                  borderColor: "rgba(255,255,255,0.08)",
                  "& .MuiListItemIcon-root svg": {
                    color: "#f9fafb",
                  },
                  "&:hover": {
                    backgroundImage: theme.gradients.sidebarActive,
                  },
                },
                "&:hover": {
                  transform: "translateX(3px)",
                  borderColor:
                    theme.palette.mode === "light"
                      ? "rgba(148,163,184,0.2)"
                      : "rgba(71,85,105,0.32)",
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(15,23,42,0.92)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  display: sidebarExpanded ? "block" : "none",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 4,
                  height: selected ? "56%" : "0%",
                  borderRadius: 999,
                  backgroundColor: selected
                    ? "rgba(248,250,252,0.9)"
                    : "transparent",
                  transition: "height 0.2s ease, background-color 0.2s ease",
                },
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>

              {sidebarExpanded ? (
                <>
                  <ListItemText
                    primary={t(item.key)}
                    sx={{
                      opacity: 1,
                      "& .MuiTypography-root": {
                        fontSize: 14,
                        fontWeight: selected ? 700 : 600,
                      },
                    }}
                  />
                  {item.key === "subscriptions" ? (
                    <Chip
                      size="small"
                      label={t(isPremium ? "premiumStatus" : "freeStatus")}
                      sx={{
                        height: 21,
                        fontSize: 10,
                        fontWeight: 800,
                        color: selected
                          ? "#f9fafb"
                          : isPremium
                            ? "success.main"
                            : "text.secondary",
                        bgcolor: selected
                          ? "rgba(255,255,255,0.16)"
                          : isPremium
                            ? "rgba(34,197,94,0.12)"
                            : "action.hover",
                      }}
                    />
                  ) : null}
                </>
              ) : null}
            </ListItemButton>
          );

          if (!sidebarExpanded && isMdUp) {
            return (
              <Tooltip
                key={item.key}
                title={
                  item.key === "subscriptions"
                    ? `${t(item.key)} · ${t(isPremium ? "premiumStatus" : "freeStatus")}`
                    : t(item.key)
                }
                placement="right"
                arrow
              >
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {isMdUp ? (
        <Drawer
          variant="permanent"
          open={isOpen}
          sx={{
            width: isOpen ? expandedWidth : collapsedWidth,
            flexShrink: 0,
            transition: "width 0.25s ease",
            [`& .MuiDrawer-paper`]: {
              width: (isOpen ? expandedWidth : collapsedWidth) - sidebarInset,
              position: "fixed",
              left: sidebarInset,
              top: navBarHeight + sidebarGap,
              bottom: sidebarGap,
              height: "auto",
              transition: "width 0.25s ease",
              boxSizing: "border-box",
              overflowX: "hidden",
              borderRight: "1px solid",
              borderTopRightRadius: 28,
              borderBottomRightRadius: 28,
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(148,163,184,0.35)"
                  : "rgba(15,23,42,0.9)",
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(241,245,249,0.98))"
                  : "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))",
              backdropFilter: "blur(18px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileSidebar}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: `min(${expandedWidth}px, calc(100% - ${sidebarInset * 2}px))`,
              left: sidebarInset,
              top: navBarHeight + sidebarGap,
              bottom: sidebarGap,
              height: "auto",
              borderTopRightRadius: 28,
              borderBottomRightRadius: 28,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 0,
          pt: 10,
          pb: 4,
        }}
      >
        <Outlet />
      </Box>

      {!isMdUp ? (
        <IconButton
          onClick={toggleMobileSidebar}
          sx={{
            position: "fixed",
            top: 76,
            left: 16,
            zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
            width: 46,
            height: 46,
            borderRadius: 2.5,
            bgcolor: "background.paper",
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              boxShadow: 4,
              bgcolor: "action.hover",
            },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      ) : null}
    </Box>
  );
};

export default DashboardLayout;
