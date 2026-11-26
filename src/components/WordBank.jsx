import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function WordBank({
  choices,
  mode,
  hintsLeft,
  wrongChoiceId,
  highlightedHintId,
  disabled,
  onSelectChoice,
  onUseHint,
}) {
  const isArabic = mode === 'mushaf';

  return (
    <section className="bg-white/95 backdrop-blur-md border-t-2 border-sky-200 rounded-t-3xl px-3.5 pt-3 pb-4 shadow-[0_-6px_20px_rgba(14,165,233,0.12)]">
      {/* Header Label + Hint Button */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
          Ketuk kata berikutnya
        </span>

        <button
          type="button"
          disabled={disabled || hintsLeft <= 0}
          onClick={onUseHint}
          className={`btn-3d inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-b-4 text-xs font-black transition ${
            hintsLeft > 0 && !disabled
              ? 'bg-amber-300 hover:bg-amber-200 border-amber-500 text-amber-950 shadow-sm'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Hint ({hintsLeft})</span>
        </button>
      </div>

      {/* 6 Pilihan Kata Acak */}
      <div className="grid grid-cols-2 gap-2">
        {choices.map((choice) => {
          const isWrong = wrongChoiceId === choice.id;
          const isHinted = highlightedHintId === choice.id;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectChoice(choice)}
              dir={isArabic ? 'rtl' : 'ltr'}
              lang={isArabic ? 'ar' : 'id'}
              className={`btn-3d min-h-[54px] px-3 py-1.5 rounded-2xl border-2 border-b-[5px] flex items-center justify-center text-center transition ${
                isWrong
                  ? 'bg-rose-100 border-rose-500 text-rose-700 animate-shake'
                  : isHinted
                  ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                  : 'bg-sky-50 hover:bg-white border-sky-300 text-slate-800 shadow-sm'
              }`}
            >
              <span
                className={
                  isArabic
                    ? 'font-arabic text-[22px] sm:text-[24px] leading-[1.9] select-none'
                    : 'font-extrabold text-sm leading-snug select-none break-words'
                }
              >
                {choice.text}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
