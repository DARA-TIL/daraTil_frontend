import {
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";
import { profileMenuItems } from "./navConfig";
import { useNavigate } from "react-router-dom";

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

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem disabled>
        <Typography variant="body2">{username}</Typography>
      </MenuItem>

      <Divider />

      {profileMenuItems.map((item) => (
        <MenuItem key={item.key} onClick={() => navigateTo(item.path)}>
          <ListItemIcon>
            <item.icon fontSize="small" />
          </ListItemIcon>
          {t(item.key)}
        </MenuItem>
      ))}

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