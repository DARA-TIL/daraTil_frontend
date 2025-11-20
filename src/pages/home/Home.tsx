import { useTranslation } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("homePage.home")}</h1>
    </div>
  );
};

export default Home;
