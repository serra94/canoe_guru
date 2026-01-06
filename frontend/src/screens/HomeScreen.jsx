import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Users, Trophy, Medal } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import RulesContent from "../components/ui/RulesContent";

import Carousel from "../components/home/Carousel";

import { MOCK_USER } from "../mock/auth";
import { MOCK_RULES } from "../mock/rules";

const HomeScreen = () => {
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- O TRUQUE ESTÁ AQUI ---
  // Criamos o visual "CanoeGuru" com a fonte Orbitron APENAS para esta tela.
  const LogoHome = (
    <span className="font-orbitron font-extrabold tracking-wide text-xl">
      <span className="text-white">Canoe</span>
      <span className="text-[#4f7cff]">Guru</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      
      {/* Passamos o componente estilizado como título */}
      <Header title={LogoHome} />

      <main className="p-4 grid grid-cols-1 gap-4 mt-2 max-w-md mx-auto">

        {/* Welcome */}
        <div className="mb-2">
          <h2 className="text-white text-xl">
            {t("home.hello")}{" "}
            <span className="font-bold text-[#4f7cff]">{MOCK_USER.name}</span>!
          </h2>
          <p className="text-gray-400 text-sm">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Carousel */}
        <Carousel navigate={navigate} />

        {/* GRID 2×2 */}
        <div className="grid grid-cols-2 gap-4">

          {/* Regras Globais */}
          <Card
            onClick={() => setShowRules(true)}
            className="h-40 flex flex-col items-center justify-center gap-2 border-[#365ef0]/30 hover:bg-[#152a45]"
          >
            <div className="p-3 bg-blue-900/30 rounded-full text-[#4f7cff]">
              <AlertCircle size={32} />
            </div>
            <span className="font-bold text-white text-center">
              {t("home.global_rules")}
            </span>
          </Card>

          {/* Meu Time */}
          <Card
            onClick={() => navigate("/my-team")}
            className="h-40 flex flex-col items-center justify-center gap-3 border-[#7a54ff]/30 hover:bg-[#152a45]"
          >
            <div className="p-3 bg-purple-900/30 rounded-full text-[#7a54ff]">
              <Users size={32} />
            </div>
            <span className="font-bold text-white text-center">
              {t("home.my_team")}
            </span>
          </Card>

          {/* Ranking */}
          <Card
            onClick={() => navigate("/ranking")}
            className="h-40 flex flex-col items-center justify-center gap-3 border-yellow-500/30 hover:bg-[#152a45]"
          >
            <div className="p-3 bg-yellow-900/30 rounded-full text-yellow-500">
              <Trophy size={32} />
            </div>
            <span className="font-bold text-white text-center">
              {t("home.global_ranking")}
            </span>
          </Card>

          {/* Ligas */}
          <Card
            onClick={() => navigate("/leagues")}
            className="h-40 flex flex-col items-center justify-center gap-3 border-green-500/30 hover:bg-[#152a45]"
          >
            <div className="p-3 bg-green-900/30 rounded-full text-green-500">
              <Medal size={32} />
            </div>
            <span className="font-bold text-white text-center">
              {t("home.leagues")}
            </span>
          </Card>

        </div>
      </main>

      {/* Modal Regras */}
      <Modal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title={t("home.global_rules")}
      >
        <RulesContent />
        <div className="mt-6">
          <Button onClick={() => setShowRules(false)}>
            {t("home.understood")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default HomeScreen;