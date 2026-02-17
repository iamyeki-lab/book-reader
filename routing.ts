// AtoB: next-intl routing - 英文 / 西文 / 阿文，默认英文
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
