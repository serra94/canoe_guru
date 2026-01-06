import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import mascot from "../assets/capivara_mascote.png";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AdModal from "../components/ui/AdModal";
import { getAds } from "../services/adService";

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [showAd, setShowAd] = useState(false);
  const [adData, setAdData] = useState(null);

  const country = i18n.language === "pt" ? "BR" : "US";
  const lang = i18n.language;

  const handleLogin = async () => {
    const ads = await getAds(country, "login", lang);

    if (ads && ads.length > 0) {
      setAdData(ads[0]);
      setShowAd(true);
      return;
    }

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#0a1a2f] flex flex-col justify-center px-6 relative">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#365ef0] rounded-full blur-[100px] opacity-20 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="flex flex-col items-center mb-12 z-10">
        <div className="flex items-center justify-center mb-6">
          <img
            src={mascot}
            alt="Canoe Guru Mascot"
            className="w-40 h-50 object-contain drop-shadow-xl"
          />
        </div>

        <h1 className="font-orbitron text-4xl font-extrabold tracking-wide">
          <span className="text-white">Canoe</span>
          <span className="text-[#4f7cff]">Guru</span>
        </h1>

        <p className="text-gray-400 mt-2">{t("login.subtitle")}</p>
      </div>

      <div className="w-full max-w-sm mx-auto z-10">
        <Input placeholder={t("login.email")} />
        <Input placeholder={t("login.password")} type="password" />

        <div className="mt-6 space-y-3">
          <Button onClick={handleLogin}>{t("login.login_button")}</Button>
          <Button variant="secondary">{t("login.signup_button")}</Button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          {t("login.forgot")}
        </p>
      </div>

      <AdModal
        ad={adData}
        isOpen={showAd}
        onClose={() => {
          setShowAd(false);
          navigate("/home");
        }}
      />
    </div>
  );
};

export default LoginScreen;
