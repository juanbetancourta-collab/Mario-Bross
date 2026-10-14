import React from 'react';
import { Trophy, Sparkles, RotateCcw, ArrowRight, Flame, Home } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface VictoryModalProps {
  engine: GameEngine;
  onNextLevel: () => void;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  engine,
  onNextLevel,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const isLevel1 = engine.state.currentLevel === 1;
  const timeBonus = Math.floor(engine.state.timeRemaining) * 50;

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Trophy className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isLevel1 ? '¡MUNDO 1-1 COMPLETADO!' : '¡MUNDO 1-2 COMPLETADO!'}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-pixel text-amber-300 tracking-wide">
            {isLevel1 ? '¡NIVEL SUPERADO!' : '¡JUEGO COMPLETADO!'}
          </h2>
        </div>

        <p className="text-slate-300 text-xs md:text-sm">
          {isLevel1
            ? '¡Has conquistado el primer nivel! Prepárate para el Mundo 1-2: El Castillo de Lava, un reto extremo con fosos de fuego y enemigos veloces.'
            : '¡IMPRESIONANTE! Has cruzado la caverna ardiente y rescatado a la Princesa Peach. ¡Eres el verdadero Campeón!'}
        </p>

        {/* Score Breakdown */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-400">Monedas:</span>
            <span className="font-pixel text-amber-400">{engine.state.coins}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-400">Bonus de Tiempo:</span>
            <span className="font-pixel text-emerald-400">+{timeBonus}</span>
          </div>

          <div className="flex justify-between items-center pt-1 text-sm">
            <span className="font-bold text-white">PUNTAJE TOTAL:</span>
            <span className="font-pixel text-amber-300 text-base">{engine.state.score}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {isLevel1 ? (
            <button
              onClick={onNextLevel}
              autoFocus
              className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:via-amber-400 hover:to-red-500 text-slate-950 font-pixel text-xs md:text-sm rounded-2xl shadow-2xl shadow-red-900/40 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 transition-all border-2 border-amber-300 font-extrabold"
            >
              <Flame className="w-5 h-5 text-amber-950 fill-current" />
              <span>SIGUIENTE: MUNDO 1-2 (DIFÍCIL)</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          ) : null}

          <button
            onClick={onPlayAgain}
            className={`w-full py-3.5 px-4 font-pixel text-xs md:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all ${
              isLevel1
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl border border-amber-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isLevel1 ? 'REPETIR MUNDO 1-1' : 'JUGAR DE NUEVO'}</span>
          </button>

          <button
            onClick={onReturnToMenu}
            className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-pixel text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all border border-slate-700 hover:border-slate-600"
          >
            <Home className="w-4 h-4 text-amber-400" />
            <span>VOLVER AL MENÚ INICIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
