import moment from "moment";

import {TimeFormat} from "../models/enums";
import intlHelper from "./intlUtils";

export const datetime = (
    intl: ReactIntl.InjectedIntl,
    outputFormat: TimeFormat,
    time?: string,
    inputFormat?: string
) => moment(time, inputFormat).format(intlHelper(intl, `tidsformat.${outputFormat}`));