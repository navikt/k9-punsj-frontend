import { IntlShape } from 'react-intl';

// @ts-ignore
export const testIntl: IntlShape = {
  formatMessage(descriptor: { id: string }): string {
    return descriptor.id;
  },
};
