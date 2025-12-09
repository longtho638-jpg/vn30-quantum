'use client';

import { useState } from 'react';

export default function BetaSignupPage() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        tradingExperience: '',
        telegramUsername: '',
        referralSource: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/beta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Signup failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                    <div className="text-6xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Welcome to the Beta!
                    </h1>
                    <p className="text-gray-400 mb-8">
                        You&apos;re in! Check your email for login instructions.
                        We&apos;ll notify you via Telegram when new features launch.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-purple-400 mb-2">What&apos;s next?</h3>
                        <ul className="text-left text-gray-300 space-y-2">
                            <li>✅ Check email for dashboard access</li>
                            <li>✅ Join our Telegram group</li>
                            <li>✅ Setup your first stock watchlist</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-6">
                        🚀 Limited Beta Access
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Join the VN30-Quantum Beta
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Be among the first 100 traders to experience AI-powered trading signals.
                        Free access during beta period.
                    </p>
                </div>

                {/* Progress */}
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Beta Slots</span>
                        <span className="text-purple-400">73/100 remaining</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                            style={{ width: '27%' }}
                        />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                placeholder="trader@example.com"
                                required
                            />
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        {/* Trading Experience */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Trading Experience</label>
                            <select
                                name="tradingExperience"
                                value={formData.tradingExperience}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="" className="bg-slate-900">Select your experience</option>
                                <option value="beginner" className="bg-slate-900">Beginner (0-1 year)</option>
                                <option value="intermediate" className="bg-slate-900">Intermediate (1-3 years)</option>
                                <option value="advanced" className="bg-slate-900">Advanced (3-5 years)</option>
                                <option value="expert" className="bg-slate-900">Expert (5+ years)</option>
                            </select>
                        </div>

                        {/* Telegram */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Telegram Username (for alerts)</label>
                            <input
                                type="text"
                                name="telegramUsername"
                                value={formData.telegramUsername}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                placeholder="@your_username"
                            />
                        </div>

                        {/* Referral Source */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">How did you hear about us?</label>
                            <select
                                name="referralSource"
                                value={formData.referralSource}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            >
                                <option value="" className="bg-slate-900">Select source</option>
                                <option value="google" className="bg-slate-900">Google Search</option>
                                <option value="facebook" className="bg-slate-900">Facebook</option>
                                <option value="youtube" className="bg-slate-900">YouTube</option>
                                <option value="friend" className="bg-slate-900">Friend Referral</option>
                                <option value="telegram" className="bg-slate-900">Telegram Group</option>
                                <option value="other" className="bg-slate-900">Other</option>
                            </select>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Request Beta Access'}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        By signing up, you agree to our{' '}
                        <a href="/terms" className="text-purple-400">Terms</a> and{' '}
                        <a href="/privacy" className="text-purple-400">Privacy Policy</a>.
                    </p>
                </form>

                {/* Benefits */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-3">🆓</div>
                        <h3 className="font-semibold text-white mb-2">Free Access</h3>
                        <p className="text-gray-400 text-sm">Full Pro features during beta</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-3">💬</div>
                        <h3 className="font-semibold text-white mb-2">Direct Feedback</h3>
                        <p className="text-gray-400 text-sm">Shape the product roadmap</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-3">🎁</div>
                        <h3 className="font-semibold text-white mb-2">Lifetime Discount</h3>
                        <p className="text-gray-400 text-sm">50% off when we launch</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
