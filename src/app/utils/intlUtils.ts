import {IntlShape} from 'react-intl';

const intlHelper = (intl: IntlShape, id: string, value?: {[key: string]: string}): string =>
    intl.formatMessage({id}, value);

export default intlHelper;
