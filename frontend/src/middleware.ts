import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'as-needed' // Only show /en or /vi when not default
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - Next.js internals like _next
    // - static files in public folder
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
