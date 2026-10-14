import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, Zap, ArrowUp } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface TouchControlsProps {
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine }) => {
  const bindPointerKey = (key: keyof typeof engine.keys) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback if pointer capture fails
      }
      engine.keys[key] = true;
      if (key === 'run') {
        engine.keys.fire = true;
        engine.triggerFire();
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      engine.keys[key] = false;
      if (key === 'run') {
        engine.keys.fire = false;
      }
    },
    onPointerCancel: () => {
      engine.keys[key] = false;
      if (key === 'run') {
        engine.keys.fire = false;
      }
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div className="w-full max-w-[960px] flex items-end justify-between px-2 md:px-4 py-2 mt-1 select-none pointer-events-auto touch-none">
      {/* Left Pad: Directionals with large, distinct Crouch/Pipe button */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Horizontal controls */}
        <div className="flex items-center gap-2">
          <button
            {...bindPointerKey('left')}
            className="w-16 h-14 md:w-18 md:h-16 bg-slate-800/90 active:bg-amber-500 border-2 border-slate-700 active:border-amber-300 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all cursor-pointer"
            aria-label="Izquierda"
          >
            <ArrowLeft className="w-7 h-7" />
            <span className="text-[9px] font-pixel text-slate-400">IZQ</span>
          </button>

          <button
            {...bindPointerKey('right')}
            className="w-16 h-14 md:w-18 md:h-16 bg-slate-800/90 active:bg-amber-500 border-2 border-slate-700 active:border-amber-300 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl active:scale-95 transition-all cursor-pointer"
            aria-label="Derecha"
          >
            <ArrowRight className="w-7 h-7" />
            <span className="text-[9px] font-pixel text-slate-400">DER</span>
          </button>
        </div>

        {/* Large, dedicated Crouch & Pipe Entry button */}
        <button
          {...bindPointerKey('down')}
          className="w-full max-w-[136px] md:max-w-[152px] h-12 md:h-14 bg-emerald-950/80 active:bg-emerald-500 border-2 border-emerald-600/70 active:border-emerald-300 rounded-2xl flex items-center justify-center gap-1.5 text-emerald-300 active:text-slate-950 shadow-xl active:scale-95 transition-all cursor-pointer font-pixel text-[10px]"
          aria-label="Agacharse y entrar en tuberías"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
          <span>AGACHARSE</span>
        </button>
      </div>

      {/* Right Pad: Action Buttons A & B */}
      <div className="flex items-center gap-3">
        {/* Button B: Run / Fire */}
        <button
          {...bindPointerKey('run')}
          className="w-16 h-16 md:w-18 md:h-18 bg-rose-700 active:bg-rose-500 border-2 border-rose-500 active:border-rose-300 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-all cursor-pointer"
          aria-label="Botón B: Correr y Bola de Fuego"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-pixel font-bold mt-0.5">B</span>
          <span className="text-[8px] font-sans text-rose-200">FUEGO</span>
        </button>

        {/* Button A: Jump */}
        <button
          {...bindPointerKey('jump')}
          className="w-18 h-18 md:w-20 md:h-20 bg-amber-500 active:bg-amber-400 border-3 border-amber-300 rounded-full flex flex-col items-center justify-center text-slate-950 font-bold shadow-2xl active:scale-95 transition-all cursor-pointer"
          aria-label="Botón A: Saltar"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
          <span className="text-[11px] font-pixel mt-0.5 font-extrabold">A</span>
          <span className="text-[8px] font-sans font-bold text-slate-900">SALTAR</span>
        </button>
      </div>
    </div>
  );
};
