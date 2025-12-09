'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import MarketOverview from '@/components/MarketOverview';
import SignalCard from '@/components/SignalCard';
import StockTable from '@/components/StockTable';
import TradingChart from '@/components/TradingChart';
import { motion } from 'framer-motion';

const SceneContainer = dynamic(() => import('@/components/Three/SceneContainer'), { ssr: false });
const AuroraBackground = dynamic(() => import('@/components/Three/AuroraBackground'), { ssr: false });

// ... (sampleData and marketStats same as before for brevity)
const sampleSignals = [
  { symbol: 'HPG', signal: 'BUY', confidence: 0.85, price: 25000, change: 2.5, target: 27500, stopLoss: 24000 },
  { symbol: 'VNM', signal: 'STRONG_BUY', confidence: 0.92, price: 78000, change: 3.2, target: 85000, stopLoss: 75000 },
  { symbol: 'FPT', signal: 'HOLD', confidence: 0.65, price: 125000, change: -0.5, target: 130000, stopLoss: 120000 },
  { symbol: 'TCB', signal: 'SELL', confidence: 0.78, price: 32000, change: -2.1, target: 29000, stopLoss: 33500 },
  { symbol: 'VCB', signal: 'BUY', confidence: 0.72, price: 95000, change: 1.8, target: 102000, stopLoss: 92000 },
];
const marketStats = { buyCount: 12, sellCount: 8, holdCount: 10, sentiment: 'BULLISH' };

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('HPG');

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || !currentTime) return null;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden">

      {/* 🌌 DASHBOARD AURORA (Subtle) */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <Suspense fallback={null}>
          <SceneContainer className="w-full h-full">
            <AuroraBackground />
          </SceneContainer>
        </Suspense>
      </div>

      <Header currentTime={currentTime} isConnected={true} />

      <main className="relative z-10 container mx-auto px-4 py-8">

        {/* Market Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <MarketOverview stats={marketStats} />
        </motion.section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* 📈 Holographic Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-liquid rounded-[1.5rem] p-6 h-[600px] flex flex-col relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 rounded-[1.5rem] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                {selectedSymbol} / VND
              </h2>
              <div className="flex gap-2">
                {['HPG', 'VNM', 'FPT', 'TCB'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => setSelectedSymbol(sym)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-mono transition-all border ${selectedSymbol === sym
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 hover:bg-white/5 text-gray-400'
                      }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full bg-black/20 rounded-xl overflow-hidden border border-white/5">
              <TradingChart symbol={selectedSymbol} />
            </div>
          </motion.div>

          {/* 🎯 Signals Feed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                LIVE SIGNALS
              </h2>
              <div className="text-xs text-green-400 font-mono animate-pulse">● RECIEVING</div>
            </div>

            <div className="glass-liquid rounded-2xl p-4 h-[600px] overflow-y-auto no-scrollbar space-y-3">
              {sampleSignals.map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  onClick={() => setSelectedSymbol(signal.symbol)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSymbol === signal.symbol
                    ? 'bg-white/10 border-cyan-500/50'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{signal.symbol}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded bg-black/40 ${signal.signal.includes('BUY') ? 'text-green-400' : signal.signal.includes('SELL') ? 'text-red-400' : 'text-yellow-400'}`}>
                      {signal.signal}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-mono">
                    <span>Conf: {(signal.confidence * 100).toFixed(0)}%</span>
                    <span className={signal.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {signal.change > 0 && '+'}{signal.change}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 📊 Universal Table */}
        <section>
          <StockTable
            signals={sampleSignals}
            onSelectSymbol={setSelectedSymbol}
            selectedSymbol={selectedSymbol}
          />
        </section>

      </main>
    </div>
  );
}
