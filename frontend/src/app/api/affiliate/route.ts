import { NextRequest, NextResponse } from 'next/server';

// Affiliate types
interface Affiliate {
    id: string;
    email: string;
    code: string;
    commissionRate: number; // 0.2 = 20%
    totalEarnings: number;
    pendingPayout: number;
    referralCount: number;
    createdAt: string;
}

interface Referral {
    affiliateCode: string;
    customerEmail: string;
    plan: string;
    amount: number;
    commission: number;
    status: 'pending' | 'paid';
    createdAt: string;
}

// Mock data - In production, use database
const affiliates: Map<string, Affiliate> = new Map();
const referrals: Referral[] = [];

// Generate unique affiliate code
function generateCode(): string {
    return 'VN30_' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /api/affiliate - Get affiliate info
export async function GET(request: NextRequest) {
    const affiliateCode = request.headers.get('x-affiliate-code');

    if (!affiliateCode) {
        return NextResponse.json(
            { success: false, error: 'Affiliate code required' },
            { status: 401 }
        );
    }

    const affiliate = affiliates.get(affiliateCode);

    if (!affiliate) {
        return NextResponse.json(
            { success: false, error: 'Affiliate not found' },
            { status: 404 }
        );
    }

    // Get referrals for this affiliate
    const affiliateReferrals = referrals.filter(r => r.affiliateCode === affiliateCode);

    return NextResponse.json({
        success: true,
        affiliate: {
            email: affiliate.email,
            code: affiliate.code,
            commissionRate: affiliate.commissionRate * 100 + '%',
            totalEarnings: affiliate.totalEarnings,
            pendingPayout: affiliate.pendingPayout,
            referralCount: affiliate.referralCount,
        },
        referrals: affiliateReferrals,
    });
}

// POST /api/affiliate - Register as affiliate
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, paypalEmail } = body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Valid email required' },
                { status: 400 }
            );
        }

        // Check if already registered
        const existing = Array.from(affiliates.values()).find(a => a.email === email);
        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already registered',
                code: existing.code,
                dashboardUrl: `/affiliate/dashboard?code=${existing.code}`,
            });
        }

        // Create new affiliate
        const code = generateCode();
        const affiliate: Affiliate = {
            id: Math.random().toString(36).substring(2, 15),
            email,
            code,
            commissionRate: 0.2, // 20% commission
            totalEarnings: 0,
            pendingPayout: 0,
            referralCount: 0,
            createdAt: new Date().toISOString(),
        };

        affiliates.set(code, affiliate);
        console.log(`🤝 New affiliate registered: ${email} - Code: ${code} - PayPal: ${paypalEmail || 'N/A'}`);

        return NextResponse.json({
            success: true,
            message: 'Affiliate account created',
            code,
            commissionRate: '20%',
            referralLink: `https://vn30quantum.com?ref=${code}`,
            dashboardUrl: `/affiliate/dashboard?code=${code}`,
        });
    } catch (error) {
        console.error('Affiliate registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to register' },
            { status: 500 }
        );
    }
}

// PUT /api/affiliate - Record a referral (internal use)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { affiliateCode, customerEmail, plan, amount } = body;
        const adminSecret = request.headers.get('x-admin-secret');

        // Admin auth check
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const affiliate = affiliates.get(affiliateCode);
        if (!affiliate) {
            return NextResponse.json(
                { success: false, error: 'Affiliate not found' },
                { status: 404 }
            );
        }

        // Calculate commission
        const commission = amount * affiliate.commissionRate;

        // Record referral
        const referral: Referral = {
            affiliateCode,
            customerEmail,
            plan,
            amount,
            commission,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        referrals.push(referral);

        // Update affiliate stats
        affiliate.referralCount++;
        affiliate.totalEarnings += commission;
        affiliate.pendingPayout += commission;

        console.log(`💰 Referral recorded: ${affiliateCode} earned $${commission.toFixed(2)}`);

        return NextResponse.json({
            success: true,
            message: 'Referral recorded',
            commission,
        });
    } catch (error) {
        console.error('Referral recording error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to record referral' },
            { status: 500 }
        );
    }
}
