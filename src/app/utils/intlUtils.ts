import '@formatjs/intl-pluralrules/dist/locale-data/nb';
import '@formatjs/intl-pluralrules/dist/locale-data/nn';
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-relativetimeformat/dist/locale-data/nb';
import '@formatjs/intl-relativetimeformat/dist/locale-data/nn';
import '@formatjs/intl-relativetimeformat/polyfill';
import {IntlShape} from 'react-intl';

const intlHelper = (intl: IntlShape, id: string, value?: {[key: string]: string}): string =>
    intl.formatMessage({id}, value);

export default intlHelper;
