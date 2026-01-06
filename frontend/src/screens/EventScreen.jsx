import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Clock, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

import CardCategory from "../components/core/CardCategory";
import ResultCard from "../components/core/ResultCard";

import {
  fetchEvent,
  fetchEventAthletes,
  fetchEventCategories,
  fetchEventResults
} from "../services/api";

const EventScreen = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [event, setEvent] = useState();
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [athletesByCategory, setAthletesByCategory] = useState({});

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectionError, setSelectionError] = useState("");

  const [selections, setSelections] = useState({});

  const getDarkHorseMinRank = () => {
    if (!event || !selectedCategory) return null;
    if (selectedCategory.dark_horse_min_rank) return selectedCategory.dark_horse_min_rank;
    if (event.is_official) return 11;
    return null;
  };

  const getVisibleAthletes = () => {
    if (!selectedCategory) return [];
    const list = athletesByCategory[selectedCategory.id] || [];
    if (selectedPosition !== "darkHorse") return list;
    const minRank = getDarkHorseMinRank();
    if (!minRank) return list;
    return list.filter(
      (athlete) => athlete.ranking_position != null && athlete.ranking_position >= minRank
    );
  };

  useEffect(() => {
    if (!selectedCategory) return;
    if (athletesByCategory[selectedCategory.id]) return;
    let mounted = true;
    fetchEventAthletes(eventId, selectedCategory.id)
      .then((data) => {
        if (!mounted) return;
        setAthletesByCategory((prev) => ({
          ...prev,
          [selectedCategory.id]: data
        }));
      })
      .catch(() => {
        if (!mounted) return;
        setAthletesByCategory((prev) => ({
          ...prev,
          [selectedCategory.id]: []
        }));
      });
    return () => {
      mounted = false;
    };
  }, [eventId, selectedCategory, athletesByCategory]);

  useEffect(() => {
    if (!categories.length) return;
    let mounted = true;
    Promise.all(
      categories.map((cat) => {
        if (athletesByCategory[cat.id]) return Promise.resolve();
        return fetchEventAthletes(eventId, cat.id).then((data) => {
          if (!mounted) return;
          setAthletesByCategory((prev) => ({
            ...prev,
            [cat.id]: data
          }));
        });
      })
    ).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [categories, eventId, athletesByCategory]);

  useEffect(() => {
    setSelectionError("");
  }, [selectedCategory, selectedPosition]);

  useEffect(() => {
    let mounted = true;
    fetchEvent(eventId)
      .then((data) => {
        if (mounted) setEvent(data);
      })
      .catch(() => {
        if (mounted) setEvent(null);
      });

    fetchEventCategories(eventId)
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });

    fetchEventResults(eventId)
      .then((data) => {
        if (mounted) setResults(data);
      })
      .catch(() => {
        if (mounted) setResults([]);
      });

    return () => {
      mounted = false;
    };
  }, [eventId]);

  const handleSaveSelection = (athlete) => {
    if (!selectedCategory || !selectedPosition) return;
    const currentSelections = selections[selectedCategory.id] || {};
    const alreadySelected = Object.values(currentSelections).includes(athlete.id);
    if (alreadySelected) {
      setSelectionError(t("event.podium.duplicateAthlete"));
      return;
    }
    if (selectedPosition === "darkHorse") {
      const minRank = getDarkHorseMinRank();
      if (minRank && (athlete.ranking_position == null || athlete.ranking_position < minRank)) {
        setSelectionError(t("event.podium.darkHorseInvalid"));
        return;
      }
    }

    setSelectionError("");
    setSelections((prev) => ({
      ...prev,
      [selectedCategory.id]: {
        ...prev[selectedCategory.id],
        [selectedPosition]: athlete.id
      }
    }));
    setSelectedPosition(null);
  };

  const isCategoryComplete = (cat) => {
    const s = selections[cat.id];
    return s && s.first && s.second && s.third && s.darkHorse;
  };

  const getAthleteName = (cat, pos) => {
    const id = selections[cat.id]?.[pos];
    if (!id) return null;
    const athlete = athletesByCategory[cat.id]?.find((a) => a.id === id);
    return athlete?.name || t("event.notFound");
  };

  const resultsByCategory = useMemo(() => {
    const map = {};
    results.forEach((result) => {
      map[result.event_category_id] = {
        first: result.first_athlete_id,
        second: result.second_athlete_id,
        third: result.third_athlete_id,
        darkHorse: result.dark_horse_athlete_id
      };
    });
    return map;
  }, [results]);

  const eventHasResults = results.length > 0;
  const isOpen = event?.status === "open";
  const isInProgress = event?.status === "in_progress";
  const isFinished = event?.status === "finished";
  const statusBadgeClass = {
    open: "text-green-400 border-green-400/30",
    upcoming: "text-gray-400 border-gray-400/30",
    in_progress: "text-yellow-400 border-yellow-400/30",
    finished: "text-red-400 border-red-400/30"
  };

  // EVENTO NÃO ENCONTRADO
  if (event === undefined) {
    return (
      <div className="min-h-screen bg-[#0a1a2f] pb-20">
        <Header
          title={t("event.titleFallback")}
          showBack
          onBack={() => navigate("/my-team")}
        />
        <div className="p-4 max-w-md mx-auto text-white">
          {t("event.loading")}
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-[#0a1a2f] pb-20">
        <Header
          title={t("event.titleFallback")}
          showBack
          onBack={() => navigate("/my-team")}
        />

        <div className="p-4 max-w-md mx-auto text-white">
          {t("event.notFound")}
        </div>
      </div>
    );
  }

  // RESULTADOS DISPONÍVEIS
  if (eventHasResults || isFinished || isInProgress) {
    return (
      <div className="min-h-screen bg-[#0a1a2f] pb-20">
        <Header title={event.name} showBack onBack={() => navigate("/my-team")} />

        <div className="p-4 max-w-md mx-auto">
          <div className="bg-[#112240] p-4 rounded-xl mb-6 border-b-4 border-b-[#365ef0]">
            <h2 className="text-white font-bold text-xl">
              {t("event.results.title")}
            </h2>

            <p className="text-gray-400 text-sm">
              {t("event.results.finalScore")}{" "}
              <span className="text-[#4f7cff] font-bold">45 pts</span>
            </p>
          </div>

          {categories.map((cat) => (
            <ResultCard
              key={cat.id}
              category={cat.name}
              selections={selections[cat.id] || {}}
              officialResults={resultsByCategory[cat.id]}
              athletes={athletesByCategory[cat.id] || []}
            />
          ))}
        </div>
      </div>
    );
  }

  // MODO OURO (seleção)
  return (
    <div className="min-h-screen bg-[#0a1a2f] pb-20">
      <Header title={event.name} showBack onBack={() => navigate("/my-team")} />

      {/* Event Info */}
      <div className="bg-[#112240] p-4 mb-4 border-b border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs font-bold uppercase border px-2 py-1 rounded ${
                statusBadgeClass[event.status] || "text-gray-400 border-gray-400/30"
              }`}
            >
              {t(`event.statusBanner.${event.status}`)}
            </span>

            {isOpen && (
              <span className="text-white text-xs flex items-center gap-1">
                <Clock size={12} /> {t("event.closesIn")}
              </span>
            )}
          </div>

          <p className="text-gray-400 text-sm">
            {t("event.completeAllCategories")}
          </p>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="p-4 max-w-md mx-auto">
        <div className="space-y-3">
          {categories.map((cat) => (
            <CardCategory
              key={cat.id}
              category={cat.name}
              isComplete={isCategoryComplete(cat)}
              onSelect={isOpen ? () => setSelectedCategory(cat) : undefined}
            />
          ))}
        </div>

        <div className="mt-8">
          <Button disabled={!isOpen || !categories.every(isCategoryComplete)}>
            {t("event.confirmTeam")}
          </Button>
        </div>
      </div>

      {/* MODAL 1 — PÓDIO */}
      <Modal
        isOpen={!!selectedCategory && !selectedPosition}
        onClose={() => setSelectedCategory(null)}
        title={`${t("event.podium.title")} ${selectedCategory?.name || ""}`}
      >
        <div className="grid grid-cols-1 gap-4 mt-2">
          {[
            {
              id: "first",
              label: t("event.podium.first"),
              color: "text-yellow-400",
              border: "border-yellow-500/50"
            },
            {
              id: "second",
              label: t("event.podium.second"),
              color: "text-gray-300",
              border: "border-gray-400/50"
            },
            {
              id: "third",
              label: t("event.podium.third"),
              color: "text-orange-400",
              border: "border-orange-500/50"
            },
            {
              id: "darkHorse",
              label: t("event.podium.darkHorse"),
              color: "text-[#7a54ff]",
              border: "border-[#7a54ff]/50"
            }
          ].map((pos) => (
            <div
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={`bg-[#0a1a2f] border-2 ${pos.border} rounded-xl p-4 flex items-center justify-between cursor-pointer active:bg-gray-800 transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-gray-800 ${pos.color}`}
                >
                  {pos.id === "darkHorse"
                    ? "?"
                    : pos.id === "first"
                    ? "1"
                    : pos.id === "second"
                    ? "2"
                    : "3"}
                </div>

                <div>
                  <p className={`text-xs font-bold uppercase ${pos.color}`}>
                    {pos.label}
                  </p>

                  <p className="text-white font-medium text-lg">
                    {selectedCategory
                      ? getAthleteName(selectedCategory, pos.id) ||
                        t("event.podium.select")
                      : t("event.podium.select")}
                  </p>
                </div>
              </div>

              <ChevronRight className="text-gray-600" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={() => setSelectedCategory(null)}>
            {t("event.podium.save")}
          </Button>
        </div>
      </Modal>

      {/* MODAL 2 — ATLETAS */}
      <Modal
        isOpen={!!selectedPosition}
        onClose={() => setSelectedPosition(null)}
        title={
          selectedPosition === "darkHorse"
            ? t("event.athlete.chooseDarkHorse")
            : t("event.athlete.choose")
        }
      >
        <Input
          placeholder={t("event.athlete.search")}
          icon={Search}
        />

        {selectionError && (
          <div className="mt-2 text-xs text-red-400">{selectionError}</div>
        )}

        <div className="mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                <th className="py-2 pl-2">{t("event.athlete.rank")}</th>
                <th className="py-2">{t("event.athlete.name")}</th>
                <th className="py-2 text-right pr-2">{t("event.athlete.country")}</th>
              </tr>
            </thead>

            <tbody className="text-white">
              {getVisibleAthletes().map((athlete) => (
                <tr
                  key={athlete.id}
                  onClick={() => handleSaveSelection(athlete)}
                  className="border-b border-gray-800 hover:bg-[#1a3a5c] cursor-pointer transition-colors"
                >
                  <td className="py-3 pl-2 font-mono text-gray-400">
                    {athlete.ranking_position ?? "-"}
                  </td>

                  <td className="py-3 font-medium">{athlete.name}</td>

                  <td className="py-3 text-right pr-2 text-gray-400">
                    {athlete.country_code}
                  </td>
                </tr>
              ))}

              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-800 opacity-50">
                  <td className="py-3 pl-2 text-gray-600">-</td>
                  <td className="py-3 text-gray-600">
                    {t("event.athlete.other")}
                  </td>
                  <td className="py-3 text-right pr-2 text-gray-600">--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default EventScreen;
