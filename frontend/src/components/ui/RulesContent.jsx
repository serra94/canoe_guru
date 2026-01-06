import { useTranslation } from "react-i18next";

const RulesContent = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-gray-300 leading-relaxed">

      <section>
        <h3 className="text-white font-semibold mb-1">1. {t("rules.title_1")}</h3>
        <p>{t("rules.p1")}</p>
        <p>{t("rules.p2")}</p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-1">2. {t("rules.title_2")}</h3>
        <p>{t("rules.p3")}</p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-1">3. {t("rules.title_3")}</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>{t("rules.p4")}</li>
          <li>{t("rules.p5")}</li>
          <li>{t("rules.p6")}</li>
          <li>{t("rules.p7")}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-1">4. {t("rules.title_4")}</h3>
        <p>{t("rules.p8")}</p>
      </section>

    </div>
  );
};

export default RulesContent;
