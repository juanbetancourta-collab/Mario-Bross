import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface PauseMenuProps {
  engine: GameEngine;
  onResume: () => void;
  onRestart: () => void;
  onReturnToMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  engine,
  onResume,
  onRestart,
  onReturnToMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <h2 className="text-xl font-pixel text-amber-400">JUEGO EN PAUSA</h2>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Puntaje Actual:</span>
            <span className="font-pixel text-white">{engine.state.score}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Monedas:</span>
            <span className="font-pixel text-amber-400">{engine.state.coins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vidas Restantes:</span>
            <span className="font-pixel text-emerald-400">{engine.state.lives}</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>REANUDAR</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR NIVEL</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-pixel text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>VOLVER AL MENÚ INICIAL</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Activar Sonido' : 'Mutear Sonido'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
