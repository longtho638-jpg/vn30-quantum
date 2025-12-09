'use client';

import { useState } from 'react';

export default function AffiliatePage() {
    const [email, setEmail] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [affiliateCode, setAffiliateCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/affiliate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, paypalEmail }),
            });

            const data = await response.json();
            if (data.success) {
                setAffiliateCode(data.code);
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block px-4 py-2 bg-green-500/20 rounded-full text-green-300 text-sm mb-8">
                        💰 Earn 20% Commission
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        VN30-Quantum <br />
                        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            Affiliate Program
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Refer traders to VN30-Quantum and earn 20% recurring commission for every subscription.
                        No limit on earnings.
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                        <div className="text-4xl mb-4">💵</div>
                        <h3 className="text-xl font-semibold mb-2">20% Commission</h3>
                        <p className="text-gray-400">
                            Earn 20% of every payment from customers you refer. Recurring monthly!
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                        <div className="text-4xl mb-4">🔄</div>
                        <h3 className="text-xl font-semibold mb-2">Lifetime Recurring</h3>
                        <p className="text-gray-400">
                            Get paid every month as long as your referral remains a subscriber.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
                        <p className="text-gray-400">
                            Dashboard to track clicks, signups, and earnings in real-time.
                        </p>
                    </div>
                </div>
            </section>

            {/* Commission Table */}
            <section className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-center mb-12">Commission Structure</h2>
                <div className="max-w-3xl mx-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/20">
                                <th className="py-4 text-left">Plan</th>
                                <th className="py-4 text-right">Monthly Price</th>
                                <th className="py-4 text-right text-green-400">Your Commission</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/10">
                                <td className="py-4">Starter</td>
                                <td className="py-4 text-right">$29</td>
                                <td className="py-4 text-right text-green-400 font-semibold">$5.80/mo</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4">Pro <span className="text-purple-400 text-sm">(Most Popular)</span></td>
                                <td className="py-4 text-right">$99</td>
                                <td className="py-4 text-right text-green-400 font-semibold">$19.80/mo</td>
                            </tr>
                            <tr className="border-b border-white/10">
                                <td className="py-4">Enterprise</td>
                                <td className="py-4 text-right">$499</td>
                                <td className="py-4 text-right text-green-400 font-semibold">$99.80/mo</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                        <p className="text-lg">
                            💡 Example: Refer 10 Pro users = <span className="text-green-400 font-bold">$198/month</span> passive income!
                        </p>
                    </div>
                </div>
            </section>

            {/* Signup Form or Success */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-xl mx-auto">
                    {!submitted ? (
                        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 text-center">Join the Program</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Your Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">PayPal Email (for payouts)</label>
                                    <input
                                        type="email"
                                        value={paypalEmail}
                                        onChange={(e) => setPaypalEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                        placeholder="paypal@example.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition"
                                >
                                    Get My Affiliate Link
                                </button>
                            </form>
                            <p className="text-center text-sm text-gray-400 mt-6">
                                By joining, you agree to our{' '}
                                <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms</a>.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold mb-4">Welcome to the Program!</h2>
                            <p className="text-gray-300 mb-6">Your unique affiliate code:</p>
                            <div className="bg-black/30 rounded-xl p-4 mb-6">
                                <code className="text-2xl text-green-400 font-mono">{affiliateCode}</code>
                            </div>
                            <p className="text-gray-400 mb-4">Your referral link:</p>
                            <div className="bg-black/30 rounded-xl p-4 mb-6 break-all">
                                <code className="text-purple-400">https://vn30quantum.com?ref={affiliateCode}</code>
                            </div>
                            <p className="text-sm text-gray-400">
                                Share this link anywhere. When someone signs up using your link, you get 20%!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="container mx-auto px-6 py-12 pb-20">
                <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">When do I get paid?</h3>
                        <p className="text-gray-400">Payouts are processed on the 1st of each month via PayPal for earnings over $50.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">How long does the cookie last?</h3>
                        <p className="text-gray-400">30 days. If someone clicks your link and signs up within 30 days, you get credit.</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Can I promote on social media?</h3>
                        <p className="text-gray-400">Absolutely! Share on Facebook, YouTube, TikTok, or anywhere you have an audience.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
