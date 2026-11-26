import { FALLBACK_SURAHS } from '../data/fallbackSurahs.js';
import { StorageService } from './StorageService.js';

const API_BASE = 'https://api.quran.com/api/v4/verses/by_chapter';
const ARABIC_LETTER_REGEX = /[\u0621-\u064A\u0671-\u06D3]/;
const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

// Pool kata umum Juz 30 (hanya dipakai jika surat sangat pendek punya < 6 kata unik)
const EXTRA_ARABIC_DISTRACTORS = [
  'ٱللَّهُ',
  'رَبِّ',
  'ٱلنَّاسِ',
  'يَوْمَ',
  'ٱلْحَقِّ',
  'عَلَىٰ',
  'مِنْ',
  'فِى',
  'إِنَّ',
  'قُلْ',
  'هُوَ',
  'وَمَا',
];

const EXTRA_ID_DISTRACTORS = [
  'Allah',
  'Tuhan',
  'manusia',
  'pada',
  'yang',
  'dari',
  'sesungguhnya',
  'dengan',
  'dan',
  'mereka',
  'hari',
  'kebenaran',
];

export function toArabicIndic(num) {
  return String(num)
    .split('')
    .map((ch) => ARABIC_INDIC_DIGITS[Number(ch)] ?? ch)
    .join('');
}

export function cleanTranslationText(rawHtml = '') {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ekstrak token kata Arab secara bersih tanpa memotong harakat/tashkil atau simbol waqaf.
 * Token tanda waqaf yang berdiri sendiri digabung ke kata sebelumnya agar tidak jadi slot terpisah.
 */
function extractArabicWords(rawWords = []) {
  const words = [];
  const wordAudios = [];
  for (const w of rawWords) {
    if (w.char_type_name !== 'word') continue;
    const text = (w.text_uthmani || w.text || '').trim();
    if (!text) continue;

    if (!ARABIC_LETTER_REGEX.test(text) && words.length > 0) {
      words[words.length - 1] = `${words[words.length - 1]} ${text}`;
    } else {
      words.push(text);
      wordAudios.push(w.audio_url || null);
    }
  }
  return { words, wordAudios };
}

function extractTranslationWords(translationText) {
  if (!translationText) return [];
  return translationText
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function normalizeVerses(rawVerses = []) {
  return rawVerses.map((v) => {
    const rawTr = v.translations?.[0]?.text || '';
    const translation = cleanTranslationText(rawTr);
    const { words: arabicWords, wordAudios: arabicWordAudios } = extractArabicWords(v.words || []);
    const translationWords = extractTranslationWords(translation);

    return {
      id: v.id,
      verseNumber: v.verse_number,
      verseKey: v.verse_key,
      pageNumber: v.page_number,
      arabicFull: arabicWords.join(' '),
      arabicWords,
      arabicWordAudios,
      translation,
      translationWords,
    };
  });
}

/**
 * Bagi surat panjang menjadi beberapa stage/bagian berdasarkan halaman mushaf
 * dengan batas maksimal 10 ayat per stage agar nyaman di layar mobile 9:16.
 */
export function buildSurahStages(verses = [], maxVersesPerStage = 10) {
  if (!verses.length) return [];

  // Kelompokkan per halaman mushaf terlebih dahulu
  const pageGroups = [];
  for (const verse of verses) {
    const last = pageGroups[pageGroups.length - 1];
    if (!last || last.pageNumber !== verse.pageNumber) {
      pageGroups.push({ pageNumber: verse.pageNumber, verses: [verse] });
    } else {
      last.verses.push(verse);
    }
  }

  // Pecah halaman yang memiliki > maxVersesPerStage ayat menjadi chunk max 10 ayat
  const stages = [];
  for (const group of pageGroups) {
    for (let i = 0; i < group.verses.length; i += maxVersesPerStage) {
      const slice = group.verses.slice(i, i + maxVersesPerStage);
      stages.push({
        stageNumber: stages.length + 1,
        pageNumber: group.pageNumber,
        startVerse: slice[0].verseNumber,
        endVerse: slice[slice.length - 1].verseNumber,
        verses: slice,
      });
    }
  }
  return stages;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Hasilkan 6 tombol kata acak: 1 kata benar + 5 kata pengecoh dari surat yang sama.
 */
export function buildWordChoices(targetWord, allSurahWords = [], mode = 'mushaf') {
  const seen = new Set([targetWord]);
  const uniquePool = [];

  for (const word of allSurahWords) {
    if (!seen.has(word)) {
      seen.add(word);
      uniquePool.push(word);
    }
  }

  const distractors = shuffleArray(uniquePool).slice(0, 5);

  if (distractors.length < 5) {
    const extraPool = mode === 'mushaf' ? EXTRA_ARABIC_DISTRACTORS : EXTRA_ID_DISTRACTORS;
    for (const extra of shuffleArray(extraPool)) {
      if (distractors.length >= 5) break;
      if (!seen.has(extra)) {
        seen.add(extra);
        distractors.push(extra);
      }
    }
  }

  const choices = [
    { id: `target-${targetWord}`, text: targetWord, isTarget: true },
    ...distractors.map((text, idx) => ({
      id: `dist-${idx}-${text}`,
      text,
      isTarget: false,
    })),
  ];

  return shuffleArray(choices);
}

export const QuranService = {
  async fetchSurah(surahId) {
    const cached = StorageService.getCachedSurah(surahId);
    if (cached && Array.isArray(cached.verses) && cached.verses.length > 0 && !cached.isPartialFallback) {
      return { ...cached, source: 'cache' };
    }

    try {
      let page = 1;
      let nextPage = 1;
      const allRawVerses = [];

      while (nextPage !== null) {
        const url = `${API_BASE}/${surahId}?words=true&translations=33&word_fields=text_uthmani,audio_url&per_page=50&page=${page}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data?.verses)) {
          allRawVerses.push(...data.verses);
        }
        nextPage = data?.pagination?.next_page ?? null;
        page = nextPage || page + 1;
      }

      if (allRawVerses.length === 0) {
        throw new Error('Empty verses response');
      }

      const normalized = {
        surahId,
        isPartialFallback: false,
        verses: normalizeVerses(allRawVerses),
        fetchedAt: Date.now(),
      };
      StorageService.saveCachedSurah(surahId, normalized);
      return { ...normalized, source: 'api' };
    } catch (err) {
      // Cek cache lama jika ada (meski partial), atau gunakan data fallback lokal
      if (cached && Array.isArray(cached.verses) && cached.verses.length > 0) {
        return { ...cached, source: 'cache' };
      }

      const fallback = FALLBACK_SURAHS[String(surahId)];
      if (fallback) {
        return {
          surahId,
          isPartialFallback: Boolean(fallback.isPartialFallback),
          verses: normalizeVerses(fallback.verses),
          source: 'fallback',
        };
      }

      throw new Error(
        `Tidak dapat memuat Surat ${surahId}. Periksa koneksi internetmu untuk mengunduh surat ini pertama kali.`
      );
    }
  },
};

export default QuranService;
