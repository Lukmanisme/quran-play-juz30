import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Coins,
  RotateCcw,
  Star,
  Volume2,
  VolumeX,
  WifiOff,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import SkyBackground from './SkyBackground.jsx';
import AvatarBot from './AvatarBot.jsx';
import { JUZ_30_SURAHS } from '../data/juz30Meta.js';
import { FALLBACK_SURAHS } from '../data/fallbackSurahs.js';
import { StorageService } from '../services/StorageService.js';
import audioManager from '../services/AudioManager.js';
import { ConfirmResetModal } from './Modals.jsx';

export default function SurahList({
  profile,
  onSelectSurah,
  onEditProfile,
  onToggleSfx,
  onToggleSortOrder,
  onResetProgress,
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const cachedIds = useMemo(() => StorageService.getCachedSurahIds(), [profile]);

  const sortedSurahs = useMemo(() => {
    const list = [...JUZ_30_SURAHS];
    if (profile.sortOrder === 'desc') {
      return list.sort((a, b) => b.id - a.id);
    }
    return list.sort((a, b) => a.id - b.id);
  }, [profile.sortOrder]);

  const completedCount = useMemo(() => {
    return JUZ_30_SURAHS.filter((s) => (profile.surahProgress?.[s.id]?.stars || 0) > 0).length;
  }, [profile.surahProgress]);

  const totalStars = useMemo(() => {
    return JUZ_30_SURAHS.reduce(
      (sum, s) => sum + (profile.surahProgress?.[s.id]?.stars || 0),
      0
    );
  }, [profile.surahProgress]);

  const progressPct = Math.round((completedCount / JUZ_30_SURAHS.length) * 100);

  return (
    <SkyBackground showHills>
      <div className="flex-1 flex flex-col pb-8">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 px-4 pt-3 pb-3 bg-sky-200/90 backdrop-blur-md border-b border-sky-300/60">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {/* Avatar Mini & Nama */}
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                onEditProfile();
              }}
              className="btn-3d flex items-center gap-2 bg-white/95 pl-1.5 pr-3 py-1 rounded-2xl border-2 border-sky-300 border-b-4 shadow-sm min-w-0"
              title="Ubah Profil & Avatar"
            >
              <AvatarBot
                colorId={profile.botColor}
                hatId={profile.botHat}
                size="xs"
                animate={false}
              />
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm text-slate-800 truncate max-w-[115px]">
                    {profile.name || 'Sahabat'}
                  </span>
                  <Pencil className="w-3 h-3 text-sky-500 shrink-0" />
                </div>
                <span className="block text-[10px] font-bold text-amber-600">
                  ★ {totalStars}/{JUZ_30_SURAHS.length * 3} Bintang
                </span>
              </div>
            </button>

            {/* Coins + SFX */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="inline-flex items-center gap-1 bg-white/95 px-2.5 py-1.5 rounded-2xl border-2 border-amber-300 border-b-4 shadow-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-black text-sm text-amber-700">{profile.coins || 0}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onToggleSfx();
                  audioManager.playClick();
                }}
                aria-label={profile.sfxEnabled ? 'Matikan suara' : 'Nyalakan suara'}
                className="btn-3d p-2 rounded-2xl bg-white/95 border-2 border-sky-300 border-b-4 text-slate-700 shadow-sm"
              >
                {profile.sfxEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar Juz 30 */}
          <div className="bg-white/90 rounded-2xl p-2.5 border-2 border-sky-200 shadow-sm">
            <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
              <span className="text-slate-700">Progres Juz 30</span>
              <span className="text-emerald-600">
                {completedCount}/37 Surat Selesai
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPct, completedCount > 0 ? 5 : 0)}%` }}
              />
            </div>
          </div>
        </header>

        {/* Sort Controls */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
          <h2 className="text-base font-black text-slate-800">Daftar 37 Surat</h2>
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onToggleSortOrder();
            }}
            className="btn-3d inline-flex items-center gap-1.5 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-xl border-2 border-sky-300 border-b-4 text-xs font-extrabold text-sky-800 shadow-sm"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {profile.sortOrder === 'desc' ? 'An-Nas → An-Naba' : 'An-Naba → An-Nas'}
            </span>
          </button>
        </div>

        {/* 37 Surah Cards */}
        <main className="px-4 space-y-2.5 flex-1">
          {sortedSurahs.map((surah) => {
            const prog = profile.surahProgress?.[surah.id];
            const stars = prog?.stars || 0;
            const isCached = cachedIds.has(surah.id);
            const hasFallback = Boolean(FALLBACK_SURAHS[String(surah.id)]);

            return (
              <button
                key={surah.id}
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onSelectSurah(surah);
                }}
                className={`btn-3d w-full text-left rounded-2xl p-3 border-2 border-b-[5px] shadow-sm transition flex items-center justify-between gap-3 ${
                  stars > 0
                    ? 'bg-emerald-50/95 border-emerald-300 hover:bg-white'
                    : 'bg-white/95 border-sky-200 hover:border-sky-300 hover:bg-white'
                }`}
              >
                {/* Left: Surah Number + Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2 ${
                      stars > 0
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}
                  >
                    {surah.id}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 text-base truncate">
                        {surah.nameSimple}
                      </span>
                      {isCached ? (
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                          title="Tersimpan offline"
                        />
                      ) : hasFallback ? (
                        <WifiOff
                          className="w-3 h-3 text-sky-400 shrink-0"
                          title="Tersedia fallback offline"
                        />
                      ) : null}
                    </div>
                    <p className="text-xs font-bold text-slate-500 truncate">
                      {surah.meaningId} • {surah.versesCount} Ayat
                    </p>
                  </div>
                </div>

                {/* Right: Arabic Name + Stars */}
                <div className="flex flex-col items-end shrink-0">
                  <span
                    dir="rtl"
                    lang="ar"
                    className="font-arabic text-xl leading-relaxed text-emerald-800"
                  >
                    {surah.nameArabic}
                  </span>
                  <div className="flex items-center gap-0.5 -mt-1">
                    {[1, 2, 3].map((idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Reset Progress Button at Bottom */}
          <div className="pt-4 pb-6 flex justify-center">
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                setShowResetConfirm(true);
              }}
              className="btn-3d inline-flex items-center gap-2 bg-white/95 hover:bg-rose-50 text-rose-600 font-extrabold text-sm px-5 py-2.5 rounded-2xl border-2 border-rose-300 border-b-4 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Progres</span>
            </button>
          </div>
        </main>
      </div>

      {showResetConfirm && (
        <ConfirmResetModal
          onCancel={() => {
            audioManager.playClick();
            setShowResetConfirm(false);
          }}
          onConfirm={() => {
            audioManager.playWrong();
            setShowResetConfirm(false);
            onResetProgress();
          }}
        />
      )}
    </SkyBackground>
  );
}
