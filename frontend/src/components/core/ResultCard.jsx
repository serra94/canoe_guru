import React from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from "react-i18next";

const ResultCard = ({ category, selections, officialResults }) => {
  const { t } = useTranslation();

  const calculatePoints = () => {
    let points = 0;
    if (!officialResults) return 0;

    const checkPos = (pos) => {
      const selectedId = selections[pos];
      const officialId = officialResults[pos];
      const isSomewhere = Object.values(officialResults).includes(selectedId);

      if (selectedId === officialId) return 9;
      if (isSomewhere && pos !== 'darkHorse') return 6;
      if (pos === 'darkHorse' && isSomewhere) return 12;
      return 0;
    };

    points += checkPos('first');
    points += checkPos('second');
    points += checkPos('third');
    points += checkPos('darkHorse');

    return points;
  };

  const points = calculatePoints();

  return (
    <div className="bg-[#112240] rounded-xl p-4 mb-4 border border-gray-800">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-white">{category}</h4>
        <span className="text-[#4f7cff] font-bold text-lg">
          {points} {t('points.short')}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {['first', 'second', 'third', 'darkHorse'].map((pos, idx) => {
          const label =
            pos === 'darkHorse'
              ? t('podium.underdog')
              : `${idx + 1}º`;

          const isHit = selections[pos] === officialResults?.[pos];

          return (
            <div key={pos} className="flex flex-col items-center gap-1">
              <span className="text-gray-500">{label}</span>

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isHit
                    ? 'bg-green-900/30 border-green-500 text-green-500'
                    : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}
              >
                {isHit ? <Check size={14} /> : <X size={14} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultCard;
