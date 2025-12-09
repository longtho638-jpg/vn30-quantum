'use client';

import { FC } from 'react';

interface SignalCardProps {
    symbol: string;
    signal: string;
    confidence: number;
    price: number;
    change: number;
    target: number;
    stopLoss: number;
    isSelected?: boolean;
    onClick?: () => void;
}

const SignalCard: FC<SignalCardProps> = ({
    symbol,
    signal,
    confidence,
    price,
    change,
    target,
    stopLoss,
    isSelected = false,
    onClick
}) => {
    const getSignalStyle = () => {
        if (signal.includes('BUY')) return {
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            text: 'text-green-400',
            badge: 'signal-buy'
        };
        if (signal.includes('SELL')) return {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            badge: 'signal-sell'
        };
        return {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            badge: 'signal-hold'
        };
    };

    const style = getSignalStyle();
    const isPositive = change >= 0;

    const formatSignal = (s: string) => {
        if (s === 'STRONG_BUY') return 'MUA MẠNH';
        if (s === 'BUY') return 'MUA';
        if (s === 'STRONG_SELL') return 'BÁN MẠNH';
        if (s === 'SELL') return 'BÁN';
        return 'GIỮ';
    };

    return (
        <div
            onClick={onClick}
            className={`
        glass rounded-xl p-4 cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700/30'}
        ${style.bg}
      `}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center font-bold">
                        {symbol.slice(0, 2)}
                    </div>
                    <div>
                        <div className="font-bold text-lg">{symbol}</div>
                        <div className="text-xs text-gray-400">VN30</div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${style.badge}`}>
                    {formatSignal(signal)}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="text-xs text-gray-400 mb-1">Giá hiện tại</div>
                    <div className="font-semibold">{price.toLocaleString()} ₫</div>
                    <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Độ tin cậy</div>
                    <div className={`font-bold text-xl ${style.text}`}>
                        {(confidence * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between text-xs">
                <div>
                    <span className="text-gray-400">Target: </span>
                    <span className="text-green-400">{target.toLocaleString()}</span>
                </div>
                <div>
                    <span className="text-gray-400">SL: </span>
                    <span className="text-red-400">{stopLoss.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default SignalCard;
