import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Carousel from "../components/home/Carousel";
import { MOCK_GLOBAL_RANKING } from "../mock/ranking";

const RankingScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const country = localStorage.getItem("country") || "BR";

  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      <Header title={t("ranking.title")} showBack onBack={() => navigate("/home")} />

      <div className="p-4 max-w-md mx-auto grid grid-cols-1 gap-4">

        <Carousel mode="ads-only" country={country} />

        <div className="bg-gradient-to-r from-[#112240] to-[#0a1a2f] p-6 rounded-xl text-center border border-gray-800 mt-2">
          <h2 className="text-gray-400 uppercase text-xs tracking-widest mb-1">
            {t("ranking.season2025")}
          </h2>
          <h3 className="text-2xl font-bold text-white">
            {t("ranking.guruOfTheYear")}
          </h3>
        </div>

        <div className="bg-[#112240] rounded-xl overflow-hidden border border-gray-800">
          <table className="w-full text-left">
            <thead className="bg-[#0f172a] text-gray-400 text-xs uppercase">
              <tr>
                <th className="py-3 pl-4">#</th>
                <th className="py-3">{t("ranking.user")}</th>
                <th className="py-3 text-right pr-4">{t("ranking.points")}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {MOCK_GLOBAL_RANKING.map((user, idx) => (
                <tr key={user.rank} className={user.rank === 2 ? "bg-[#365ef0]/10" : ""}>
                  <td className="py-4 pl-4 text-white font-bold flex items-center gap-2">
                    {idx === 0 && <span className="text-yellow-400">🥇</span>}
                    {idx === 1 && <span className="text-gray-300">🥈</span>}
                    {idx === 2 && <span className="text-orange-400">🥉</span>}
                    {user.rank}
                  </td>

                  <td className="py-4">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.league}</div>
                  </td>

                  <td className="py-4 text-right pr-4 text-[#4f7cff] font-bold">
                    {user.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default RankingScreen;
