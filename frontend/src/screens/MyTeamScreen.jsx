import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import CardEvent from "../components/core/CardEvent";

import { fetchEvents } from "../services/api";

const MyTeamScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchEvents()
      .then((data) => {
        if (mounted) setEvents(data);
      })
      .catch(() => {
        if (mounted) setEvents([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      <Header title={t("team.title")} showBack onBack={() => navigate("/home")} />

      <div className="p-4 max-w-md mx-auto">
        <Input placeholder={t("team.search_event")} icon={Search} />

        <h2 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-4 mt-2">
          {t("team.available_events")}
        </h2>

        {events.map((event) => (
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
