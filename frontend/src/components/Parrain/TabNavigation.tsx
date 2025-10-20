import React from 'react';
import { useTranslation } from 'react-i18next';

interface TabNavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();

  return (
    <div className="tabs px-5 shadow-sm">
      <a
        className={`tab text-lg transition duration-300 ease-in-out ${currentTab === "all" ? "tab-active" : ""}`}
        onClick={() => setCurrentTab("all")}
      >
        {t('parrain.tab.all')}
      </a>
      <a
        className={`tab text-lg transition duration-300 ease-in-out ${currentTab === "favorites" ? "tab-active" : ""}`}
        onClick={() => setCurrentTab("favorites")}
      >
        {t('parrain.tab.favorites')}
      </a>
      <a
        className={`tab text-lg transition duration-300 ease-in-out ${currentTab === "mine" ? "tab-active" : ""}`}
        onClick={() => setCurrentTab("mine")}
      >
        {t('parrain.tab.mine')}
      </a>
    </div>
  );
};

export default TabNavigation;
