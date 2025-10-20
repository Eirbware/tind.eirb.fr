import React from 'react';
import Avatar from '../Avatar';
import { Fillot } from '../../views/ParrainView';
import { useTranslation } from 'react-i18next';

interface FillotItemProps {
  fillot: Fillot;
  user: any;
  activeFillot: Fillot | null;
  setActiveFillot: (fillot: Fillot | null) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  getFilliere: (fillot: Fillot) => string;
}

const FillotItem: React.FC<FillotItemProps> = React.memo(({
  fillot,
  user,
  activeFillot,
  setActiveFillot,
  addFavorite,
  removeFavorite,
  getFilliere,
}) => {
  const { t } = useTranslation();
  const isActive = activeFillot && activeFillot.id === fillot.id;

  const getAdoptionStatus = () => {
    const gender = fillot.infos?.sex || 'none';
    if (fillot.parrain === '') {
      return `${getFilliere(fillot)} ${t('parrain.actions.orphan')}`;
    } else if (fillot.parrain === user.id) {
      return t(`parrain.actions.adopted.${gender}`);
    } else {
      return t(`parrain.actions.adoptedByColleague.${gender}`);
    }
  };

  return (
    <div 
      className={`flex gap-2 justify-between p-3 mb-1 w-full cursor-pointer items-center rounded-md ${
        isActive ? "bg-rose-500 hover:bg-rose-500 text-white dark:text-gray-900"
        : fillot.parrain !== '' && fillot.parrain !== user.id ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        : fillot.parrain === user.id ? "bg-orange-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        : "hover:bg-rose-100 dark:hover:bg-rose-900"
      }`}
      onClick={() => {
        isActive ? setActiveFillot(null) : setActiveFillot(fillot);
      }}
    >
      <div className='w-16 h-16'>
        <Avatar seed={fillot.id} />
      </div>
      <div className='flex flex-col w-full text-gray-500 dark:text-gray-200'>
        <h1 
          className={`font-semibold text-xl px-2 w-full text-ellipsis ${
            isActive 
              ? "text-white"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {fillot.firstName} {fillot.lastName}
        </h1>
        <h1 
          className={`w-fit px-2 ${
            isActive 
              ? "text-white"
              : "text-gray-900 dark:text-gray-200"
          }`}
        >
          {getAdoptionStatus()}
        </h1>
      </div>
      <button
        className='rounded-full h-8 flex items-center justify-center aspect-square bg-white shadow-md hover:scale-110 transition duration-300 ease-in-out group'
        onClick={(e) => {
          e.stopPropagation();
          user.favorites.includes(fillot.id) 
            ? removeFavorite(fillot.id)
            : addFavorite(fillot.id)
        }}
      >
        <span
          className='absolute group-hover:inline-block hidden line-clamp-1 text-xs px-2 py-1 bg-gray-900 text-white rounded-md whitespace-nowrap z-20 right-5 shadow-md bottom-6'  
        >
          {user.favorites.includes(fillot.id) 
            ? t("parrain.actions.removeFavorite")
            : t("parrain.actions.addFavorite")}
        </span>
        <img
          src={user.favorites.includes(fillot.id) ? '/img/reload.svg' : '/img/star.svg'}
          alt="action"
          className="w-5 h-5"
        />
      </button>
    </div>
  );
});

export default FillotItem;
