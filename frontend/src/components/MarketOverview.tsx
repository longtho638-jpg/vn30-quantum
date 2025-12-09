'use client';

import { FC } from 'react';

interface MarketOverviewProps {
    stats: {
        buyCount: number;
        sellCount: number;
        holdCount: number;
        sentiment: string;
    };
}

const MarketOverview: FC<MarketOverviewProps> = ({ stats }) => {
    const total = stats.buyCount + stats.sellCount + stats.holdCount;

    const getSentimentColor = () => {
        if (stats.sentiment === 'BULLISH') return 'text-green-400';
        if (stats.sentiment === 'BEARISH') return 'text-red-400';
        return 'text-yellow-400';
    };

    const getSentimentEmoji = () => {
        if (stats.sentiment === 'BULLISH') return '🚀';
        if (stats.sentiment === 'BEARISH') return '📉';
        return '⚖️';
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Buy Signals */}
            <div className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Tín hiệu MUA</span>
                    <span className="text-2xl">🟢</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{stats.buyCount}</div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-green rounded-full transition-all duration-500"
                        style={{ width: `${(stats.buyCount / total) * 100}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">{((stats.buyCount / total) * 100).toFixed(0)}% tổng số</div>
            </div>

            {/* Sell Signals */}
            <div className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Tín hiệu BÁN</span>
                    <span className="text-2xl">🔴</span>
                </div>
                <div className="text-3xl font-bold text-red-400">{stats.sellCount}</div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full gradient-red rounded-full transition-all duration-500"
                        style={{ width: `${(stats.sellCount / total) * 100}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">{((stats.sellCount / total) * 100).toFixed(0)}% tổng số</div>
            </div>

            {/* Hold Signals */}
            <div className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Trung lập</span>
                    <span className="text-2xl">🟡</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">{stats.holdCount}</div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.holdCount / total) * 100}%` }}
                    />
                </div>
                <div className="text-xs text-gray-500 mt-1">{((stats.holdCount / total) * 100).toFixed(0)}% tổng số</div>
            </div>

            {/* Market Sentiment */}
            <div className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Xu hướng</span>
                    <span className="text-2xl">{getSentimentEmoji()}</span>
                </div>
                <div className={`text-2xl font-bold ${getSentimentColor()}`}>
                    {stats.sentiment === 'BULLISH' ? 'Tăng' : stats.sentiment === 'BEARISH' ? 'Giảm' : 'Giằng co'}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                    Dựa trên {total} tín hiệu VN30
                </div>
            </div>
        </div>
    );
};

export default MarketOverview;
