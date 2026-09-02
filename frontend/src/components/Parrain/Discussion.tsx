import React, { useRef, useEffect, useState } from 'react';
import Avatar from '../Avatar';
import { Fillot } from '../../views/ParrainView';
import { useTranslation } from 'react-i18next';
import ChatComponent from './ChatComponent';
import { notify } from '../Notifications';

interface DiscussionProps {
  activeFillot: Fillot;
  user: any;
  currentTime: string;
  maxFillots: number;
  setActiveFillot: (fillot: Fillot | null) => void;
  getAdoptionStatus: (fillot: Fillot) => string;
}

const Discussion: React.FC<DiscussionProps> = ({
  activeFillot,
  user,
  currentTime,
  maxFillots,
  setActiveFillot,
  getAdoptionStatus,
}) => {
  const discussionRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [canAdopt, setCanAdopt] = useState<boolean>(true);

  const scrollToTop = () => {
    if (discussionRef.current) {
      discussionRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [activeFillot]);

  useEffect(() => {
    const now = new Date(currentTime);
    const shotgun = new Date(user.shotgunDate);
    const diff = shotgun.getTime() - now.getTime();

    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    } else {
      setTimeLeft('');
    }
  }, [currentTime, user.shotgunDate]);

  const getYear = () => {
    return parseInt(user.diplome.substring(5, 6), 10);
  };

  const selectFillot = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/adoptFillot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idParrain: user.id,
          idFillot: id,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setActiveFillot({
          ...activeFillot,
          parrain: user.id,
        });
        fetchMayAdopt();
      } else {
        console.error('Erreur lors de l\'adoption du fillot:', data.message);
        notify("Erreur lors de l'adoption du fillot")
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel de la route d\'adoption:', error);
    }
  };

  const fetchMayAdopt = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/nbFillots?id=${encodeURIComponent(user.id)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setCanAdopt(data.nbfillots < maxFillots);
      } else {
        console.error('Failed to fetch fillots:', data.message);
        setCanAdopt(false);
      }
    } catch (error) {
      console.error('Error fetching fillots:', error);
      setCanAdopt(false);
    }
  };

  useEffect(() => {
    fetchMayAdopt();
  }, [user.id, maxFillots]);

  return (
    <div className="flex flex-col h-screen w-full z-10">
      <div className="w-full min-h-16 h-fit md:h-16 bg-white/80 backdrop-blur-md dark:bg-gray-900 relative z-10 shadow-sm flex items-center gap-4 p-5 font-semibold text-lg">
        <button onClick={() => setActiveFillot(null)}>
          <img src="./img/arrow-left-solid.svg" alt="Retour" className="w-6 h-6 dark:invert" />
        </button>
        <div className="w-10 h-10">
          <Avatar seed={activeFillot.id || ''} />
        </div>
        <div>
          <h1>
            {activeFillot.firstName} {activeFillot.lastName}
          </h1>
          <h1 className="font-light text-sm text-gray-500 dark:text-gray-200 -mt-1">
            {getAdoptionStatus(activeFillot)}
          </h1>
        </div>
      </div>

      <div className="p-10 flex-1 overflow-y-scroll" ref={discussionRef}>
        {(!activeFillot.infos || !activeFillot.infos.res) ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium p-4 bg-gray-100 dark:bg-gray-800 rounded-md shadow-md">
            {t('parrain.discussion.noInfos')}
          </p>
        ) : (
          <ChatComponent activeFillot={activeFillot} user={user} />
        )}
      </div>

      {getYear() > 4 ? (
        <button className="select-btn bg-rose-500" disabled>
          <p className="inline-block">{t('parrain.discussion.tooOld')}</p>
        </button>
      ) : activeFillot.parrain === user.id ? (
        <button className="select-btn bg-gray-500 cursor-not-allowed text-white">
          {activeFillot.firstName}{' '}
          {(activeFillot.infos === null || !activeFillot.infos.sex)
            ? t('parrain.discussion.alreadyYour.none')
            : activeFillot.infos.sex === 'F'
              ? t('parrain.discussion.alreadyYour.F')
              : t('parrain.discussion.alreadyYour.M')}
        </button>
      ) : activeFillot.parrain && activeFillot.parrain !== user.id ? (
        <button className="select-btn cursor-not-allowed bg-gray-500" disabled>
          <p>
            {activeFillot.firstName} {t('parrain.discussion.adoptedByColleague')}
          </p>
        </button>
      ) : timeLeft ? (
        <button className="select-btn bg-rose-500 cursor-not-allowed" disabled>
          <p className="inline-block">
            {t('parrain.discussion.adoptIn.0')} {activeFillot.firstName}
            {t('parrain.discussion.adoptIn.1')} {timeLeft}
          </p>
        </button>
      ) : !canAdopt ? (
        <button className="select-btn cursor-not-allowed bg-gray-500">
          <p>
            {t('parrain.discussion.tooMuch.0')} {activeFillot.firstName}
            {t('parrain.discussion.tooMuch.1')} {maxFillots} fillot.e.s
          </p>
        </button>
      ) : (
        <button
          className="select-btn bg-rose-500 hover:bg-black dark:hover:bg-gray-50 dark:hover:text-gray-900"
          onClick={() => { selectFillot(activeFillot.id); }}
        >
          <p className="inline-block">
            {t('parrain.discussion.adopt')} {activeFillot.firstName}
          </p>
        </button>
      )}
    </div>
  );
};

export default Discussion;
