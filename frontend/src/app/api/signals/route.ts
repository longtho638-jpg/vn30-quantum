import { NextRequest, NextResponse } from 'next/server';

// Mock data - In production, query from InfluxDB
interface Signal {
    symbol: string;
    price: number;
    predictedPrice: number;
    signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    score: number;
    rsi: number;
    macd: number;
    timestamp: string;
    reasons: string[];
}

// Mock signals data
const mockSignals: Signal[] = [
    {
        symbol: 'HPG',
        price: 25000,
        predictedPrice: 25500,
        signal: 'STRONG_BUY',
        score: 5,
        rsi: 28.5,
        macd: 0.15,
        timestamp: new Date().toISOString(),
        reasons: ['RSI oversold', 'MACD bullish crossover', 'Price below BB lower'],
    },
    {
        symbol: 'FPT',
        price: 98500,
        predictedPrice: 99200,
        signal: 'BUY',
        score: 3,
        rsi: 35.2,
        macd: 0.08,
        timestamp: new Date().toISOString(),
        reasons: ['RSI near oversold', 'Uptrend SMA'],
    },
    {
        symbol: 'VIC',
        price: 45000,
        predictedPrice: 44200,
        signal: 'STRONG_SELL',
        score: -4,
        rsi: 75.8,
        macd: -0.12,
        timestamp: new Date().toISOString(),
        reasons: ['RSI overbought', 'MACD bearish', 'Price above BB upper'],
    },
];

// Subscription tier limits
const TIER_LIMITS: Record<string, { stocks: number; fields: string[] }> = {
    free: {
        stocks: 3,
        fields: ['symbol', 'signal', 'timestamp'],
    },
    starter: {
        stocks: 5,
        fields: ['symbol', 'price', 'signal', 'score', 'rsi', 'timestamp'],
    },
    pro: {
        stocks: 30,
        fields: ['symbol', 'price', 'predictedPrice', 'signal', 'score', 'rsi', 'macd', 'timestamp', 'reasons'],
    },
    enterprise: {
        stocks: 30,
        fields: ['symbol', 'price', 'predictedPrice', 'signal', 'score', 'rsi', 'macd', 'timestamp', 'reasons'],
    },
};

// Filter signal data based on tier
function filterSignalByTier(signal: Signal, tier: string): Partial<Signal> {
    const allowedFields = TIER_LIMITS[tier]?.fields || TIER_LIMITS.free.fields;
    const filtered: Record<string, unknown> = {};

    for (const field of allowedFields) {
        if (field in signal) {
            filtered[field] = signal[field as keyof Signal];
        }
    }

    return filtered as Partial<Signal>;
}

// GET /api/signals - Get current signals
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const apiKey = request.headers.get('x-api-key');
        const symbol = searchParams.get('symbol');
        const signalType = searchParams.get('type'); // BUY, SELL, etc

        // Determine tier from API key
        // TODO: Validate API key against database
        let tier = 'free';
        if (apiKey) {
            if (apiKey.startsWith('enterprise_')) tier = 'enterprise';
            else if (apiKey.startsWith('pro_')) tier = 'pro';
            else if (apiKey.startsWith('starter_')) tier = 'starter';
        }

        // Get stock limit for tier
        const stockLimit = TIER_LIMITS[tier]?.stocks || 3;

        // Filter signals
        let signals = mockSignals;

        // Filter by symbol
        if (symbol) {
            signals = signals.filter(s => s.symbol === symbol.toUpperCase());
        }

        // Filter by signal type
        if (signalType) {
            signals = signals.filter(s => s.signal.includes(signalType.toUpperCase()));
        }

        // Apply tier limits
        signals = signals.slice(0, stockLimit);

        // Filter fields based on tier
        const filteredSignals = signals.map(s => filterSignalByTier(s, tier));

        return NextResponse.json({
            success: true,
            tier,
            count: filteredSignals.length,
            signals: filteredSignals,
            meta: {
                timestamp: new Date().toISOString(),
                stockLimit,
                upgradeUrl: tier === 'free' ? '/pricing' : null,
            },
        });
    } catch (error) {
        console.error('Signals API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch signals' },
            { status: 500 }
        );
    }
}

// POST /api/signals/subscribe - Subscribe to symbol alerts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symbols, webhookUrl, telegramChatId } = body;
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'API key required' },
                { status: 401 }
            );
        }

        // TODO: Store subscription in database
        // TODO: Setup webhook/telegram notification

        return NextResponse.json({
            success: true,
            message: 'Subscription created',
            subscription: {
                symbols: symbols || ['ALL'],
                webhookUrl,
                telegramChatId,
            },
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
