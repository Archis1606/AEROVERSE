import React, { useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Palette, Layers, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { ShowroomCanvas } from '../../game/ShowroomCanvas';
import { VEHICLE_CATALOG, PRESET_LIVERIES } from '../../data/vehicles';
import { MISSION_CATALOG } from '../../data/missions';
import { VehicleCategory, PaintFinish } from '../../types/vehicle';

export const VehicleGarage: React.FC = () => {
  const currentVehicle = useGameStore(state => state.getCurrentVehicle());
  const currentColors = useGameStore(state => state.getCurrentColors());
  const selectedCategory = useGameStore(state => state.selectedCategory);
  const setSelectedCategory = useGameStore(state => state.setSelectedCategory);
  const setSelectedVehicleId = useGameStore(state => state.setSelectedVehicleId);
  const updateVehicleColors = useGameStore(state => state.updateVehicleColors);
  const resetVehicleColors = useGameStore(state => state.resetVehicleColors);
  const setScreen = useGameStore(state => state.setScreen);
  const setActiveMission = useGameStore(state => state.setActiveMission);
  const startMission = useGameStore(state => state.startMission);

  const [customTab, setCustomTab] = useState<'paint' | 'finish' | 'liveries'>('paint');

  const filteredVehicles = VEHICLE_CATALOG.filter(v => v.category === selectedCategory);

  const SWATCHES = [
    '#374151', '#1f2937', '#0f172a', '#0284c7', '#2563eb',
    '#dc2626', '#b91c1c', '#f59e0b', '#d97706', '#10b981',
    '#059669', '#7c3aed', '#db2777', '#f8fafc', '#18181b'
  ];

  const handleLaunchFreePlay = () => {
    soundSystem.playClick();
    // Choose appropriate default spawn
    const freeMission = MISSION_CATALOG.find(m => m.id === 'free_roam') || MISSION_CATALOG[0];
    setActiveMission(freeMission);
    startMission(freeMission);
    setScreen('game');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
      {/* 3D Showroom Background */}
      <div className="absolute inset-0 z-0">
        <ShowroomCanvas />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between p-6 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              soundSystem.playClick();
              setScreen('menu');
            }}
            className="glass-panel p-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white transition-all shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] font-tech text-cyan-400 tracking-widest uppercase font-bold">
              VEHICLE HANGAR & WORKSHOP
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-wider">
              {currentVehicle.name}
            </h1>
          </div>
        </div>

        {/* Category Switcher Tabs */}
        <div className="glass-panel p-1 rounded-xl border border-cyan-500/30 flex space-x-1">
          {(['jet', 'helicopter', 'car'] as VehicleCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                soundSystem.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-5 py-2 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              {cat === 'jet' ? 'FIGHTER JETS' : cat === 'helicopter' ? 'HELICOPTERS' : 'SUPER & TRACK CARS'}
            </button>
          ))}
        </div>

        {/* Quick Launch Button */}
        <button
          onClick={handleLaunchFreePlay}
          className="flex items-center space-x-3 px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-black text-sm tracking-widest transition-all shadow-xl hover:shadow-cyan-500/40"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>LAUNCH SIMULATION</span>
        </button>
      </header>

      {/* Center Left: Vehicle Model Selector & Specs */}
      <div className="relative z-10 flex items-center justify-between p-6 pointer-events-none">
        {/* Left: Model List & Specifications Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 max-w-sm w-full space-y-5 pointer-events-auto shadow-2xl backdrop-blur-xl">
          {/* Vehicle List */}
          <div>
            <div className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest font-bold mb-2">
              SELECT AIRFRAME / CHASSIS
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredVehicles.map(veh => (
                <button
                  key={veh.id}
                  onClick={() => {
                    soundSystem.playClick();
                    setSelectedVehicleId(veh.id);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    currentVehicle.id === veh.id
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold font-hud">{veh.name}</div>
                    <div className="text-[10px] text-slate-400">{veh.subtitle}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="border-t border-slate-700/60 pt-4 space-y-3">
            <div className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest font-bold">
              PERFORMANCE TELEMETRY
            </div>

            {/* Spec Bars */}
            <div className="space-y-2 text-xs font-hud">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>MAX AIRSPEED / TOP SPEED</span>
                  <span className="font-tech text-cyan-300 font-bold">{currentVehicle.specs.topSpeed} KM/H</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.min(100, (currentVehicle.specs.topSpeed / 3000) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ACCELERATION & THRUST</span>
                  <span className="font-tech text-cyan-300 font-bold">{currentVehicle.specs.acceleration} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${currentVehicle.specs.acceleration}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>AGILITY & MANEUVERABILITY</span>
                  <span className="font-tech text-cyan-300 font-bold">{currentVehicle.specs.handling} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${currentVehicle.specs.handling}%` }} />
                </div>
              </div>

              {/* Engine Specs */}
              <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                <div>POWERPLANT: <span className="text-white font-tech">{currentVehicle.specs.powerHpOrKn}</span></div>
                <div>CURB MASS: <span className="text-white font-tech">{currentVehicle.specs.massKg.toLocaleString()} KG</span></div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "{currentVehicle.specs.description}"
            </p>
          </div>
        </div>

        {/* Right: Customization Paint & Livery Studio */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 max-w-sm w-full space-y-4 pointer-events-auto shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center space-x-2 text-xs font-hud font-bold text-white tracking-wider">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>CUSTOMIZE APPEARANCE</span>
            </div>
            <button
              onClick={() => {
                soundSystem.playClick();
                resetVehicleColors(currentVehicle.id);
              }}
              title="Reset default paint"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-Tabs: Paint / Finish / Liveries */}
          <div className="flex space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCustomTab('paint')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-hud font-bold uppercase transition-all ${
                customTab === 'paint' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              PAINT
            </button>
            <button
              onClick={() => setCustomTab('finish')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-hud font-bold uppercase transition-all ${
                customTab === 'finish' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              FINISH
            </button>
            <button
              onClick={() => setCustomTab('liveries')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-hud font-bold uppercase transition-all ${
                customTab === 'liveries' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              LIVERIES
            </button>
          </div>

          {/* Tab 1: Paint Colors */}
          {customTab === 'paint' && (
            <div className="space-y-3">
              {/* Primary Color Picker */}
              <div>
                <div className="flex justify-between text-xs font-hud text-slate-300 mb-1.5">
                  <span>PRIMARY HULL / BODY</span>
                  <span className="font-tech uppercase text-cyan-400">{currentColors.primary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SWATCHES.map(color => (
                    <button
                      key={`primary_${color}`}
                      onClick={() => {
                        soundSystem.playClick();
                        updateVehicleColors(currentVehicle.id, { primary: color });
                      }}
                      className={`w-6 h-6 rounded-md border transition-transform ${
                        currentColors.primary === color ? 'border-white scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Secondary Color Picker */}
              <div>
                <div className="flex justify-between text-xs font-hud text-slate-300 mb-1.5">
                  <span>SECONDARY ACCENT</span>
                  <span className="font-tech uppercase text-cyan-400">{currentColors.secondary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SWATCHES.map(color => (
                    <button
                      key={`sec_${color}`}
                      onClick={() => {
                        soundSystem.playClick();
                        updateVehicleColors(currentVehicle.id, { secondary: color });
                      }}
                      className={`w-6 h-6 rounded-md border transition-transform ${
                        currentColors.secondary === color ? 'border-white scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Neon Glow Color Picker */}
              <div>
                <div className="flex justify-between text-xs font-hud text-slate-300 mb-1.5">
                  <span>NEON UNDERGLOW / ENGINE GLOW</span>
                  <span className="font-tech uppercase text-cyan-400">{currentColors.neon}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['#06b6d4', '#38bdf8', '#ef4444', '#f59e0b', '#10b981', '#a855f7', '#ffffff'].map(color => (
                    <button
                      key={`neon_${color}`}
                      onClick={() => {
                        soundSystem.playClick();
                        updateVehicleColors(currentVehicle.id, { neon: color });
                      }}
                      className={`w-6 h-6 rounded-md border transition-transform ${
                        currentColors.neon === color ? 'border-white scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Material Finish */}
          {customTab === 'finish' && (
            <div className="grid grid-cols-2 gap-2">
              {(['metallic', 'matte', 'gloss', 'carbon'] as PaintFinish[]).map(finish => (
                <button
                  key={finish}
                  onClick={() => {
                    soundSystem.playClick();
                    updateVehicleColors(currentVehicle.id, { finish });
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    currentColors.finish === finish
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold font-hud uppercase">{finish}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {finish === 'metallic' ? 'High Specular Flake' : finish === 'matte' ? 'Zero Reflection' : finish === 'carbon' ? 'Woven Composite' : 'Deep Clearcoat'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tab 3: Preset Liveries */}
          {customTab === 'liveries' && (
            <div className="space-y-2">
              {PRESET_LIVERIES.map(liv => (
                <button
                  key={liv.name}
                  onClick={() => {
                    soundSystem.playClick();
                    updateVehicleColors(currentVehicle.id, {
                      primary: liv.primary,
                      secondary: liv.secondary,
                      accent: liv.accent,
                      neon: liv.neon,
                      finish: liv.finish
                    });
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-900/80 transition-all text-left"
                >
                  <div>
                    <div className="text-xs font-bold font-hud text-white">{liv.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{liv.finish} Finish</div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: liv.primary }} />
                    <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: liv.accent }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Hint */}
      <footer className="relative z-10 p-4 text-center text-xs font-tech text-slate-500 pointer-events-none">
        DRAG TO ROTATE 360° • SCROLL TO ZOOM • PREVIEWS REFLECT LIVE IN SIMULATION
      </footer>
    </div>
  );
};
