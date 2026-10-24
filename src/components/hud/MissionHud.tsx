import React, { useEffect, useState } from 'react';
import { Trophy, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';

export const MissionHud: React.FC = () => {
  const activeMission = useGameStore(state => state.activeMission);
  const isMissionRunning = useGameStore(state => state.isMissionRunning);
  const currentCheckpointIdx = useGameStore(state => state.currentCheckpointIdx);
  const missionStartTime = useGameStore(state => state.missionStartTime);
  const missionResult = useGameStore(state => state.missionResult);
  const startMission = useGameStore(state => state.startMission);
  const resetMission = useGameStore(state => state.resetMission);
  const setScreen = useGameStore(state => state.setScreen);

  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!isMissionRunning || missionStartTime === 0) return;
    const interval = setInterval(() => {
      setElapsedSec((performance.now() - missionStartTime) / 1000);
    }, 50);
    return () => clearInterval(interval);
  }, [isMissionRunning, missionStartTime]);

  useEffect(() => {
    if (missionResult && missionResult.success) {
      soundSystem.playMissionComplete();
    }
  }, [missionResult]);

  const totalCps = activeMission.checkpoints.length;
  if (!isMissionRunning && !missionResult && totalCps === 0) {
    // In free exploration mode
    return (
      <div className="absolute top-6 left-6 pointer-events-none select-none">
        <div className="glass-panel px-4 py-2 rounded-lg border border-cyan-500/30">
          <div className="text-[10px] text-cyan-400 font-tech uppercase tracking-widest">MODE</div>
          <div className="text-sm font-bold font-hud text-white">FREE EXPLORATION</div>
          <div className="text-xs text-slate-400">Open sandbox world • No time limits</div>
        </div>
      </div>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <>
      {/* Live Mission Card (Top-Left) */}
      <div className="absolute top-6 left-6 pointer-events-none select-none max-w-sm">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest font-bold">
              {activeMission.type.replace('_', ' ')}
            </span>
            {isMissionRunning && (
              <span className="text-xs font-tech font-bold text-amber-300 animate-pulse">
                REC ●
              </span>
            )}
          </div>

          <div className="text-base font-bold font-hud text-white leading-tight">
            {activeMission.title}
          </div>
          <div className="text-xs text-slate-300 leading-snug">
            {activeMission.subtitle}
          </div>

          {/* Progress and Timer */}
          {totalCps > 0 && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs font-tech">
              <div>
                <span className="text-slate-400">CHECKPOINT: </span>
                <span className="font-bold text-white text-sm">
                  {Math.min(currentCheckpointIdx + 1, totalCps)} / {totalCps}
                </span>
              </div>
              <div>
                <span className="text-slate-400">TIME: </span>
                <span className="font-bold text-cyan-300 text-sm">
                  {formatTime(isMissionRunning ? elapsedSec : (missionResult?.time || 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Result Modal Overlay */}
      {missionResult && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center pointer-events-auto z-40 p-4">
          <div className="glass-panel p-8 rounded-2xl border-2 border-cyan-400 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>

            <div>
              <div className="text-xs font-tech text-cyan-400 tracking-widest uppercase">
                MISSION ACCOMPLISHED
              </div>
              <h2 className="text-2xl font-bold font-hud text-white mt-1">
                {activeMission.title}
              </h2>
            </div>

            {/* Time & Medal Result */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 font-tech">FINAL TIME</div>
              <div className="text-4xl font-bold font-display text-cyan-300 glow-cyan">
                {formatTime(missionResult.time)}
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <span className="text-xs text-slate-300 font-tech">AWARD:</span>
                <span
                  className={`text-sm font-bold font-hud px-3 py-0.5 rounded uppercase ${
                    missionResult.medal === 'gold'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                      : missionResult.medal === 'silver'
                      ? 'bg-slate-300/20 text-slate-200 border border-slate-300'
                      : 'bg-amber-700/20 text-amber-500 border border-amber-600'
                  }`}
                >
                  {missionResult.medal} MEDAL
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => {
                  soundSystem.playClick();
                  startMission(activeMission);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-slate-600 hover:border-cyan-400 bg-slate-900 hover:bg-cyan-950/40 text-white font-hud text-xs tracking-wider transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RETRY</span>
              </button>

              <button
                onClick={() => {
                  soundSystem.playClick();
                  resetMission();
                  setScreen('missions');
                }}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-hud font-bold text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/50"
              >
                <span>NEXT MISSION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
