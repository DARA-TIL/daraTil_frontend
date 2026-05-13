import {
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useTranslation } from "react-i18next";
import { profileMenuItems } from "./navConfig";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  username: string;
  onLogout: () => Promise<void>; // из Zustand
}

export const ProfileMenu = ({
  anchorEl,
  onClose,
  username,
  onLogout,
}: Props) => {
  const open = Boolean(anchorEl);
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await onLogout();
    onClose();
    navigate("/login");
  };

  const user = useAuthStore((s) => s.user);
  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin";

  const menuItems = profileMenuItems.filter((x) =>
    x.path.startsWith("/app/admin") ? isAdmin : true,
  );

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem disabled>
        <Typography variant="body2">{username}</Typography>
      </MenuItem>

      <Divider />

      {menuItems.map((item) => (
        <MenuItem key={item.key} onClick={() => navigateTo(item.path)}>
          <ListItemIcon>
            <item.icon fontSize="small" />
          </ListItemIcon>
          {t(item.key)}
        </MenuItem>
      ))}

      <MenuItem onClick={() => navigateTo("/app/notifications")}>
        <ListItemIcon>
          <NotificationsRoundedIcon fontSize="small" />
        </ListItemIcon>
        {t("notifications", { defaultValue: "Notifications" })}
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        {t("logout")}
      </MenuItem>
    </Menu>
  );
};

export default ProfileMenu;
