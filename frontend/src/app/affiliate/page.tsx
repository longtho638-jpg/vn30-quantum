'use client';

import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AffiliatePage() {
    return (
        <PageWrapper>
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="inline-block px-4 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-bold tracking-widest text-sm mb-6">
                        💰 EARN 20% FOREVER
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        PARTNER WITH <br />
                        <span className="text-hologram">THE FUTURE</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Join our affiliate program and earn recurring commissions by introducing traders to the world's most advanced AI Oracle.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mb-20 text-left">
                    {[
                        { title: 'High Commission', value: '20%', desc: 'Recurring monthly for the lifetime of every customer.', color: 'text-green-400' },
                        { title: 'Global Payouts', value: 'Instant', desc: 'Get paid via PayPal or Crypto automatically.', color: 'text-cyan-400' },
                        { title: 'Marketing Kit', value: 'Ready', desc: 'Banners, copy, and visuals needed to convert.', color: 'text-purple-400' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-liquid rounded-3xl p-8"
                        >
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{item.title}</div>
                            <div className={`text-4xl font-black ${item.color} mb-4`}>{item.value}</div>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="glass-liquid rounded-[2rem] p-12 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6">Ready to start earning?</h2>
                    <form className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-6 py-4 bg-black/30 border border-white/10 rounded-xl focus:border-cyan-500 focus:outline-none text-white text-lg placeholder-gray-600 transition-colors"
                        />
                        <button className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                            Apply for Partner Account
                        </button>
                    </form>
                    <p className="mt-6 text-sm text-gray-500">
                        By applying, you agree to our <Link href="/terms" className="text-green-400 hover:underline">Affiliate Terms</Link>.
                    </p>
                </div>
            </div>
        </PageWrapper>
    );
}
