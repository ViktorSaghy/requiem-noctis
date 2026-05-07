import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import { useGame } from './engine';
import type { Character } from './engine';
import type { Chronicle } from './engine';
import {
  TitleScreen,
  StorySelect,
  CharacterCreation,
  GameScreen,
  EndingScreen,
  SettingsPanel,
} from './ui';
import { AshAndIvory } from '../content/ash-ivory/scenes';
import { Audio } from './audio';
import type { AppSettings } from './engine/settings';
import { loadSettings } from './engine/settings';

type Screen = 'title' | 'story' | 'create' | 'game' | 'ending' | 'settings';

const CHRONICLES: Chronicle[] = [AshAndIvory];

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [prevScreen, setPrevScreen] = useState<Screen>('title');
  const [selectedChronicle, setSelectedChronicle] = useState<Chronicle>(CHRONICLES[0]);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const audioUnlocked = useRef(false);
  const game = useGame();

  // Apply saved settings to audio engine on first render
  useEffect(() => {
    Audio.applySettings(settings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Unlock AudioContext on first user interaction, then start exploration music
  useEffect(() => {
    const unlock = () => {
      if (audioUnlocked.current) return;
      audioUnlocked.current = true;
      Audio.unlock();
      Audio.setMood('exploration');
    };
    document.addEventListener('click', unlock, { once: true, capture: true });
    document.addEventListener('touchstart', unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
  }, []);

  // Restore exploration mood when returning to menu screens
  useEffect(() => {
    if (!audioUnlocked.current) return;
    if (screen === 'title' || screen === 'story' || screen === 'create') {
      Audio.setMood('exploration');
    }
  }, [screen]);

  const handleNewGame = useCallback(() => {
    setScreen('story');
  }, []);

  const handleContinue = useCallback(async () => {
    const ok = await game.resume(CHRONICLES[0]);
    if (ok) setScreen('game');
  }, [game]);

  const handleStorySelect = useCallback((c: Chronicle) => {
    setSelectedChronicle(c);
    setScreen('create');
  }, []);

  const handleCharacterComplete = useCallback((char: Character) => {
    game.start(char, selectedChronicle);
    setScreen('game');
  }, [game, selectedChronicle]);

  const handleEndingReady = useCallback((id: string) => {
    setEndingId(id);
    setScreen('ending');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setEndingId(null);
    setScreen('title');
  }, []);

  const handleSettings = useCallback(() => {
    setPrevScreen(screen);
    setScreen('settings');
  }, [screen]);

  const handleSettingsBack = useCallback(() => {
    setScreen(prevScreen);
  }, [prevScreen]);

  const handleBackToTitle = useCallback(() => {
    setScreen('title');
  }, []);

  const handleSaveSlot = useCallback(async (slot: string) => {
    await game.saveToSlot(slot);
  }, [game]);

  const handleLoadSlot = useCallback(async (slot: string) => {
    return game.loadFromSlot(slot);
  }, [game]);

  return (
    <>
      {screen === 'title' && (
        <TitleScreen onNewGame={handleNewGame} onContinue={handleContinue} />
      )}

      {screen === 'story' && (
        <StorySelect
          chronicles={CHRONICLES}
          onSelect={handleStorySelect}
          onBack={() => setScreen('title')}
        />
      )}

      {screen === 'create' && (
        <CharacterCreation
          onComplete={handleCharacterComplete}
          onBack={() => setScreen('story')}
        />
      )}

      {screen === 'game' && game.state && (
        <GameScreen
          game={game.state}
          onGoTo={game.goTo}
          onBeginRoll={game.beginRoll}
          onRevealRoll={game.revealRoll}
          onConfirmRoll={game.confirmRoll}
          onEndingReady={handleEndingReady}
          onSaveSlot={handleSaveSlot}
          onLoadSlot={handleLoadSlot}
          onSettings={handleSettings}
          onBackToTitle={handleBackToTitle}
          devMode={settings.devMode}
        />
      )}

      {screen === 'ending' && endingId && game.state && (
        <EndingScreen
          ending={game.state.chronicle.endings[endingId]}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {screen === 'settings' && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onBack={handleSettingsBack}
        />
      )}
    </>
  );
}
