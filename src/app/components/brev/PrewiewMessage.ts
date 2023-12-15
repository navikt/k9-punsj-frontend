import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import { URL_BACKEND } from 'app/apiConfig';
import dokumentMalType from './dokumentMalType';

export const previewMessage = async (
    values: BrevFormValues,
    aktørId: string,
    sakstype: string,
    journalpostId?: string,
    fagsakId?: string,
): Promise<string | undefined> => {
    const mottaker = {
        type: values.mottaker === aktørId && !values.velgAnnenMottaker ? 'AKTØRID' : 'ORGNR',
        id: values.velgAnnenMottaker ? values.orgNummer : values.mottaker,
    };

    const brevmalErGenereltFritekstbrev = values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV;

    try {
        const response = await fetch(`${URL_BACKEND()}/api/k9-formidling/brev/forhaandsvis`, {
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
                overstyrtMottaker: mottaker,
                dokumentMal: values.brevmalkode,
                dokumentdata: {
                    fritekst: !brevmalErGenereltFritekstbrev ? values.fritekst : undefined,
                    fritekstbrev: brevmalErGenereltFritekstbrev ? values.fritekstbrev : undefined,
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
        console.log('response: ', response);
        throw new Error(response.statusText);
    } catch (error) {
        return error.message as string;
    }
};
