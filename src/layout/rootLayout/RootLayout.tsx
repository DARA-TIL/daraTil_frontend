import React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

import { AppErrorBoundary, NavBar } from "@/widgets";
import { PAGE_PX } from "@/shared/config/layout";

const RootLayout: React.FC = () => {
  return (
    <AppErrorBoundary>
      <Box
        display="flex"
        flexDirection="column"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <NavBar />

        <Box
          component="main"
          sx={{
            flex: 1,
            py: 2,
            px: PAGE_PX,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </AppErrorBoundary>
  );
};

export default RootLayout;
