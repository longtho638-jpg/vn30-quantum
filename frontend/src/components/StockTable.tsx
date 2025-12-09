'use client';

import { FC } from 'react';

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
    const getSignalBadge = (signal: string) => {
        if (signal.includes('BUY')) return 'signal-buy';
        if (signal.includes('SELL')) return 'signal-sell';
        return 'signal-hold';
    };

    const formatSignal = (s: string) => {
        if (s === 'STRONG_BUY') return 'MUA MẠNH';
        if (s === 'BUY') return 'MUA';
        if (s === 'STRONG_SELL') return 'BÁN MẠNH';
        if (s === 'SELL') return 'BÁN';
        return 'GIỮ';
    };

    return (
        <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-800/50">
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Mã CK
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tín hiệu
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Giá
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Thay đổi
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Độ tin cậy
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Target
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Stop Loss
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {signals.map((signal, index) => {
                            const isPositive = signal.change >= 0;
                            const isSelected = signal.symbol === selectedSymbol;

                            return (
                                <tr
                                    key={signal.symbol}
                                    onClick={() => onSelectSymbol(signal.symbol)}
                                    className={`
                    cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-500/10' : 'hover:bg-gray-700/30'}
                  `}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-bold">
                                                {signal.symbol.slice(0, 2)}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{signal.symbol}</div>
                                                <div className="text-xs text-gray-500">VN30</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSignalBadge(signal.signal)}`}>
                                            {formatSignal(signal.signal)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                        {signal.price.toLocaleString()} ₫
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        <span className="flex items-center justify-end gap-1">
                                            {isPositive ? '↑' : '↓'}
                                            {Math.abs(signal.change).toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${signal.signal.includes('BUY') ? 'bg-green-500' : signal.signal.includes('SELL') ? 'bg-red-500' : 'bg-yellow-500'}`}
                                                    style={{ width: `${signal.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{(signal.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-400">
                                        {signal.target.toLocaleString()} ₫
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-400">
                                        {signal.stopLoss.toLocaleString()} ₫
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;
