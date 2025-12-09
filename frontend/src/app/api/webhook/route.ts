import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with webhook secret
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia' as any, // Cast to any to avoid strict version check
}) : null;

// POST /api/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
    if (!stripe || !webhookSecret) {
        console.log('[Webhook] Stripe not configured');
        return NextResponse.json({ received: true, mode: 'development' });
    }

    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('[Webhook] Signature verification failed:', err);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        console.log(`[Webhook] Received event: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCreated(subscription);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

// Handler functions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log(`[Webhook] Checkout completed: ${session.id}`);

    const email = session.customer_email;
    const planId = session.metadata?.planId;
    const affiliateCode = session.metadata?.affiliateCode;

    // TODO: Create user in database
    // TODO: Send welcome email
    // TODO: Grant access to platform

    console.log(`[Webhook] New customer: ${email} - Plan: ${planId}`);

    // Record affiliate referral if applicable
    if (affiliateCode) {
        console.log(`[Webhook] Affiliate referral: ${affiliateCode}`);
        // TODO: Call affiliate API to record referral
        // await fetch('/api/affiliate', { method: 'PUT', ... })
    }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    console.log(`[Webhook] Subscription created: ${subscription.id}`);

    const customerId = subscription.customer as string;
    const planId = subscription.metadata?.planId;
    const status = subscription.status;

    // TODO: Update user subscription in database
    console.log(`[Webhook] Customer ${customerId} subscribed to ${planId} - Status: ${status}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log(`[Webhook] Subscription updated: ${subscription.id}`);

    const status = subscription.status;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    // TODO: Update subscription status in database
    console.log(`[Webhook] Subscription status: ${status}, Cancel at period end: ${cancelAtPeriodEnd}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

    const customerId = subscription.customer as string;

    // TODO: Revoke user access
    // TODO: Send cancellation email
    console.log(`[Webhook] Customer ${customerId} subscription ended`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`[Webhook] Payment succeeded: ${invoice.id}`);

    const customerId = invoice.customer as string;
    const amount = invoice.amount_paid / 100; // Convert from cents

    // TODO: Record payment in database
    // TODO: Calculate and record affiliate commission
    console.log(`[Webhook] Customer ${customerId} paid $${amount}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`[Webhook] Payment failed: ${invoice.id}`);

    const customerId = invoice.customer as string;

    // TODO: Send payment failed email
    // TODO: Update subscription status
    console.log(`[Webhook] Customer ${customerId} payment failed`);
}
