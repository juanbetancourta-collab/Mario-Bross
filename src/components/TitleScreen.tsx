import React from 'react';
import { Play, Sparkles, Trophy, Gamepad2, ArrowRight, Flame, Flag } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface TitleScreenProps {
  engine: GameEngine;
  onStart: () => void;
  onSelectLevel?: (lvl: 1 | 2) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ engine, onStart, onSelectLevel }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 md:p-6 text-center z-20 overflow-y-auto">
      <div className="max-w-xl w-full space-y-4 my-auto">
        {/* Title Header Lockup */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>MUNDO 1-1 Y MUNDO 1-2 (DIFÍCIL) CON CHECKPOINTS</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-pixel text-amber-400 tracking-wider drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)] leading-tight">
            SUPER MARIO
          </h1>

          <p className="text-slate-300 text-xs md:text-sm max-w-md mx-auto">
            Dos mundos completos con físicas auténticas, sistema de puntos de control (checkpoints), lava ardiente y sonido chiptune.
          </p>
        </div>

        {/* --- BOTÓN GRANDE DE INICIO --- */}
        <div className="py-1">
          <button
            onClick={onStart}
            autoFocus
            className="group relative w-full py-5 md:py-6 px-8 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:via-amber-400 hover:to-red-500 text-slate-950 font-pixel text-lg md:text-2xl rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.8)] active:scale-98 transition-all duration-200 flex items-center justify-center gap-4 cursor-pointer border-2 border-amber-200/80"
          >
            <span className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 md:w-7 md:h-7 fill-current ml-0.5" />
            </span>
            <span className="tracking-widest drop-shadow font-extrabold text-white group-hover:text-slate-950 transition-colors">
              INICIAR JUEGO
            </span>
            <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:text-slate-950 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Quick Select Buttons */}
          {onSelectLevel && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                onClick={() => onSelectLevel(1)}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-pixel text-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <span>Mundo 1-1</span>
              </button>
              <button
                onClick={() => onSelectLevel(2)}
                className="py-1.5 px-3 bg-red-950/70 hover:bg-red-900 border border-red-700/80 rounded-lg text-red-200 font-pixel text-[10px] flex items-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-3 h-3 text-red-400 fill-current" />
                <span>Mundo 1-2 (Difícil)</span>
              </button>
            </div>
          )}
        </div>

        {/* Checkpoint Feature Callout */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 flex items-center justify-center gap-2">
          <Flag className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px]">
            <strong>Checkpoints Activos:</strong> Al cruzar la bandera de mitad de nivel, reaparecerás allí si pierdes una vida.
          </span>
        </div>

        {/* Guía Lógica de Controles */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-xs text-left shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-pixel text-[10px]">
              <Gamepad2 className="w-4 h-4" />
              <span>GUÍA DE CONTROLES</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Récord: <strong className="font-pixel text-white">{engine.state.highScore}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <span className="block text-slate-400 text-[9px] uppercase font-bold">Moverse</span>
              <span className="font-mono text-white text-[11px] font-semibold">← → / A D</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <span className="block text-amber-400 text-[9px] uppercase font-bold">Saltar</span>
              <span className="font-mono text-white text-[11px] font-semibold">Espacio / W / A</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <span className="block text-rose-400 text-[9px] uppercase font-bold">Fuego/Correr</span>
              <span className="font-mono text-white text-[11px] font-semibold">Shift / F / B</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <span className="block text-emerald-400 text-[9px] uppercase font-bold">Agacharse</span>
              <span className="font-mono text-white text-[11px] font-semibold">↓ / S (Tubería)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
