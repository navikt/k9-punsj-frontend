/* eslint-disable  */
import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import BrevFormValues from 'app/models/types/brev/BrevFormValues';

import dokumentMalType from './dokumentMalType';

const lagDokumentdata = (values: BrevFormValues) => {
    const felterSomSkalMed: Partial<BrevFormValues> = {};

    Object.keys(values)
        .filter((key: BrevFormKeys) => key !== BrevFormKeys.mottaker && key !== BrevFormKeys.brevmalkode && values[key])
        .forEach((key: BrevFormKeys) => {
            if (key === BrevFormKeys.fritekst) {
                if (values.brevmalkode === dokumentMalType.INNHENT_DOK) {
                    felterSomSkalMed[key] = values[key];
                }
            } else if (key === BrevFormKeys.fritekstbrev) {
                if (
                    values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV ||
                    values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV_NYNORSK
                ) {
                    felterSomSkalMed[key] = values[key];
                }
            } else {
                felterSomSkalMed[key] = values[key];
            }
        });
    return felterSomSkalMed;
};

export class Brev {
    soekerId: string;

    mottaker: {
        type: string;
        id: string;
    };

    fagsakYtelseType: string;

    dokumentMal: string;

    dokumentdata: Partial<BrevFormValues>;

    journalpostId?: string;

    saksnummer?: string;

    constructor(
        values: BrevFormValues,
        søkerId: string,
        mottaker: {
            type: string;
            id: string;
        },
        fagsakYtelseType: string,
        dokumentMal: string,
        journalpostId?: string,
        fagsakId?: string,
    ) {
        this.soekerId = søkerId;
        this.mottaker = mottaker;
        this.fagsakYtelseType = fagsakYtelseType;
        this.dokumentMal = dokumentMal;
        this.dokumentdata = lagDokumentdata(values);
        this.journalpostId = journalpostId;
        this.saksnummer = fagsakId;
    }
}
