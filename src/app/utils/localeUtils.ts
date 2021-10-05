import { Locale } from 'app/models/types';

const LocaleSessionKey = 'selectedLocale';

export const getLocaleFromSessionStorage = (): Locale => (sessionStorage.getItem(LocaleSessionKey) as Locale) || 'nb';

export const setLocaleInSessionStorage = (locale: Locale): void => {
    sessionStorage.setItem(LocaleSessionKey, locale);
};
