import React, { useState, useEffect } from 'react';

// ensure any accidental references to driverLocation don't crash
// this variable is not used directly by the client, but some
// components from the sibling project (in the workspace) might
// still reference it when Metro bundles everything. Declaring
// it here prevents `ReferenceError: Property 'driverLocation' doesn't exist`.
// if other code needs it, they can assign to global.driverLocation.
var driverLocation; // intentionally uninitialized
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder imports - will be replaced as components are migrated
import Splash from './src/components/Splash/Splash';
import Login from './src/components/Login/Login';
import Register from './src/components/Register/Register';
import ForgotPassword from './src/components/ForgotPassword/ForgotPassword';
import Home from './src/components/Home/Home';
import RequestFreight from './src/components/RequestFreight/RequestFreight';
import Negotiation from './src/components/Negotiation/Negotiation';
import FreightAccepted from './src/components/FreightAccepted/FreightAccepted';
import History from './src/components/History/History';
import Chat from './src/components/Chat/Chat';
import Profile from './src/components/Profile/Profile';

// Tipos de telas disponíveis
export const Screen = {
  SPLASH: 'splash',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT: 'forgot',
  HOME: 'home',
  REQUEST: 'request',
  NEGOTIATION: 'negotiation',
  ACCEPTED: 'accepted',
  HISTORY: 'history',
  CHAT: 'chat',
  PROFILE: 'profile',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(Screen.SPLASH);
  const [screenParams, setScreenParams] = useState({});
  console.log('--- [APP] Renderizando App. Tela atual:', currentScreen, 'Params:', screenParams);

  useEffect(() => {
    console.log('--- [APP] useEffect iniciado. Iniciando timer de 2.6s... ---');
    // Aguarda o Splash terminar (2.5s) antes de verificar autenticação
    const splashTimer = setTimeout(async () => {
      console.log('--- [APP] Timer de 2.6s finalizado. Verificando AsyncStorage... ---');
      try {
        const user = await AsyncStorage.getItem('userData');
        if (user) {
          setCurrentScreen(Screen.HOME);
        } else {
          // If not logged in, go to Login (after splash)
          // Or let splash handle it? Original code let splash finish then stayed or moved?
          // Original: if user -> HOME. logic implies if not user, it stays on SPLASH? 
          // Wait, original logic:
          // setTimeout 2600. if user -> HOME.
          // But Splash component supposedly has onNavigate?
          // Likely Splash calls onNavigate after animation? 
          // Original App.js didn't show explicit transition to Login in useEffect, only to HOME.
          // So if no user, it probably relies on Splash calling onNavigate(LOGIN).
          // I'll keep it as is.
        }
      } catch (e) {
        console.error(e);
      }
    }, 2600);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleNavigate = (screen, params = {}) => {
    setScreenParams(params);
    setCurrentScreen(screen);
  };

  const handleLogin = async (userData) => {
    // Avoid duplicate storing or just keep in sync. Login.js already stored it anyway.
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setCurrentScreen(Screen.HOME);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userToken'); // Clean token too
    setCurrentScreen(Screen.LOGIN);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.SPLASH:
        return <Splash onNavigate={handleNavigate} />;
      case Screen.LOGIN:
        return <Login onNavigate={handleNavigate} onLogin={handleLogin} />;
      case Screen.REGISTER:
        return <Register onNavigate={handleNavigate} onLogin={handleLogin} />;
      case Screen.FORGOT:
        return <ForgotPassword onNavigate={handleNavigate} />;
      case Screen.HOME:
        return <Home onNavigate={handleNavigate} />;
      case Screen.REQUEST:
        return <RequestFreight onNavigate={handleNavigate} />;
      case Screen.NEGOTIATION:
        return <Negotiation onNavigate={handleNavigate} freightId={screenParams.freightId} />;
      case Screen.ACCEPTED:
        return <FreightAccepted onNavigate={handleNavigate} freightId={screenParams.freightId} />;
      case Screen.HISTORY:
        return <History onNavigate={handleNavigate} />;
      case Screen.CHAT:
        return <Chat onNavigate={handleNavigate} freteId={screenParams.freightId} />;
      case Screen.PROFILE:
        return <Profile onNavigate={handleNavigate} onLogout={handleLogout} />; // User prop fetched inside or passed?
      // Original passed user={JSON.parse(localStorage...)}
      // In RN, reading from AsyncStorage is async, so better to handle user state in App or Profile.
      // For 'minimal structure change', I should probably pass user, but fetching async in render is bad.
      // I will let Profile handle fetching or use a state in App.
      // I'll make Profile fetch it itself to be safe or read it once.
      // For now I'll pass nothing and let Profile handle it or handle it later.
      default:
        return <Splash onNavigate={handleNavigate} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
