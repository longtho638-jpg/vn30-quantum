'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';

interface Signal {
    symbol: string;
    signal: string;
    confidence: number;
    price: number;
    change: number;
    target: number;
    stopLoss: number;
}

interface StockTableProps {
    signals: Signal[];
    onSelectSymbol: (symbol: string) => void;
    selectedSymbol: string;
}

const StockTable: FC<StockTableProps> = ({ signals, onSelectSymbol, selectedSymbol }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-liquid rounded-[1.5rem] overflow-hidden border border-white/10"
        >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    VN30 MARKET SCANNER
                </h2>
                <div className="flex gap-4 text-sm text-gray-400 font-mono">
                    <span>Vol: $45.2M</span>
                    <span>Active: 30</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-black/40 text-left">
                            {['SYMBOL', 'SIGNAL', 'PRICE', 'CHANGE', 'CONFIDENCE', 'TARGET', 'STOP LOSS'].map((head) => (
                                <th key={head} className="px-6 py-4 text-xs font-bold text-gray-500 tracking-wider">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {signals.map((signal, index) => {
                            const isPositive = signal.change >= 0;
                            const isSelected = signal.symbol === selectedSymbol;

                            return (
                                <tr
                                    key={signal.symbol}
                                    onClick={() => onSelectSymbol(signal.symbol)}
                                    className={`
                                        cursor-pointer transition-all duration-200
                                        ${isSelected ? 'bg-cyan-500/10' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
                                                {signal.symbol.slice(0, 1)}
                                            </div>
                                            <div className="font-bold font-mono text-cyan-200">{signal.symbol}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded text-xs font-bold tracking-wide border ${signal.signal.includes('BUY')
                                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                                : signal.signal.includes('SELL')
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                            }`}>
                                            {signal.signal}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-300">
                                        {signal.price.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4 font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {isPositive ? '+' : ''}{signal.change}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden w-24">
                                                <div
                                                    className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${signal.confidence > 0.8 ? 'bg-cyan-400 text-cyan-400' : 'bg-purple-400 text-purple-400'
                                                        }`}
                                                    style={{ width: `${signal.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 font-mono">{(signal.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-cyan-300">
                                        {signal.target.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-pink-300">
                                        {signal.stopLoss.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default StockTable;
