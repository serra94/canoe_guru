import React, { useEffect, useState } from "react";
import { Calendar, Trophy } from "lucide-react";
import { getAds } from "../../services/adService";
import { fetchEvents } from "../../services/api";
import { useTranslation } from "react-i18next";

const Carousel = ({ navigate, mode = "mixed", country = "BR" }) => {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [events, setEvents] = useState([]);

  const { t, i18n } = useTranslation();
  const lang = i18n.language;

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
  }, [mode, country, lang]);

  useEffect(() => {
    getAds(country, "carousel", lang).then((ads) => {
      if (!ads || ads.length === 0) {
        setItems([]);
        return;
      }

      if (mode === "ads-only") {
        const onlyAds = ads.map((ad) => ({ type: "ad", data: ad }));
        setItems(onlyAds);
        return;
      }

      const openEvents = events.filter((e) => e.status !== "finished");

      const combined = [];
      openEvents.forEach((ev, i) => {
        combined.push({ type: "event", data: ev });
        if (ads[i % ads.length]) {
          combined.push({ type: "ad", data: ads[i % ads.length] });
        }
      });

      setItems(combined);
    });
  }, [events, mode, country, lang]);

  useEffect(() => {
    if (items.length === 0) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, 4000);
    return () => clearInterval(t);
  }, [items]);

  if (items.length === 0) return null;

  const item = items[index];

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-xl border border-gray-800 bg-[#0a1a2f]">

      {item.type === "event" && (
        <div
          onClick={() => navigate(`/event/${item.data.id}`)}
          className="w-full h-full p-5 bg-gradient-to-r from-blue-900 to-[#0a1a2f] flex flex-col justify-center cursor-pointer relative"
        >
          <span className="text-[#4f7cff] text-xs font-bold uppercase mb-2 flex items-center gap-1">
            <Trophy size={14} /> {t("carousel.next_event")}
          </span>

          <h3 className="text-white text-2xl font-bold leading-tight">
            {item.data.name}
          </h3>

          <p className="text-gray-300 text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} />{" "}
            {item.data.starts_at
              ? new Date(item.data.starts_at).toLocaleDateString(lang, {
                  day: "2-digit",
                  month: "short"
                })
              : ""}
          </p>
        </div>
      )}

      {item.type === "ad" && (
        <div
          className="w-full h-full bg-cover bg-center p-5 flex flex-col justify-center relative"
          style={{ backgroundImage: `url(${item.data.image})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute top-2 right-2 bg-black/40 text-white text-[10px] px-2 py-1 rounded">
            {t("carousel.sponsored")}
          </div>

          <h3 className="relative z-10 text-white text-2xl font-bold">
            {item.data.title}
          </h3>

          <p className="relative z-10 text-white/90">
            {item.data.subtitle}
          </p>

          <button className="relative z-10 mt-3 bg-white text-black px-3 py-1 rounded text-xs font-bold">
            {item.data.action}
          </button>
        </div>
      )}
    </div>
  );
};

export default Carousel;
