'use client';

import { useState } from 'react';

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for beginners',
            monthlyPrice: 29,
            yearlyPrice: 290, // ~17% off
            features: [
                '5 stocks monitoring',
                'Daily signals',
                'Email alerts',
                'Basic dashboard',
                'Email support',
            ],
            notIncluded: [
                'Telegram alerts',
                'AI predictions',
                'API access',
            ],
            popular: false,
            color: 'gray',
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'For active traders',
            monthlyPrice: 99,
            yearlyPrice: 990, // ~17% off
            features: [
                'All 30 VN30 stocks',
                'Real-time signals',
                'Telegram alerts',
                'AI price prediction',
                'Advanced dashboard',
                'Priority support',
            ],
            notIncluded: [
                'API access',
                'White-label',
            ],
            popular: true,
            color: 'purple',
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For institutions',
            monthlyPrice: 499,
            yearlyPrice: 4990, // ~17% off
            features: [
                'Everything in Pro',
                'API access (100k calls)',
                'Custom alerts',
                'White-label option',
                'Dedicated support',
                'SLA guarantee',
            ],
            notIncluded: [],
            popular: false,
            color: 'blue',
        },
    ];

    const handleSubscribe = async (planId: string) => {
        try {
            const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    billingPeriod,
                }),
            });

            const data = await response.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }
        } catch (error) {
            console.error('Checkout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <section className="container mx-auto px-6 py-20 text-center">
                <h1 className="text-5xl font-bold mb-6">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Start free, upgrade when you need more. No hidden fees.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}>Monthly</span>
                    <button
                        onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-16 h-8 bg-purple-600 rounded-full p-1 transition"
                    >
                        <div
                            className={`w-6 h-6 bg-white rounded-full transition-transform ${billingPeriod === 'yearly' ? 'translate-x-8' : ''
                                }`}
                        />
                    </button>
                    <span className={billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}>
                        Yearly <span className="text-green-400 text-sm">(Save 17%)</span>
                    </span>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="container mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl p-8 border ${plan.popular
                                    ? 'bg-gradient-to-b from-purple-600/20 to-pink-600/20 border-purple-500/50'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <p className="text-gray-400 mb-6">{plan.description}</p>

                            <div className="mb-6">
                                <span className="text-5xl font-bold">
                                    ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                </span>
                                <span className="text-gray-400">
                                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                                </span>
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.id)}
                                className={`w-full py-4 rounded-xl font-semibold transition mb-8 ${plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                                        : 'border border-purple-500 text-purple-400 hover:bg-purple-500/10'
                                    }`}
                            >
                                {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                            </button>

                            <ul className="space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="text-green-400">✓</span>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 opacity-50">
                                        <span className="text-gray-500">✕</span>
                                        <span className="text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                        <p className="text-gray-400">Yes, you can cancel your subscription at any time from your dashboard.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                        <p className="text-gray-400">We offer a 7-day free trial for the Pro plan. No credit card required.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                        <p className="text-gray-400">We accept all major credit cards via Stripe (Visa, Mastercard, AMEX).</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Can I upgrade or downgrade?</h3>
                        <p className="text-gray-400">Yes, you can change plans anytime. The difference is prorated.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-12 text-center border border-purple-500/30">
                    <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-gray-400 mb-8">
                        Our team is here to help. Schedule a demo or chat with us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                            Schedule Demo
                        </button>
                        <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/5 transition">
                            Contact Support
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 border-t border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔮</span>
                        <span className="text-lg font-bold">VN30-Quantum</span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-400">
                        <a href="/terms" className="hover:text-white transition">Terms</a>
                        <a href="/privacy" className="hover:text-white transition">Privacy</a>
                        <a href="/affiliate" className="hover:text-white transition">Affiliate</a>
                    </div>
                    <div className="text-gray-500">© 2026 VN30-Quantum</div>
                </div>
            </footer>
        </div>
    );
}
