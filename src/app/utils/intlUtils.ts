import { InjectedIntl, MessageValue } from 'react-intl';

const intlHelper = (intl: InjectedIntl, id: string, value?: { [key: string]: MessageValue }): string =>
    intl.formatMessage({ id }, value);

export default intlHelper;
