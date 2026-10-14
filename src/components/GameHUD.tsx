import React from 'react';
import { Volume2, VolumeX, Music, Pause, Play, Tv, RotateCcw, Clock, Heart, Smartphone, Monitor } from 'lucide-react';
import { GameState } from '../game/types';

interface GameHUDProps {
  state: GameState;
  isMuted: boolean;
  isMusicMuted: boolean;
  showScanlines: boolean;
  controlMode: 'mobile' | 'desktop' | 'hidden';
  onSetControlMode: (mode: 'mobile' | 'desktop' | 'hidden') => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleScanlines: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  isMuted,
  isMusicMuted,
  showScanlines,
  controlMode,
  onSetControlMode,
  onToggleMute,
  onToggleMusic,
  onToggleScanlines,
  onTogglePause,
  onRestart,
}) => {
  const formattedScore = state.score.toString().padStart(6, '0');
  const formattedCoins = state.coins.toString().padStart(2, '0');
  const formattedTime = Math.max(0, Math.floor(state.timeRemaining)).toString().padStart(3, '0');
  const isTimeLow = state.timeRemaining < 100;

  return (
    <header className="w-full max-w-[960px] bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl px-3 py-2.5 shadow-2xl mb-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Main Stats Row: Completely separated, clear typography */}
        <div className="w-full flex items-center justify-between gap-1.5 md:gap-4 font-pixel text-center">
          {/* 1. Mario / Score */}
          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2 py-1.5 min-w-[70px]">
            <span className="block text-slate-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">MARIO</span>
            <span className="block text-white text-xs md:text-sm tabular-nums mt-0.5 font-bold">{formattedScore}</span>
          </div>

          {/* 2. Coins */}
          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2 py-1.5 min-w-[65px]">
            <span className="block text-amber-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">MONEDAS</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-200 animate-pulse" />
              <span className="text-amber-300 text-xs md:text-sm tabular-nums font-bold">x{formattedCoins}</span>
            </div>
          </div>

          {/* 3. World & Checkpoint */}
          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-xl px-2 py-1.5 min-w-[60px] relative">
            <span className="block text-sky-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">MUNDO</span>
            <span className="block text-white text-xs md:text-sm mt-0.5 font-bold">{state.world}</span>
            {state.hasCheckpoint && (
              <span className="absolute -top-2 -right-1 px-1 py-0.5 bg-emerald-500 text-slate-950 font-pixel text-[7px] rounded-md font-bold shadow animate-pulse">
                🚩 CP
              </span>
            )}
          </div>

          {/* 4. TIME: Distinct module with clock icon */}
          <div className={`flex-1 bg-slate-950/70 border rounded-xl px-2 py-1.5 min-w-[70px] ${
            isTimeLow ? 'border-red-500/80 bg-red-950/40' : 'border-slate-800/80'
          }`}>
            <div className="flex items-center justify-center gap-1 text-amber-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>TIEMPO</span>
            </div>
            <span
              className={`block text-xs md:text-sm tabular-nums mt-0.5 font-bold ${
                isTimeLow ? 'text-red-400 animate-pulse' : 'text-amber-300'
              }`}
            >
              {formattedTime}
            </span>
          </div>

          {/* 5. LIVES: Clearly isolated module with heart icon */}
          <div className="flex-1 bg-slate-950/70 border border-emerald-950/60 rounded-xl px-2 py-1.5 min-w-[65px]">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider">
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>VIDAS</span>
            </div>
            <span className="block text-emerald-300 text-xs md:text-sm tabular-nums mt-0.5 font-bold">
              x{state.lives}
            </span>
          </div>
        </div>

        {/* Big High-Visibility Celular vs Compu Button */}
        <div className="flex items-center gap-1.5 self-center md:self-auto shrink-0">
          <button
            onClick={() => onSetControlMode(controlMode === 'mobile' ? 'desktop' : 'mobile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-pixel text-[10px] md:text-xs transition-all shadow-xl cursor-pointer active:scale-95 ${
              controlMode === 'mobile'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-amber-500/30 ring-2 ring-amber-300/40'
                : 'bg-sky-600 hover:bg-sky-500 text-white border-sky-300 font-extrabold shadow-sky-500/30 ring-2 ring-sky-300/40'
            }`}
            title="Toca para alternar entre controles para celular táctil o controles de computador"
          >
            {controlMode === 'mobile' ? (
              <>
                <Smartphone className="w-4 h-4 stroke-[3]" />
                <span>📱 MODO CELULAR</span>
                <span className="hidden sm:inline text-[8px] bg-slate-950/25 px-1.5 py-0.5 rounded font-sans font-bold text-slate-950">
                  Cambiar a Compu 💻
                </span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 stroke-[3]" />
                <span>💻 MODO COMPU</span>
                <span className="hidden sm:inline text-[8px] bg-white/20 px-1.5 py-0.5 rounded font-sans font-bold text-white">
                  Cambiar a Celular 📱
                </span>
              </>
            )}
          </button>
        </div>

        {/* Separated Utility Controls Bar */}
        <div className="flex items-center gap-1.5 self-center md:self-auto bg-slate-950/80 border border-slate-800 rounded-xl p-1 shrink-0">
          {/* Pause / Resume */}
          {state.status === 'playing' || state.status === 'paused' ? (
            <button
              onClick={onTogglePause}
              title={state.status === 'paused' ? 'Reanudar juego' : 'Pausar juego'}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              aria-label="Pausa"
            >
              {state.status === 'paused' ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          ) : null}

          {/* Quick Restart */}
          <button
            onClick={onRestart}
            title="Reiniciar Nivel"
            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 active:scale-95 transition-all"
            aria-label="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <span className="w-[1px] h-4 bg-slate-800 mx-0.5" />

          {/* Music */}
          <button
            onClick={onToggleMusic}
            title={isMusicMuted ? 'Activar Música' : 'Mutear Música'}
            className={`p-1.5 rounded-lg transition-all ${
              !isMusicMuted ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Música"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Sound FX */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Activar Sonidos' : 'Mutear Sonidos'}
            className={`p-1.5 rounded-lg transition-all ${
              !isMuted ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 hover:text-red-300'
            }`}
            aria-label="Efectos de sonido"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Scanlines CRT effect */}
          <button
            onClick={onToggleScanlines}
            title="Filtro retro CRT Arcade"
            className={`p-1.5 rounded-lg transition-all ${
              showScanlines ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Filtro CRT"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
