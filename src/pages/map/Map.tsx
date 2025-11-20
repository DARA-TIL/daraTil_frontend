import { useTranslation } from "react-i18next"

const Map = () => {
  const { t } = useTranslation()
  return (
    <div>
      <h1>{t("mapPage.map")}</h1>
    </div>
  )
}

export default Map
