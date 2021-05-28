import {IPeriodeV2} from "../../models/types/PeriodeV2";
import moment from "moment";

export const fjernIndexFraLabel = (label: string) =>
  label.replace(/\[.*\]/g, '[]');

export const generateDateString = (p: IPeriodeV2 | null) => {
    return p ? moment(p.fom).format('DD.MM.YYYY') + " - " + moment(p.tom).format('DD.MM.YYYY') : '-';
}
