'use client';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <p className="text-gray-400 mb-8">Last updated: December 2024</p>

                <div className="space-y-8 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using VN30-Quantum (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                            If you disagree with any part of these terms, you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                        <p>
                            VN30-Quantum provides AI-powered trading signals and analysis for the Vietnamese stock market (VN30 index).
                            The Service includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Real-time stock price data analysis</li>
                            <li>Technical indicator calculations (RSI, MACD, Bollinger Bands)</li>
                            <li>AI-powered price predictions</li>
                            <li>Trading signal notifications via Telegram</li>
                            <li>Dashboard access for visualization</li>
                            <li>API access (for applicable subscription tiers)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. No Financial Advice</h2>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                            <p className="font-semibold text-red-400 mb-2">⚠️ IMPORTANT DISCLAIMER</p>
                            <p>
                                VN30-Quantum is NOT a registered investment advisor. The signals, predictions, and analysis provided
                                are for <strong>educational and informational purposes only</strong>. They do NOT constitute financial
                                advice, investment recommendations, or trading recommendations.
                            </p>
                            <p className="mt-4">
                                Trading stocks involves substantial risk of loss. Past performance is not indicative of future results.
                                You should consult with a qualified financial advisor before making any investment decisions.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Subscriptions are billed monthly or annually as selected at checkout.</li>
                            <li>Payments are processed securely via Stripe.</li>
                            <li>Prices are subject to change with 30 days notice to existing subscribers.</li>
                            <li>You may cancel your subscription at any time from your account dashboard.</li>
                            <li>No refunds are provided for partial months of service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. User Responsibilities</h2>
                        <p>You agree to:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Provide accurate account information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Not share your account with others</li>
                            <li>Not reverse engineer or attempt to access the source code</li>
                            <li>Not use the Service for any illegal purposes</li>
                            <li>Not redistribute signals or data without authorization</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. API Usage (Enterprise Tier)</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>API access is limited to your subscription tier limits.</li>
                            <li>Rate limiting applies to prevent abuse.</li>
                            <li>API keys must be kept confidential.</li>
                            <li>We reserve the right to revoke API access for Terms violations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Service Availability</h2>
                        <p>
                            We strive for 99.9% uptime but do not guarantee uninterrupted service. The Service may be temporarily
                            unavailable for:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Scheduled maintenance (with advance notice)</li>
                            <li>Emergency maintenance</li>
                            <li>Force majeure events</li>
                            <li>Third-party service provider issues</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                            <p>
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, VN30-QUANTUM AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY
                                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
                                LOSS OF PROFITS, DATA, OR TRADING LOSSES, ARISING FROM YOUR USE OF THE SERVICE.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">9. Intellectual Property</h2>
                        <p>
                            All content, features, and functionality of VN30-Quantum, including but not limited to the algorithms,
                            source code, graphics, logos, and trademarks, are owned by VN30-Quantum and protected by intellectual
                            property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
                        <p>
                            We may terminate or suspend your account immediately, without prior notice, for any reason including
                            breach of these Terms. Upon termination, your right to use the Service will cease immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of Vietnam, without regard
                            to its conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. We will notify users of any material changes
                            via email or through the Service. Continued use of the Service after changes constitutes acceptance
                            of the modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">13. Contact</h2>
                        <p>
                            For questions about these Terms of Service, please contact us at:
                            <br />
                            <a href="mailto:support@vn30quantum.com" className="text-purple-400 hover:text-purple-300">
                                support@vn30quantum.com
                            </a>
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500">
                    <p>© 2026 VN30-Quantum. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
