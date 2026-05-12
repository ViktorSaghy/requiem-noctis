import { useState, useCallback, useEffect, useMemo } from 'react';
import './App.css';
import { useGame, localizeChronicle } from './engine';
import { awardXp } from './engine/progression';
import type { XpAwardRecord } from './engine';
import type { Character } from './engine';
import type { Chronicle } from './engine';
import {
  TitleScreen,
  StorySelect,
  CharacterCreation,
  GameScreen,
  EndingScreen,
  DeathScreen,
  SettingsPanel,
  CreditsScreen,
  UpgradeScreen,
  XpRecapScreen,
  Toast,
  type ToastMessage,
} from './ui';
import { AshAndIvory } from '../content/ash-ivory/scenes';
import { BloodGamesChronicle } from '../content/blood-games/scenes';
import { AshesOfTorpor } from '../content/ashes-of-torpor/scenes';
import { Audio } from './audio';
import type { AppSettings } from './engine/settings';
import { loadSettings } from './engine/settings';
import { LangContext } from './engine/i18n';
import { saveCharacter } from './engine/saves';

type Screen = 'title' | 'story' | 'create' | 'game' | 'ending' | 'xp-recap' | 'downtime' | 'settings' | 'credits' | 'death';

const BASE_CHRONICLES: Chronicle[] = [AshesOfTorpor, AshAndIvory, BloodGamesChronicle];

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [prevScreen, setPrevScreen] = useState<Screen>('title');
  const [endingId, setEndingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [toast] = useState<ToastMessage | null>(null);
  const [pendingXpRecord, setPendingXpRecord] = useState<XpAwardRecord | null>(null);
  const [pendingCharacter, setPendingCharacter] = useState<Character | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const game = useGame();
  const CHRONICLES = useMemo(
    () => BASE_CHRONICLES.map(c => localizeChronicle(c, settings.language ?? 'en')),
    [settings.language]
  );

  // Apply settings and attempt auto-start (works when browser allows autoplay)
  useEffect(() => {
    Audio.applySettings(settings);
    void Audio.unlock().then(running => {
      if (running) setAudioUnlocked(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback: unlock AudioContext on first user gesture
  useEffect(() => {
    if (audioUnlocked) return;
    const unlock = async () => {
      await Audio.unlock();
      setAudioUnlocked(true);
    };
    document.addEventListener('click', unlock, { once: true, capture: true });
    document.addEventListener('touchstart', unlock, { once: true, capture: true });
    return () => {
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
  }, [audioUnlocked]);

  // Set appropriate music for each screen (re-runs when screen or unlock state changes)
  useEffect(() => {
    if (!audioUnlocked) return;
    if (screen === 'title' || screen === 'credits') {
      Audio.setMood('title');
    } else if (screen === 'story' || screen === 'create' || screen === 'settings' || screen === 'game') {
      Audio.setMood('exploration');
    } else if (screen === 'ending') {
      Audio.setMood('ending');
    }
  }, [screen, audioUnlocked]);

  const handleNewGame = useCallback(() => {
    setScreen('create');
  }, []);

  const handleContinue = useCallback(async () => {
    const ok = await game.resume(CHRONICLES[0]);
    if (ok) setScreen('game');
  }, [game]);

  const handleStorySelect = useCallback((c: Chronicle) => {
    if (pendingCharacter) {
      game.start(pendingCharacter, c);
      setPendingCharacter(null);
      setScreen('game');
    } else {
      setScreen('create');
    }
  }, [pendingCharacter, game]);

  const handleCharacterComplete = useCallback((char: Character) => {
    setPendingCharacter(char);
    setScreen('story');
  }, []);

  const handleEndingReady = useCallback((id: string) => {
    setEndingId(id);
    if (!game.state) return;

    const flags = game.state.flags;
    const ending = game.state.chronicle.endings[id];

    // Infer bonus XP criteria from ending type and flags
    const isGoodOrPerfect = ending?.type === 'good_end' || ending?.type === 'perfect_end';
    const isPerfect = ending?.type === 'perfect_end';

    const xpRecord = awardXp(id, {
      episodeComplete: true,
      desireFulfilled: isPerfect || !!flags['desire_fulfilled'],
      ambitionAdvanced: !!flags['ambition_advanced'],
      masqueradeKept: isGoodOrPerfect && !flags['masquerade_broken'],
      humanityPreserved: !!flags['humanity_preserved'],
      endingTitle: ending?.title,
    });

    // Apply XP to character and persist to log
    const updatedChar: Character = {
      ...game.state.character,
      xp: (game.state.character.xp ?? 0) + xpRecord.amount,
      xpTotal: (game.state.character.xpTotal ?? 0) + xpRecord.amount,
      xpAwardLog: [...(game.state.character.xpAwardLog ?? []), xpRecord],
    };
    game.state.character = updatedChar;
    game.state.downtimeAvailable = true;

    setPendingXpRecord(xpRecord);
    setScreen('xp-recap');
  }, [game.state]);

  const handleRecapContinue = useCallback(() => {
    setPendingXpRecord(null);
    setScreen('downtime');
  }, []);

  const handleDowntimeComplete = useCallback((updatedChar: Character) => {
    if (game.state) {
      game.state.character = updatedChar;
      game.state.downtimeAvailable = false;
    }
    void saveCharacter(updatedChar);
    setScreen('ending');
  }, [game.state]);

  const handleContinueCharacter = useCallback(() => {
    if (game.state) setPendingCharacter({ ...game.state.character });
    setEndingId(null);
    setScreen('story');
  }, [game.state]);

  const handleNewCharacter = useCallback(() => {
    setEndingId(null);
    setPendingCharacter(null);
    setScreen('create');
  }, []);

  const handleSelectCharacter = useCallback((char: Character) => {
    setPendingCharacter(char);
    setScreen('story');
  }, []);

  const handleSettings = useCallback(() => {
    setPrevScreen(screen);
    setScreen('settings');
  }, [screen]);

  const handleCredits = useCallback(() => {
    setScreen('credits');
  }, []);

  const handleSettingsBack = useCallback(() => {
    setScreen(prevScreen);
  }, [prevScreen]);

  const handleCreditsBack = useCallback(() => {
    setScreen('settings');
  }, []);

  const handleBackToTitle = useCallback(() => {
    setScreen('title');
  }, []);

  const handleDefeat = useCallback(() => {
    setScreen('death');
  }, []);

  const handleRetryChronicle = useCallback(() => {
    game.retryChronicle();
    setScreen('game');
  }, [game]);

  const handleSaveSlot = useCallback(async (slot: string) => {
    await game.saveToSlot(slot);
  }, [game]);

  const handleLoadSlot = useCallback(async (slot: string) => {
    return game.loadFromSlot(slot);
  }, [game]);

  return (
    <LangContext.Provider value={settings.language ?? 'en'}>
      {screen === 'title' && (
        <TitleScreen
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          onSettings={handleSettings}
          onSelectCharacter={handleSelectCharacter}
        />
      )}

      {screen === 'story' && (
        <StorySelect
          chronicles={CHRONICLES}
          onSelect={handleStorySelect}
          onBack={() => setScreen('create')}
        />
      )}

      {screen === 'create' && (
        <CharacterCreation
          onComplete={handleCharacterComplete}
          onBack={() => setScreen('title')}
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
          onApplyPostCombatDamage={game.applyPostCombatDamage}
          onDefeat={handleDefeat}
          devMode={settings.devMode}
        />
      )}

      {screen === 'death' && (
        <DeathScreen
          onLoadSlot={async (slot) => {
            const ok = await handleLoadSlot(slot);
            if (ok) setScreen('game');
            return ok;
          }}
          onRetry={handleRetryChronicle}
          onBackToTitle={handleBackToTitle}
        />
      )}

      {screen === 'xp-recap' && pendingXpRecord && game.state && endingId && (
        <XpRecapScreen
          record={pendingXpRecord}
          characterName={game.state.character.name}
          endingTitle={game.state.chronicle.endings[endingId]?.title}
          endingType={game.state.chronicle.endings[endingId]?.type}
          totalXp={game.state.character.xp ?? 0}
          onContinue={handleRecapContinue}
        />
      )}

      {screen === 'ending' && endingId && game.state && (
        <EndingScreen
          ending={game.state.chronicle.endings[endingId]}
          characterName={game.state.character.name}
          onContinueCharacter={handleContinueCharacter}
          onNewCharacter={handleNewCharacter}
        />
      )}

      {screen === 'downtime' && game.state && (
        <UpgradeScreen
          character={game.state.character}
          onDone={handleDowntimeComplete}
        />
      )}

      {screen === 'settings' && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onBack={handleSettingsBack}
          onCredits={handleCredits}
        />
      )}

      {screen === 'credits' && (
        <CreditsScreen onBack={handleCreditsBack} />
      )}

      <Toast message={toast} />
    </LangContext.Provider>
  );
}
