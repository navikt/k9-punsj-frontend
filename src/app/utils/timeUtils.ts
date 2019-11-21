import {TimeFormat} from 'app/models/enums';
import moment       from 'moment';
import intlHelper   from './intlUtils';

export const datetime = (
    intl: ReactIntl.InjectedIntl,
    outputFormat: TimeFormat,
    time?: string,
    inputFormat?: string
) => moment(time, inputFormat).format(intlHelper(intl, `tidsformat.${outputFormat}`));