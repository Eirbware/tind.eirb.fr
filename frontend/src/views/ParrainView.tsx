import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';
import Header from '../components/Parrain/Header';
import TabNavigation from '../components/Parrain/TabNavigation';
import FillotList from '../components/Parrain/FillotList';
import Discussion from '../components/Parrain/Discussion';
import '../assets/styles/ParrainView.css';

// Interface representing a Fillot's data structure
export interface Fillot {
  id: string;
  firstName: string;
  lastName: string;
  diploma: string;
  parrain: string;
  infos: {
    res: string[];
    sex: string;
  } | null;
}

// Props interface for the ParrainView component
interface ParrainViewProps {
  user: User;
  pb: any;
  logout: () => void;
  isAuthenticated: () => boolean;
  setUser: (user: User) => void;
}

// Interface representing a configuration record in the database
interface ConfigRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  key: string;
  updated: string;
  value: string;
}

const ParrainView: React.FC<ParrainViewProps> = ({ user, pb, logout, setUser }) => {
  const [listFillots, setListFillots] = useState<Fillot[]>([]); // State to store all fillots
  const [filteredFillots, setFilteredFillots] = useState<Fillot[]>([]); // State to store filtered fillots based on the current tab
  const [currentTab, setCurrentTab] = useState<string>('all'); // State to track the currently selected tab
  const [activeFillot, setActiveFillot] = useState<Fillot | null>(null); // State to track the currently active fillot in the discussion
  const [currentTime, setCurrentTime] = useState<string>(''); // State to track the current time for scheduling or other purposes
  const [maxFillots, setMaxFillots] = useState<number>(0); // State to track the maximum number of fillots allowed

  const { t, i18n } = useTranslation(); // Translation hook for internationalization
  const currentLang = i18n.language; // Track the current language setting

  // Function to toggle the language between French and English
  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  // Fetch configuration values like TIME and MAX_FILLOTS from the database
  const fetchConfigValues = async () => {
    try {
      const configs = await pb.collection("config").getFullList();
      const timeConfig = configs.find((config: ConfigRecord) => config.key === "TIME");
      const maxFillotsConfig = configs.find((config: ConfigRecord) => config.key === "MAX_FILLOTS");

      if (timeConfig) {
        setCurrentTime(timeConfig.value);
      }
      if (maxFillotsConfig) {
        setMaxFillots(parseInt(maxFillotsConfig.value));
      }
    } catch (error) {
      console.error('Error fetching config values:', error);
    }
  };

  // Fetch fillots from the database based on the user's diploma
  const fetchFillots = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fillots?idParrain=${encodeURIComponent(user.id)}`);
      const data = await response.json();
      if (data.status === 'success') {
        setListFillots(data.fillots);
        applyFilter(currentTab, data.fillots);
      } else {
        console.error('Failed to fetch fillots:', data.message);
      }
    } catch (error) {
      console.error('Error fetching fillots:', error);
    }
  };

  /*
    Apply filters to the list of fillots based on the selected tab.
    - 'favorites': Only show fillots that are in the user's favorites list.
    - 'mine': Only show fillots that are currently adopted by the user.
    - 'all': Show all fillots.
  */
  const applyFilter = useCallback((tab: string, fillots: Fillot[]) => {
    let filtered = fillots;

    switch (tab) {
      case 'favorites':
        filtered = fillots.filter(fillot => user.favorites.includes(fillot.id));
        break;
      case 'mine':
        filtered = fillots.filter(fillot => fillot.parrain === user.id);
        break;
      case 'all':
      default:
        filtered = fillots;
        break;
    }

    setFilteredFillots(filtered);
  }, [user.favorites, user.id]);

  // Handle tab change and reapply the appropriate filter
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    applyFilter(tab, listFillots);
  };

  /*
    Fetch the fillots and configuration values when the component mounts,
    and re-fetch them when there are updates in the users or config collections.
  */
  useEffect(() => {
    fetchFillots();
    fetchConfigValues();

    // Subscribe to updates in the users and config collections
    pb.collection('users').subscribe('*', async ({ action }: { action: string }) => {
      if (action === 'update' || action === 'create' || action === 'delete') {
        fetchFillots();
      }
    });

    pb.collection('config').subscribe('*', async () => {
      fetchConfigValues();
    });

    // Cleanup the subscriptions when the component unmounts
    return () => {
      pb.collection('users').unsubscribe('*');
      pb.collection('config').unsubscribe('*');
    };
  }, [user]);

  /*
    Handle the search functionality within the fillot list.
    Filters the list based on the search term entered by the user, 
    matching either the fillot's name or information.
  */
  const handleSearch = useCallback((searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    setFilteredFillots(
      listFillots.filter(fillot => {
        const matchesName = `${fillot.firstName} ${fillot.lastName}`.toLowerCase().includes(lowerSearchTerm);
        const matchesInfo = fillot.infos
          ? Object.values(fillot.infos).some(infoValue => {
            if (typeof infoValue === 'string') {
              return infoValue.toLowerCase().includes(lowerSearchTerm);
            } else if (Array.isArray(infoValue)) {
              return infoValue.some(item => item.toLowerCase().includes(lowerSearchTerm));
            }
            return false;
          })
          : false;
        return matchesName || matchesInfo;
      })
    );
  }, [listFillots]);

  // Determine the filliere (major) of a fillot based on their diploma and gender
  const getFilliere = useCallback((fillot: Fillot) => {
    const baseFiliere = (() => {
      switch (fillot.diploma.slice(0, 5)) {
        case 'IIEIN':
          return 'Informaticien';
        case 'IIETE':
          return 'Télécom';
        case 'IIEMM':
          return 'Matméca';
        case 'IIEEL':
          return 'Electronicien';
        default:
          return 'animal';
      }
    })();

    if (!fillot.infos || fillot.infos['sex'] === 'none') {
      if (baseFiliere === 'Télécom' || baseFiliere === 'Matméca') return baseFiliere;
      if (baseFiliere === 'animal') return `${baseFiliere}.e`;
      return `${baseFiliere}.ne`;
    }

    const genderSuffix =
      fillot.infos['sex'] === 'F' && baseFiliere !== 'Télécom' && baseFiliere !== 'Matméca'
        ? baseFiliere === 'animal'
          ? 'e'
          : 'ne'
        : '';

    return baseFiliere + genderSuffix;
  }, []);

  // Determine the adoption status of a fillot based on their gender and parrain status
  const getAdoptionStatus = useCallback((fillot: Fillot) => {
    const gender = fillot.infos?.sex || 'none';
    if (fillot.parrain === '') {
      return t('parrain.actions.orphan');
    } else if (fillot.parrain === user.id) {
      return t(`parrain.actions.adopted.${gender}`);
    } else {
      return t(`parrain.actions.adoptedByColleague.${gender}`);
    }
  }, [t, user.id]);

  // Add a fillot to the user's favorites list and update the database
  const addFavorite = async (id: string) => {
    try {
      const updatedFavorites = [...user.favorites, id];
      await pb.collection('users').update(user.id, {
        favorites: updatedFavorites,
      });
      setUser({ ...user, favorites: updatedFavorites });
      applyFilter(currentTab, listFillots);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  // Remove a fillot from the user's favorites list and update the database
  const removeFavorite = async (id: string) => {
    try {
      const updatedFavorites = user.favorites.filter(favorite => favorite !== id);
      await pb.collection('users').update(user.id, {
        favorites: updatedFavorites,
      });
      setUser({ ...user, favorites: updatedFavorites });
      applyFilter(currentTab, listFillots);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // Render the main UI for the ParrainView component
  return (
    <div className="w-full h-full gradient dark:bg-gray-950">
      <div className="w-full h-full flex items-center bg">
        <div
          className={`w-full md:max-w-md h-full self-start flex flex-col bg-white/90 backdrop-blur-md dark:bg-gray-900 shadow-sm ${activeFillot && 'hidden md:flex'
            }`}
        >
          <Header
            logout={logout}
            currentLang={currentLang}
            toggleLanguage={toggleLanguage}
            handleSearch={handleSearch}
            currentTime={currentTime}
          />
          <TabNavigation currentTab={currentTab} setCurrentTab={handleTabChange} />
          {
            filteredFillots.length !== 0 ?
              <FillotList
                filteredFillots={filteredFillots}
                user={user}
                activeFillot={activeFillot}
                setActiveFillot={setActiveFillot}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                getFilliere={getFilliere}
              />
              : <p className='font-semibold text-center mt-10'>Aucuns fillots disponibles</p>
          }
        </div>

        {activeFillot && (
          <div className="flex flex-col h-screen w-full z-10">
            <Discussion
              activeFillot={activeFillot}
              user={user}
              currentTime={currentTime}
              maxFillots={maxFillots}
              setActiveFillot={setActiveFillot}
              getAdoptionStatus={getAdoptionStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParrainView;
