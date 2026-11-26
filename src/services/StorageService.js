const PROFILE_KEY = 'quran_play_juz30_profile_v1';
const SURAH_CACHE_PREFIX = 'quran_play_juz30_surah_v1_';

export const DEFAULT_PROFILE = {
  name: '',
  botColor: 'blue_light',
  botHat: 'peci_putih',
  coins: 0,
  sfxEnabled: true,
  sortOrder: 'desc', // 'desc' (114 -> 78, ramah pemula) | 'asc' (78 -> 114)
  surahProgress: {},
};

export const StorageService = {
  loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return { ...DEFAULT_PROFILE };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        surahProgress: parsed?.surahProgress || {},
      };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  },

  saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors gracefully
    }
  },

  resetProgress(currentProfile) {
    const next = {
      ...DEFAULT_PROFILE,
      name: currentProfile?.name || '',
      botColor: currentProfile?.botColor || DEFAULT_PROFILE.botColor,
      botHat: currentProfile?.botHat || DEFAULT_PROFILE.botHat,
      sfxEnabled: currentProfile?.sfxEnabled ?? true,
      sortOrder: currentProfile?.sortOrder || 'desc',
      coins: 0,
      surahProgress: {},
    };
    this.saveProfile(next);
    return next;
  },

  getCachedSurah(surahId) {
    try {
      const raw = localStorage.getItem(`${SURAH_CACHE_PREFIX}${surahId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveCachedSurah(surahId, payload) {
    try {
      localStorage.setItem(`${SURAH_CACHE_PREFIX}${surahId}`, JSON.stringify(payload));
    } catch {
      // Ignore quota exceeded
    }
  },

  getCachedSurahIds() {
    const ids = new Set();
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(SURAH_CACHE_PREFIX)) {
          const id = Number(key.slice(SURAH_CACHE_PREFIX.length));
          if (!Number.isNaN(id)) ids.add(id);
        }
      }
    } catch {
      // Ignore
    }
    return ids;
  },
};

export default StorageService;
