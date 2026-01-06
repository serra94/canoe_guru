import React from 'react';
import { Trophy, Calendar, Clock } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Card from '../ui/Card';

const CardEvent = ({ event, onClick }) => {
  const { t } = useTranslation();

  const statusColors = {
    open: 'text-green-400',
    closed: 'text-red-400',
    future: 'text-gray-400',
  };

  const statusLabels = {
    open: t('event.status.open'),
    closed: t('event.status.closed'),
    future: t('event.status.future'),
  };

  return (
    <Card onClick={onClick} className="mb-4 flex gap-4 hover:border-[#365ef0] transition-colors">
      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        <div
          className={`w-full h-full flex items-center justify-center ${
            event.status === 'open' ? 'bg-blue-900' : 'bg-gray-800'
          }`}
        >
          <Trophy className="text-white/20" size={32} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-lg leading-tight">{event.name}</h3>

          {event.status === 'open' && (
            <div className="animate-pulse w-2 h-2 rounded-full bg-green-500 mt-1.5" />
          )}
        </div>

        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
          <Calendar size={14} /> {event.date}
        </p>

        <div className="mt-2 flex justify-between items-center">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${statusColors[event.status]}`}
          >
            {statusLabels[event.status]}
          </span>

          {event.status === 'open' && (
            <span className="text-xs text-[#4f7cff] font-medium flex items-center gap-1">
              <Clock size={12} /> 02d 14h
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CardEvent;
