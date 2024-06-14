import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import { ApiPath } from 'app/apiConfig';
import dokumentMalType from './dokumentMalType';

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
        } catch (error) {
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
    values: BrevFormValues,
    aktørId: string,
    sakstype: string,
    journalpostId?: string,
    fagsakId?: string,
): Promise<string | undefined> => {
    const mottakerType = values.mottaker === aktørId && !values.velgAnnenMottaker ? 'AKTØRID' : 'ORGNR';
    const mottakerId = values.velgAnnenMottaker ? values.orgNummer : values.mottaker;

    const isGenereltFritekstbrev = values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV;

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
                dokumentdata: {
                    fritekst: !isGenereltFritekstbrev ? values.fritekst : undefined,
                    fritekstbrev: isGenereltFritekstbrev ? values.fritekstbrev : undefined,
                },
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
        console.error('Error i forhåndsvisning av brev', error);
        return error.message as string;
    }
};
