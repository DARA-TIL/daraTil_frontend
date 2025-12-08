import { Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const LanguageMenu = ({ anchorEl, onClose }: Props) => {
  const { i18n } = useTranslation();
  const open = Boolean(anchorEl);

  const langs = {
    en: "EN",
    ru: "RU",
    kz: "KZ",
  } as const;

  type LangKey = keyof typeof langs;

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {(Object.keys(langs) as LangKey[]).map((lng) => (
        <MenuItem
          key={lng}
          selected={i18n.resolvedLanguage === lng}
          onClick={() => {
            i18n.changeLanguage(lng);
            onClose();
          }}
        >
          {langs[lng]}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default LanguageMenu;