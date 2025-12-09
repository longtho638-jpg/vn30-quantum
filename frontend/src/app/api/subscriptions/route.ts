import { NextRequest, NextResponse } from 'next/server';

// Stripe types (will install @stripe/stripe-js)
interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    priceId: string; // Stripe price ID
    features: string[];
    limits: {
        stocks: number;
        apiCalls: number;
        alertsPerDay: number;
    };
}

// Subscription tiers
const PLANS: Record<string, SubscriptionPlan> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        price: 29,
        priceId: 'price_starter_monthly', // Replace with real Stripe price ID
        features: [
            '5 stocks monitoring',
            'Daily signals',
            'Email alerts',
            'Basic dashboard',
        ],
        limits: {
            stocks: 5,
            apiCalls: 100,
            alertsPerDay: 10,
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 99,
        priceId: 'price_pro_monthly', // Replace with real Stripe price ID
        features: [
            'All 30 VN30 stocks',
            'Real-time signals',
            'Telegram alerts',
            'AI price prediction',
            'Advanced dashboard',
        ],
        limits: {
            stocks: 30,
            apiCalls: 10000,
            alertsPerDay: 100,
        },
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 499,
        priceId: 'price_enterprise_monthly', // Replace with real Stripe price ID
        features: [
            'Everything in Pro',
            'API access',
            'Custom alerts',
            'Priority support',
            'White-label option',
        ],
        limits: {
            stocks: 30,
            apiCalls: -1, // Unlimited
            alertsPerDay: -1, // Unlimited
        },
    },
};

// GET /api/subscriptions - Get all plans
export async function GET() {
    return NextResponse.json({
        success: true,
        plans: Object.values(PLANS),
    });
}

// POST /api/subscriptions - Create checkout session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { planId, email } = body;

        if (!planId || !PLANS[planId]) {
            return NextResponse.json(
                { success: false, error: 'Invalid plan ID' },
                { status: 400 }
            );
        }

        const plan = PLANS[planId];

        // TODO: Initialize Stripe and create checkout session
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const session = await stripe.checkout.sessions.create({
        //   payment_method_types: ['card'],
        //   line_items: [{
        //     price: plan.priceId,
        //     quantity: 1,
        //   }],
        //   mode: 'subscription',
        //   success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
        //   customer_email: email,
        // });

        // Placeholder response
        return NextResponse.json({
            success: true,
            message: 'Checkout session created',
            plan: plan,
            checkoutUrl: `/checkout?plan=${planId}`, // Replace with session.url
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
