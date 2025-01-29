import DokumentMalType from './DookumentMalType';
import { BrevFormKeys, IBrev, IBrevDokumentdata, IBrevForm, IBrevMottaker } from './types';

export const defaultValuesBrev: IBrevForm = {
    [BrevFormKeys.brevmalkode]: '',
    [BrevFormKeys.mottaker]: '',
    [BrevFormKeys.fritekst]: '',
    [BrevFormKeys.velgAnnenMottaker]: false,
    [BrevFormKeys.orgNummer]: '',
    [BrevFormKeys.fritekstbrev]: {
        overskrift: '',
        brødtekst: '',
    },
};

/*const lagDokumentdata = (values: IBrevForm): Partial<IBrevForm> => {
    const felterSomSkalMed: Partial<IBrevForm> = {};

    Object.keys(values)
        .filter(
            (key: BrevFormKeys) =>
                key !== BrevFormKeys.mottaker && key !== BrevFormKeys.brevmalkode && values[key] !== undefined,
        )
        .forEach((key: BrevFormKeys) => {
            if (key === BrevFormKeys.fritekst) {
                if (values.brevmalkode === DokumentMalType.INNHENT_DOK) {
                    felterSomSkalMed[key] = values[key];
                }
            } else if (key === BrevFormKeys.fritekstbrev) {
                if (
                    values.brevmalkode === DokumentMalType.GENERELT_FRITEKSTBREV ||
                    values.brevmalkode === DokumentMalType.GENERELT_FRITEKSTBREV_NYNORSK
                ) {
                    felterSomSkalMed[key] = values[key];
                }
            } else {
                felterSomSkalMed[key] = values[key];
            }
        });

    return felterSomSkalMed;
};*/

export const getDokumentdata = (values: IBrevForm): IBrevDokumentdata => {
    if (values.brevmalkode === DokumentMalType.INNHENT_DOK) {
        return {
            [BrevFormKeys.fritekst]: values[BrevFormKeys.fritekst],
        };
    }
    return {
        [BrevFormKeys.fritekstbrev]: values[BrevFormKeys.fritekstbrev],
    };
};

export const createBrev = (
    values: IBrevForm,
    søkerId: string,
    mottakerData: IBrevMottaker,
    sakstype: string,
    dokumentMal: string,
    journalpostId?: string,
    fagsakId?: string,
): IBrev => ({
    soekerId: søkerId,
    mottaker: mottakerData,
    fagsakYtelseType: sakstype,
    dokumentMal,
    dokumentdata: getDokumentdata(values),
    journalpostId,
    saksnummer: fagsakId,
});
