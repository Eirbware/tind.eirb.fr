import React, { useEffect, useState } from 'react';
import { useUserStore } from './store/useUserStore';
import pb, { isAuthenticated, login, logout } from './api/pocketbase';
import './i18n';
import LoginView from './views/LoginView';
import ParrainView from './views/ParrainView';
import FillotView from './views/FillotView';
import { Notification, notify } from './components/Notifications';
import { User } from './types';

import './App.css';

// Helper function to create a fully populated User object
// This function ensures that a User object has all required fields, providing default values if necessary.
const createCompleteUser = (partialUser: Partial<User> = {}): User => {
  return {
    id: partialUser.id || '',
    username: partialUser.username || '',
    diplome: partialUser.diplome || '',
    shotgunDate: partialUser.shotgunDate || '',
    favorites: partialUser.favorites || [],
    firstName: partialUser.firstName || '',
    lastName: partialUser.lastName || '',
    parrain: partialUser.parrain || '',
    infos: partialUser.infos || { res: null, sex: null },
    ...partialUser
  };
};

// Function to handle the CAS login process
// It triggers the loading state and redirects the user to the CAS authentication page.
const loginWithCas = (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setLoading(true);
  const redirectUrl = window.location.href;
  const serviceUrl = "https://cas.serveur-bde.eirb.fr/";
  const encodedUrl = encodeURIComponent(`${serviceUrl}?token=${btoa(redirectUrl)}`);
  const authenticationCasUrl = `https://cas.bordeaux-inp.fr/login?service=${encodedUrl}`;
  window.location.href = authenticationCasUrl;
}

function App() {
  const { user, setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState<boolean>(false);

  /*
    Retrieve the locally stored diploma on page reload if the user is authenticated.
    This useEffect is triggered whenever the 'user' changes.
  */
  useEffect(() => {
    if (isAuthenticated() && !user?.diplome) {
      const storedDiplome = localStorage.getItem('userDiplome');
      if (storedDiplome) {
        const currentUser = pb.authStore.model ? createCompleteUser(pb.authStore.model) : createCompleteUser();
        setUser({
          ...currentUser,
          diplome: storedDiplome
        });
      }
    }
  }, [isAuthenticated, setUser, user]);

  /*
    Subscribe to authentication state changes and update the user state accordingly.
    This useEffect is triggered only when the component mounts.
  */
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      const currentUser = pb.authStore.model ? createCompleteUser(pb.authStore.model) : createCompleteUser();
      if (currentUser.username !== user?.username) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [setUser, user]);

  /*
    Handle CAS redirection by extracting the ticket from the URL.
    This useEffect is triggered when the component mounts.
    If a CAS ticket is found, it sends a request to the backend to validate the ticket and retrieve the username and password.
    Then, it uses the username and password to log the user into PocketBase.
    If the login is successful, it updates the user state with the returned data, including the 'diplome' field.
  */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get("ticket");
    if (ticket) {
      setLoading(true);

      // Remove the ticket from the URL after handling it
      window.history.replaceState({}, document.title, window.location.pathname);
      const redirectUrl = window.location.href
        .replace("ticket=" + ticket, "")
        .replace("?&", "?")
        .replace("&&", "&");

      // Send the CAS ticket to the backend for validation and login
      fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/cas?ticket=${ticket}&redirectUrl=${btoa(redirectUrl)}`,
        { method: "GET" }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            // If successful, log the user into PocketBase with the returned credentials
            login(data.username, data.password).then(() => {
              const currentUser = pb.authStore.model ? createCompleteUser(pb.authStore.model) : createCompleteUser({
                firstName: data.firstName,
                lastName: data.lastName,
                parrain: data.parrain,
                infos: data.infos,
              });
              setUser(currentUser);
              localStorage.setItem('userDiplome', data.diplome);
            }).catch(() => {
              notify("Login failed");
            }).finally(() => {
              setLoading(false);
            });
          } else {
            notify(data.message);
            setLoading(false);
          }
        })
        .catch(() => {
          notify("Login failed");
          setLoading(false);
        });
    }
  }, [setUser]);

  // Function to handle the logout process
  const handleLogout = () => {
    logout();
    clearUser();
    localStorage.removeItem('userDiplome');
    setLoading(false);
  };

  // Helper function to check if a user is a 'Parrain'
  const isParrain = (diplome: string | undefined): boolean => {
    const parrains = [
      "IIEIN4",     // 2A Info
      "IIETE4",     // 2A Telecom
      "IIEMM4",     // 2A Matmeca
      "IIEEL4",     // 2A Elec
      "IAERI4",     // 2A R&I
      "IAESE4",     // 2A SEE
      // Les 3A sont autorisés à s'inscrire mais ils ne peuvent pas parrainer
      "IIEIN5",
      "IIETE5",
      "IIEMM5",
      "IIEEL5",
      "IAERI5",
      "IAESE5"
    ];
    return parrains.includes(diplome || '');
  };

  return (
    <div>
      <Notification />
      <div className='splashscreen'>
        <img src='./img/logo.png' alt='Logo' className='w-32' />
      </div>
      {
        // Check if the user is authenticated and render the appropriate view
        isAuthenticated() && user ? (
          <div>
            {
              // Render the ParrainView if the user is a Parrain
              isParrain(user.diplome) ? (
                <ParrainView
                  user={user}
                  setUser={setUser}
                  pb={pb}
                  logout={handleLogout}
                  isAuthenticated={isAuthenticated}
                />
              ) : (
                // Otherwise, render the FillotView
                <FillotView
                  user={user}
                  pb={pb}
                  logout={handleLogout}
                  isAuthenticated={isAuthenticated}
                  setUser={setUser}
                />
              )
            }
          </div>
        ) : (
          // If not authenticated, render the LoginView
          <LoginView loading={loading} loginWithCas={() => loginWithCas(setLoading)} />
        )
      }
    </div>
  );
}

export default App;
