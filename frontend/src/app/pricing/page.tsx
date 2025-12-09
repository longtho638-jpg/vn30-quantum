'use client';

import { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for beginners',
            monthlyPrice: 29,
            yearlyPrice: 290,
            features: [
                '5 stocks monitoring',
                'Daily signals',
                'Email alerts',
                'Basic dashboard',
            ],
            notIncluded: ['Telegram alerts', 'AI predictions', 'API access'],
            popular: false,
            color: 'border-white/10',
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'For active traders',
            monthlyPrice: 99,
            yearlyPrice: 990,
            features: [
                'All 30 VN30 stocks',
                'Real-time signals',
                'Telegram alerts',
                'AI price prediction',
                'Advanced dashboard',
            ],
            notIncluded: ['API access', 'White-label'],
            popular: true,
            color: 'neon-border bg-purple-500/10',
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For institutions',
            monthlyPrice: 499,
            yearlyPrice: 4990,
            features: [
                'Everything in Pro',
                'API access (100k calls)',
                'Custom alerts',
                'White-label option',
                'Dedicated support',
            ],
            notIncluded: [],
            popular: false,
            color: 'border-white/10',
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
        <PageWrapper>
            {/* Header */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm text-cyan-400 mb-6">
                    💎 UNLOCK THE POWER
                </div>
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                    SIMPLE, TRANSPARENT <span className="text-hologram">PRICING</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Start free, upgrade when you need more. No hidden fees.
                    Cancel anytime.
                </p>
            </motion.section>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-6 mb-16">
                <span className={`text-lg transition ${billingPeriod === 'monthly' ? 'text-white font-bold' : 'text-gray-500'}`}>Monthly</span>
                <button
                    onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative w-20 h-10 rounded-full p-1 transition shadow-[0_0_20px_rgba(139,92,246,0.3)] bg-gradient-to-r from-purple-600 to-pink-600"
                >
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-8 h-8 bg-white rounded-full shadow-lg ${billingPeriod === 'yearly' ? 'ml-auto' : ''}`}
                    />
                </button>
                <span className={`text-lg transition ${billingPeriod === 'yearly' ? 'text-white font-bold' : 'text-gray-500'}`}>
                    Yearly <span className="text-green-400 text-sm font-semibold ml-2">(-17%)</span>
                </span>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-liquid rounded-[2rem] p-10 relative group ${plan.color}`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                Most Popular
                            </div>
                        )}

                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-gray-400 mb-8 h-10">{plan.description}</p>

                        <div className="mb-8 flex items-baseline gap-1">
                            <span className="text-5xl font-black tracking-tighter">
                                ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                            </span>
                            <span className="text-gray-500 font-medium">
                                /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                            </span>
                        </div>

                        <button
                            onClick={() => handleSubscribe(plan.id)}
                            className={`w-full py-4 rounded-xl font-bold transition mb-8 relative overflow-hidden group/btn ${plan.popular
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                                    : 'border border-white/20 hover:bg-white/5'
                                }`}
                        >
                            <span className="relative z-10">{plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}</span>
                            {plan.popular && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />}
                        </button>

                        <ul className="space-y-4">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">✓</div>
                                    <span className="text-gray-300 font-medium">{feature}</span>
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 opacity-40">
                                    <div className="w-5 h-5 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-500 text-xs">✕</div>
                                    <span className="text-gray-500">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </PageWrapper>
    );
}
