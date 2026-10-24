import React, { useState } from 'react';
import { Play, Warehouse, Compass, Car, Trophy, Settings as SettingsIcon, Keyboard, User, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { ShowroomCanvas } from '../../game/ShowroomCanvas';
import { SettingsModal } from '../settings/SettingsModal';
import { ControlsModal } from '../settings/ControlsModal';
import { PlayerProfileModal } from '../profile/PlayerProfileModal';
import { MissionSelectModal } from '../menus/MissionSelectModal';
import { MISSION_CATALOG } from '../../data/missions';
import { VEHICLE_CATALOG } from '../../data/vehicles';

export const MainMenu: React.FC = () => {
  const setScreen = useGameStore(state => state.setScreen);
  const setSelectedCategory = useGameStore(state => state.setSelectedCategory);
  const currentVehicle = useGameStore(state => state.getCurrentVehicle());
  const setActiveMission = useGameStore(state => state.setActiveMission);
  const startMission = useGameStore(state => state.startMission);

  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMissions, setShowMissions] = useState(false);

  const handleEnterWorld = () => {
    soundSystem.playClick();
    const freeMission = MISSION_CATALOG.find(m => m.id === 'free_roam') || MISSION_CATALOG[0];
    setActiveMission(freeMission);
    startMission(freeMission);
    setScreen('game');
  };

  const handleFreeFlight = () => {
    soundSystem.playClick();
    setSelectedCategory('jet');
    const freeMission = MISSION_CATALOG.find(m => m.id === 'free_roam') || MISSION_CATALOG[0];
    setActiveMission(freeMission);
    startMission(freeMission);
    setScreen('game');
  };

  const handleFreeDrive = () => {
    soundSystem.playClick();
    setSelectedCategory('car');
    const carDef = VEHICLE_CATALOG.find(v => v.category === 'car') || VEHICLE_CATALOG[0];
    const freeMission = MISSION_CATALOG.find(m => m.id === 'car_time_trial_circuit') || MISSION_CATALOG[0];
    setActiveMission(freeMission);
    startMission(freeMission);
    setScreen('game');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
      {/* Real-time 3D Vehicle Showroom Background */}
      <div className="absolute inset-0 z-0">
        <ShowroomCanvas />
      </div>

      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 scanlines opacity-40 pointer-events-none z-0" />

      {/* Top Header Branding */}
      <header className="relative z-10 flex items-center justify-between p-8 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-auto">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-tech text-cyan-400 uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>PROJECT: SIMULATION ENVIRONMENT // VER 2.5</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display text-white tracking-widest mt-1">
            AERO<span className="text-cyan-400 glow-cyan">VERSE</span>
          </h1>
          <p className="text-xs text-slate-400 font-hud tracking-wider mt-0.5">
            NEXT-GENERATION OPEN-WORLD 3D VEHICLE SIMULATOR
          </p>
        </div>

        {/* Current Vehicle Badge */}
        <div className="glass-panel px-5 py-3 rounded-2xl border border-cyan-500/30 flex items-center space-x-4 shadow-xl">
          <div className="text-right">
            <div className="text-[10px] text-cyan-400 font-tech uppercase tracking-widest">ACTIVE AIRFRAME</div>
            <div className="text-sm font-bold font-hud text-white">{currentVehicle.name}</div>
            <div className="text-[11px] text-slate-400">{currentVehicle.subtitle}</div>
          </div>
          <button
            onClick={() => {
              soundSystem.playClick();
              setScreen('garage');
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-hud text-xs font-bold transition-all"
          >
            CUSTOMIZE
          </button>
        </div>
      </header>

      {/* Left Main Menu Navigation Panel */}
      <div className="relative z-10 p-8 flex items-center pointer-events-none">
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 max-w-sm w-full space-y-2.5 pointer-events-auto shadow-2xl backdrop-blur-2xl animate-fade-in">
          {/* 1. ENTER WORLD */}
          <button
            onClick={handleEnterWorld}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-black text-sm tracking-wider transition-all shadow-xl hover:shadow-cyan-500/50 group"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 fill-current" />
              <span>1. ENTER WORLD</span>
            </div>
            <span className="text-xs opacity-75 font-tech">PLAY</span>
          </button>

          {/* 2. VEHICLE GARAGE */}
          <button
            onClick={() => {
              soundSystem.playClick();
              setScreen('garage');
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <Warehouse className="w-4 h-4 text-cyan-400" />
              <span>2. VEHICLE GARAGE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">HANGAR</span>
          </button>

          {/* 3. FREE FLIGHT */}
          <button
            onClick={handleFreeFlight}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>3. FREE FLIGHT</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">JETS / HELIS</span>
          </button>

          {/* 4. FREE DRIVE */}
          <button
            onClick={handleFreeDrive}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <Car className="w-4 h-4 text-cyan-400" />
              <span>4. FREE DRIVE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">CIRCUIT</span>
          </button>

          {/* 5. MISSIONS */}
          <button
            onClick={() => {
              soundSystem.playClick();
              setShowMissions(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>5. MISSIONS & TRIALS</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">CHALLENGES</span>
          </button>

          {/* 6. SETTINGS */}
          <button
            onClick={() => {
              soundSystem.playClick();
              setShowSettings(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              <span>6. SETTINGS</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">OPTIONS</span>
          </button>

          {/* 7. CONTROLS */}
          <button
            onClick={() => {
              soundSystem.playClick();
              setShowControls(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>7. CONTROLS</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">KEYMAP</span>
          </button>

          {/* 8. PLAYER PROFILE */}
          <button
            onClick={() => {
              soundSystem.playClick();
              setShowProfile(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-800 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/40 text-slate-200 hover:text-white font-hud text-xs tracking-wider transition-all"
          >
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-cyan-400" />
              <span>8. PLAYER PROFILE</span>
            </div>
            <span className="text-[10px] text-slate-400 font-tech">RECORDS</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <footer className="relative z-10 flex items-center justify-between p-6 text-xs font-tech text-slate-500 pointer-events-none">
        <div>AEROVERSE FLIGHT DYNAMICS • WEBGL THREE.JS ACCELERATED</div>
        <div>DRAG MOUSE TO ROTATE 3D AIRFRAME</div>
      </footer>

      {/* Modal Dialogs */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
      {showProfile && <PlayerProfileModal onClose={() => setShowProfile(false)} />}
      {showMissions && <MissionSelectModal onClose={() => setShowMissions(false)} />}
    </div>
  );
};
