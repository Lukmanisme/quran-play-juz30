import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { toArabicIndic } from '../services/QuranService.js';
import audioManager from '../services/AudioManager.js';

export default function TranslationBoard({
  surah,
  verse,
  wordCursor,
  ghostText,
  onToggleGhostText,
  lastHintIndex,
}) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [wordCursor, verse?.id]);

  if (!verse) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 pt-2 pb-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
          <BookOpen className="w-3 h-3" />
          <span>
            {surah.nameSimple} • Ayat {verse.verseNumber}
          </span>
        </span>

        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            onToggleGhostText();
          }}
          className={`btn-3d inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border-2 border-b-4 transition ${
            ghostText
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          {ghostText ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Ghost Text {ghostText ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Konten Utama: Ayat Arab Utuh + Slot Terjemahan */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5">
        {/* Kartu Ayat Arab Utuh */}
        <div className="rounded-3xl bg-[#fdfaf0] border-2 border-emerald-600/35 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold text-emerald-700">
              Hal. {verse.pageNumber}
            </span>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-600 text-amber-100 font-arabic text-sm">
              آية {toArabicIndic(verse.verseNumber)}
            </span>
          </div>
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-2xl sm:text-[28px] leading-[2.25] text-slate-900 text-center"
          >
            {verse.arabicFull}
          </p>
        </div>

        {/* Kartu Slot Susun Terjemahan */}
        <div className="rounded-3xl bg-white border-2 border-sky-200 p-3.5 shadow-sm">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Susun Terjemahan Bahasa Indonesia:
          </p>
          <div className="flex flex-wrap gap-2">
            {verse.translationWords.map((word, idx) => {
              const isSolved = idx < wordCursor;
              const isTarget = idx === wordCursor;
              const wasHinted = lastHintIndex === idx;

              if (isSolved) {
                return (
                  <span
                    key={`${verse.id}-tr-${idx}`}
                    className={`inline-flex items-center px-3 py-1.5 rounded-xl font-extrabold text-sm border-2 animate-pop-in ${
                      wasHinted
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    {word}
                  </span>
                );
              }

              if (isTarget) {
                return (
                  <span
                    key={`${verse.id}-tr-${idx}`}
                    ref={activeRef}
                    className="inline-flex items-center justify-center min-w-[68px] px-3 py-1.5 rounded-xl bg-amber-200 border-2 border-amber-400 ring-2 ring-amber-300/70 font-extrabold text-sm"
                  >
                    {ghostText ? (
                      <span className="text-amber-900/35 select-none">{word}</span>
                    ) : (
                      <span className="text-amber-700/80 tracking-widest">•••</span>
                    )}
                  </span>
                );
              }

              return (
                <span
                  key={`${verse.id}-tr-${idx}`}
                  className="inline-flex items-center justify-center min-w-[54px] px-3 py-1.5 rounded-xl bg-slate-100 border border-dashed border-slate-300 font-bold text-sm"
                >
                  {ghostText ? (
                    <span className="text-slate-400/50 select-none">{word}</span>
                  ) : (
                    <span className="text-slate-300">___</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
