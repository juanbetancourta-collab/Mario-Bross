/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { PauseMenu } from './components/PauseMenu';
import { TitleScreen } from './components/TitleScreen';
import { GameControls } from './components/GameControls';
import { VictoryModal } from './components/VictoryModal';
import { sound } from './game/audio';
import { GameEngine } from './game/engine';
import { GameState } from './game/types';

export default function App() {
  const engine = useMemo(() => new GameEngine(), []);
  const [gameState, setGameState] = useState<GameState>({ ...engine.state });
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(sound.getIsMusicMuted());
  const [showScanlines, setShowScanlines] = useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const [controlMode, setControlMode] = useState<'mobile' | 'desktop' | 'hidden'>(() => {
    const saved = localStorage.getItem('mario_control_mode') as 'mobile' | 'desktop' | 'hidden' | null;
    if (saved && ['mobile', 'desktop', 'hidden'].includes(saved)) {
      return saved;
    }
    return isTouchDevice ? 'mobile' : 'desktop';
  });

  const handleSetControlMode = (newMode: 'mobile' | 'desktop' | 'hidden') => {
    setControlMode(newMode);
    localStorage.setItem('mario_control_mode', newMode);
  };

  // Sync React state with game engine loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState({ ...engine.state });
    }, 50); // 20 times per second for UI sync

    return () => clearInterval(interval);
  }, [engine]);

  // Global Keyboard & Pointer event listeners
  useEffect(() => {
    const handlePointerDown = () => {
      sound.unlockAudio();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      sound.unlockAudio();

      // Prevent default page scroll on game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Pause toggle
      if ((e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) {
        if (engine.state.status === 'playing') {
          engine.state.status = 'paused';
          sound.stopMusic();
          setGameState({ ...engine.state });
          return;
        } else if (engine.state.status === 'paused') {
          engine.state.status = 'playing';
          sound.playMusic(engine.state.isUnderground ? 'underground' : 'overworld');
          setGameState({ ...engine.state });
          return;
        }
      }

      const keyLower = e.key ? e.key.toLowerCase() : '';

      // Direct trigger for F / f key to launch fire immediately
      if (e.code === 'KeyF' || keyLower === 'f') {
        engine.keys.fire = true;
        engine.keys.run = true;
        engine.triggerFire();
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          engine.keys.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.keys.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
        case 'KeyZ':
          engine.keys.jump = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          engine.keys.down = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyX':
          engine.keys.run = true;
          engine.keys.fire = true;
          engine.triggerFire();
          break;
        case 'Enter':
          if (engine.state.status === 'title') {
            engine.startGame();
            setGameState({ ...engine.state });
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyLower = e.key ? e.key.toLowerCase() : '';

      if (e.code === 'KeyF' || keyLower === 'f') {
        engine.keys.fire = false;
        engine.keys.run = false;
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          engine.keys.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.keys.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
        case 'KeyZ':
          engine.keys.jump = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          engine.keys.down = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyX':
          engine.keys.run = false;
          engine.keys.fire = false;
          break;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine]);

  // Audio & UI Handlers
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const musicMuted = sound.toggleMusic();
    setIsMusicMuted(musicMuted);
  };

  const handleToggleScanlines = () => {
    setShowScanlines((prev) => !prev);
  };

  const handleTogglePause = () => {
    if (engine.state.status === 'playing') {
      engine.state.status = 'paused';
      sound.stopMusic();
    } else if (engine.state.status === 'paused') {
      engine.state.status = 'playing';
      sound.playMusic(engine.state.isUnderground ? 'underground' : 'overworld');
    }
    setGameState({ ...engine.state });
  };

  const handleStartGame = () => {
    engine.startGame();
    setGameState({ ...engine.state });
  };

  const handleResumeGame = () => {
    engine.state.status = 'playing';
    sound.playMusic(engine.state.isUnderground ? 'underground' : 'overworld');
    setGameState({ ...engine.state });
  };

  const handleRestartGame = () => {
    engine.restartGame();
    setGameState({ ...engine.state });
  };

  const handleNextLevel = () => {
    engine.advanceToNextLevel();
    setGameState({ ...engine.state });
  };

  const handleSelectLevel = (lvl: 1 | 2) => {
    engine.startLevel(lvl);
    setGameState({ ...engine.state });
  };

  const handleReturnToMenu = () => {
    engine.goToTitle();
    setGameState({ ...engine.state });
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-between p-2 md:p-6 overflow-x-hidden font-sans">
      {/* Top Bar / HUD */}
      <GameHUD
        state={gameState}
        isMuted={isMuted}
        isMusicMuted={isMusicMuted}
        showScanlines={showScanlines}
        controlMode={controlMode}
        onSetControlMode={handleSetControlMode}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onToggleScanlines={handleToggleScanlines}
        onTogglePause={handleTogglePause}
        onRestart={handleRestartGame}
      />

      {/* Main Game Stage with Canvas and Screen Overlays */}
      <div className="relative w-full max-w-[960px] flex items-center justify-center my-auto">
        <GameCanvas engine={engine} showScanlines={showScanlines} />

        {/* Title Screen Overlay */}
        {gameState.status === 'title' && (
          <TitleScreen
            engine={engine}
            onStart={handleStartGame}
            onSelectLevel={handleSelectLevel}
          />
        )}

        {/* Pause Menu Overlay */}
        {gameState.status === 'paused' && (
          <PauseMenu
            engine={engine}
            onResume={handleResumeGame}
            onRestart={handleRestartGame}
            onReturnToMenu={handleReturnToMenu}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* Game Over Screen Overlay */}
        {gameState.status === 'game_over' && (
          <GameOverModal
            engine={engine}
            onRestart={handleRestartGame}
            onReturnToMenu={handleReturnToMenu}
          />
        )}

        {/* Victory Clear Screen Overlay */}
        {gameState.status === 'level_cleared' && (
          <VictoryModal
            engine={engine}
            onNextLevel={handleNextLevel}
            onPlayAgain={handleRestartGame}
            onReturnToMenu={handleReturnToMenu}
          />
        )}
      </div>

      {/* Unified Controls for Mobile (Touch) & Computer (Arcade Click + Keyboard) */}
      <GameControls
        engine={engine}
        mode={controlMode}
        onSetMode={handleSetControlMode}
        onTogglePause={handleTogglePause}
        onRestart={handleRestartGame}
      />
    </main>
  );
}
