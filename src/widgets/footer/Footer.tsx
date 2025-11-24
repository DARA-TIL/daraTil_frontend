import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: { xs: 2, md: 4 },
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {year} Dara Til
      </Typography>
    </Box>
  );
};

export default Footer;
