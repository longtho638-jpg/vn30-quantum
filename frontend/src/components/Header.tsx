'use client';

import { FC, useState, useEffect } from 'react';

interface HeaderProps {
    currentTime: Date;
    isConnected: boolean;
}

const Header: FC<HeaderProps> = ({ currentTime, isConnected }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Client-side only
        const isBrowser = typeof window !== 'undefined';
        if (isBrowser) {
            setMounted(true);
        }
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Check if market is open (9:00-15:00 weekdays)
    const isMarketOpen = () => {
        const hour = currentTime.getHours();
        const day = currentTime.getDay();
        return day >= 1 && day <= 5 && hour >= 9 && hour < 15;
    };

    return (
        <header className="glass border-b border-gray-700/50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                            <span className="text-xl">⚛</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                VN30-Quantum
                            </h1>
                            <p className="text-xs text-gray-400">AI Trading Dashboard</p>
                        </div>
                    </div>

                    {/* Center - Market Status */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${mounted && isMarketOpen() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-300">
                                {mounted ? (isMarketOpen() ? 'Thị trường đang mở' : 'Thị trường đã đóng') : '...'}
                            </span>
                        </div>
                        <div className="h-4 w-px bg-gray-600" />
                        <div className="text-center">
                            <div className="text-lg font-mono font-bold text-white">
                                {mounted ? formatTime(currentTime) : '--:--:--'}
                            </div>
                            <div className="text-xs text-gray-400">
                                {mounted ? formatDate(currentTime) : '...'}
                            </div>
                        </div>
                    </div>

                    {/* Right - Connection + Actions */}
                    <div className="flex items-center gap-4">
                        {/* Connection Status */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-xs text-gray-300">
                                {isConnected ? 'Live' : 'Offline'}
                            </span>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                            <span className="text-xl">🔔</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                                3
                            </span>
                        </button>

                        {/* Profile */}
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700/50 transition-colors">
                            <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
                                👤
                            </div>
                            <span className="hidden md:block text-sm">Pro</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
