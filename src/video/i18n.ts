import { registerI18n } from '@videojs/html/i18n';
// Registering any string for a locale stops its built-in pack from lazy-loading, so load those packs first.
import '@videojs/html/i18n/locales/de/register';
import '@videojs/html/i18n/locales/fr/register';
import '@videojs/html/i18n/locales/es/register';
import '@videojs/html/i18n/locales/ro/register';
import '@videojs/html/i18n/locales/ru/register';
import '@videojs/html/i18n/locales/ar/register';

/** Strings for the skin's own labels. English is the text inside each <media-text>. */
const strings: Record<string, { plate: string; status: string; index: string; exit: string; more: string; errorHint: string; vol: string; error: string; close: string }> = {
  de: { plate: 'Tafel', status: 'Status', index: 'Index', exit: 'Beenden', more: 'Mehr', errorHint: "Das Video wurde nicht geladen. Prüfe die Verbindung und versuche es erneut.", vol: 'Lautst.', error: 'Fehler', close: 'Schließen' },
  fr: { plate: 'Planche', status: 'État', index: 'Index', exit: 'Quitter', more: 'Plus', errorHint: "La vidéo ne s'est pas chargée. Vérifiez votre connexion et réessayez.", vol: 'Vol', error: 'Erreur', close: 'Fermer' },
  es: { plate: 'Lámina', status: 'Estado', index: 'Índice', exit: 'Salir', more: 'Más', errorHint: "El vídeo no se ha cargado. Comprueba la conexión y vuelve a intentarlo.", vol: 'Vol', error: 'Error', close: 'Cerrar' },
  ro: { plate: 'Planșa', status: 'Stare', index: 'Index', exit: 'Ieși', more: 'Mai mult', errorHint: "Video-ul nu s-a încărcat. Verifică conexiunea și încearcă din nou.", vol: 'Vol', error: 'Eroare', close: 'Închide' },
  ru: { plate: 'Лист', status: 'Статус', index: 'Указатель', exit: 'Выйти', more: 'Ещё', errorHint: "Видео не загрузилось. Проверьте подключение и попробуйте ещё раз.", vol: 'Громк.', error: 'Ошибка', close: 'Закрыть' },
  ar: { plate: 'لوحة', status: 'الحالة', index: 'الفهرس', exit: 'خروج', more: 'المزيد', errorHint: "لم يتم تحميل الفيديو. تحقّق من الاتصال وحاول مرة أخرى.", vol: 'الصوت', error: 'خطأ', close: 'إغلاق' },
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

// The seek keys show "−10" and "+10"; their names start with the same, so voice control can say it
// (WCAG 2.5.3, label in name).
const seekNames: Record<string, { backward: string; forward: string }> = {
  en: { backward: '−{seconds} seconds', forward: '+{seconds} seconds' },
  de: { backward: '−{seconds} Sekunden', forward: '+{seconds} Sekunden' },
  fr: { backward: '−{seconds} secondes', forward: '+{seconds} secondes' },
  es: { backward: '−{seconds} segundos', forward: '+{seconds} segundos' },
  ro: { backward: '−{seconds} secunde', forward: '+{seconds} secunde' },
  ru: { backward: '−{seconds} секунд', forward: '+{seconds} секунд' },
  ar: { backward: '−{seconds} ثوانٍ', forward: '+{seconds} ثوانٍ' },
};
for (const [locale, seek] of Object.entries(seekNames)) {
  registerI18n(locale, { seek } as Parameters<typeof registerI18n>[1]);
}
