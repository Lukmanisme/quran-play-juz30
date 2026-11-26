import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  X,
  Heart,
  Coins,
  RotateCcw,
  Flame,
  Loader2,
  WifiOff,
  ChevronRight,
  BookOpenCheck,
  Languages,
} from 'lucide-react';
import QuranService, {
  buildSurahStages,
  buildWordChoices,
} from '../services/QuranService.js';
import audioManager from '../services/AudioManager.js';
import MushafBoard from './MushafBoard.jsx';
import TranslationBoard from './TranslationBoard.jsx';
import WordBank from './WordBank.jsx';
import { GameOverModal, LevelCompleteModal } from './Modals.jsx';

const MAX_LIVES = 5;
const MAX_HINTS = 3;

export default function Gameplay({
  profile,
  surah,
  hasNextSurah,
  onExit,
  onCompleteSurah,
  onNextSurah,
}) {
  const [mode, setMode] = useState('mushaf'); // 'mushaf' | 'translation'
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [surahData, setSurahData] = useState(null);

  const [stageIndex, setStageIndex] = useState(0);
  // Untuk mode 'mushaf': cursor menunjuk index kata dalam stage saat ini
  const [mushafCursor, setMushafCursor] = useState(0);
  // Untuk mode 'translation': verseIndex dalam stage + wordCursor dalam ayat tersebut
  const [trVerseIndex, setTrVerseIndex] = useState(0);
  const [trWordCursor, setTrWordCursor] = useState(0);

  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);
  const [ghostText, setGhostText] = useState(false);

  const [wrongChoiceId, setWrongChoiceId] = useState(null);
  const [lastHintIndex, setLastHintIndex] = useState(null);
  const [floatingPoints, setFloatingPoints] = useState(null);
  const [stageCleared, setStageCleared] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const resetGameState = useCallback(() => {
    setStageIndex(0);
    setMushafCursor(0);
    setTrVerseIndex(0);
    setTrWordCursor(0);
    setLives(MAX_LIVES);
    setScore(0);
    setSessionCoins(0);
    setCombo(0);
    setHintsLeft(MAX_HINTS);
    setWrongChoiceId(null);
    setLastHintIndex(null);
    setFloatingPoints(null);
    setStageCleared(false);
    setIsWin(false);
    setIsGameOver(false);
  }, []);

  const loadSurahContent = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await QuranService.fetchSurah(surah.id);
      setSurahData(data);
      resetGameState();
    } catch (err) {
      setLoadError(err?.message || 'Gagal memuat data surat.');
    } finally {
      setLoading(false);
    }
  }, [surah.id, resetGameState]);

  useEffect(() => {
    loadSurahContent();
  }, [loadSurahContent]);

  // Stages (per halaman mushaf / max 10 ayat)
  const stages = useMemo(() => {
    if (!surahData?.verses) return [];
    return buildSurahStages(surahData.verses, 10);
  }, [surahData]);

  const currentStage = stages[stageIndex] || null;

  // Pool seluruh kata di surat ini untuk distractor
  const allArabicWords = useMemo(() => {
    if (!surahData?.verses) return [];
    return surahData.verses.flatMap((v) => v.arabicWords);
  }, [surahData]);

  const allTranslationWords = useMemo(() => {
    if (!surahData?.verses) return [];
    return surahData.verses.flatMap((v) => v.translationWords);
  }, [surahData]);

  // Token stage untuk mode mushaf
  const stageArabicTokens = useMemo(() => {
    if (!currentStage) return [];
    return currentStage.verses.flatMap((v) => v.arabicWords);
  }, [currentStage]);

  // Ayat aktif untuk mode terjemahan
  const currentTrVerse = currentStage?.verses?.[trVerseIndex] || null;

  // Kata target saat ini
  const targetWord = useMemo(() => {
    if (!currentStage) return null;
    if (mode === 'mushaf') {
      return stageArabicTokens[mushafCursor] ?? null;
    }
    return currentTrVerse?.translationWords?.[trWordCursor] ?? null;
  }, [mode, currentStage, stageArabicTokens, mushafCursor, currentTrVerse, trWordCursor]);

  // 6 pilihan kata acak setiap kali targetWord / posisi berubah
  const choices = useMemo(() => {
    if (!targetWord) return [];
    const pool = mode === 'mushaf' ? allArabicWords : allTranslationWords;
    return buildWordChoices(targetWord, pool, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetWord,
    mode,
    stageIndex,
    mushafCursor,
    trVerseIndex,
    trWordCursor,
    allArabicWords,
    allTranslationWords,
  ]);

  const triggerFloatingScore = (points, currentCombo) => {
    setFloatingPoints({
      id: Date.now() + Math.random(),
      points,
      combo: currentCombo,
    });
  };

  const finishLevel = useCallback(
    (finalScore, finalLives, currentSessionCoins) => {
      const stars = finalLives >= 5 ? 3 : finalLives >= 3 ? 2 : 1;
      const bonusCoins = stars * 15 + Math.floor(finalScore / 20);
      const totalEarned = currentSessionCoins + bonusCoins;

      setIsWin(true);
      audioManager.playWin();
      onCompleteSurah({
        surahId: surah.id,
        stars,
        score: finalScore,
        earnedCoins: totalEarned,
        mode,
      });
    },
    [surah.id, mode, onCompleteSurah]
  );

  const advanceCorrectStep = useCallback(
    (isHint = false) => {
      const nextCombo = isHint ? combo : combo + 1;
      const gained = isHint
        ? 5
        : nextCombo >= 10
        ? 20
        : nextCombo >= 5
        ? 15
        : 10;
      const coinGain = isHint ? 0 : 1;

      const nextScore = score + gained;
      const nextSessionCoins = sessionCoins + coinGain;

      setScore(nextScore);
      setSessionCoins(nextSessionCoins);
      setCombo(nextCombo);
      triggerFloatingScore(gained, isHint ? 0 : nextCombo);

      if (isHint) {
        audioManager.playHint();
        setLastHintIndex(mode === 'mushaf' ? mushafCursor : trWordCursor);
      } else if (nextCombo > 0 && nextCombo % 5 === 0) {
        audioManager.playCombo(nextCombo);
        setLastHintIndex(null);
      } else {
        audioManager.playCorrect();
        setLastHintIndex(null);
      }

      if (mode === 'mushaf') {
        const nextCursor = mushafCursor + 1;
        if (nextCursor < stageArabicTokens.length) {
          setMushafCursor(nextCursor);
        } else if (stageIndex + 1 < stages.length) {
          audioManager.playStageClear();
          setMushafCursor(nextCursor);
          setStageCleared(true);
        } else {
          setMushafCursor(nextCursor);
          finishLevel(nextScore, lives, nextSessionCoins);
        }
      } else {
        const wordsLen = currentTrVerse?.translationWords?.length || 0;
        const nextWordCursor = trWordCursor + 1;
        if (nextWordCursor < wordsLen) {
          setTrWordCursor(nextWordCursor);
        } else if (trVerseIndex + 1 < (currentStage?.verses?.length || 0)) {
          setTrVerseIndex(trVerseIndex + 1);
          setTrWordCursor(0);
          setLastHintIndex(null);
        } else if (stageIndex + 1 < stages.length) {
          audioManager.playStageClear();
          setTrWordCursor(nextWordCursor);
          setStageCleared(true);
        } else {
          setTrWordCursor(nextWordCursor);
          finishLevel(nextScore, lives, nextSessionCoins);
        }
      }
    },
    [
      combo,
      score,
      sessionCoins,
      mode,
      mushafCursor,
      trWordCursor,
      stageArabicTokens.length,
      stageIndex,
      stages.length,
      currentTrVerse,
      trVerseIndex,
      currentStage,
      lives,
      finishLevel,
    ]
  );

  const handleSelectChoice = (choice) => {
    if (isWin || isGameOver || stageCleared || !targetWord) return;

    if (choice.text === targetWord) {
      advanceCorrectStep(false);
    } else {
      audioManager.playWrong();
      setCombo(0);
      setWrongChoiceId(choice.id);
      setTimeout(() => {
        setWrongChoiceId((prev) => (prev === choice.id ? null : prev));
      }, 420);

      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
        audioManager.playGameOver();
      }
    }
  };

  const handleUseHint = () => {
    if (hintsLeft <= 0 || isWin || isGameOver || stageCleared || !targetWord) return;
    setHintsLeft((h) => h - 1);
    advanceCorrectStep(true);
  };

  const handleNextStage = () => {
    audioManager.playClick();
    setStageCleared(false);
    setStageIndex((idx) => idx + 1);
    setMushafCursor(0);
    setTrVerseIndex(0);
    setTrWordCursor(0);
    setLastHintIndex(null);
  };

  const handleToggleMode = (nextMode) => {
    if (nextMode === mode) return;
    audioManager.playClick();
    setMode(nextMode);
    resetGameState();
  };

  // Hitung progres keseluruhan ayat/bagian
  const earnedStars = lives >= 5 ? 3 : lives >= 3 ? 2 : 1;
  const totalBonusPreview = earnedStars * 15 + Math.floor(score / 20) + sessionCoins;

  const progressLabel = useMemo(() => {
    if (!stages.length || !currentStage) return '';
    if (mode === 'mushaf') {
      return `Bagian ${stageIndex + 1}/${stages.length} • Hal. ${currentStage.pageNumber}`;
    }
    const verse = currentTrVerse || currentStage.verses[0];
    return `Ayat ${verse?.verseNumber}/${surahData?.verses?.length || surah.versesCount}`;
  }, [stages.length, currentStage, mode, stageIndex, currentTrVerse, surahData, surah.versesCount]);

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 flex justify-center">
      <div className="relative w-full max-w-[440px] h-[100dvh] flex flex-col overflow-hidden bg-sky-50/70 shadow-xl">
        {/* Top Header */}
        <header className="px-3 pt-3 pb-2 bg-white/95 border-b-2 border-sky-200 shadow-sm shrink-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Keluar (X) */}
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                onExit();
              }}
              aria-label="Keluar ke daftar surat"
              className="btn-3d w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 border-b-4 flex items-center justify-center text-slate-600 shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>

            {/* Nama Surat Latin & Arab + Indikator Progres */}
            <div className="text-center min-w-0 flex-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="font-black text-slate-800 text-sm sm:text-base truncate">
                  {surah.nameSimple}
                </span>
                <span dir="rtl" lang="ar" className="font-arabic text-lg text-emerald-700 leading-none">
                  {surah.nameArabic}
                </span>
              </div>
              {progressLabel && (
                <p className="text-[11px] font-extrabold text-sky-700 truncate">
                  {progressLabel}
                </p>
              )}
            </div>

            {/* Toggle Mode Permainan */}
            <div className="inline-flex bg-sky-100 p-0.5 rounded-xl border border-sky-200 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleMode('mushaf')}
                title="Mode Susun Ayat (Mushaf)"
                className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition ${
                  mode === 'mushaf'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-sky-800 hover:bg-white/60'
                }`}
              >
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span className="hidden min-[380px]:inline">Ayat</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('translation')}
                title="Mode Susun Terjemahan"
                className={`px-2 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition ${
                  mode === 'translation'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-sky-800 hover:bg-white/60'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden min-[380px]:inline">Arti</span>
              </button>
            </div>
          </div>

          {/* Status Bar: 5 Nyawa, Skor & Koin, Reset Surat */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* 5 Nyawa Hati Merah */}
            <div className="flex items-center gap-0.5" aria-label={`Nyawa tersisa ${lives}`}>
              {Array.from({ length: MAX_LIVES }, (_, idx) => {
                const alive = idx < lives;
                return (
                  <Heart
                    key={idx}
                    className={`w-5 h-5 transition-all ${
                      alive
                        ? 'text-rose-500 fill-rose-500 scale-100'
                        : 'text-slate-300 fill-slate-200 scale-90'
                    }`}
                  />
                );
              })}
            </div>

            {/* Skor & Koin */}
            <div className="relative flex items-center gap-2">
              <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="text-[11px] font-extrabold text-emerald-700">Skor</span>
                <span className="text-xs font-black text-emerald-900">{score}</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-black text-amber-800">
                  {(profile.coins || 0) + sessionCoins}
                </span>
              </div>

              {/* Floating +10 / +20 feedback */}
              {floatingPoints && (
                <span
                  key={floatingPoints.id}
                  className="pointer-events-none absolute -top-5 right-6 text-xs font-black text-emerald-600 bg-white/95 px-2 py-0.5 rounded-full shadow border border-emerald-200 animate-float-up"
                >
                  +{floatingPoints.points}
                </span>
              )}
            </div>

            {/* Tombol Reset Surat */}
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                resetGameState();
              }}
              title="Reset surat dari awal"
              className="btn-3d inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 border-b-2 text-[11px] font-extrabold text-slate-700 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </header>

        {/* Banner Fallback Parsial atau Combo Badge */}
        {(surahData?.isPartialFallback || combo >= 5) && (
          <div className="px-3 pt-1.5 flex items-center justify-between gap-2 shrink-0">
            {surahData?.isPartialFallback ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                Mode Offline (Ayat 1–10)
              </span>
            ) : (
              <span />
            )}

            {combo >= 5 && (
              <span className="inline-flex items-center gap-1 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-0.5 rounded-full shadow animate-pop-in">
                <Flame className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                Combo x{combo}! 🔥
              </span>
            )}
          </div>
        )}

        {/* Area Permainan Tengah */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
            <p className="font-black text-slate-700">Memuat Surat {surah.nameSimple}...</p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              Menyiapkan ayat per kata & terjemahan Kemenag RI
            </p>
          </div>
        ) : loadError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mb-3">
              <WifiOff className="w-7 h-7" />
            </div>
            <p className="font-black text-slate-800 mb-1">Ups, Gagal Memuat Surat</p>
            <p className="text-xs font-bold text-slate-500 mb-5 max-w-[280px]">{loadError}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadSurahContent}
                className="btn-3d px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-sm border-2 border-emerald-600 border-b-4"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={onExit}
                className="btn-3d px-4 py-2.5 rounded-2xl bg-white text-slate-700 font-extrabold text-sm border-2 border-slate-300 border-b-4"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : currentStage ? (
          <>
            {mode === 'mushaf' ? (
              <MushafBoard
                surah={surah}
                stage={currentStage}
                stageIndex={stageIndex}
                cursor={mushafCursor}
                ghostText={ghostText}
                onToggleGhostText={() => setGhostText((g) => !g)}
                lastHintIndex={lastHintIndex}
              />
            ) : (
              <TranslationBoard
                surah={surah}
                verse={currentTrVerse}
                wordCursor={trWordCursor}
                ghostText={ghostText}
                onToggleGhostText={() => setGhostText((g) => !g)}
                lastHintIndex={lastHintIndex}
              />
            )}

            {/* Stage Clear Banner vs Word Bank */}
            {stageCleared ? (
              <div className="bg-white border-t-2 border-emerald-300 rounded-t-3xl p-4 text-center shadow-lg animate-pop-in">
                <p className="text-base font-black text-emerald-700">
                  Bagian {stageIndex + 1} dari {stages.length} Selesai! 🎉
                </p>
                <p className="text-xs font-bold text-slate-500 mt-0.5 mb-3">
                  Lanjut ke halaman/bagian berikutnya (Ayat{' '}
                  {stages[stageIndex + 1].startVerse}–{stages[stageIndex + 1].endVerse})
                </p>
                <button
                  type="button"
                  onClick={handleNextStage}
                  className="btn-3d w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base border-2 border-emerald-600 border-b-[5px] flex items-center justify-center gap-1.5"
                >
                  <span>Lanjut Bagian Berikutnya</span>
                  <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            ) : (
              <WordBank
                choices={choices}
                mode={mode}
                hintsLeft={hintsLeft}
                wrongChoiceId={wrongChoiceId}
                highlightedHintId={null}
                disabled={isWin || isGameOver}
                onSelectChoice={handleSelectChoice}
                onUseHint={handleUseHint}
              />
            )}
          </>
        ) : null}

        {/* Popup Kemenangan */}
        {isWin && (
          <LevelCompleteModal
            profile={profile}
            surah={surah}
            stars={earnedStars}
            score={score}
            earnedCoins={totalBonusPreview}
            hasNextSurah={hasNextSurah}
            onNextSurah={onNextSurah}
            onReplay={resetGameState}
            onBackToList={onExit}
          />
        )}

        {/* Popup Game Over */}
        {isGameOver && (
          <GameOverModal
            profile={profile}
            surah={surah}
            onReplay={resetGameState}
            onBackToList={onExit}
          />
        )}
      </div>
    </div>
  );
}
