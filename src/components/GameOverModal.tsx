import React from 'react';
import { RotateCcw, Skull, Trophy, Home } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface GameOverModalProps {
  engine: GameEngine;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  engine,
  onRestart,
  onReturnToMenu,
}) => {
  const isNewRecord = engine.state.score >= engine.state.highScore && engine.state.score > 0;

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
      <div className="max-w-sm w-full bg-slate-900 border border-red-950/60 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-950/50 border border-red-800/40 flex items-center justify-center text-red-500">
          <Skull className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-pixel text-red-500 tracking-wider">GAME OVER</h2>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Puntaje Final:</span>
            <span className="font-pixel text-white text-sm">{engine.state.score}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Monedas Obtenidas:</span>
            <span className="font-pixel text-amber-400">{engine.state.coins}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Récord:</span>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-pixel text-amber-300">{engine.state.highScore}</span>
            </div>
          </div>

          {isNewRecord && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 font-pixel text-[10px] mt-2">
              ¡NUEVO RÉCORD HISTÓRICO!
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          <button
            onClick={onRestart}
            autoFocus
            className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white font-pixel text-xs sm:text-sm rounded-xl shadow-xl shadow-red-950/60 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 transition-all border border-red-400/40"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>REINTENTAR AHORA</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-pixel text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all border border-slate-700 hover:border-slate-600"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>MENÚ INICIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
