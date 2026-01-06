import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const CreateLeagueScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a1a2f]">
      <Header
        title={t("league.create.title")}
        showBack
        onBack={() => navigate("/leagues")}
      />

      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Nome da Liga */}
        <div>
          <label className="text-white font-bold mb-2 block">
            {t("league.create.nameLabel")}
          </label>

          <Input placeholder={t("league.create.namePlaceholder")} />
        </div>

        {/* Descrição */}
        <div>
          <label className="text-white font-bold mb-2 block">
            {t("league.create.descriptionLabel")}
          </label>

          <textarea
            className="w-full bg-[#112240] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#4f7cff] h-32"
            placeholder={t("league.create.descriptionPlaceholder")}
          ></textarea>
        </div>

        {/* Liga Aberta */}
        <div className="flex items-center justify-between bg-[#112240] p-4 rounded-xl">
          <span className="text-white font-medium">
            {t("league.create.open")}
          </span>

          <div className="w-12 h-6 bg-[#365ef0] rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Botão Criar */}
        <Button onClick={() => navigate("/leagues")}>
          {t("league.create.submit")}
        </Button>
      </div>
    </div>
  );
};

export default CreateLeagueScreen;
