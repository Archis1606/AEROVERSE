import React, { useState } from 'react';
import { Play, RotateCcw, Camera, Settings as SettingsIcon, Keyboard, LogOut, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { SettingsModal } from '../settings/SettingsModal';
import { ControlsModal } from '../settings/ControlsModal';

interface PauseMenuProps {
  onResume: () => void;
  onResetVehicle: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onResetVehicle }) => {
  const setScreen = useGameStore(state => state.setScreen);
  const cycleCameraMode = useGameStore(state => state.cycleCameraMode);
  const cameraMode = useGameStore(state => state.cameraMode);

  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return (
    <>
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-lg flex items-center justify-center pointer-events-auto z-50 p-4">
        <div className="glass-panel p-8 rounded-2xl border-2 border-cyan-500/40 max-w-sm w-full space-y-6 shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="text-[11px] font-tech text-cyan-400 tracking-widest uppercase">SIMULATION PAUSED</div>
            <h2 className="text-3xl font-black font-display text-white tracking-wider">AEROVERSE</h2>
          </div>

          {/* Menu Buttons */}
          <div className="space-y-3 font-hud">
            <button
              onClick={() => {
                soundSystem.playClick();
                onResume();
              }}
              className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider transition-all shadow-lg hover:shadow-cyan-500/40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME FLIGHT</span>
            </button>

            <button
              onClick={() => {
                soundSystem.playClick();
                onResetVehicle();
              }}
              className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/80 hover:bg-cyan-950/40 text-white font-medium text-xs tracking-wider transition-all"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>RESET VEHICLE [R]</span>
            </button>

            <button
              onClick={() => {
                soundSystem.playClick();
                cycleCameraMode();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/80 hover:bg-cyan-950/40 text-white font-medium text-xs tracking-wider transition-all"
            >
              <div className="flex items-center space-x-3">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>CAMERA MODE</span>
              </div>
              <span className="text-[11px] font-bold text-amber-300 uppercase">{cameraMode}</span>
            </button>

            <button
              onClick={() => {
                soundSystem.playClick();
                setShowControls(true);
              }}
              className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/80 hover:bg-cyan-950/40 text-white font-medium text-xs tracking-wider transition-all"
            >
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>CONTROLS & BINDINGS</span>
            </button>

            <button
              onClick={() => {
                soundSystem.playClick();
                setShowSettings(true);
              }}
              className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900/80 hover:bg-cyan-950/40 text-white font-medium text-xs tracking-wider transition-all"
            >
              <SettingsIcon className="w-4 h-4 text-cyan-400" />
              <span>SETTINGS</span>
            </button>

            <button
              onClick={() => {
                soundSystem.playClick();
                onResume();
                setScreen('menu');
              }}
              className="w-full flex items-center justify-center space-x-3 py-2.5 rounded-xl border border-red-500/40 hover:border-red-400 bg-red-950/20 hover:bg-red-900/40 text-red-300 font-medium text-xs tracking-wider transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>RETURN TO DASHBOARD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </>
  );
};
