import React, { useState } from 'react';
import { X, Users, Copy, Check, ArrowRight } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface TeamCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: () => void;
}

export const TeamCodeModal: React.FC<TeamCodeModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
}) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playBump(0.6);
    navigator.clipboard?.writeText?.(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length < 4) return;
    sounds.playBump(0.8);
    setIsConnecting(true);

    setTimeout(() => {
      setIsConnecting(false);
      onClose();
      onStartMatch();
    }, 1200);
  };

  const handleHostStart = () => {
    sounds.playBump(0.8);
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onClose();
      onStartMatch();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-4 border-cyan-400 rounded-[36px] pt-14 pb-6 px-4 sm:px-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.2)] text-center animate-in zoom-in-95 duration-150">
        {/* Top 3D Ribbon Banner */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] border-2 border-sky-200 px-8 py-1.5 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5)] whitespace-nowrap">
          <span className="text-base sm:text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            TEAM CODE 1v1
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playBump(0.6);
            onClose();
          }}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-400 border-2 border-white flex items-center justify-center text-white transition-all cursor-pointer active:scale-90 shadow-lg shadow-rose-950/50"
          title="Close"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Create Room vs Join Room Toggle */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setMode('create');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'create'
                ? 'bg-gradient-to-b from-[#38bdf8] to-[#0284c7] text-white shadow-md border border-sky-200'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            CREATE ROOM
          </button>
          <button
            onClick={() => {
              sounds.playBump(0.4);
              setMode('join');
            }}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'join'
                ? 'bg-gradient-to-b from-[#84cc16] to-[#4d7c0f] text-white shadow-md border border-[#bef264]'
                : 'text-sky-200 hover:text-white'
            }`}
          >
            JOIN ROOM
          </button>
        </div>

        {mode === 'create' ? (
          <div>
            <div className="text-xs text-sky-200 font-semibold mb-2">
              Share this 4-digit code with your friend:
            </div>

            {/* Generated Code Display */}
            <div className="bg-black/60 border-2 border-cyan-400/50 rounded-2xl py-4 px-3 mb-3 flex items-center justify-center gap-3">
              <span className="text-4xl font-black font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                {roomCode}
              </span>
              <button
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 flex items-center justify-center text-cyan-300 transition-all cursor-pointer active:scale-95"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-medium mb-4">
              {copied ? '✓ Code copied to clipboard!' : 'Waiting for opponent to connect...'}
            </div>

            <button
              onClick={handleHostStart}
              disabled={isConnecting}
              className="w-full py-3.5 bg-gradient-to-b from-[#84cc16] via-[#65a30d] to-[#4d7c0f] hover:from-[#bef264] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-lime-200 shadow-[0_4px_0_#365314,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#365314] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isConnecting ? 'CONNECTING...' : 'START PRIVATE 1v1'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin}>
            <div className="text-xs text-sky-200 font-semibold mb-2">
              Enter your friend's 4-digit room code:
            </div>

            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="e.g. 4921"
              className="w-full bg-black/60 border-2 border-sky-400/50 rounded-2xl py-3 px-4 mb-4 text-center text-2xl font-black font-mono tracking-widest text-sky-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-300 shadow-inner"
            />

            <button
              type="submit"
              disabled={inputCode.trim().length < 4 || isConnecting}
              className="w-full py-3.5 bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] hover:from-[#7dd3fc] text-white font-black text-sm uppercase tracking-wider rounded-2xl border-2 border-sky-200 shadow-[0_4px_0_#075985,0_6px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_2px_0_#075985] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isConnecting ? 'ENTERING ARENA...' : 'ENTER ARENA'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
