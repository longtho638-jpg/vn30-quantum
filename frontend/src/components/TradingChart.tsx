'use client';

import { FC, useEffect, useRef, useState } from 'react';

interface TradingChartProps {
    symbol: string;
}

// Sample candlestick data generator
const generateCandleData = (days: number = 30) => {
    const data = [];
    let basePrice = 25000 + Math.random() * 5000;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const change = (Math.random() - 0.48) * basePrice * 0.05;
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * basePrice * 0.02;
        const low = Math.min(open, close) - Math.random() * basePrice * 0.02;

        data.push({
            date: date.toLocaleDateString('vi-VN'),
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 1000000) + 500000
        });

        basePrice = close;
    }

    return data;
};

const TradingChart: FC<TradingChartProps> = ({ symbol }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [data, setData] = useState(generateCandleData(30));
    const [hoveredCandle, setHoveredCandle] = useState<number | null>(null);

    // Regenerate data when symbol changes
    useEffect(() => {
        setData(generateCandleData(30));
    }, [symbol]);

    // Draw chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = { top: 20, right: 60, bottom: 60, left: 20 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom - 60; // Space for volume

        // Clear
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);

        // Find price range
        const prices = data.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices) * 0.99;
        const maxPrice = Math.max(...prices) * 1.01;
        const priceRange = maxPrice - minPrice;

        // Find volume range
        const volumes = data.map(d => d.volume);
        const maxVolume = Math.max(...volumes);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price labels
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#6b7280';
            ctx.font = '10px Inter';
            ctx.textAlign = 'left';
            ctx.fillText(price.toFixed(0), width - padding.right + 5, y + 4);
        }

        // Draw candlesticks
        const candleWidth = chartWidth / data.length * 0.7;
        const candleGap = chartWidth / data.length;

        data.forEach((candle, i) => {
            const x = padding.left + candleGap * i + candleGap / 2;
            const isUp = candle.close >= candle.open;

            // Colors
            const color = isUp ? '#10b981' : '#ef4444';

            // Wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            const highY = padding.top + (maxPrice - candle.high) / priceRange * chartHeight;
            const lowY = padding.top + (maxPrice - candle.low) / priceRange * chartHeight;
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            // Body
            const openY = padding.top + (maxPrice - candle.open) / priceRange * chartHeight;
            const closeY = padding.top + (maxPrice - candle.close) / priceRange * chartHeight;
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1, Math.abs(openY - closeY));

            ctx.fillStyle = color;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

            // Volume bars (bottom section)
            const volumeHeight = (candle.volume / maxVolume) * 50;
            const volumeY = height - padding.bottom - volumeHeight;
            ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(x - candleWidth / 2, volumeY, candleWidth, volumeHeight);
        });

        // Draw latest price line
        const latestPrice = data[data.length - 1].close;
        const latestY = padding.top + (maxPrice - latestPrice) / priceRange * chartHeight;

        ctx.strokeStyle = data[data.length - 1].close >= data[data.length - 2]?.close ? '#10b981' : '#ef4444';
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(padding.left, latestY);
        ctx.lineTo(width - padding.right, latestY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Latest price label
        ctx.fillStyle = data[data.length - 1].close >= data[data.length - 2]?.close ? '#10b981' : '#ef4444';
        ctx.fillRect(width - padding.right + 2, latestY - 10, 56, 20);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(latestPrice.toFixed(0), width - padding.right + 30, latestY + 4);

    }, [data, hoveredCandle]);

    return (
        <div className="relative h-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />

            {/* Legend */}
            <div className="absolute top-2 left-2 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-gray-400">Tăng</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span className="text-gray-400">Giảm</span>
                </div>
            </div>

            {/* Price info */}
            {data.length > 0 && (
                <div className="absolute top-2 right-2 text-right">
                    <div className="text-xl font-bold">
                        {data[data.length - 1].close.toLocaleString()} ₫
                    </div>
                    <div className={`text-sm ${data[data.length - 1].close >= data[0].close ? 'text-green-400' : 'text-red-400'}`}>
                        {data[data.length - 1].close >= data[0].close ? '↑' : '↓'}
                        {(((data[data.length - 1].close - data[0].close) / data[0].close) * 100).toFixed(2)}%
                        trong 30 ngày
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradingChart;
