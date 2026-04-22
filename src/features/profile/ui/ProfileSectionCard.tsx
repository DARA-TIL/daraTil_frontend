import React from "react";
import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  children: React.ReactNode;
  variant?: "soft" | "hero";
  sx?: SxProps<Theme>;
};

const ProfileSectionCard: React.FC<Props> = ({
  children,
  variant = "soft",
  sx,
}) => {
  const theme = useTheme();

  const bg =
    variant === "hero"
      ? theme.gradients.dashboardHeader
      : theme.gradients.cardSoft;

  return (
    <Paper
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: theme.customColors.sidebarBorder,
        backgroundImage: bg,
        ...(variant === "hero" ? { color: "#fff" } : {}),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};

export default ProfileSectionCard;
