import {TimeFormat} from 'app/models/enums';
import moment       from 'moment';
import {IntlShape}  from 'react-intl';
import intlHelper   from './intlUtils';

export const datetime = (
    intl: IntlShape,
    outputFormat: TimeFormat,
    time?: string,
    inputFormat?: string
) => moment(time, inputFormat).format(intlHelper(intl, `tidsformat.${outputFormat}`));