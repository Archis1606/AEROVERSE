import React from 'react';
import { X, Volume2, Monitor, Gauge, ShieldCheck, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { GraphicsQuality, SpeedUnit } from '../../types/settings';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const resetSettings = useGameStore(state => state.resetSettings);

  const handleVolumeChange = (type: 'master' | 'engine' | 'fx', val: number) => {
    if (type === 'master') {
      updateSettings({ masterVolume: val });
      soundSystem.setVolumes(val, settings.engineVolume, settings.fxVolume);
    } else if (type === 'engine') {
      updateSettings({ engineVolume: val });
      soundSystem.setVolumes(settings.masterVolume, val, settings.fxVolume);
    } else {
      updateSettings({ fxVolume: val });
      soundSystem.setVolumes(settings.masterVolume, settings.engineVolume, val);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-hud text-white tracking-wider">SIMULATION SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              soundSystem.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Audio Volume */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-tech text-cyan-400 font-bold tracking-wider">
            <Volume2 className="w-4 h-4" />
            <span>AUDIO CONFIGURATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>MASTER</span>
                <span className="font-tech text-cyan-400">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={e => handleVolumeChange('master', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>ENGINE AUDIO</span>
                <span className="font-tech text-cyan-400">{Math.round(settings.engineVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.engineVolume}
                onChange={e => handleVolumeChange('engine', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>EFFECTS & UI</span>
                <span className="font-tech text-cyan-400">{Math.round(settings.fxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.fxVolume}
                onChange={e => handleVolumeChange('fx', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Display & Graphics */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-tech text-cyan-400 font-bold tracking-wider">
            <Monitor className="w-4 h-4" />
            <span>GRAPHICS & DISPLAY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Speed Units Toggle */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-hud">SPEED UNITS</span>
              <div className="flex space-x-1">
                {(['kmh', 'mph', 'knots'] as SpeedUnit[]).map(unit => (
                  <button
                    key={unit}
                    onClick={() => {
                      soundSystem.playClick();
                      updateSettings({ units: unit });
                    }}
                    className={`px-3 py-1 rounded text-xs font-tech font-bold uppercase transition-all ${
                      settings.units === unit
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Graphics Preset */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-hud">QUALITY</span>
              <div className="flex space-x-1">
                {(['low', 'medium', 'high', 'ultra'] as GraphicsQuality[]).map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      soundSystem.playClick();
                      updateSettings({ graphics: q });
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-tech font-bold uppercase transition-all ${
                      settings.graphics === q
                        ? 'bg-cyan-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Field of View (FOV) */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>CAMERA FOV</span>
                <span className="font-tech text-cyan-400">{settings.fov}°</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={settings.fov}
                onChange={e => updateSettings({ fov: parseInt(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* HUD Scale */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>HUD SCALE</span>
                <span className="font-tech text-cyan-400">{Math.round(settings.hudScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.hudScale}
                onChange={e => updateSettings({ hudScale: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Flight & Vehicle Assistance */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-tech text-cyan-400 font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>PHYSICS & FLIGHT ASSISTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-hud">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">AIRCRAFT AUTO-STABILIZER</span>
              <input
                type="checkbox"
                checked={settings.flightStabilizer}
                onChange={e => updateSettings({ flightStabilizer: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">HELICOPTER HOVER ASSIST</span>
              <input
                type="checkbox"
                checked={settings.hoverAssistDefault}
                onChange={e => updateSettings({ hoverAssistDefault: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">CAR TRACTION CONTROL (TCS)</span>
              <input
                type="checkbox"
                checked={settings.tractionControlDefault}
                onChange={e => updateSettings({ tractionControlDefault: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">INVERT FLIGHT PITCH</span>
              <input
                type="checkbox"
                checked={settings.invertFlightPitch}
                onChange={e => updateSettings({ invertFlightPitch: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <button
            onClick={() => {
              soundSystem.playClick();
              resetSettings();
            }}
            className="flex items-center space-x-2 text-xs font-hud text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET TO DEFAULTS</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider font-hud transition-all shadow-md"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
