import React, { useMemo } from 'react';
import {
  Star,
  Coins,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  AlertTriangle,
  HeartCrack,
  Trophy,
} from 'lucide-react';
import AvatarBot from './AvatarBot.jsx';
import audioManager from '../services/AudioManager.js';

const CONFETTI_COLORS = [
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#f472b6',
  '#fb923c',
  '#a855f7',
];

export function LevelCompleteModal({
  profile,
  surah,
  stars,
  score,
  earnedCoins,
  hasNextSurah,
  onNextSurah,
  onReplay,
  onBackToList,
}) {
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 3.7) % 100}%`,
        delay: `${(i % 7) * 0.22}s`,
        duration: `${1.9 + (i % 4) * 0.35}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: i % 2 === 0 ? 'w-2.5 h-2.5 rounded-sm' : 'w-2 h-3.5 rounded-full',
      })),
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      {/* Confetti Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
            }}
            className={`absolute -top-4 ${piece.size} animate-confetti`}
          />
        ))}
      </div>

      {/* Modal Card */}
      <div className="relative w-full max-w-[380px] bg-white rounded-3xl border-2 border-emerald-300 border-b-[8px] shadow-2xl p-5 text-center animate-pop-in">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-300 mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>SURAT SELESAI!</span>
        </div>

        <div className="flex justify-center my-1">
          <AvatarBot
            colorId={profile.botColor}
            hatId={profile.botHat}
            size="lg"
            mood="celebrate"
          />
        </div>

        <h2 className="text-2xl font-black text-slate-800 mt-1">
          Hebat, {profile.name || 'Sahabat'}!
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-0.5">
          Surat {surah.nameSimple} ({surah.nameArabic}) tuntas disusun
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((idx) => {
            const active = idx <= stars;
            return (
              <Star
                key={idx}
                className={`w-11 h-11 transition-transform ${
                  active
                    ? 'text-amber-400 fill-amber-400 drop-shadow scale-110'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Score & Bonus Coins */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-2.5">
            <span className="block text-[11px] font-extrabold text-sky-700 uppercase">
              Total Skor
            </span>
            <span className="text-xl font-black text-slate-800">{score}</span>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-2.5">
            <span className="block text-[11px] font-extrabold text-amber-700 uppercase">
              Bonus Koin
            </span>
            <span className="inline-flex items-center justify-center gap-1 text-xl font-black text-amber-700">
              <Coins className="w-5 h-5 text-amber-500" />+{earnedCoins}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          {hasNextSurah && (
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                onNextSurah();
              }}
              className="btn-3d w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base border-2 border-emerald-600 border-b-[5px] flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Surat Berikutnya</span>
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                onReplay();
              }}
              className="btn-3d py-2.5 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-sm border-2 border-sky-300 border-b-4 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                onBackToList();
              }}
              className="btn-3d py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-2 border-slate-300 border-b-4 flex items-center justify-center gap-1.5"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Daftar Surat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameOverModal({ profile, surah, onReplay, onBackToList }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[360px] bg-white rounded-3xl border-2 border-rose-300 border-b-[8px] shadow-2xl p-5 text-center animate-pop-in">
        <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 text-xs font-black px-3 py-1 rounded-full border border-rose-200 mb-2">
          <HeartCrack className="w-4 h-4" />
          <span>NYAWA HABIS!</span>
        </div>

        <div className="flex justify-center my-1">
          <AvatarBot
            colorId={profile.botColor}
            hatId={profile.botHat}
            size="lg"
            mood="sad"
            animate={false}
          />
        </div>

        <h2 className="text-xl font-black text-slate-800 mt-1">
          Jangan Menyerah, {profile.name || 'Sahabat'}!
        </h2>
        <p className="text-xs font-bold text-slate-500 mt-1 mb-5">
          Nyawamu habis di surat <span className="text-slate-700">{surah.nameSimple}</span>. Yuk coba lagi, kamu pasti bisa!
        </p>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onReplay();
            }}
            className="btn-3d w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base border-2 border-emerald-600 border-b-[5px] flex items-center justify-center gap-2 shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Ulangi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onBackToList();
            }}
            className="btn-3d w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-2 border-slate-300 border-b-4 flex items-center justify-center gap-1.5"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Daftar Surat</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmResetModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[350px] bg-white rounded-3xl border-2 border-rose-200 border-b-[6px] shadow-2xl p-5 text-center animate-pop-in">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">Reset Semua Progres?</h3>
        <p className="text-xs font-bold text-slate-500 mt-1 mb-5 leading-relaxed">
          Semua bintang surat dan koin yang sudah dikumpulkan akan dikembalikan ke 0. Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="btn-3d py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-2 border-slate-300 border-b-4"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-3d py-2.5 px-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-2 border-rose-600 border-b-4"
          >
            Ya, Reset
          </button>
        </div>
      </div>
    </div>
  );
}
