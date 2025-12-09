'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MarketOverview from '@/components/MarketOverview';
import SignalCard from '@/components/SignalCard';
import StockTable from '@/components/StockTable';
import TradingChart from '@/components/TradingChart';

// Sample data
const sampleSignals = [
  { symbol: 'HPG', signal: 'BUY', confidence: 0.85, price: 25000, change: 2.5, target: 27500, stopLoss: 24000 },
  { symbol: 'VNM', signal: 'STRONG_BUY', confidence: 0.92, price: 78000, change: 3.2, target: 85000, stopLoss: 75000 },
  { symbol: 'FPT', signal: 'HOLD', confidence: 0.65, price: 125000, change: -0.5, target: 130000, stopLoss: 120000 },
  { symbol: 'TCB', signal: 'SELL', confidence: 0.78, price: 32000, change: -2.1, target: 29000, stopLoss: 33500 },
  { symbol: 'VCB', signal: 'BUY', confidence: 0.72, price: 95000, change: 1.8, target: 102000, stopLoss: 92000 },
];

const marketStats = {
  buyCount: 12,
  sellCount: 8,
  holdCount: 10,
  sentiment: 'BULLISH'
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('HPG');
  const isConnected = true;

  useEffect(() => {
    // Set mounted flag immediately
    const mountedNow = true;
    if (mountedNow) {
      setMounted(true);
      setCurrentTime(new Date());
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show loading during SSR
  if (!mounted || !currentTime) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚛</div>
          <div className="text-xl text-gray-400">Loading VN30-Quantum...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <Header currentTime={currentTime} isConnected={isConnected} />

      <main className="container mx-auto px-4 py-6">
        {/* Market Overview */}
        <section className="mb-8">
          <MarketOverview stats={marketStats} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  📈 {selectedSymbol} Chart
                </h2>
                <div className="flex gap-2">
                  {['HPG', 'VNM', 'FPT', 'TCB', 'VCB'].map(sym => (
                    <button
                      key={sym}
                      onClick={() => setSelectedSymbol(sym)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${selectedSymbol === sym
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700/50 hover:bg-gray-600/50'
                        }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
              <TradingChart symbol={selectedSymbol} />
            </div>
          </div>

          {/* Top Signals */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🎯 Top Signals
              <span className="text-sm font-normal text-gray-400">Real-time</span>
            </h2>
            {sampleSignals.slice(0, 4).map(signal => (
              <SignalCard
                key={signal.symbol}
                {...signal}
                onClick={() => setSelectedSymbol(signal.symbol)}
                isSelected={selectedSymbol === signal.symbol}
              />
            ))}
          </div>
        </div>

        {/* Stock Table */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">📊 VN30 Overview</h2>
          <StockTable
            signals={sampleSignals}
            onSelectSymbol={setSelectedSymbol}
            selectedSymbol={selectedSymbol}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        VN30-Quantum Dashboard v2.0 | Powered by Gemini AI
      </footer>
    </div>
  );
}
