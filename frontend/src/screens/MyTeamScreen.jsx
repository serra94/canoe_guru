import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import CardEvent from "../components/core/CardEvent";

import { MOCK_EVENTS } from "../mock/events";

const MyTeamScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      <Header title={t("team.title")} showBack onBack={() => navigate("/home")} />

      <div className="p-4 max-w-md mx-auto">
        <Input placeholder={t("team.search_event")} icon={Search} />

        <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 mt-2">
          {t("team.available_events")}
        </h2>

        {MOCK_EVENTS.map((event) => (
          <CardEvent
            key={event.id}
            event={event}
            onClick={() => navigate(`/event/${event.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default MyTeamScreen;
