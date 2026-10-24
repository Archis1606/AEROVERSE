import React, { useState } from 'react';
import { X, Trophy, Play, CheckCircle2, Timer, Navigation } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { MISSION_CATALOG } from '../../data/missions';
import { MissionDefinition, MissionType } from '../../types/mission';

interface MissionSelectModalProps {
  onClose: () => void;
}

export const MissionSelectModal: React.FC<MissionSelectModalProps> = ({ onClose }) => {
  const setScreen = useGameStore(state => state.setScreen);
  const setActiveMission = useGameStore(state => state.setActiveMission);
  const startMission = useGameStore(state => state.startMission);
  const setSelectedCategory = useGameStore(state => state.setSelectedCategory);
  const missionRecords = useGameStore(state => state.missionRecords);

  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<MissionDefinition>(MISSION_CATALOG[1]);

  const filtered = MISSION_CATALOG.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const handleLaunch = (mission: MissionDefinition) => {
    soundSystem.playClick();
    if (mission.allowedCategory !== 'any') {
      setSelectedCategory(mission.allowedCategory);
    }
    setActiveMission(mission);
    startMission(mission);
    onClose();
    setScreen('game');
  };

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 max-w-4xl w-full max-h-[90vh] flex flex-col space-y-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-hud text-white tracking-wider">
              MISSIONS & FLIGHT / DRIVING CHALLENGES
            </h2>
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

        {/* Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-hud">
          {[
            { id: 'all', label: 'ALL CHALLENGES' },
            { id: 'flight_school', label: 'FLIGHT SCHOOL' },
            { id: 'driving_school', label: 'DRIVING SCHOOL' },
            { id: 'time_trials', label: 'TIME TRIALS' },
            { id: 'landing_challenge', label: 'PRECISION LANDING' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundSystem.playClick();
                setFilterType(f.id);
              }}
              className={`px-4 py-2 rounded-xl uppercase font-bold tracking-wider transition-all whitespace-nowrap ${
                filterType === f.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content: List on left, details on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Mission List */}
          <div className="space-y-2 overflow-y-auto pr-2 max-h-[50vh]">
            {filtered.map(m => {
              const record = missionRecords[m.id];
              const isSelected = selectedMission.id === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    soundSystem.playClick();
                    setSelectedMission(m);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-md'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest font-bold">
                        {m.allowedCategory.toUpperCase()}
                      </span>
                      {record && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          {record.medal.toUpperCase()} ({formatSec(record.bestTimeSec)})
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold font-hud">{m.title}</div>
                    <div className="text-xs text-slate-400">{m.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Mission Briefing Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="text-[10px] font-tech text-cyan-400 tracking-widest uppercase font-bold">
                MISSION BRIEFING
              </div>
              <h3 className="text-2xl font-black font-hud text-white leading-tight">
                {selectedMission.title}
              </h3>
              <div className="text-xs font-hud text-cyan-300 font-semibold">
                {selectedMission.subtitle}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {selectedMission.description}
              </p>

              {/* Targets Table */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-tech">
                <div className="flex justify-between items-center text-slate-400">
                  <span>CHECKPOINTS:</span>
                  <span className="text-white font-bold">{selectedMission.checkpoints.length} GATES</span>
                </div>
                {selectedMission.goldTimeSec > 0 && (
                  <div className="flex justify-between items-center text-amber-300">
                    <span>GOLD MEDAL TIME:</span>
                    <span className="font-bold">UNDER {selectedMission.goldTimeSec}S</span>
                  </div>
                )}
                {selectedMission.silverTimeSec > 0 && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>SILVER MEDAL TIME:</span>
                    <span className="font-bold">UNDER {selectedMission.silverTimeSec}S</span>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => handleLaunch(selectedMission)}
              className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-black text-sm tracking-wider transition-all shadow-xl hover:shadow-cyan-500/50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>COMMENCE MISSION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
