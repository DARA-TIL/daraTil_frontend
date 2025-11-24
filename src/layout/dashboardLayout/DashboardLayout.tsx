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

const expandedWidth = 260;
const collapsedWidth = 64;

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [isOpen, setIsOpen] = useState(true); // desktop: expanded/collapsed
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  const { t } = useTranslation("navbar");
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleMobileSidebar = () => setMobileOpen((prev) => !prev);

  // для списка: на мобильных всегда "раскрыт"
  const sidebarExpanded = isMdUp ? isOpen : true;

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
        {/* кнопка сворачивания на desktop */}
        {isMdUp && (
          <IconButton
            onClick={toggleSidebar}
            size="small"
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                boxShadow: 3,
                bgcolor: "action.hover",
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

        {/* кнопка закрытия на mobile */}
        {!isMdUp && (
          <IconButton
            onClick={toggleMobileSidebar}
            size="small"
            sx={{
              borderRadius: 2,
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
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
      >
        {profileMenuItems.map((item) => {
          const selected = location.pathname === item.path;

          const button = (
            <ListItemButton
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (!isMdUp) toggleMobileSidebar();
              }}
              sx={{
                position: "relative",
                mx: 1,
                mb: 0.8,
                borderRadius: 2,
                justifyContent: sidebarExpanded ? "flex-start" : "center",
                transition:
                  "background-color 0.2s ease, transform 0.2s ease, padding 0.2s ease",
                "& .MuiListItemIcon-root": {
                  mr: sidebarExpanded ? 2 : 0,
                  minWidth: "auto",
                  justifyContent: "center",
                  transition: "margin-right 0.2s ease",
                },
                "&.Mui-selected": {
                  backgroundColor: theme.palette.action.selected,
                  "&:hover": {
                    backgroundColor: theme.palette.action.selected,
                  },
                },
                "&:hover": {
                  transform: "translateX(2px)",
                },
                // цветная полоска слева у активного пункта
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: selected ? "60%" : "0%",
                  borderRadius: 999,
                  backgroundColor: selected
                    ? theme.palette.primary.main
                    : "transparent",
                  transition: "height 0.2s ease, background-color 0.2s ease",
                },
              }}
            >
              <ListItemIcon>
                <item.icon fontSize="small" />
              </ListItemIcon>

              {sidebarExpanded && (
                <ListItemText
                  primary={t(item.key)}
                  sx={{
                    opacity: sidebarExpanded ? 1 : 0,
                    transition: "opacity 0.2s ease",
                  }}
                />
              )}
            </ListItemButton>
          );

          // тултип только когда свернуто и только на desktop
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

          return <React.Fragment key={item.key}>{button}</React.Fragment>;
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* DESKTOP DRAWER (collapsible) */}
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
              top: 64, // не перекрываем NavBar
              height: "calc(100% - 64px)",
              transition: "width 0.25s ease",
              boxSizing: "border-box",
              overflowX: "hidden",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* MOBILE DRAWER (slide-over) */}
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
          px: 3,
          pt: 6, // отступ под NavBar
          ml: 0,
          transition: "margin-left 0.25s",
        }}
      >
        <Outlet />
      </Box>

      {/* DESKTOP: кнопка открыть sidebar, когда он свернут */}
      {isMdUp && !isOpen && (
        <IconButton
          onClick={toggleSidebar}
          sx={{
            position: "fixed",
            top: 76,
            left: 16,
            zIndex: 1101,
            borderRadius: 2,
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

      {/* MOBILE: кнопка открытия меню - “в блоке” */}
      {!isMdUp && (
        <IconButton
          onClick={toggleMobileSidebar}
          sx={{
            position: "fixed",
            top: 76,
            left: 16,
            zIndex: 1101,
            borderRadius: 2,
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
