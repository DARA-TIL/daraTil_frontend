import { useTranslation } from "react-i18next";

const NavBar = () => {
  const lngs = {
    en: { nativeName: "EN" },
    ru: { nativeName: "RU" },
    kz: { nativeName: "KZ" },
  } as const;

  const { i18n } = useTranslation();

  return (
    <div>
      <h1>NavBar</h1>
      <div>
        {Object.keys(lngs).map((lng) => {
          const langKey = lng as keyof typeof lngs;

          return (
            <button
              key={lng}
              style={{
                fontWeight:
                  i18n.resolvedLanguage === lng ? "bold" : "normal",
              }}
              type="button"
              onClick={() => i18n.changeLanguage(lng)}
            >
              {lngs[langKey].nativeName}
            </button>
          );
        })}
      </div>
    </div>
  )
}

export default NavBar
