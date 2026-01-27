// src/layout/dashboardLayout/DashboardLayout.tsx
import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";

import { profileMenuItems } from "@/widgets/navBar/navConfig";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const expandedWidth = 260;
const collapsedWidth = 68;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { t } = useTranslation("navbar");
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);

  const sidebarExpanded = isMdUp ? isOpen : true;

  const user = useAuthStore((s) => s.user);
  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin";

  const menuItems = profileMenuItems.filter((x) =>
    x.path.startsWith("/app/admin") ? isAdmin : true,
  );

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER SIDEBAR */}
      <Toolbar
        sx={{
          minHeight: 56,
          px: 1.5,
          display: "flex",
          justifyContent: isMdUp ? "flex-end" : "space-between",
          borderBottom: "none",
        }}
      >
        {/* desktop - одна кнопка со стрелкой */}
        {isMdUp && (
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              borderRadius: 999,
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(15,23,42,0.9)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 6px 16px rgba(15,23,42,0.18)"
                  : "0 10px 22px rgba(0,0,0,0.7)",
              border: "1px solid",
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(148,163,184,0.35)"
                  : "rgba(15,23,42,0.9)",
              "&:hover": {
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0 10px 22px rgba(15,23,42,0.25)"
                    : "0 14px 26px rgba(0,0,0,0.85)",
                bgcolor:
                  theme.palette.mode === "light"
                    ? "rgba(248,250,252,1)"
                    : "rgba(15,23,42,1)",
              },
            }}
          >
            {isOpen ? (
              <ChevronLeftIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
        )}

        {/* mobile - крестик внутри дровера */}
        {!isMdUp && (
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
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      {/* NAV ITEMS */}
      <List
        sx={{
          flex: 1,
          py: 1,
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
                mx: 1,
                mb: 0.8,
                borderRadius: 2.5,
                justifyContent: sidebarExpanded ? "flex-start" : "center",
                transition:
                  "background-color 0.2s ease, transform 0.2s ease, padding 0.2s ease",
                px: sidebarExpanded ? 1.75 : 1,
                py: 1,
                "& .MuiListItemIcon-root": {
                  mr: sidebarExpanded ? 1.8 : 0,
                  minWidth: "auto",
                  justifyContent: "center",
                  transition: "margin-right 0.2s ease",
                },
                "& .MuiListItemIcon-root svg": {
                  fontSize: 20,
                },
                "&.Mui-selected": {
                  backgroundImage: theme.gradients.cardSoft,
                  color: "#f9fafb",
                  "& .MuiListItemIcon-root svg": {
                    color: "#f9fafb",
                  },
                  "&:hover": {
                    backgroundImage: theme.gradients.cardSoft,
                  },
                },
                "&:hover": {
                  transform: "translateX(2px)",
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(148,163,184,0.12)"
                      : "rgba(15,23,42,0.9)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 6,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: selected ? "60%" : "0%",
                  borderRadius: 999,
                  backgroundColor: selected
                    ? "rgba(248,250,252,0.95)"
                    : "transparent",
                  transition: "height 0.2s ease, background-color 0.2s ease",
                },
              }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>

              {sidebarExpanded && (
                <ListItemText
                  primary={t(item.key)}
                  sx={{
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    "& .MuiTypography-root": {
                      fontSize: 14,
                      fontWeight: selected ? 600 : 500,
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          if (!sidebarExpanded && isMdUp) {
            return (
              <Tooltip
                key={item.key}
                title={t(item.key)}
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
      {/* DESKTOP DRAWER */}
      {isMdUp && (
        <Drawer
          variant="permanent"
          open={isOpen}
          sx={{
            width: isOpen ? expandedWidth : collapsedWidth,
            flexShrink: 0,
            transition: "width 0.25s ease",
            [`& .MuiDrawer-paper`]: {
              width: isOpen ? expandedWidth : collapsedWidth,
              position: "fixed",
              left: 0,
              top: 64,
              height: "calc(100% - 64px)",
              transition: "width 0.25s ease",
              boxSizing: "border-box",
              overflowX: "hidden",
              borderRight: "1px solid",
              borderColor:
                theme.palette.mode === "light"
                  ? "rgba(148,163,184,0.35)"
                  : "rgba(15,23,42,0.9)",
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(249,250,251,0.96)"
                  : "rgba(15,23,42,0.96)",
              backdropFilter: "blur(18px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* MOBILE DRAWER */}
      {!isMdUp && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggleMobileSidebar}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: expandedWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: 0,
          pt: 10,
          pb: 4,
          transition: "margin-left 0.25s ease",
        }}
      >
        <Outlet />
      </Box>

      {/* MOBILE: одна кнопка-бургер снаружи */}
      {!isMdUp && (
        <IconButton
          onClick={toggleMobileSidebar}
          sx={{
            position: "fixed",
            top: 76,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            borderRadius: 999,
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
          <MenuIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default DashboardLayout;
