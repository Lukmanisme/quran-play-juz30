import React, { useEffect, useMemo, useState } from 'react';
import { JUZ_30_SURAHS } from './data/juz30Meta.js';
import StorageService from './services/StorageService.js';
import audioManager from './services/AudioManager.js';
import LoginProfile from './components/LoginProfile.jsx';
import SurahList from './components/SurahList.jsx';
import Gameplay from './components/Gameplay.jsx';

export default function App() {
  const [profile, setProfile] = useState(() => StorageService.loadProfile());
  const [screen, setScreen] = useState(() =>
    StorageService.loadProfile().name ? 'list' : 'login'
  );
  const [activeSurah, setActiveSurah] = useState(null);

  useEffect(() => {
    audioManager.setEnabled(profile.sfxEnabled);
    StorageService.saveProfile(profile);
  }, [profile]);

  const orderedSurahs = useMemo(() => {
    const list = [...JUZ_30_SURAHS];
    return profile.sortOrder === 'desc'
      ? list.sort((a, b) => b.id - a.id)
      : list.sort((a, b) => a.id - b.id);
  }, [profile.sortOrder]);

  const nextSurah = useMemo(() => {
    if (!activeSurah) return null;
    const idx = orderedSurahs.findIndex((s) => s.id === activeSurah.id);
    if (idx === -1 || idx + 1 >= orderedSurahs.length) return null;
    return orderedSurahs[idx + 1];
  }, [activeSurah, orderedSurahs]);

  const handleSaveAndStart = (updatedProfile) => {
    setProfile(updatedProfile);
    setScreen('list');
  };

  const handleToggleSfx = () => {
    setProfile((prev) => ({
      ...prev,
      sfxEnabled: !prev.sfxEnabled,
    }));
  };

  const handleToggleSortOrder = () => {
    setProfile((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleResetProgress = () => {
    const reset = StorageService.resetProgress(profile);
    setProfile(reset);
  };

  const handleCompleteSurah = ({ surahId, stars, score, earnedCoins, mode }) => {
    setProfile((prev) => {
      const existing = prev.surahProgress?.[surahId] || {
        stars: 0,
        bestScore: 0,
        completedModes: [],
      };
      const modes = new Set(existing.completedModes || []);
      modes.add(mode);

      return {
        ...prev,
        coins: (prev.coins || 0) + earnedCoins,
        surahProgress: {
          ...prev.surahProgress,
          [surahId]: {
            stars: Math.max(existing.stars || 0, stars),
            bestScore: Math.max(existing.bestScore || 0, score),
            completedModes: Array.from(modes),
          },
        },
      };
    });
  };

  if (screen === 'login') {
    return (
      <LoginProfile
        profile={profile}
        onSaveAndStart={handleSaveAndStart}
        onToggleSfx={handleToggleSfx}
      />
    );
  }

  if (screen === 'play' && activeSurah) {
    return (
      <Gameplay
        key={activeSurah.id}
        profile={profile}
        surah={activeSurah}
        hasNextSurah={Boolean(nextSurah)}
        onToggleSfx={handleToggleSfx}
        onExit={() => {
          setScreen('list');
          setActiveSurah(null);
        }}
        onCompleteSurah={handleCompleteSurah}
        onNextSurah={() => {
          if (nextSurah) setActiveSurah(nextSurah);
        }}
      />
    );
  }

  return (
    <SurahList
      profile={profile}
      onSelectSurah={(surah) => {
        setActiveSurah(surah);
        setScreen('play');
      }}
      onEditProfile={() => setScreen('login')}
      onToggleSfx={handleToggleSfx}
      onToggleSortOrder={handleToggleSortOrder}
      onResetProgress={handleResetProgress}
    />
  );
}
