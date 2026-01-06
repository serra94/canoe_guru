import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import CardLeague from "../components/core/CardLeague";

import { MOCK_LEAGUES } from "../mock/leagues";

const LeaguesScreen = () => {
  const [activeTab, setActiveTab] = useState("my");
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      <Header title={t("home.leagues")} showBack onBack={() => navigate("/home")} />

      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-2 mb-4">
          <Input placeholder={t("league.search")} icon={Search} />

          <button
            onClick={() => navigate("/create-league")}
            className="bg-[#365ef0] w-14 rounded-xl flex items-center justify-center text-white shadow-lg mb-4"
          >
            <div className="text-2xl">+</div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-4">
          {["mine", "explore", "admin"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#4f7cff] text-white"
                  : "border-transparent text-gray-500"
              }`}
            >
              {t(`league.tabs.${tab}`)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {MOCK_LEAGUES.map((league) => (
            <CardLeague
              key={league.id}
              league={league}
              onAction={() => alert(`${t("league.requestEntry")} ${league.name}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaguesScreen;
