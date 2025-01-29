import { ApiPath } from 'app/apiConfig';
import { BrevFormKeys, IBrev, IBrevDokumentdata, IBrevForm, IBrevMottaker, IMal } from './types';

export const defaultValuesBrev: IBrevForm = {
    [BrevFormKeys.brevmalkode]: '',
    [BrevFormKeys.mottaker]: '',
    [BrevFormKeys.velgAnnenMottaker]: false,
    [BrevFormKeys.orgNummer]: '',
    [BrevFormKeys.overskrift]: '',
    [BrevFormKeys.brødtekst]: '',
};

export const getDokumentdata = (values: IBrevForm, valgteMal?: IMal): IBrevDokumentdata => {
    if (valgteMal && valgteMal.støtterTittelOgFritekst) {
        return {
            fritekstbrev: {
                overskrift: values[BrevFormKeys.overskrift],
                brødtekst: values[BrevFormKeys.brødtekst],
            },
        };
    }
    if (valgteMal && valgteMal.støtterFritekst) {
        return {
            fritekst: values[BrevFormKeys.brødtekst],
        };
    }

    return {};
};

export const createBrev = (
    søkerId: string,
    mottakerData: IBrevMottaker,
    sakstype: string,
    dokumentMal: string,
    dokumentdata: IBrevDokumentdata,
    journalpostId?: string,
    fagsakId?: string,
): IBrev => ({
    soekerId: søkerId,
    mottaker: mottakerData,
    fagsakYtelseType: sakstype,
    dokumentMal,
    dokumentdata,
    journalpostId,
    saksnummer: fagsakId,
});

interface ErrType {
    feilmelding: string;
}

const getErrorString = (errorText: string): string => {
    const jsonStart = errorText.indexOf('{"');
    if (jsonStart !== -1) {
        const jsonEnd = errorText.lastIndexOf('}') + 1;
        const jsonString = errorText.substring(jsonStart, jsonEnd);
        try {
            const errorObject = JSON.parse(jsonString);
            if (errorObject && errorObject.melding) {
                return errorObject.melding;
            }
        } catch {
            return errorText;
        }
    }

    const errorStart = 'Årsak: ';
    const errorIndex = errorText.indexOf(errorStart);
    if (errorIndex !== -1) {
        return errorText.substring(errorIndex + errorStart.length);
    }

    return errorText;
};

export const previewMessage = async (
    values: IBrevForm,
    aktørId: string,
    sakstype: string,
    valgteMal?: IMal,
    journalpostId?: string,
    fagsakId?: string,
): Promise<string | undefined> => {
    const mottakerType = values.mottaker === aktørId && !values.velgAnnenMottaker ? 'AKTØRID' : 'ORGNR';
    const mottakerId = values.velgAnnenMottaker ? values.orgNummer.replace(/\s/g, '') : values.mottaker;

    const dokumentdata = getDokumentdata(values, valgteMal);

    try {
        const response = await fetch(ApiPath.BREV_FORHAANDSVIS, {
            method: 'post',
            credentials: 'include',
            body: JSON.stringify({
                aktørId,
                eksternReferanse: journalpostId || fagsakId,
                ytelseType: {
                    kode: sakstype,
                    kodeverk: 'FAGSAK_YTELSE',
                },
                saksnummer: fagsakId || 'GENERELL_SAK',
                avsenderApplikasjon: 'K9PUNSJ',
                overstyrtMottaker: { type: mottakerType, id: mottakerId },
                dokumentMal: values.brevmalkode,
                dokumentdata,
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.blob();
            if (URL.createObjectURL) {
                window.open(URL.createObjectURL(data));
            }
            return undefined;
        }

        if (response.status === 500) {
            const errorText: ErrType = await response.json();
            const errorString = getErrorString(errorText.feilmelding);
            throw new Error(errorString);
        }

        throw new Error(response.statusText);
    } catch (error) {
        return error.message as string;
    }
};
