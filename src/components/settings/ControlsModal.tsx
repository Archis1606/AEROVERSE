import React, { useState, useEffect } from 'react';
import { X, Keyboard, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { KeyBindingsMap } from '../../types/settings';
import { DEFAULT_SETTINGS } from '../../data/defaultSettings';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);

  const [activeTab, setActiveTab] = useState<'jet' | 'helicopter' | 'car' | 'common'>('jet');
  const [rebindingKey, setRebindingKey] = useState<keyof KeyBindingsMap | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Listen for keydown when rebinding
  useEffect(() => {
    if (!rebindingKey) return;

    const handleRebindKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newCode = e.code;
      if (newCode === 'Escape') {
        setRebindingKey(null);
        return;
      }

      // Check for duplicate key in other actions
      const entries = Object.entries(settings.bindings) as [keyof KeyBindingsMap, string][];
      const existing = entries.find(([k, v]) => v === newCode && k !== rebindingKey);

      if (existing) {
        setDuplicateWarning(`Key "${newCode}" is already assigned to "${existing[0]}". Overridden.`);
      } else {
        setDuplicateWarning(null);
      }

      const updatedBindings = {
        ...settings.bindings,
        [rebindingKey]: newCode
      };

      updateSettings({ bindings: updatedBindings });
      soundSystem.playClick();
      setRebindingKey(null);
    };

    window.addEventListener('keydown', handleRebindKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleRebindKeyDown, { capture: true });
    };
  }, [rebindingKey, settings.bindings, updateSettings]);

  const JET_CONTROLS: { key: keyof KeyBindingsMap; label: string; desc: string }[] = [
    { key: 'jetPitchDown', label: 'PITCH NOSE DOWN', desc: 'Push stick forward' },
    { key: 'jetPitchUp', label: 'PITCH NOSE UP', desc: 'Pull stick backward' },
    { key: 'jetRollLeft', label: 'ROLL BANK LEFT', desc: 'Aileron roll left' },
    { key: 'jetRollRight', label: 'ROLL BANK RIGHT', desc: 'Aileron roll right' },
    { key: 'jetYawLeft', label: 'RUDDER YAW LEFT', desc: 'Vertical tail rudder left' },
    { key: 'jetYawRight', label: 'RUDDER YAW RIGHT', desc: 'Vertical tail rudder right' },
    { key: 'jetThrottleUp', label: 'INCREASE THROTTLE', desc: 'Advance military thrust' },
    { key: 'jetThrottleDown', label: 'DECREASE THROTTLE', desc: 'Throttle idle / airbrakes' },
    { key: 'jetAfterburner', label: 'AFTERBURNER BOOST', desc: 'Ignite max reheater thrust' },
    { key: 'jetLandingGear', label: 'TOGGLE LANDING GEAR', desc: 'Retract/extend tricycle gear' },
  ];

  const HELI_CONTROLS: { key: keyof KeyBindingsMap; label: string; desc: string }[] = [
    { key: 'heliPitchForward', label: 'CYCLIC PITCH FORWARD', desc: 'Tilt rotor forward to fly forward' },
    { key: 'heliPitchBack', label: 'CYCLIC PITCH BACK', desc: 'Tilt rotor backward to stop/reverse' },
    { key: 'heliRollLeft', label: 'CYCLIC ROLL LEFT', desc: 'Bank rotor left for sideward flight' },
    { key: 'heliRollRight', label: 'CYCLIC ROLL RIGHT', desc: 'Bank rotor right for sideward flight' },
    { key: 'heliYawLeft', label: 'TAIL PEDAL YAW LEFT', desc: 'Anti-torque rotation left' },
    { key: 'heliYawRight', label: 'TAIL PEDAL YAW RIGHT', desc: 'Anti-torque rotation right' },
    { key: 'heliCollectiveUp', label: 'COLLECTIVE UP (CLIMB)', desc: 'Increase rotor blade pitch & lift' },
    { key: 'heliCollectiveDown', label: 'COLLECTIVE DOWN (DESCEND)', desc: 'Decrease rotor blade pitch' },
    { key: 'heliHoverAssist', label: 'HOVER ASSIST TOGGLE', desc: 'Auto-level attitude & hover dampener' },
  ];

  const CAR_CONTROLS: { key: keyof KeyBindingsMap; label: string; desc: string }[] = [
    { key: 'carAccelerate', label: 'THROTTLE ACCELERATE', desc: 'Apply engine torque forward' },
    { key: 'carBrake', label: 'BRAKE / REVERSE', desc: 'Disc brakes / reverse gear' },
    { key: 'carSteerLeft', label: 'STEER LEFT', desc: 'Turn front wheels left' },
    { key: 'carSteerRight', label: 'STEER RIGHT', desc: 'Turn front wheels right' },
    { key: 'carHandbrake', label: 'HANDBRAKE / DRIFT', desc: 'Lock rear wheels for drift slides' },
    { key: 'carBoost', label: 'NITROUS / BOOST', desc: 'Auxiliary engine power boost' },
  ];

  const COMMON_CONTROLS: { key: keyof KeyBindingsMap; label: string; desc: string }[] = [
    { key: 'cameraSwitch', label: 'CYCLE CAMERA MODE', desc: 'Cockpit / Chase / Close / Cinematic' },
    { key: 'resetVehicle', label: 'RESET VEHICLE', desc: 'Spawn vehicle safely at checkpoint' },
    { key: 'pauseGame', label: 'PAUSE SIMULATION', desc: 'Open in-game pause menu' },
  ];

  const getActiveList = () => {
    switch (activeTab) {
      case 'jet': return JET_CONTROLS;
      case 'helicopter': return HELI_CONTROLS;
      case 'car': return CAR_CONTROLS;
      case 'common': return COMMON_CONTROLS;
    }
  };

  const formatKeyName = (code: string) => {
    if (code.startsWith('Key')) return code.substring(3);
    if (code.startsWith('Digit')) return code.substring(5);
    return code;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-hud text-white tracking-wider">CONTROL MAPPING & INPUTS</h2>
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

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-tech">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Vehicle Category Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          {(['jet', 'helicopter', 'car', 'common'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                soundSystem.playClick();
                setActiveTab(tab);
                setRebindingKey(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-hud font-bold uppercase transition-all tracking-wider ${
                activeTab === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'jet' ? 'FIGHTER JET' : tab === 'helicopter' ? 'HELICOPTER' : tab === 'car' ? 'GROUND CAR' : 'COMMON'}
            </button>
          ))}
        </div>

        {/* Bindings Table */}
        <div className="space-y-2">
          {getActiveList().map(item => {
            const currentBinding = settings.bindings[item.key];
            const isRebinding = rebindingKey === item.key;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-colors"
              >
                <div>
                  <div className="text-xs font-bold font-hud text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      soundSystem.playClick();
                      setRebindingKey(item.key);
                    }}
                    className={`min-w-[100px] px-4 py-1.5 rounded-lg border font-tech text-xs font-bold uppercase transition-all text-center ${
                      isRebinding
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 animate-pulse'
                        : 'border-cyan-500/40 bg-slate-800 hover:bg-cyan-950/40 text-cyan-300 hover:text-white hover:border-cyan-400'
                    }`}
                  >
                    {isRebinding ? 'PRESS ANY KEY' : formatKeyName(currentBinding)}
                  </button>

                  {/* Reset single binding */}
                  <button
                    onClick={() => {
                      soundSystem.playClick();
                      updateSettings({
                        bindings: {
                          ...settings.bindings,
                          [item.key]: DEFAULT_SETTINGS.bindings[item.key]
                        }
                      });
                    }}
                    title="Reset to default key"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <button
            onClick={() => {
              soundSystem.playClick();
              updateSettings({ bindings: DEFAULT_SETTINGS.bindings });
            }}
            className="flex items-center space-x-2 text-xs font-hud text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESTORE ALL DEFAULT BINDINGS</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider font-hud transition-all shadow-md"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
