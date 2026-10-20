import React, { useState } from 'react';
import { Sparkles, Dices, Swords } from 'lucide-react';
import { sounds } from '../audio/soundManager';
import { generateRandomBotName } from '../game/botGenerator';

interface WelcomeNameModalProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
}

export const WelcomeNameModal: React.FC<WelcomeNameModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  const [name, setName] = useState(() => {
    return 'Brawler_' + Math.floor(100 + Math.random() * 900);
  });

  if (!isOpen) return null;

  const handleRollRandom = () => {
    sounds.playBump(0.6);
    // Pick clean gamer tag
    const randomTag = generateRandomBotName().replace(/\[.*?\]/, '').replace(/^xX_/, '').replace(/_xX$/, '');
    setName(randomTag);
  };

  const handleStart = () => {
    const finalName = name.trim() || 'Brawler_' + Math.floor(100 + Math.random() * 900);
    sounds.playVictory?.();
    onConfirm(finalName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#29b6f6] via-[#0288d1] to-[#01579b] border-4 border-[#81d4fa] rounded-[36px] pt-14 px-6 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.4)] text-center animate-in zoom-in-95 duration-150">
        
        {/* Top Glossy Ribbon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#d97706] border-2 border-[#fef08a] px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
          <span className="text-sm sm:text-base font-black tracking-widest text-[#78350f] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 fill-amber-700" />
            WELCOME BRAWLER!
          </span>
        </div>

        {/* Brawler Icon */}
        <div className="relative w-24 h-24 mx-auto mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white flex items-center justify-center text-4xl shadow-xl">
            🥊
          </div>
        </div>

        <h2 className="text-lg font-black text-white drop-shadow mb-1">
          CHOOSE YOUR NAME
        </h2>
        <p className="text-xs text-sky-200 font-semibold mb-4">
          Enter your gamer tag for matchmaking & leaderboards!
        </p>

        {/* Input with Dice button */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            placeholder="e.g. ShadowStriker"
            className="flex-1 bg-[#013f6b] text-white placeholder-sky-300/40 font-black text-center text-base py-3 px-3 rounded-2xl border-2 border-sky-300/50 focus:border-amber-400 focus:outline-none shadow-inner"
          />
          <button
            onClick={handleRollRandom}
            className="px-3.5 bg-white/15 hover:bg-white/25 border-2 border-white/30 text-yellow-300 rounded-2xl flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow"
            title="Randomize Name"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-gradient-to-b from-[#a3e635] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] hover:to-[#65a30d] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_5px_0_#365314,0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-[0_1px_0_#365314] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Swords className="w-4 h-4 stroke-[2.5]" />
          <span>LET'S BRAWL!</span>
        </button>
      </div>
    </div>
  );
};
