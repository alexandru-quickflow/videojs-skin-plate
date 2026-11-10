import { registerI18n } from '@videojs/html/i18n';
// Registering any string for a locale stops its built-in pack from lazy-loading, so load those packs first.
import '@videojs/html/i18n/locales/de/register';
import '@videojs/html/i18n/locales/fr/register';
import '@videojs/html/i18n/locales/es/register';
import '@videojs/html/i18n/locales/ro/register';
import '@videojs/html/i18n/locales/ru/register';
import '@videojs/html/i18n/locales/ar/register';

/** Strings for the skin's own labels. English is the text inside each <media-text>. */
const strings: Record<string, { plate: string; status: string; index: string; exit: string }> = {
  de: { plate: 'Tafel', status: 'Status', index: 'Index', exit: 'Beenden' },
  fr: { plate: 'Planche', status: 'État', index: 'Index', exit: 'Quitter' },
  es: { plate: 'Lámina', status: 'Estado', index: 'Índice', exit: 'Salir' },
  ro: { plate: 'Planșa', status: 'Stare', index: 'Index', exit: 'Ieși' },
  ru: { plate: 'Лист', status: 'Статус', index: 'Указатель', exit: 'Выйти' },
  ar: { plate: 'لوحة', status: 'الحالة', index: 'الفهرس', exit: 'خروج' },
};

// The `pl` namespace is the skin's own; Video.js types only know its built-in keys.
for (const [locale, pl] of Object.entries(strings)) {
  registerI18n(locale, { pl } as unknown as Parameters<typeof registerI18n>[1]);
}

// Shorter German words where the built-in ones are long for a text button.
registerI18n('de', {
  menu: { speed: 'Tempo' },
  buttons: { mute: 'Ton aus', unmute: 'Ton an' },
} as Parameters<typeof registerI18n>[1]);

// The speed button's name starts with the word it shows (WCAG 2.5.3, label in name).
const speedNames: Record<string, string> = {
  en: 'Speed, {rate}',
  de: 'Tempo, {rate}',
  ro: 'Viteză, {rate}',
  ar: 'السرعة، {rate}',
};
for (const [locale, rate] of Object.entries(speedNames)) {
  registerI18n(locale, { playback: { rate } } as Parameters<typeof registerI18n>[1]);
}
