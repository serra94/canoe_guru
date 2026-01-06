import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Card from '../ui/Card';

const CardCategory = ({ category, isComplete, onSelect }) => {
  const { t } = useTranslation();

  return (
    <Card
      onClick={onSelect}
      className="mb-3 border-l-4 border-l-[#365ef0] flex justify-between items-center py-3"
    >
      <div>
        <h4 className="font-bold text-white">{category}</h4>
        <p className="text-xs text-gray-400 mt-0.5">
          {isComplete ? t('category.complete') : t('category.incomplete')}
        </p>
      </div>

      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isComplete ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'
        }`}
      >
        {isComplete ? <Check size={16} /> : <ChevronRight size={16} />}
      </div>
    </Card>
  );
};

export default CardCategory;
