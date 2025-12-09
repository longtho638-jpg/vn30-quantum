import { NextRequest, NextResponse } from 'next/server';

// Waitlist storage (in production, use database)
const waitlist: { email: string; timestamp: string; source: string }[] = [];

// POST /api/waitlist - Add email to waitlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, source = 'landing' } = body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check if already registered
        const exists = waitlist.find((w) => w.email === email);
        if (exists) {
            return NextResponse.json({
                success: true,
                message: 'Email already registered',
                isNew: false,
            });
        }

        // Add to waitlist
        waitlist.push({
            email,
            timestamp: new Date().toISOString(),
            source,
        });

        // TODO: Send confirmation email via SendGrid/Resend
        // TODO: Store in database (Supabase/PostgreSQL)
        // TODO: Add to email marketing list (Mailchimp/Convertkit)

        console.log(`📧 New waitlist signup: ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Successfully added to waitlist',
            isNew: true,
            position: waitlist.length,
        });
    } catch (error) {
        console.error('Waitlist error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add to waitlist' },
            { status: 500 }
        );
    }
}

// GET /api/waitlist - Get waitlist count (admin only)
export async function GET(request: NextRequest) {
    // TODO: Add admin authentication
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        count: waitlist.length,
        emails: waitlist,
    });
}
