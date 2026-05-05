import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@navikt/ds-react';

import { IPSBSoknad } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { createOMSKorrigering, hentOMSSøknad } from 'app/state/actions/OMSPunchFormActions';
import KorrigeringAvInntektsmeldingForm from './KorrigeringAvInntektsmeldingForm';
import { ROUTES } from 'app/constants/routes';
import { manglerK9saksnummerMessage, resolveK9saksnummer } from 'app/utils/k9saksnummerUtils';

const KorrigeringAvInntektsmeldingContainer: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const [soknad, setSoknad] = useState<Partial<IPSBSoknad>>({});
    const [opprettError, setOpprettError] = useState<string>();

    const { søkerId } = identState;
    const k9saksnummer = resolveK9saksnummer(fordelingState, journalpost);

    useEffect(() => {
        if (!id) {
            if (!k9saksnummer) {
                setOpprettError(manglerK9saksnummerMessage);
                return;
            }

            setOpprettError(undefined);
            createOMSKorrigering(
                søkerId,
                journalpost?.journalpostId || '',
                (response, data) => {
                    if (!response.ok) {
                        setOpprettError(response.statusText || 'Det oppstod en feil under opprettelse av søknad.');
                        return;
                    }

                    setSoknad(data);
                    navigate(`../${ROUTES.KORRIGERING_INNTEKTSMELDING_ID.replace(':id', data.soeknadId)}`);
                },
                k9saksnummer,
            );
        }
        if (id) {
            const søknad = hentOMSSøknad(journalpost?.norskIdent || '', id);
            søknad.then((response) => {
                setSoknad(response);
            });
        }
    }, [id, journalpost, k9saksnummer, navigate, søkerId]);

    const journalposterFraSoknad = soknad?.journalposter || [];
    const journalposter = Array.from(journalposterFraSoknad);

    if (opprettError) {
        return (
            <Alert size="small" variant="error">
                {opprettError}
            </Alert>
        );
    }

    return (
        <KorrigeringAvInntektsmeldingForm
            søkerId={søkerId || soknad.soekerId || ''}
            søknadId={soknad?.soeknadId || id || ''}
            journalposter={journalposter}
        />
    );
};

export default KorrigeringAvInntektsmeldingContainer;
