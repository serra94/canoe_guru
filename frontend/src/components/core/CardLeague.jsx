import React from 'react';
import { Star, UserPlus, Lock, Check } from 'lucide-react';
import { useTranslation } from "react-i18next";
import Card from '../ui/Card';

const CardLeague = ({ league, onAction }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#365ef0] to-[#7a54ff] flex items-center justify-center text-white font-bold text-lg">
          {league.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">{league.name}</h3>
          <p className="text-xs text-gray-400">
            {league.members} {t('league.members')} • {league.type === 'public' ? t('league.public') : t('league.private')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {league.isAdmin && <Star size={16} className="text-yellow-500" />}

        {!league.isMember && league.type === 'public' && (
          <button className="bg-[#365ef0] p-2 rounded-lg text-white" onClick={onAction}>
            <UserPlus size={18} />
          </button>
        )}

        {!league.isMember && league.type === 'private' && (
          <Lock size={18} className="text-gray-500" />
        )}

        {league.isMember && !league.isAdmin && (
          <Check size={18} className="text-green-500" />
        )}
      </div>
    </Card>
  );
};

export default CardLeague;
