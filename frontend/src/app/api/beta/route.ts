import { NextRequest, NextResponse } from 'next/server';

// Beta user interface
interface BetaUser {
    email: string;
    name: string;
    tradingExperience: string;
    telegramUsername: string;
    referralSource: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

// Mock storage - In production, use database
const betaUsers: BetaUser[] = [];
const MAX_BETA_USERS = 100;

// POST /api/beta - Register for beta
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, tradingExperience, telegramUsername, referralSource } = body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Valid email required' },
                { status: 400 }
            );
        }

        // Check if already registered
        const existing = betaUsers.find(u => u.email === email);
        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already registered for beta',
                status: existing.status,
            });
        }

        // Check capacity
        if (betaUsers.length >= MAX_BETA_USERS) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Beta is currently full',
                    waitlist: true,
                },
                { status: 400 }
            );
        }

        // Create beta user
        const betaUser: BetaUser = {
            email,
            name: name || '',
            tradingExperience: tradingExperience || 'beginner',
            telegramUsername: telegramUsername || '',
            referralSource: referralSource || 'direct',
            status: 'approved', // Auto-approve during beta
            createdAt: new Date().toISOString(),
        };

        betaUsers.push(betaUser);
        console.log(`🎉 New beta user: ${email} (${betaUsers.length}/${MAX_BETA_USERS})`);

        // TODO: Send welcome email
        // TODO: Create user account in database
        // TODO: Add to Telegram group

        return NextResponse.json({
            success: true,
            message: 'Welcome to the beta!',
            status: 'approved',
            position: betaUsers.length,
            totalSlots: MAX_BETA_USERS,
            remainingSlots: MAX_BETA_USERS - betaUsers.length,
        });
    } catch (error) {
        console.error('Beta signup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to register' },
            { status: 500 }
        );
    }
}

// GET /api/beta - Get beta stats (admin only)
export async function GET(request: NextRequest) {
    const adminSecret = request.headers.get('x-admin-secret');

    // Public stats
    if (!adminSecret) {
        return NextResponse.json({
            success: true,
            totalSlots: MAX_BETA_USERS,
            remainingSlots: MAX_BETA_USERS - betaUsers.length,
            percentFull: Math.round((betaUsers.length / MAX_BETA_USERS) * 100),
        });
    }

    // Admin stats
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        totalUsers: betaUsers.length,
        maxUsers: MAX_BETA_USERS,
        users: betaUsers,
        breakdown: {
            approved: betaUsers.filter(u => u.status === 'approved').length,
            pending: betaUsers.filter(u => u.status === 'pending').length,
            rejected: betaUsers.filter(u => u.status === 'rejected').length,
        },
        sources: {
            google: betaUsers.filter(u => u.referralSource === 'google').length,
            facebook: betaUsers.filter(u => u.referralSource === 'facebook').length,
            youtube: betaUsers.filter(u => u.referralSource === 'youtube').length,
            friend: betaUsers.filter(u => u.referralSource === 'friend').length,
            telegram: betaUsers.filter(u => u.referralSource === 'telegram').length,
            other: betaUsers.filter(u => u.referralSource === 'other').length,
        },
    });
}
