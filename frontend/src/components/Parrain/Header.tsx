import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  logout: () => void;
  currentLang: string;
  toggleLanguage: () => void;
  handleSearch: (searchTerm: string) => void;
  currentTime: string | null;
}

const Header: React.FC<HeaderProps> = ({ logout, currentLang, toggleLanguage, handleSearch, currentTime }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap px-6 pt-4">
        <h1 className="text-rose-500 font-semibold text-2xl tracking-tight">Tind'eirb</h1>
        <div className="flex">
          <button
            className="btn rounded-full dark:bg-white dark:text-gray-900 dark:hover:bg-rose-500 dark:hover:text-white"
            onClick={logout}
          >
            {t('parrain.logout')}
          </button>
          <img
            src={currentLang === 'fr' ? './img/flag-uk.svg' : './img/flag-fr.svg'}
            alt={currentLang === 'fr' ? 'English' : 'Français'}
            className="ml-2 h-10 ml-7 mr-7 my-auto cursor-pointer"
            onClick={toggleLanguage}
          />
        </div>
      </div>
      <div className="text-center mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {currentTime && currentTime.includes('T')
            ? `${currentTime.split('T')[0]} ${currentTime.split('T')[1].slice(0, 5)}`
            : 'Loading...'}
        </h1>
      </div>
      <div className="w-full p-5">
        <input
          type="text"
          placeholder={`🔍 ${t('parrain.search-bar')}`}
          className="w-full px-5 py-3 rounded-full box-border bg-gray-100 dark:bg-gray-700 outline-none hover:ring-2 hover:ring-gray-500 transition duration-300 ease-in-out"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Header;
