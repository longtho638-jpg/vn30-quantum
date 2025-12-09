'use client';

import { FC, useEffect, useRef, useState } from 'react';

interface TradingChartProps {
    symbol: string;
}

// ... (sample data generator kept same for brevity, but could be moved to utils)
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
            open, high, low, close,
            volume: Math.floor(Math.random() * 1000000) + 500000
        });
        basePrice = close;
    }
    return data;
};

interface CandleData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

const TradingChart: FC<TradingChartProps> = ({ symbol }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<CandleData[]>([]);

    useEffect(() => {
        setMounted(true);
        setData(generateCandleData(30));
    }, []);

    useEffect(() => {
        if (mounted) setData(generateCandleData(30));
    }, [symbol, mounted]);

    useEffect(() => {
        if (!mounted || data.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = { top: 40, right: 60, bottom: 40, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom - 60;

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Calculate Scale
        const prices = data.flatMap(d => [d.high, d.low]);
        const minPrice = Math.min(...prices) * 0.99;
        const maxPrice = Math.max(...prices) * 1.01;
        const priceRange = maxPrice - minPrice;
        const volumes = data.map(d => d.volume);
        const maxVolume = Math.max(...volumes);

        // 🌌 GRID (Cyberpunk)
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Labels
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#00f3ff';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'left';
            ctx.fillText(price.toFixed(0), width - padding.right + 10, y + 4);
        }

        // 🕯️ CANDLES (Holographic)
        const candleWidth = chartWidth / data.length * 0.6;
        const candleGap = chartWidth / data.length;

        data.forEach((candle, i) => {
            const x = padding.left + candleGap * i + candleGap / 2;
            const isUp = candle.close >= candle.open;

            // Neon Colors
            const color = isUp ? '#00f3ff' : '#ff0055'; // Cyan vs Pink
            const shadowColor = isUp ? 'rgba(0, 243, 255, 0.5)' : 'rgba(255, 0, 85, 0.5)';

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 10;

            // Wick
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
            const bodyHeight = Math.max(2, Math.abs(openY - closeY));

            ctx.fillStyle = color;
            ctx.shadowBlur = 0; // Reset blur for fill to keep it crisp but maybe add glow back
            ctx.globalAlpha = 0.8;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
            ctx.globalAlpha = 1.0;

            // Volume (Bottom)
            const volumeHeight = (candle.volume / maxVolume) * 50;
            const volumeY = height - padding.bottom - volumeHeight;
            ctx.fillStyle = isUp ? 'rgba(0, 243, 255, 0.2)' : 'rgba(255, 0, 85, 0.2)';
            ctx.fillRect(x - candleWidth / 2, volumeY, candleWidth, volumeHeight);
        });

        // ⚡ LATEST PRICE LINE (Pulsing)
        if (data.length > 0) {
            const latestPrice = data[data.length - 1].close;
            const latestY = padding.top + (maxPrice - latestPrice) / priceRange * chartHeight;
            const isUp = data[data.length - 1].close >= data[data.length - 2].close;
            const color = isUp ? '#00f3ff' : '#ff0055';

            ctx.strokeStyle = color;
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.moveTo(padding.left, latestY);
            ctx.lineTo(width - padding.right, latestY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.fillStyle = color;
            ctx.fillRect(width - padding.right, latestY - 12, 60, 24);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(latestPrice.toFixed(0), width - padding.right + 30, latestY + 5);
        }

    }, [data, mounted]);

    if (!mounted) return <div className="h-full flex items-center justify-center text-cyan-500 animate-pulse">INITIALIZING HOLOGRAPHIC CHART...</div>;

    return (
        <div className="relative h-full w-full">
            <canvas ref={canvasRef} className="w-full h-full" />

            {/* Legend */}
            <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
                    <span className="text-cyan-200">BULLISH</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ff0055] shadow-[0_0_10px_#ff0055]" />
                    <span className="text-pink-200">BEARISH</span>
                </div>
            </div>

            {/* Title / Watermark */}
            <div className="absolute bottom-4 left-4 text-[10px] text-white/10 font-bold uppercase tracking-[0.3em] pointer-events-none">
                VN30-Quantum // Neural Engine
            </div>
        </div>
    );
};

export default TradingChart;
