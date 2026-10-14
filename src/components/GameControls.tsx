import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Flame,
  Smartphone,
  Monitor,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GameEngine } from '../game/engine';

export type ControlMode = 'mobile' | 'desktop' | 'hidden';

interface GameControlsProps {
  engine: GameEngine;
  mode?: ControlMode;
  onSetMode?: (mode: ControlMode) => void;
  onTogglePause?: () => void;
  onRestart?: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  engine,
  mode: propMode,
  onSetMode,
  onTogglePause,
  onRestart,
}) => {
  // Detect if current device has touch capabilities by default
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // Load user preference or default intelligently
  const [internalMode, setInternalMode] = useState<ControlMode>(() => {
    const saved = localStorage.getItem('mario_control_mode') as ControlMode | null;
    if (saved && ['mobile', 'desktop', 'hidden'].includes(saved)) {
      return saved;
    }
    return isTouchDevice ? 'mobile' : 'desktop';
  });

  const mode = propMode ?? internalMode;

  const handleModeChange = (newMode: ControlMode) => {
    if (onSetMode) {
      onSetMode(newMode);
    } else {
      setInternalMode(newMode);
    }
    localStorage.setItem('mario_control_mode', newMode);
  };

  // Track active keys state to light up on-screen buttons when user types on physical keyboard
  const [activeKeys, setActiveKeys] = useState({
    left: false,
    right: false,
    down: false,
    jump: false,
    fire: false,
  });

  useEffect(() => {
    // Poll engine keys at high frequency to sync real-time physical keyboard presses
    const interval = window.setInterval(() => {
      setActiveKeys({
        left: engine.keys.left,
        right: engine.keys.right,
        down: engine.keys.down,
        jump: engine.keys.jump,
        fire: engine.keys.fire || engine.keys.run,
      });
    }, 30);

    return () => clearInterval(interval);
  }, [engine]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe fallback
      }
    }
  };

  const bindKey = (key: keyof typeof engine.keys) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      triggerHaptic();
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
    <section className="w-full max-w-[960px] flex flex-col items-center gap-3 select-none pointer-events-auto touch-none mt-2">
      {/* 1. BIG HIGH-VISIBILITY MODE SELECTOR CARDS */}
      <div className="w-full bg-slate-900/95 border-2 border-slate-800 rounded-2xl p-3 md:p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-pixel text-xs md:text-sm text-white tracking-wider">
              🎮 SELECTOR DE CONTROLES: ¿DÓNDE ESTÁS JUGANDO?
            </span>
          </div>
          <button
            onClick={() => handleModeChange(mode === 'hidden' ? (isTouchDevice ? 'mobile' : 'desktop') : 'hidden')}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            title="Ocultar o mostrar botones en pantalla"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{mode === 'hidden' ? 'Mostrar botones' : 'Ocultar botones'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 1: JUGAR EN CELULAR */}
          <button
            onClick={() => handleModeChange('mobile')}
            className={`flex items-center gap-3.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
              mode === 'mobile'
                ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/50 scale-[1.01]'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              mode === 'mobile'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Smartphone className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-pixel text-xs sm:text-sm font-bold ${
                  mode === 'mobile' ? 'text-amber-300' : 'text-slate-200'
                }`}>
                  📱 MODO CELULAR
                </span>
                {mode === 'mobile' && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-pixel text-[9px] font-extrabold rounded-md shadow animate-pulse">
                    ACTIVO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Botones táctiles grandes para jugar tocando la pantalla con los dedos.
              </p>
            </div>
          </button>

          {/* Card 2: JUGAR EN COMPUTADOR */}
          <button
            onClick={() => handleModeChange('desktop')}
            className={`flex items-center gap-3.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
              mode === 'desktop'
                ? 'bg-sky-500/20 border-sky-400 shadow-xl shadow-sky-500/20 ring-2 ring-sky-400/50 scale-[1.01]'
                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 opacity-80'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              mode === 'desktop'
                ? 'bg-sky-500 text-white border-sky-300 shadow-md'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Monitor className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`font-pixel text-xs sm:text-sm font-bold ${
                  mode === 'desktop' ? 'text-sky-300' : 'text-slate-200'
                }`}>
                  💻 MODO COMPUTADOR
                </span>
                {mode === 'desktop' && (
                  <span className="px-2 py-0.5 bg-sky-500 text-white font-pixel text-[9px] font-extrabold rounded-md shadow animate-pulse">
                    ACTIVO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Consola arcade con atajos de teclado [A, D, Espacio, F] y clics de ratón.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. MODE: CELULAR (Mobile Ergonomic Gamepad) */}
      {mode === 'mobile' && (
        <div className="w-full flex items-end justify-between px-2 md:px-4 py-1.5 select-none touch-none">
          {/* Left Thumb Pad: D-Pad & Crouch */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              {/* Left Button */}
              <button
                {...bindKey('left')}
                className={`w-16 h-15 sm:w-18 sm:h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer border-2 ${
                  activeKeys.left
                    ? 'bg-amber-500 border-amber-300 text-slate-950 scale-95 shadow-amber-500/50'
                    : 'bg-slate-800/95 border-slate-700 text-white'
                }`}
                aria-label="Mover a la izquierda"
              >
                <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
                <span className="text-[9px] font-pixel mt-0.5 opacity-80">IZQ</span>
              </button>

              {/* Right Button */}
              <button
                {...bindKey('right')}
                className={`w-16 h-15 sm:w-18 sm:h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer border-2 ${
                  activeKeys.right
                    ? 'bg-amber-500 border-amber-300 text-slate-950 scale-95 shadow-amber-500/50'
                    : 'bg-slate-800/95 border-slate-700 text-white'
                }`}
                aria-label="Mover a la derecha"
              >
                <ArrowRight className="w-7 h-7 stroke-[2.5]" />
                <span className="text-[9px] font-pixel mt-0.5 opacity-80">DER</span>
              </button>
            </div>

            {/* Crouch & Down Pipe Button */}
            <button
              {...bindKey('down')}
              className={`w-full max-w-[136px] sm:max-w-[152px] h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer border-2 font-pixel text-[10px] ${
                activeKeys.down
                  ? 'bg-emerald-400 border-emerald-200 text-slate-950 scale-95'
                  : 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
              }`}
              aria-label="Agacharse y entrar en tuberías"
            >
              <ArrowDown className="w-4 h-4 stroke-[3]" />
              <span>AGACHARSE</span>
            </button>
          </div>

          {/* Center Utility Micro-Buttons for Mobile */}
          <div className="flex flex-col items-center gap-1.5 mb-1">
            {onTogglePause && (
              <button
                onClick={onTogglePause}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-md cursor-pointer"
                title="Pausar juego"
                aria-label="Pausa"
              >
                {engine.state.status === 'paused' ? (
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
            )}
            {onRestart && (
              <button
                onClick={onRestart}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 active:scale-90 transition-all shadow-md cursor-pointer"
                title="Reiniciar nivel"
                aria-label="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Thumb Pad: Action Buttons A & B */}
          <div className="flex items-center gap-3">
            {/* Button B: Fire & Turbo Run */}
            <button
              {...bindKey('run')}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center text-white shadow-2xl active:scale-95 transition-all cursor-pointer border-2 ${
                activeKeys.fire
                  ? 'bg-rose-500 border-rose-300 scale-95 shadow-rose-500/50'
                  : 'bg-rose-700 border-rose-500'
              }`}
              aria-label="Botón B: Correr y Bola de Fuego"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span className="text-[10px] font-pixel font-bold mt-0.5">B</span>
              <span className="text-[8px] font-sans font-bold text-rose-200">FUEGO</span>
            </button>

            {/* Button A: Jump */}
            <button
              {...bindKey('jump')}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center text-slate-950 font-bold shadow-2xl active:scale-95 transition-all cursor-pointer border-3 ${
                activeKeys.jump
                  ? 'bg-amber-400 border-white scale-95 shadow-amber-400/50'
                  : 'bg-amber-500 border-amber-300'
              }`}
              aria-label="Botón A: Saltar"
            >
              <ArrowUp className="w-7 h-7 stroke-[3.5]" />
              <span className="text-[11px] font-pixel mt-0.5 font-extrabold">A</span>
              <span className="text-[8px] font-sans font-extrabold text-slate-950">SALTAR</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MODE: COMPU (Desktop Retro Arcade Deck) */}
      {mode === 'desktop' && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Movement Section */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel text-slate-500 mr-1 hidden sm:inline">
                MOVIMIENTO:
              </span>

              {/* Left Button */}
              <button
                {...bindKey('left')}
                className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  activeKeys.left
                    ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/30 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                }`}
                title="Mover a la izquierda (Tecla A o Flecha Izquierda)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-semibold">IZQ</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/60 text-amber-300 border border-slate-700">
                  A / ←
                </kbd>
              </button>

              {/* Right Button */}
              <button
                {...bindKey('right')}
                className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  activeKeys.right
                    ? 'bg-amber-500 border-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-500/30 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                }`}
                title="Mover a la derecha (Tecla D o Flecha Derecha)"
              >
                <span className="text-xs font-semibold">DER</span>
                <ArrowRight className="w-4 h-4" />
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/60 text-amber-300 border border-slate-700">
                  D / →
                </kbd>
              </button>

              {/* Crouch Button */}
              <button
                {...bindKey('down')}
                className={`group flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  activeKeys.down
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 scale-95'
                    : 'bg-emerald-950/40 hover:bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                }`}
                title="Agacharse o entrar por tuberías verdes (Tecla S o Flecha Abajo)"
              >
                <ArrowDown className="w-4 h-4" />
                <span className="text-xs font-semibold hidden sm:inline">ABAJO</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-200 border border-emerald-700">
                  S / ↓
                </kbd>
              </button>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel text-slate-500 mr-1 hidden sm:inline">
                ACCIONES:
              </span>

              {/* Fire & Turbo Run Button */}
              <button
                {...bindKey('run')}
                className={`group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  activeKeys.fire
                    ? 'bg-rose-500 border-rose-300 text-white font-bold shadow-lg shadow-rose-500/40 scale-95 animate-pulse'
                    : 'bg-rose-950/40 hover:bg-rose-950/70 border-rose-600/70 text-rose-300'
                }`}
                title="Disparar Fuego (si tienes flor) y Correr rápido (Tecla F o Shift)"
              >
                <Flame className="w-4 h-4 text-rose-400 fill-current" />
                <span className="text-xs font-bold">FUEGO</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-200 border border-rose-600">
                  F / Shift
                </kbd>
              </button>

              {/* Jump Button */}
              <button
                {...bindKey('jump')}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                  activeKeys.jump
                    ? 'bg-amber-400 border-white text-slate-950 font-extrabold shadow-lg shadow-amber-400/50 scale-95'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-300'
                }`}
                title="Saltar (Tecla Espacio, W o Tecla Z)"
              >
                <ArrowUp className="w-4 h-4 stroke-[3]" />
                <span className="text-xs font-extrabold">SALTAR</span>
                <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-200 border border-amber-500">
                  Espacio
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODE: HIDDEN (Prominent restore cards) */}
      {mode === 'hidden' && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-pixel text-[10px]">CONTROLES:</span>
            <span>Los botones en pantalla están ocultos.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleModeChange('mobile')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg font-pixel text-[10px] cursor-pointer active:scale-95 transition-all shadow flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>📱 Activar Modo Celular</span>
            </button>
            <button
              onClick={() => handleModeChange('desktop')}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg font-pixel text-[10px] cursor-pointer active:scale-95 transition-all shadow flex items-center gap-1.5"
            >
              <Monitor className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>💻 Activar Modo Compu</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
