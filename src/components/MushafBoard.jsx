import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff, Volume2 } from 'lucide-react';
import { toArabicIndic } from '../services/QuranService.js';
import audioManager from '../services/AudioManager.js';

export default function MushafBoard({
  surah,
  stage,
  stageIndex,
  cursor,
  ghostText,
  onToggleGhostText,
  lastHintIndex,
  recitingVerseNumber,
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
  }, [cursor, stageIndex]);

  // Hitung offset token kumulatif tiap ayat pada stage ini
  let runningIndex = 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 px-3 pt-2 pb-2">
      {/* Toolbar kecil di atas mushaf */}
      <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 truncate">
            Hal. {stage.pageNumber} • Ayat {stage.startVerse}–{stage.endVerse}
          </span>
          {recitingVerseNumber !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-200/90 px-2 py-0.5 rounded-full border border-emerald-400 shadow-sm animate-pulse shrink-0">
              <Volume2 className="w-3 h-3" />
              <span>Ayat {recitingVerseNumber}</span>
            </span>
          )}
        </div>

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

      {/* Halaman Mushaf */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-3xl border-[3px] border-emerald-700/35 bg-[#fdfaf0] shadow-inner p-2">
        <div className="mushaf-paper min-h-full rounded-2xl border border-emerald-600/30 p-3 sm:p-4">
          {/* Banner Hijau Nama Surat */}
          <div className="relative rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white px-4 py-2 mb-3 border-2 border-amber-300/70 shadow-sm flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                Surat ke-{surah.id}
              </span>
              <span className="font-black text-sm">{surah.nameSimple}</span>
            </div>
            <span
              dir="rtl"
              lang="ar"
              className="font-arabic text-2xl leading-none text-amber-100 drop-shadow-sm"
            >
              سُورَةُ {surah.nameArabic}
            </span>
          </div>

          {/* Basmalah pada bagian awal surat */}
          {stageIndex === 0 && surah.bismillahPre && (
            <div className="text-center pb-2 mb-3 border-b border-emerald-600/15">
              <p
                dir="rtl"
                lang="ar"
                className="font-arabic text-xl sm:text-2xl leading-[2.1] text-emerald-900"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* Aliran Kata-kata Ayat RTL */}
          <div
            dir="rtl"
            lang="ar"
            className="flex flex-wrap items-center justify-start gap-x-2 gap-y-3 text-right"
          >
            {stage.verses.map((verse) => {
              const verseStart = runningIndex;
              runningIndex += verse.arabicWords.length;
              const isReciting = recitingVerseNumber === verse.verseNumber;

              return (
                <React.Fragment key={verse.id}>
                  {verse.arabicWords.map((word, wIdx) => {
                    const globalIdx = verseStart + wIdx;
                    const isSolved = globalIdx < cursor;
                    const isTarget = globalIdx === cursor;
                    const wasHinted = lastHintIndex === globalIdx;

                    if (isSolved) {
                      return (
                        <span
                          key={`${verse.id}-${wIdx}`}
                          className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-xl font-arabic text-[22px] sm:text-[25px] leading-[2.15] transition-all duration-300 ${
                            isReciting
                              ? 'bg-emerald-100/90 text-emerald-950 ring-1 ring-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.28)]'
                              : wasHinted
                              ? 'bg-amber-100/90 text-amber-900 ring-1 ring-amber-300 animate-pop-in'
                              : 'text-slate-900 animate-pop-in'
                          }`}
                        >
                          {word}
                        </span>
                      );
                    }

                    if (isTarget) {
                      return (
                        <span
                          key={`${verse.id}-${wIdx}`}
                          ref={activeRef}
                          className="inline-flex items-center justify-center min-w-[58px] min-h-[44px] px-2.5 py-0.5 rounded-xl bg-amber-200/95 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-sm font-arabic text-[21px] sm:text-[24px] leading-[2.1]"
                        >
                          {ghostText ? (
                            <span className="text-amber-900/30 select-none">{word}</span>
                          ) : (
                            <span className="text-amber-700/70 font-sans text-xs font-black tracking-widest">
                              •••
                            </span>
                          )}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={`${verse.id}-${wIdx}`}
                        className="inline-flex items-center justify-center min-w-[48px] min-h-[42px] px-2 py-0.5 rounded-xl bg-emerald-900/[0.04] border border-dashed border-emerald-700/25 font-arabic text-[21px] sm:text-[24px] leading-[2.1]"
                      >
                        {ghostText ? (
                          <span className="text-slate-700/25 select-none">{word}</span>
                        ) : (
                          <span className="text-emerald-700/25 font-sans text-xs font-bold">
                            —
                          </span>
                        )}
                      </span>
                    );
                  })}

                  {/* Ornamen Nomor Ayat Bulat Hijau */}
                  <span
                    title={`Ayat ${verse.verseNumber}`}
                    className={`inline-flex items-center justify-center w-8 h-8 mx-0.5 rounded-full bg-emerald-600 text-amber-100 border-2 border-amber-300 shadow-sm font-arabic text-base leading-none shrink-0 transition-all duration-300 ${
                      isReciting ? 'ring-4 ring-emerald-300/80 scale-110' : ''
                    }`}
                  >
                    {toArabicIndic(verse.verseNumber)}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
