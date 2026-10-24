import React from 'react';
import { X, User, Trophy, Medal, Award, Trash2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { soundSystem } from '../../game/audio/SoundSystem';
import { MISSION_CATALOG } from '../../data/missions';

interface PlayerProfileModalProps {
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ onClose }) => {
  const missionRecords = useGameStore(state => state.missionRecords);

  const completedCount = Object.keys(missionRecords).length;
  const goldCount = Object.values(missionRecords).filter(r => r.medal === 'gold').length;
  const silverCount = Object.values(missionRecords).filter(r => r.medal === 'silver').length;
  const bronzeCount = Object.values(missionRecords).filter(r => r.medal === 'bronze').length;

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear your saved mission records?')) {
      localStorage.removeItem('aeroverse_records_v1');
      window.location.reload();
    }
  };

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-hud text-white tracking-wider">PILOT / DRIVER DOSSIER</h2>
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

        {/* Stats Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-tech uppercase">COMPLETED</div>
            <div className="text-3xl font-black font-display text-white mt-1">{completedCount}</div>
            <div className="text-[10px] text-cyan-400 mt-1">TRIALS</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-500/30 text-center">
            <div className="text-[10px] text-amber-400 font-tech uppercase">GOLD MEDALS</div>
            <div className="text-3xl font-black font-display text-amber-300 mt-1">{goldCount}</div>
            <div className="text-[10px] text-amber-400 mt-1">RECORD</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-600/30 text-center">
            <div className="text-[10px] text-slate-300 font-tech uppercase">SILVER MEDALS</div>
            <div className="text-3xl font-black font-display text-slate-200 mt-1">{silverCount}</div>
            <div className="text-[10px] text-slate-300 mt-1">ELITE</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-amber-700/30 text-center">
            <div className="text-[10px] text-amber-600 font-tech uppercase">BRONZE MEDALS</div>
            <div className="text-3xl font-black font-display text-amber-500 mt-1">{bronzeCount}</div>
            <div className="text-[10px] text-amber-600 mt-1">QUALIFIED</div>
          </div>
        </div>

        {/* Records Table */}
        <div className="space-y-3">
          <div className="text-xs font-tech text-cyan-400 font-bold uppercase tracking-wider">
            PERSONAL BEST MISSION LOG
          </div>

          {completedCount === 0 ? (
            <div className="p-8 text-center text-xs font-hud text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
              No mission records recorded yet. Complete flight or driving challenges to earn medals!
            </div>
          ) : (
            <div className="space-y-2">
              {Object.values(missionRecords).map(rec => {
                const missionDef = MISSION_CATALOG.find(m => m.id === rec.missionId);
                return (
                  <div
                    key={rec.missionId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800"
                  >
                    <div>
                      <div className="text-xs font-bold font-hud text-white">
                        {missionDef ? missionDef.title : rec.missionId}
                      </div>
                      <div className="text-[10px] text-slate-400">Completed on: {rec.completedAt}</div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-bold font-tech text-cyan-300">
                        {formatSec(rec.bestTimeSec)}
                      </div>
                      <span
                        className={`text-[10px] font-bold font-hud px-2.5 py-1 rounded uppercase ${
                          rec.medal === 'gold'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400'
                            : rec.medal === 'silver'
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300'
                            : 'bg-amber-700/20 text-amber-500 border border-amber-600'
                        }`}
                      >
                        {rec.medal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
          <button
            onClick={handleClearData}
            className="flex items-center space-x-2 text-xs font-hud text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>RESET CAREER DATA</span>
          </button>

          <button
            onClick={() => {
              soundSystem.playClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider font-hud transition-all shadow-md"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
