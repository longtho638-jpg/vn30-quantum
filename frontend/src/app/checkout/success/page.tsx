'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SessionData {
    status: string;
    customer_email: string;
    amount_total: number;
    currency: string;
}

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<SessionData | null>(null);

    useEffect(() => {
        if (sessionId) {
            fetch(`/api/checkout?session_id=${sessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setSession(data.session);
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🔄</div>
                    <p className="text-white text-xl">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">🎉</span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">
                    Welcome to VN30-Quantum!
                </h1>

                <p className="text-gray-400 mb-8">
                    Your payment was successful. You now have full access to all features.
                </p>

                {session && (
                    <div className="bg-black/30 rounded-xl p-4 mb-8 text-left">
                        <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white">{session.customer_email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10">
                            <span className="text-gray-400">Amount</span>
                            <span className="text-green-400">
                                ${session.amount_total ? (session.amount_total / 100).toFixed(2) : '99.00'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-400">Status</span>
                            <span className="text-green-400">✓ Active</span>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className="text-left mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Next Steps:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">1️⃣</span>
                            Check your email for login credentials
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">2️⃣</span>
                            Connect your Telegram for alerts
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <span className="text-green-400">3️⃣</span>
                            Explore the dashboard
                        </li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <Link href="/" className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                        Go to Dashboard
                    </Link>
                    <Link href="/docs/getting-started" className="block w-full py-4 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/5 transition">
                        Read Getting Started Guide
                    </Link>
                </div>

                <p className="text-sm text-gray-500 mt-8">
                    Questions? Email us at{' '}
                    <a href="mailto:support@vn30quantum.com" className="text-purple-400">
                        support@vn30quantum.com
                    </a>
                </p>
            </div>
        </div>
    );
}
