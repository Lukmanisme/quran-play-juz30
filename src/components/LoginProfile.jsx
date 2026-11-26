import React, { useState } from 'react';
import { Volume2, VolumeX, Coins, ChevronRight, Sparkles, Check } from 'lucide-react';
import SkyBackground from './SkyBackground.jsx';
import AvatarBot, { BOT_COLORS, BOT_HATS } from './AvatarBot.jsx';
import audioManager from '../services/AudioManager.js';

export default function LoginProfile({ profile, onSaveAndStart, onToggleSfx }) {
  const [name, setName] = useState(profile.name || '');
  const [botColor, setBotColor] = useState(profile.botColor || 'blue_light');
  const [botHat, setBotHat] = useState(profile.botHat || 'peci_putih');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      audioManager.playWrong();
      setError('Yuk, tulis nama panggilanmu dulu!');
      return;
    }
    audioManager.playCorrect();
    onSaveAndStart({
      ...profile,
      name: trimmed,
      botColor,
      botHat,
    });
  };

  return (
    <SkyBackground showHills>
      <div className="flex-1 flex flex-col px-4 pt-4 pb-8">
        {/* Header Bar */}
        <header className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-amber-300 shadow-sm">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-sm text-amber-700">{profile.coins || 0}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onToggleSfx();
              audioManager.playClick();
            }}
            aria-label={profile.sfxEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            className="btn-3d flex items-center gap-1.5 bg-white/95 hover:bg-white px-3 py-1.5 rounded-full border-2 border-sky-300 border-b-4 text-sky-700 font-bold text-xs shadow-sm"
          >
            {profile.sfxEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span>SFX On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>SFX Off</span>
              </>
            )}
          </button>
        </header>

        {/* App Title & Mascot */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAME HAFALAN JUZ 'AMMA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            Qur'an Play: <span className="text-emerald-600">Juz 30</span>
          </h1>
          <p className="text-xs sm:text-sm text-sky-900/75 font-semibold mt-0.5">
            Susun ayat & terjemahan sambil bermain!
          </p>
        </div>

        {/* Bot Preview Stage */}
        <div className="flex justify-center my-2">
          <div className="relative flex flex-col items-center">
            <AvatarBot colorId={botColor} hatId={botHat} size="xl" mood="happy" />
            <div className="w-24 h-3 bg-sky-900/15 rounded-full -mt-1 blur-[1px]" />
          </div>
        </div>

        {/* Customization Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-sky-200 border-b-[6px] shadow-lg p-4 space-y-4 mt-1"
        >
          {/* Nama Panggilan */}
          <div>
            <label htmlFor="player-name" className="block text-sm font-extrabold text-slate-700 mb-1.5">
              Siapa namamu?
            </label>
            <input
              id="player-name"
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Aisyah, Zaid..."
              className="w-full px-4 py-2.5 rounded-2xl bg-sky-50/70 border-2 border-sky-200 focus:border-emerald-400 focus:bg-white focus:outline-none font-bold text-slate-800 placeholder:text-slate-400 text-base transition"
            />
            {error && (
              <p className="text-xs font-bold text-rose-500 mt-1 animate-shake">{error}</p>
            )}
          </div>

          {/* Pilih Warna Bot */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Warna Bot
              </span>
              <span className="text-xs font-bold text-sky-700">
                {BOT_COLORS.find((c) => c.id === botColor)?.label}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {BOT_COLORS.map((color) => {
                const selected = botColor === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    title={color.label}
                    aria-label={`Warna ${color.label}`}
                    onClick={() => {
                      audioManager.playClick();
                      setBotColor(color.id);
                    }}
                    style={{ backgroundColor: color.body }}
                    className={`btn-3d aspect-square rounded-full flex items-center justify-center border-2 transition ${
                      selected
                        ? 'border-slate-800 scale-110 ring-2 ring-amber-300 shadow-md'
                        : 'border-white shadow-sm opacity-85 hover:opacity-100'
                    }`}
                  >
                    {selected && <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilih Topi / Aksesoris */}
          <div>
            <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Aksesoris Topi
            </span>
            <div className="grid grid-cols-3 gap-2">
              {BOT_HATS.map((hat) => {
                const selected = botHat === hat.id;
                return (
                  <button
                    key={hat.id}
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      setBotHat(hat.id);
                    }}
                    className={`btn-3d px-2 py-2 rounded-2xl border-2 border-b-4 text-xs font-extrabold transition flex flex-col items-center justify-center text-center leading-tight ${
                      selected
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    <span>{hat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Start Button */}
          <button
            type="submit"
            className="btn-3d w-full py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg border-2 border-emerald-600 border-b-[6px] shadow-md flex items-center justify-center gap-2"
          >
            <span>Mulai Juz 30</span>
            <ChevronRight className="w-6 h-6" strokeWidth={3} />
          </button>
        </form>
      </div>
    </SkyBackground>
  );
}
