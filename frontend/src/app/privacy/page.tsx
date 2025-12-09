'use client';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <p className="text-gray-400 mb-8">Last updated: December 2024</p>

                <div className="space-y-8 text-gray-300">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                        <p>
                            VN30-Quantum (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, disclose, and safeguard your information when you use our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

                        <h3 className="text-xl font-medium text-purple-400 mt-6 mb-3">Personal Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Email address (for account creation and notifications)</li>
                            <li>Payment information (processed securely by Stripe)</li>
                            <li>Telegram chat ID (for notification delivery)</li>
                        </ul>

                        <h3 className="text-xl font-medium text-purple-400 mt-6 mb-3">Usage Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Pages visited and features used</li>
                            <li>API calls and usage patterns</li>
                            <li>Device information and browser type</li>
                            <li>IP address and approximate location</li>
                        </ul>

                        <h3 className="text-xl font-medium text-purple-400 mt-6 mb-3">Cookies and Tracking</h3>
                        <p>
                            We use essential cookies for authentication and optional analytics cookies for service improvement.
                            You can manage cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and maintain our Service</li>
                            <li>To process payments and manage subscriptions</li>
                            <li>To send trading signals and alerts</li>
                            <li>To improve our algorithms and predictions</li>
                            <li>To communicate updates and promotional offers</li>
                            <li>To detect and prevent fraud or abuse</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing</h2>
                        <p>We do NOT sell your personal information. We may share data with:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Stripe:</strong> For payment processing</li>
                            <li><strong>Cloudflare:</strong> For security and CDN services</li>
                            <li><strong>Telegram:</strong> For notification delivery</li>
                            <li><strong>Analytics providers:</strong> In anonymized/aggregated form</li>
                            <li><strong>Legal authorities:</strong> When required by law</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                            <p className="font-semibold text-green-400 mb-2">🛡️ Security Measures</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All data is encrypted in transit (TLS 1.3)</li>
                                <li>Sensitive data is encrypted at rest</li>
                                <li>Zero Trust architecture with Cloudflare</li>
                                <li>Regular security audits</li>
                                <li>No plaintext password storage</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Account data: Retained while account is active</li>
                            <li>Usage logs: Retained for 90 days</li>
                            <li>Payment records: Retained as required by law (typically 7 years)</li>
                            <li>After account deletion: Data removed within 30 days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update inaccurate information</li>
                            <li><strong>Deletion:</strong> Request account and data deletion</li>
                            <li><strong>Portability:</strong> Export your data in a standard format</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, contact us at{' '}
                            <a href="mailto:privacy@vn30quantum.com" className="text-purple-400 hover:text-purple-300">
                                privacy@vn30quantum.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
                        <p>
                            Your data may be processed on servers located outside your country of residence. We ensure appropriate
                            safeguards are in place for international data transfers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">9. Children&apos;s Privacy</h2>
                        <p>
                            Our Service is not intended for users under 18 years of age. We do not knowingly collect personal
                            information from children.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by updating
                            the &quot;Last updated&quot; date and, for material changes, by email notification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
                        <p>
                            For privacy-related questions or concerns, please contact:
                            <br /><br />
                            <strong>Data Protection Contact:</strong><br />
                            Email:{' '}
                            <a href="mailto:privacy@vn30quantum.com" className="text-purple-400 hover:text-purple-300">
                                privacy@vn30quantum.com
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
