import React from 'react';
import { useGameStore } from './store/gameStore';
import { MainMenu } from './components/dashboard/MainMenu';
import { VehicleGarage } from './components/garage/VehicleGarage';
import { GameCanvas } from './game/GameCanvas';

export const App: React.FC = () => {
  const currentScreen = useGameStore(state => state.currentScreen);

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'garage' && <VehicleGarage />}
      {currentScreen === 'game' && <GameCanvas />}
    </main>
  );
};

export default App;
