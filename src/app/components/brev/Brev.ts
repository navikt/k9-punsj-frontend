/* eslint-disable import/prefer-default-export */

import BrevFormValues from 'app/models/types/brev/BrevFormValues';

const lagDokumentdata = (values: BrevFormValues) => {
    const felterSomSkalMed: Partial<BrevFormValues> = {};
    Object.keys(values).forEach((key) => {
        if (key !== 'mottaker' && key !== 'brevmalkode' && values[key]) {
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

    journalpostId: string;

    constructor(
        values: BrevFormValues,
        søkerId: string,
        mottaker: {
            type: string;
            id: string;
        },
        fagsakYtelseType: string,
        dokumentMal: string,
        journalpostId: string
    ) {
        this.soekerId = søkerId;
        this.mottaker = mottaker;
        this.fagsakYtelseType = fagsakYtelseType;
        this.dokumentMal = dokumentMal;
        this.dokumentdata = lagDokumentdata(values);
        this.journalpostId = journalpostId;
    }
}
