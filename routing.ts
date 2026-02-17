// AtoB: next-intl routing - 默认阿文，西文/阿文外则英文
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'es', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
});
