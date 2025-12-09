import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia' as any, // Cast to any to avoid strict version check
}) : null;

// Stripe Price IDs (create these in Stripe Dashboard)
const PRICE_IDS: Record<string, { monthly: string; yearly: string }> = {
    starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
        yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
    },
    pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
    },
    enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    },
};

// POST /api/checkout - Create Stripe Checkout Session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { planId, billingPeriod = 'monthly', email, affiliateCode } = body;

        console.log(`[Checkout] Creating session for ${email} - Plan: ${planId} (${billingPeriod})`);

        // Validate plan
        if (!planId || !PRICE_IDS[planId]) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan ID' },
                { status: 400 }
            );
        }

        // Check if Stripe is configured
        if (!stripe) {
            // Development mode - return mock checkout
            console.log('[Checkout] Stripe not configured - returning mock session');
            return NextResponse.json({
                success: true,
                mode: 'development',
                message: 'Stripe not configured. Set STRIPE_SECRET_KEY in environment.',
                checkoutUrl: `/checkout/success?session_id=mock_${Date.now()}`,
                sessionId: `mock_${Date.now()}`,
            });
        }

        // Get the correct price ID
        const priceId = PRICE_IDS[planId][billingPeriod as 'monthly' | 'yearly'];

        // Build success/cancel URLs
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
        const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/pricing`;

        // Create Stripe Checkout Session
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: email,
            metadata: {
                planId,
                billingPeriod,
                affiliateCode: affiliateCode || '',
            },
            subscription_data: {
                metadata: {
                    planId,
                    affiliateCode: affiliateCode || '',
                },
            },
            allow_promotion_codes: true,
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        console.log(`[Checkout] Session created: ${session.id}`);

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            checkoutUrl: session.url,
        });
    } catch (error) {
        console.error('[Checkout] Error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            { success: false, error: `Checkout failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}

// GET /api/checkout - Get session details
export async function GET(request: NextRequest) {
    try {
        const sessionId = request.nextUrl.searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { success: false, error: 'Session ID required' },
                { status: 400 }
            );
        }

        // Mock mode
        if (sessionId.startsWith('mock_') || !stripe) {
            return NextResponse.json({
                success: true,
                mode: 'development',
                session: {
                    id: sessionId,
                    status: 'complete',
                    customer_email: 'test@example.com',
                    amount_total: 9900,
                    currency: 'usd',
                },
            });
        }

        // Get real session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer'],
        });

        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                customer_email: session.customer_email,
                amount_total: session.amount_total,
                currency: session.currency,
                subscription: session.subscription,
            },
        });
    } catch (error) {
        console.error('[Checkout] Session retrieval error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to retrieve session' },
            { status: 500 }
        );
    }
}
