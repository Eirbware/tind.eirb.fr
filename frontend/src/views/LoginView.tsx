import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import '../assets/styles/LoginView.css';

import PhotosBackground from '../components/PhotosBackground';

interface LoginViewProps {
  loading: boolean;
  loginWithCas: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ loading, loginWithCas }) => {
  const { t, i18n } = useTranslation();
  const [scroll, setScroll] = useState<number>(0);

  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  function handlescroll() {
    setScroll((window.scrollY / window.innerHeight) * 3);
  }

  useEffect(() => {
    window.addEventListener("scroll", handlescroll);
    return () => {
      window.removeEventListener("scroll", handlescroll);
    };
  }, []);

  return (
    <div className='background'>
      <PhotosBackground />
      <div className='background-overlay'>
        <header>
          <div className='login-logo'>
            <img
              src='./img/logo.png'
              alt='Logo'
              className='h-7 md:h-8 w-auto'
            />
            <img
              src='./img/logo_text.png'
              alt='Logo text'
              className='h-7 md:h-8 w-auto'
            />
          </div>
          <div className="flex items-center">
            <button
              className='login-btn'
              onClick={loginWithCas}
              disabled={loading}
            >
              {loading ? t('login.logginIn') : t('login.create')}
            </button>
            <img
              src={currentLang === 'fr' ? './img/flag-uk.svg' : './img/flag-fr.svg'}
              alt={currentLang === 'fr' ? 'English' : 'Français'}
              className="ml-2 h-10 ml-7 mr-7 cursor-pointer"
              onClick={toggleLanguage}
            />
          </div>
        </header>
        <div className='login-container' style={{ opacity: 1 - scroll }}>
          <h1 className='text-5xl md:text-[110px]'>
            {t('login.title.1')}<br />{t('login.title.2')}
            <sup className='text-3xl md:text-[34px]'>TM</sup>
          </h1>
          <p className='text-sm md:text-base text-gray-300 pb-4 mt-4'>
            {t('login.CGU.1')}
            <br className='hidden sm:block' />
            {t('login.CGU.2')}
          </p>
          <button
            className="register-btn"
            onClick={loginWithCas}
            disabled={loading}
          >
            {loading ? t('login.logginIn') : t('login.login')}
          </button>
        </div>
        <footer style={{ opacity: 1 - scroll }}>
          {t('login.footer')}
        </footer>
      </div>
      <div className="mentions text-gray-400">
        {t('login.mention.1')}<br /><br />
        {t('login.mention.2')}
        <hr />
        <div
          style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}
        >
          <span>
            Pôle Web &gt; Pôle Log &gt;&gt; Pôle Com &gt; MNT &gt; MFB &gt; WST &gt; DNS &gt;&gt;&gt;&gt; CRB &gt; UNV &gt; MSQ &gt; JK &gt; NK &gt; BAR &gt; Pôle event
          </span>
          <span>
            <span className="copyleft">&copy;</span> {t('login.mention.copyleft')}</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
