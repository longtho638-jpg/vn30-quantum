'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'vi', label: 'VI', flag: '🇻🇳' },
];

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const currentLocale = locales.find(l => l.code === locale) || locales[1];

    const handleSwitch = (newLocale: string) => {
        setIsOpen(false);

        // Remove current locale prefix if exists
        let newPath = pathname;
        for (const l of locales) {
            if (pathname.startsWith(`/${l.code}/`) || pathname === `/${l.code}`) {
                newPath = pathname.replace(`/${l.code}`, '') || '/';
                break;
            }
        }

        // Navigate with new locale
        startTransition(() => {
            router.push(`/${newLocale}${newPath}`);
        });
    };

    return (
        <div className="relative">
            {/* 🌌 WOW Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/5 border border-white/10 backdrop-blur-md
          hover:bg-white/10 hover:border-cyan-500/30
          transition-all duration-300 group
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
            >
                <span className="text-lg">{currentLocale.flag}</span>
                <span className="text-sm font-mono text-cyan-200 group-hover:text-cyan-400 transition-colors">
                    {currentLocale.label}
                </span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            {/* 🌌 Dropdown (Holographic) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-full right-0 mt-2 w-36 rounded-xl overflow-hidden
                       bg-black/80 backdrop-blur-xl border border-cyan-500/20
                       shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                    >
                        {locales.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => handleSwitch(l.code)}
                                disabled={l.code === locale}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  transition-all duration-200
                  ${l.code === locale
                                        ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
                                        : 'hover:bg-white/10 text-gray-300 hover:text-white'}
                `}
                            >
                                <span className="text-xl">{l.flag}</span>
                                <span className="font-mono text-sm">{l.label}</span>
                                {l.code === locale && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto text-cyan-400"
                                    >
                                        ✓
                                    </motion.span>
                                )}
                            </button>
                        ))}

                        {/* Holographic Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-cyan-500/5 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
